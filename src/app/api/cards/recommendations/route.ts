import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const businessId = searchParams.get('businessId');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!category && !businessId) {
      return NextResponse.json(
        { error: 'Category or business ID is required', success: false },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get card rewards for the specified category
    let cardQuery = supabase
      .from('card_rewards')
      .select('*');

    if (category) {
      cardQuery = cardQuery.eq('category', category);
    }

    const { data: cardRewards, error: cardError } = await cardQuery;

    if (cardError) {
      console.error('Database error:', cardError);
      return NextResponse.json(
        { error: 'Failed to fetch card rewards', success: false },
        { status: 500 }
      );
    }

    // Get business details if businessId provided
    let business = null;
    if (businessId) {
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (!businessError && businessData) {
        business = businessData;
      }
    }

    // Calculate recommendations based on card rewards
    const recommendations = cardRewards?.map(card => {
      // Base calculation
      const estimatedPoints = 100 * card.reward_rate; // Assume $100 spending
      let annualValue = 0;
      let matchScore = 0;
      const reasons: string[] = [];

      // Calculate annual value based on reward type
      switch (card.reward_type) {
        case 'cashback':
          annualValue = estimatedPoints; // Direct cash value
          break;
        case 'points':
          annualValue = estimatedPoints * 0.01; // Assume 1¢ per point
          break;
        case 'miles':
          annualValue = estimatedPoints * 0.015; // Assume 1.5¢ per mile
          break;
      }

      // Subtract annual fee
      annualValue -= card.annual_fee / 12; // Monthly impact

      // Calculate match score (0-100)
      if (card.reward_rate >= 5.0) {
        matchScore += 40;
        reasons.push(`Excellent ${card.reward_rate}x ${card.reward_type} rate`);
      } else if (card.reward_rate >= 3.0) {
        matchScore += 30;
        reasons.push(`Great ${card.reward_rate}x ${card.reward_type} rate`);
      } else if (card.reward_rate >= 2.0) {
        matchScore += 20;
        reasons.push(`Good ${card.reward_rate}x ${card.reward_type} rate`);
      } else {
        matchScore += 10;
        reasons.push(`Standard ${card.reward_rate}x ${card.reward_type} rate`);
      }

      // Bonus for no annual fee
      if (card.annual_fee === 0) {
        matchScore += 20;
        reasons.push('No annual fee');
      } else if (card.annual_fee <= 100) {
        matchScore += 10;
        reasons.push('Low annual fee');
      }

      // Bonus offer consideration
      if (card.bonus_offer) {
        matchScore += 15;
        reasons.push(`Sign-up bonus: ${card.bonus_offer}`);
      }

      // Category-specific bonuses
      if (category === 'dining' && card.reward_rate >= 3.0) {
        matchScore += 10;
        reasons.push('Perfect for dining out');
      }
      
      if (category === 'groceries' && card.reward_rate >= 3.0) {
        matchScore += 10;
        reasons.push('Great for grocery shopping');
      }

      if (category === 'gas' && card.reward_rate >= 3.0) {
        matchScore += 10;
        reasons.push('Excellent for gas purchases');
      }

      if (category === 'travel' && card.reward_rate >= 2.0) {
        matchScore += 15;
        reasons.push('Ideal for travel expenses');
      }

      // Distance bonus if business location provided
      if (business && lat && lng) {
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          business.latitude,
          business.longitude
        );
        
        if (distance <= 1000) { // Within 1km
          matchScore += 5;
          reasons.push('Available nearby');
        }
      }

      return {
        card,
        business,
        estimated_points: Math.round(estimatedPoints),
        annual_value: Math.round(annualValue * 100) / 100,
        match_score: Math.min(matchScore, 100),
        reasons
      };
    }) || [];

    // Sort by match score and annual value
    recommendations.sort((a, b) => {
      if (Math.abs(a.match_score - b.match_score) < 5) {
        return b.annual_value - a.annual_value;
      }
      return b.match_score - a.match_score;
    });

    return NextResponse.json({
      recommendations: recommendations.slice(0, 10), // Top 10 recommendations
      business,
      category,
      success: true
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}
