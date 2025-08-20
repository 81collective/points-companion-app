import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/apiUtils';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { plan } = await req.json();
    
    if (!['basic', 'premium', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const supabase = createClient();

    // Update user's subscription plan
    // In a real app, this would involve payment processing
    const { data, error } = await supabase
      .from('profiles')
      .update({
        subscription_plan: plan,
        subscription_status: 'active',
        subscription_expires_at: null, // For lifetime subscriptions or handled separately
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      plan: data.subscription_plan,
      message: `Successfully upgraded to ${plan} plan! New AI models are now available.`
    });

  } catch (error) {
    console.error('Subscription upgrade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}