// Welcome Bonus React Query Hooks
// Points Companion - Data Management for Welcome Bonus System

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  WelcomeBonusTracker, 
  BonusAnalytics, 
  SpendingRecommendation,
  BonusFilter,
  AddBonusForm
} from '@/types/welcomeBonus';

// API base URL
const API_BASE = '/api/bonuses';

// Query Keys
export const bonusQueryKeys = {
  all: ['bonuses'] as const,
  lists: () => [...bonusQueryKeys.all, 'list'] as const,
  list: (filters: BonusFilter) => [...bonusQueryKeys.lists(), filters] as const,
  details: () => [...bonusQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...bonusQueryKeys.details(), id] as const,
  analytics: () => [...bonusQueryKeys.all, 'analytics'] as const,
  analyticsTimeframe: (timeframe: string) => [...bonusQueryKeys.analytics(), timeframe] as const,
  recommendations: () => [...bonusQueryKeys.all, 'recommendations'] as const,
  recommendationsForBonus: (bonusId: string) => [...bonusQueryKeys.recommendations(), bonusId] as const,
};

// Fetch welcome bonuses with filters
export const useWelcomeBonuses = (filters?: BonusFilter) => {
  return useQuery({
    queryKey: bonusQueryKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status.join(','));
      if (filters?.priority) params.append('priority', filters.priority.join(','));
      if (filters?.bonusType) params.append('bonusType', filters.bonusType.join(','));
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      const response = await fetch(`${API_BASE}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch bonuses');
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      return result.data as WelcomeBonusTracker[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch single welcome bonus
export const useWelcomeBonus = (id: string) => {
  return useQuery({
    queryKey: bonusQueryKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch bonus');
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      return result.data as WelcomeBonusTracker;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Fetch bonus analytics
export const useBonusAnalytics = (timeframe: string = '30d') => {
  return useQuery({
    queryKey: bonusQueryKeys.analyticsTimeframe(timeframe),
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/analytics?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      return result.data as BonusAnalytics;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Fetch spending recommendations
export const useSpendingRecommendations = (bonusId: string, urgency?: string) => {
  return useQuery({
    queryKey: bonusQueryKeys.recommendationsForBonus(bonusId),
    queryFn: async () => {
      const params = new URLSearchParams({ bonusId });
      if (urgency) params.append('urgency', urgency);
      
      const response = await fetch(`${API_BASE}/recommendations?${params}`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      return result.data as SpendingRecommendation[];
    },
    enabled: !!bonusId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Generate personalized recommendations
export const useGenerateRecommendations = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      bonusId: string;
      userSpendingPatterns: Array<{ category: string; monthlyAverage: number }>;
      monthlyBudget: number;
      timeRemaining: number;
    }) => {
      const response = await fetch(`${API_BASE}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to generate recommendations');
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      return result.data as SpendingRecommendation[];
    },
    onSuccess: (data, variables) => {
      // Update the recommendations cache
      queryClient.setQueryData(
        bonusQueryKeys.recommendationsForBonus(variables.bonusId),
        data
      );
    },
  });
};

// Create new welcome bonus
export const useCreateWelcomeBonus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bonusData: AddBonusForm) => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bonusData),
      });
      
      if (!response.ok) throw new Error('Failed to create bonus');
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      return result.data as WelcomeBonusTracker;
    },
    onSuccess: () => {
      // Invalidate and refetch bonuses
      queryClient.invalidateQueries({ queryKey: bonusQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bonusQueryKeys.analytics() });
    },
  });
};

// Update welcome bonus
export const useUpdateWelcomeBonus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { id: string; updates: Partial<WelcomeBonusTracker> }) => {
      const response = await fetch(API_BASE, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to update bonus');
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      return result.data as WelcomeBonusTracker;
    },
    onSuccess: (data, variables) => {
      // Update the specific bonus cache
      queryClient.setQueryData(bonusQueryKeys.detail(variables.id), data);
      
      // Invalidate the lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: bonusQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bonusQueryKeys.analytics() });
    },
  });
};

// Update spending for a bonus
export const useUpdateBonusSpending = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { bonusId: string; amount: number; description?: string }) => {
      // Get current bonus data
      const currentBonus = queryClient.getQueryData<WelcomeBonusTracker>(
        bonusQueryKeys.detail(data.bonusId)
      );
      
      if (!currentBonus) throw new Error('Bonus not found');
      
      const newCurrentSpend = currentBonus.currentSpend + data.amount;
      const newProgress = (newCurrentSpend / currentBonus.requiredSpend) * 100;
      
      const updates = {
        currentSpend: newCurrentSpend,
        progress: Math.min(100, newProgress),
        status: newProgress >= 100 ? 'completed' as const : currentBonus.status,
        completedDate: newProgress >= 100 ? new Date().toISOString().split('T')[0] : currentBonus.completedDate
      };
      
      const response = await fetch(API_BASE, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: data.bonusId, ...updates }),
      });
      
      if (!response.ok) throw new Error('Failed to update spending');
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      return result.data as WelcomeBonusTracker;
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: bonusQueryKeys.detail(variables.bonusId) });
      
      // Snapshot the previous value
      const previousBonus = queryClient.getQueryData<WelcomeBonusTracker>(
        bonusQueryKeys.detail(variables.bonusId)
      );
      
      // Optimistically update the cache
      if (previousBonus) {
        const newCurrentSpend = previousBonus.currentSpend + variables.amount;
        const newProgress = (newCurrentSpend / previousBonus.requiredSpend) * 100;
        
        queryClient.setQueryData(bonusQueryKeys.detail(variables.bonusId), {
          ...previousBonus,
          currentSpend: newCurrentSpend,
          progress: Math.min(100, newProgress),
          status: newProgress >= 100 ? 'completed' : previousBonus.status
        });
      }
      
      return { previousBonus };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousBonus) {
        queryClient.setQueryData(bonusQueryKeys.detail(variables.bonusId), context.previousBonus);
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: bonusQueryKeys.detail(variables.bonusId) });
      queryClient.invalidateQueries({ queryKey: bonusQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bonusQueryKeys.analytics() });
    },
  });
};

// Delete welcome bonus
export const useDeleteWelcomeBonus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete bonus');
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      return result;
    },
    onSuccess: (data, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: bonusQueryKeys.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: bonusQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bonusQueryKeys.analytics() });
    },
  });
};

// Accept spending recommendation
export const useAcceptRecommendation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (recommendation: SpendingRecommendation) => {
      // In a real implementation, this would mark the recommendation as accepted
      // and potentially create a spending plan or reminder
      
      return { success: true, recommendation };
    },
    onSuccess: () => {
      // Invalidate recommendations to refresh the list
      queryClient.invalidateQueries({ queryKey: bonusQueryKeys.recommendations() });
    },
  });
};

// Custom hook for bonus statistics
export const useBonusStats = () => {
  const { data: bonuses } = useWelcomeBonuses();
  
  const stats = {
    active: bonuses?.filter(b => b.status === 'active').length || 0,
    completed: bonuses?.filter(b => b.status === 'completed').length || 0,
    urgent: bonuses?.filter(b => {
      if (b.status !== 'active') return false;
      const daysRemaining = Math.floor((new Date(b.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysRemaining <= 7;
    }).length || 0,
    totalValue: bonuses?.filter(b => b.status === 'active').reduce((sum, b) => sum + b.estimatedValue, 0) || 0,
    totalRemaining: bonuses?.filter(b => b.status === 'active').reduce((sum, b) => sum + (b.requiredSpend - b.currentSpend), 0) || 0,
  };
  
  return stats;
};
