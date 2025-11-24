import { NextRequest, NextResponse } from 'next/server';
import getRequestUrl from '@/lib/getRequestUrl';
import { LoyaltyInsight, LoyaltyInsightsResponse } from '@/types/loyalty';

export async function GET() {
  try {
    // For now, return mock insights data
    // TODO: Replace with real Supabase queries once auth is implemented
    
    const mockInsights: LoyaltyInsight[] = [
      {
        id: '1',
        type: 'expiration_warning',
        title: 'Points Expiring Soon',
        message: '15,000 Marriott points expire in 3 months. Consider booking a stay or transferring points.',
        severity: 'medium',
        actionRequired: true,
        actionUrl: '/loyalty/marriott-bonvoy'
      },
      {
        id: '2',
        type: 'certificate_reminder',
        title: 'Companion Certificate Expires',
        message: 'Your Delta companion certificate expires in 5 months. Book a trip soon!',
        severity: 'medium',
        actionRequired: true
      },
      {
        id: '3',
        type: 'elite_progress',
        title: 'Close to Gold Status',
        message: 'You need 15 more nights to reach Marriott Platinum status this year.',
        severity: 'low',
        actionRequired: false
      },
      {
        id: '4',
        type: 'optimization_tip',
        title: 'Maximize Your Points',
        message: 'Use your Chase Sapphire for dining purchases to earn 3x points.',
        severity: 'low',
        actionRequired: false
      }
    ];

    const response: LoyaltyInsightsResponse = {
      success: true,
      data: mockInsights
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in loyalty insights API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = getRequestUrl(request);
    const insightId = searchParams.get('id');
    const body = await request.json();

    if (!insightId) {
      return NextResponse.json(
        { success: false, error: 'Insight ID is required' },
        { status: 400 }
      );
    }

    // For now, return success response
    // TODO: Replace with real Supabase update once auth is implemented
    
    const { dismissed } = body;

    return NextResponse.json({
      success: true,
      data: { id: insightId, dismissed: dismissed || false }
    });

  } catch (error) {
    console.error('Error in loyalty insights PATCH API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
