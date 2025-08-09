// React Query hooks for loyalty system API integration
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  LoyaltyAccount, 
  LoyaltyAccountsResponse, 
  LoyaltyAccountResponse,
  LoyaltyAnalytics,
  LoyaltyInsightsResponse,
  LoyaltyProgram,
  LoyaltyFilter,
  AddLoyaltyAccountForm
} from '@/types/loyalty';

// Query keys
export const loyaltyKeys = {
  all: ['loyalty'] as const,
  accounts: () => [...loyaltyKeys.all, 'accounts'] as const,
  account: (id: string) => [...loyaltyKeys.accounts(), id] as const,
  accountsFiltered: (filters: LoyaltyFilter) => [...loyaltyKeys.accounts(), 'filtered', filters] as const,
  analytics: () => [...loyaltyKeys.all, 'analytics'] as const,
  insights: () => [...loyaltyKeys.all, 'insights'] as const,
  programs: () => [...loyaltyKeys.all, 'programs'] as const,
  programsByCategory: (category: string) => [...loyaltyKeys.programs(), category] as const,
};

// API functions
const loyaltyApi = {
  // Accounts
  async getAccounts(filters?: LoyaltyFilter): Promise<LoyaltyAccountsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.category?.length) {
      params.append('category', filters.category[0]); // For simplicity, use first category
    }
    if (filters?.syncStatus?.length) {
      params.append('syncStatus', filters.syncStatus[0]);
    }
    if (filters?.hasExpiringPoints) {
      params.append('hasExpiringPoints', 'true');
    }
    if (filters?.hasCertificates) {
      params.append('hasCertificates', 'true');
    }
    if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters?.sortOrder) {
      params.append('sortOrder', filters.sortOrder);
    }

    const response = await fetch(`/api/loyalty/accounts?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch loyalty accounts');
    }
    return response.json();
  },

  async createAccount(data: AddLoyaltyAccountForm): Promise<LoyaltyAccountResponse> {
    const response = await fetch('/api/loyalty/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create loyalty account');
    }
    return response.json();
  },

  async updateAccount(id: string, data: Partial<LoyaltyAccount>): Promise<LoyaltyAccountResponse> {
    const response = await fetch(`/api/loyalty/accounts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update loyalty account');
    }
    return response.json();
  },

  async deleteAccount(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/loyalty/accounts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete loyalty account');
    }
    return response.json();
  },

  // Analytics
  async getAnalytics(): Promise<{ success: boolean; data: LoyaltyAnalytics }> {
    const response = await fetch('/api/loyalty/analytics');
    if (!response.ok) {
      throw new Error('Failed to fetch loyalty analytics');
    }
    return response.json();
  },

  // Insights
  async getInsights(): Promise<LoyaltyInsightsResponse> {
    const response = await fetch('/api/loyalty/insights');
    if (!response.ok) {
      throw new Error('Failed to fetch loyalty insights');
    }
    return response.json();
  },

  async dismissInsight(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/loyalty/insights?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dismissed: true }),
    });
    if (!response.ok) {
      throw new Error('Failed to dismiss insight');
    }
    return response.json();
  },

  // Programs
  async getPrograms(category?: string, search?: string): Promise<{ success: boolean; data: LoyaltyProgram[]; total: number }> {
    const params = new URLSearchParams();
    if (category && category !== 'all') {
      params.append('category', category);
    }
    if (search) {
      params.append('search', search);
    }

    const response = await fetch(`/api/loyalty/programs?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch loyalty programs');
    }
    return response.json();
  },

  async getProgram(id: string): Promise<{ success: boolean; data: LoyaltyProgram }> {
    const response = await fetch(`/api/loyalty/programs?id=${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch loyalty program');
    }
    return response.json();
  },
};

// React Query hooks

// Accounts
export function useLoyaltyAccounts(filters?: LoyaltyFilter) {
  return useQuery({
    queryKey: filters ? loyaltyKeys.accountsFiltered(filters) : loyaltyKeys.accounts(),
    queryFn: () => loyaltyApi.getAccounts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useLoyaltyAccount(id: string) {
  return useQuery({
    queryKey: loyaltyKeys.account(id),
    queryFn: async () => {
      // For individual account, we'll get it from the accounts list
      const response = await loyaltyApi.getAccounts();
      const account = response.data?.find(acc => acc.id === id);
      if (!account) throw new Error('Account not found');
      return { success: true, data: account };
    },
    enabled: !!id,
  });
}

export function useCreateLoyaltyAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: loyaltyApi.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loyaltyKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: loyaltyKeys.analytics() });
    },
  });
}

export function useUpdateLoyaltyAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LoyaltyAccount> }) =>
      loyaltyApi.updateAccount(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: loyaltyKeys.account(id) });
      queryClient.invalidateQueries({ queryKey: loyaltyKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: loyaltyKeys.analytics() });
    },
  });
}

export function useDeleteLoyaltyAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: loyaltyApi.deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loyaltyKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: loyaltyKeys.analytics() });
    },
  });
}

// Analytics
export function useLoyaltyAnalytics() {
  return useQuery({
    queryKey: loyaltyKeys.analytics(),
    queryFn: loyaltyApi.getAnalytics,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Insights
export function useLoyaltyInsights() {
  return useQuery({
    queryKey: loyaltyKeys.insights(),
    queryFn: loyaltyApi.getInsights,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDismissInsight() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: loyaltyApi.dismissInsight,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loyaltyKeys.insights() });
    },
  });
}

// Programs
export function useLoyaltyPrograms(category?: string, search?: string) {
  return useQuery({
    queryKey: category ? loyaltyKeys.programsByCategory(category) : loyaltyKeys.programs(),
    queryFn: () => loyaltyApi.getPrograms(category, search),
    staleTime: 1000 * 60 * 30, // 30 minutes (programs don't change often)
  });
}

export function useLoyaltyProgram(id: string) {
  return useQuery({
    queryKey: [...loyaltyKeys.programs(), id],
    queryFn: () => loyaltyApi.getProgram(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
