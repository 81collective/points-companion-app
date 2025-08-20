// Model access control based on subscription plans
import { createClient } from '@/lib/supabase';

export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';

export interface ModelAccess {
  model: string;
  displayName: string;
  description: string;
  requiredPlan: SubscriptionPlan;
  isAvailable: boolean;
}

// Define available models and their requirements
const MODEL_TIERS: Record<string, { displayName: string; description: string; requiredPlan: SubscriptionPlan }> = {
  'gpt-3.5-turbo': {
    displayName: 'GPT-3.5 Turbo',
    description: 'Fast responses, good for basic recommendations',
    requiredPlan: 'free'
  },
  'gpt-4o-mini': {
    displayName: 'GPT-4o Mini',
    description: 'Balanced performance and accuracy',
    requiredPlan: 'basic'
  },
  'gpt-4o': {
    displayName: 'GPT-4o',
    description: 'Advanced reasoning for complex strategies',
    requiredPlan: 'premium'
  },
  'o1-mini': {
    displayName: 'o1 Mini',
    description: 'Deep analysis and reasoning',
    requiredPlan: 'premium'
  },
  'o1-preview': {
    displayName: 'o1 Preview',
    description: 'Cutting-edge reasoning for enterprise users',
    requiredPlan: 'enterprise'
  }
};

const PLAN_HIERARCHY: Record<SubscriptionPlan, number> = {
  'free': 0,
  'basic': 1,
  'premium': 2,
  'enterprise': 3
};

export async function getUserSubscriptionInfo(userId: string) {
  const supabase = createClient();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_status, subscription_expires_at')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return {
      plan: 'free' as SubscriptionPlan,
      status: 'active',
      expiresAt: null,
      isActive: true
    };
  }

  const isActive = profile.subscription_status === 'active' && 
    (profile.subscription_expires_at === null || 
     new Date(profile.subscription_expires_at) > new Date());

  return {
    plan: (profile.subscription_plan as SubscriptionPlan) || 'free',
    status: profile.subscription_status || 'active',
    expiresAt: profile.subscription_expires_at,
    isActive
  };
}

export async function getAvailableModels(userId: string): Promise<ModelAccess[]> {
  const subscription = await getUserSubscriptionInfo(userId);
  const userPlanLevel = PLAN_HIERARCHY[subscription.isActive ? subscription.plan : 'free'];

  return Object.entries(MODEL_TIERS).map(([model, config]) => ({
    model,
    displayName: config.displayName,
    description: config.description,
    requiredPlan: config.requiredPlan,
    isAvailable: userPlanLevel >= PLAN_HIERARCHY[config.requiredPlan]
  }));
}

export async function getBestAvailableModel(userId: string): Promise<string> {
  const availableModels = await getAvailableModels(userId);
  
  // Return the most advanced model available to the user
  const bestModel = availableModels
    .filter(m => m.isAvailable)
    .sort((a, b) => PLAN_HIERARCHY[b.requiredPlan] - PLAN_HIERARCHY[a.requiredPlan])[0];

  return bestModel?.model || 'gpt-3.5-turbo';
}

export async function isModelAvailable(userId: string, model: string): Promise<boolean> {
  const modelConfig = MODEL_TIERS[model];
  if (!modelConfig) return false;

  const subscription = await getUserSubscriptionInfo(userId);
  const userPlanLevel = PLAN_HIERARCHY[subscription.isActive ? subscription.plan : 'free'];
  
  return userPlanLevel >= PLAN_HIERARCHY[modelConfig.requiredPlan];
}

// For server-side API routes, extract user from session
export async function getBestAvailableModelForRequest(request: Request): Promise<string> {
  // In a real implementation, you'd extract the user from the session/JWT
  // For now, we'll add this functionality when we update the API route
  return 'gpt-4o'; // fallback to current behavior
}