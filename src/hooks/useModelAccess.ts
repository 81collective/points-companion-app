import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface ModelInfo {
  model: string;
  displayName: string;
  description: string;
  requiredPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  isAvailable: boolean;
}

export interface SubscriptionInfo {
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  status: string;
  isActive: boolean;
  expiresAt?: string | null;
}

export interface ModelAccessInfo {
  models: ModelInfo[];
  subscription: SubscriptionInfo;
  currentModel?: string;
}

export function useModelAccess() {
  const [modelAccess, setModelAccess] = useState<ModelAccessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchModelAccess() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/assistant/models');
        if (!response.ok) {
          throw new Error('Failed to fetch model access information');
        }
        
        const data = await response.json();
        setModelAccess(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Set fallback data for unauthenticated users
        setModelAccess({
          models: [{
            model: 'gpt-3.5-turbo',
            displayName: 'GPT-3.5 Turbo',
            description: 'Fast responses, good for basic recommendations',
            requiredPlan: 'free',
            isAvailable: true
          }],
          subscription: {
            plan: 'free',
            status: 'active',
            isActive: true
          }
        });
      } finally {
        setLoading(false);
      }
    }

    fetchModelAccess();
  }, [user]);

  const availableModels = modelAccess?.models.filter(m => m.isAvailable) || [];
  const bestModel = availableModels.sort((a, b) => {
    const planOrder = { free: 0, basic: 1, premium: 2, enterprise: 3 };
    return planOrder[b.requiredPlan] - planOrder[a.requiredPlan];
  })[0];

  const refresh = async () => {
    const response = await fetch('/api/assistant/models');
    if (response.ok) {
      const data = await response.json();
      setModelAccess(data);
    }
  };

  return {
    modelAccess,
    availableModels,
    bestModel,
    currentModel: bestModel?.model,
    subscription: modelAccess?.subscription,
    loading,
    error,
    refresh
  };
}