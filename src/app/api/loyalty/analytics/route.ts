import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LoyaltyAnalytics } from '@/types/loyalty';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // For now, return mock analytics data
    // TODO: Replace with real calculations from Supabase once auth is implemented
    
    const mockAnalytics: LoyaltyAnalytics = {
      totalValue: 8750,
      totalAccounts: 3,
      categoriesBreakdown: {
        airline: { count: 1, totalValue: 2025, averageBalance: 67500 },
        hotel: { count: 1, totalValue: 2550, averageBalance: 85000 },
        credit_card: { count: 1, totalValue: 3750, averageBalance: 125000 },
        dining: { count: 0, totalValue: 0, averageBalance: 0 },
        shopping: { count: 0, totalValue: 0, averageBalance: 0 },
        other: { count: 0, totalValue: 0, averageBalance: 0 }
      },
      expirationSummary: {
        expiring30Days: 0,
        expiring60Days: 15000,
        expiring90Days: 15000,
        totalExpiring: 15000
      },
      certificateSummary: {
        total: 2,
        estimatedValue: 700,
        expiringCount: 1
      },
      eliteStatusSummary: {
        currentTiers: { 'Gold': 1, 'Silver': 1 },
        progressToNextTier: [
          {
            programName: 'Marriott Bonvoy',
            currentTier: 'Gold',
            nextTier: 'Platinum',
            progress: 70
          },
          {
            programName: 'Delta SkyMiles',
            currentTier: 'Silver',
            nextTier: 'Gold',
            progress: 56
          }
        ]
      },
      trends: {
        timeframe: '30d',
        data: [
          {
            date: '2025-01-01',
            balance: 270000,
            activity: { earned: 5000, redeemed: 0, expired: 0 }
          },
          {
            date: '2025-01-15',
            balance: 277500,
            activity: { earned: 7500, redeemed: 0, expired: 0 }
          }
        ]
      }
    };

    return NextResponse.json({
      success: true,
      data: mockAnalytics
    });

  } catch (error) {
    console.error('Error in loyalty analytics API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
