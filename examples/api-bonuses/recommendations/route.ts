// Spending Recommendations API
// Points Companion - AI-Powered Spending Suggestions

import { NextRequest, NextResponse } from 'next/server';
import getRequestUrl from '@/lib/getRequestUrl';
import { SpendingRecommendation } from '@/types/welcomeBonus';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = getRequestUrl(request);
    const bonusId = searchParams.get('bonusId');
    const urgency = searchParams.get('urgency');

    if (!bonusId) {
      return NextResponse.json(
        { success: false, error: 'Bonus ID is required' },
        { status: 400 }
      );
    }

    // Mock recommendations - replace with actual AI generation
    const mockRecommendations: SpendingRecommendation[] = [
      {
        id: 'rec-1',
        category: 'Bills & Utilities',
        amount: 800,
        description: 'Prepay your electricity, internet, and phone bills',
        suggestedMerchants: ['Electric Company', 'Verizon', 'Comcast'],
        pointsImpact: 800,
        urgency: 'high',
        reasoning: 'Prepaying bills is a safe way to meet spending requirements without changing your budget. You can prepay up to 3 months in advance.',
        estimatedCompletionDate: '2025-02-08',
        alternativeOptions: [
          'Pay insurance premiums early',
          'Prepay subscription services',
          'Pay property taxes early'
        ],
        tags: ['safe', 'bills', 'prepayment']
      },
      {
        id: 'rec-2',
        category: 'Gift Cards',
        amount: 500,
        description: 'Purchase gift cards for future use at stores you frequent',
        suggestedMerchants: ['Amazon', 'Target', 'Whole Foods', 'Home Depot'],
        pointsImpact: 500,
        urgency: 'medium',
        reasoning: 'Gift cards preserve your purchasing power while meeting spending requirements. Choose stores you regularly shop at.',
        estimatedCompletionDate: '2025-02-07',
        alternativeOptions: [
          'Buy cards for upcoming holidays',
          'Purchase restaurant gift cards',
          'Get gas station gift cards'
        ],
        tags: ['flexible', 'gift-cards', 'future-use']
      },
      {
        id: 'rec-3',
        category: 'Groceries',
        amount: 600,
        description: 'Stock up on non-perishable groceries and household items',
        suggestedMerchants: ['Costco', 'Sam\'s Club', 'Target', 'Walmart'],
        pointsImpact: 600,
        urgency: 'medium',
        reasoning: 'Bulk grocery shopping for items you\'ll use anyway. Focus on non-perishables like cleaning supplies, paper products, and canned goods.',
        estimatedCompletionDate: '2025-02-09',
        alternativeOptions: [
          'Buy in bulk at warehouse stores',
          'Stock up on cleaning supplies',
          'Purchase frozen foods'
        ],
        tags: ['groceries', 'bulk', 'essentials']
      },
      {
        id: 'rec-4',
        category: 'Large Purchases',
        amount: 1200,
        description: 'Time any planned large purchases for this period',
        suggestedMerchants: ['Best Buy', 'Home Depot', 'Furniture Stores', 'Apple Store'],
        pointsImpact: 1200,
        urgency: 'low',
        reasoning: 'If you have any planned large purchases (electronics, appliances, furniture), now is the perfect time to make them.',
        estimatedCompletionDate: '2025-02-06',
        alternativeOptions: [
          'Buy needed electronics',
          'Purchase home improvements',
          'Get new appliances'
        ],
        tags: ['large-purchase', 'timing', 'planned']
      },
      {
        id: 'rec-5',
        category: 'Dining',
        amount: 300,
        description: 'Increase dining spending or order catering for events',
        suggestedMerchants: ['Local Restaurants', 'DoorDash', 'Uber Eats', 'Catering Services'],
        pointsImpact: 300,
        urgency: 'low',
        reasoning: 'Since dining is a regular expense, you can slightly increase this category or order catering for any upcoming events.',
        estimatedCompletionDate: '2025-02-12',
        alternativeOptions: [
          'Order catering for work events',
          'Try new restaurants',
          'Increase food delivery orders'
        ],
        tags: ['dining', 'regular-spending', 'social']
      }
    ];

    // Filter by urgency if specified
    let filteredRecommendations = mockRecommendations;
    if (urgency) {
      filteredRecommendations = mockRecommendations.filter(rec => rec.urgency === urgency);
    }

    // Sort by urgency and impact
    const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    filteredRecommendations.sort((a, b) => {
      const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      return b.pointsImpact - a.pointsImpact;
    });

    return NextResponse.json({
      success: true,
      data: filteredRecommendations
    });

  } catch (error) {
    console.error('Error fetching spending recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch spending recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bonusId, userSpendingPatterns, monthlyBudget, timeRemaining } = body;

    if (!bonusId) {
      return NextResponse.json(
        { success: false, error: 'Bonus ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would use AI to generate personalized recommendations
    // based on user spending patterns, remaining time, and bonus requirements

    // Generate dynamic recommendations based on user data
    const recommendations: SpendingRecommendation[] = [];

    // Add bill payment recommendation if user has high monthly expenses
    if (monthlyBudget > 3000) {
      recommendations.push({
        id: `rec-bills-${Date.now()}`,
        category: 'Bills & Utilities',
        amount: Math.min(monthlyBudget * 0.3, 1000),
        description: 'Prepay recurring bills based on your spending patterns',
        suggestedMerchants: ['Electric Company', 'Internet Provider', 'Insurance'],
        pointsImpact: Math.min(monthlyBudget * 0.3, 1000),
        urgency: timeRemaining <= 7 ? 'critical' : timeRemaining <= 14 ? 'high' : 'medium',
        reasoning: `Based on your monthly budget of $${monthlyBudget}, you can safely prepay bills without impacting your finances.`,
        estimatedCompletionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        alternativeOptions: ['Insurance premiums', 'Subscription services', 'Property taxes'],
        tags: ['personalized', 'bills', 'safe']
      });
    }

    // Add category-specific recommendations based on user patterns
    if (userSpendingPatterns) {
      const topCategories = userSpendingPatterns
        .sort((a: { monthlyAverage: number }, b: { monthlyAverage: number }) => b.monthlyAverage - a.monthlyAverage)
        .slice(0, 2);

      topCategories.forEach((pattern: { category: string; monthlyAverage: number }, index: number) => {
        recommendations.push({
          id: `rec-${pattern.category.toLowerCase()}-${Date.now()}-${index}`,
          category: pattern.category,
          amount: pattern.monthlyAverage * 1.5,
          description: `Increase spending in ${pattern.category.toLowerCase()} - your top category`,
          suggestedMerchants: getMerchantsForCategory(pattern.category),
          pointsImpact: pattern.monthlyAverage * 1.5,
          urgency: index === 0 ? 'medium' : 'low',
          reasoning: `You typically spend $${pattern.monthlyAverage}/month on ${pattern.category}, so increasing this aligns with your habits.`,
          estimatedCompletionDate: new Date(Date.now() + (index + 2) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          alternativeOptions: ['Bulk purchases', 'Premium options', 'Stock up on essentials'],
          tags: ['personalized', pattern.category.toLowerCase(), 'natural-spending']
        });
      });
    }

    return NextResponse.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

// Helper function to get merchants for a category
function getMerchantsForCategory(category: string): string[] {
  const merchantMap: Record<string, string[]> = {
    'Groceries': ['Walmart', 'Target', 'Kroger', 'Safeway', 'Whole Foods'],
    'Dining': ['Local Restaurants', 'DoorDash', 'Uber Eats', 'Starbucks'],
    'Gas': ['Shell', 'Exxon', 'BP', 'Chevron', 'Costco Gas'],
    'Shopping': ['Amazon', 'Target', 'Best Buy', 'Department Stores'],
    'Entertainment': ['Netflix', 'Movie Theaters', 'Streaming Services', 'Sports Events'],
    'Travel': ['Airlines', 'Hotels', 'Car Rental', 'Travel Agencies'],
    'Bills & Utilities': ['Electric Company', 'Internet Provider', 'Phone Bill', 'Insurance'],
    'Health & Fitness': ['Gym', 'Pharmacy', 'Medical', 'Health Food Stores']
  };

  return merchantMap[category] || ['Various Merchants'];
}
