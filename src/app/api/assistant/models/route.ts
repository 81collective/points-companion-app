import { NextRequest, NextResponse } from 'next/server';
import { getAvailableModels, getUserSubscriptionInfo } from '@/lib/modelAccess';
import { getUserFromRequest } from '@/lib/apiUtils';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      // Return free tier models for unauthenticated users
      return NextResponse.json({
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
    }

    const [availableModels, subscription] = await Promise.all([
      getAvailableModels(user.id),
      getUserSubscriptionInfo(user.id)
    ]);

    return NextResponse.json({
      models: availableModels,
      subscription
    });
  } catch (error) {
    console.error('Error fetching available models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available models' },
      { status: 500 }
    );
  }
}