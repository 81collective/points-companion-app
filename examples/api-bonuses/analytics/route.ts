// Welcome Bonus Analytics API
// Points Companion - Analytics and Insights

import { NextRequest, NextResponse } from 'next/server';
import getRequestUrl from '@/lib/getRequestUrl';
import { BonusAnalytics } from '@/types/welcomeBonus';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = getRequestUrl(request);
    const timeframe = searchParams.get('timeframe') || '30d';

    // Mock analytics data - replace with actual Supabase queries
    const analytics: BonusAnalytics = {
      totalBonusesEarned: 3,
      totalValueEarned: 1650,
      averageCompletionTime: 65, // days
      successRate: 75, // percentage
      mostEffectiveCategories: [
        'Bills & Utilities',
        'Groceries',
        'Dining',
        'Gift Cards'
      ],
      spendingPatterns: [
        { category: 'Dining', percentage: 25, averageAmount: 350 },
        { category: 'Groceries', percentage: 20, averageAmount: 280 },
        { category: 'Gas', percentage: 15, averageAmount: 210 },
        { category: 'Bills & Utilities', percentage: 15, averageAmount: 210 },
        { category: 'Shopping', percentage: 12, averageAmount: 168 },
        { category: 'Entertainment', percentage: 8, averageAmount: 112 },
        { category: 'Travel', percentage: 5, averageAmount: 70 }
      ],
      monthlyBreakdown: [
        {
          month: '2024-11',
          bonusesCompleted: 1,
          valueEarned: 200,
          spendingVolume: 1500
        },
        {
          month: '2024-12',
          bonusesCompleted: 1,
          valueEarned: 750,
          spendingVolume: 4000
        },
        {
          month: '2025-01',
          bonusesCompleted: 1,
          valueEarned: 700,
          spendingVolume: 4000
        }
      ]
    };

    // Calculate additional metrics based on timeframe
    let filteredData = analytics;
    
    if (timeframe === '7d') {
      // Last 7 days data
      filteredData = {
        ...analytics,
        monthlyBreakdown: analytics.monthlyBreakdown.slice(-1)
      };
    } else if (timeframe === '90d') {
      // Last 90 days data - no change needed for mock data
    }

    return NextResponse.json({
      success: true,
      data: filteredData
    });

  } catch (error) {
    console.error('Error fetching bonus analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bonus analytics' },
      { status: 500 }
    );
  }
}
