import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { creditCardDatabase } from '@/data/creditCardDatabase';
import { RewardCategory } from '@/types/creditCards';

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

    console.log('🎯 Recommendations API called with:', { category, businessId, lat, lng });

    const supabase = createClient();

    // Map category names to our RewardCategory enum
    const categoryMap: { [key: string]: RewardCategory } = {
      'dining': RewardCategory.Dining,
      'groceries': RewardCategory.Groceries,
      'gas': RewardCategory.Gas,
      'travel': RewardCategory.Travel,
      'hotels': RewardCategory.Hotels,
      'streaming': RewardCategory.Streaming,
      'drugstores': RewardCategory.Drugstores,
      'home_improvement': RewardCategory.HomeImprovement,
      'entertainment': RewardCategory.Entertainment,
      'general': RewardCategory.EverythingElse,
      'shopping': RewardCategory.Department_stores
    };

    const targetCategory = category ? categoryMap[category] || RewardCategory.EverythingElse : RewardCategory.EverythingElse;
    console.log('🎯 Target category mapped to:', targetCategory);

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

    // Calculate recommendations based on our credit card database
    const recommendations = creditCardDatabase.map(card => {
      // Find the best reward multiplier for the target category
      const categoryReward = card.rewards.find(r => r.category === targetCategory);
      const everythingElseReward = card.rewards.find(r => r.category === RewardCategory.EverythingElse);
      
      const rewardMultiplier = categoryReward?.multiplier || everythingElseReward?.multiplier || 1;
      const rewardCategory = categoryReward?.category || RewardCategory.EverythingElse;
      
      // Base calculation - assume $100 spending
      const estimatedPoints = 100 * rewardMultiplier;
      let annualValue = 0;
      let matchScore = 0;
      const reasons: string[] = [];

      // Calculate annual value (assume points worth 1¢ each for simplicity)
      annualValue = estimatedPoints * 0.01;

      // Subtract annual fee impact (monthly)
      if (card.annualFee) {
        annualValue -= card.annualFee / 12;
      }

      // Calculate match score (0-100)
      if (rewardMultiplier >= 5.0) {
        matchScore += 40;
        reasons.push(`Excellent ${rewardMultiplier}x points rate`);
      } else if (rewardMultiplier >= 3.0) {
        matchScore += 30;
        reasons.push(`Great ${rewardMultiplier}x points rate`);
      } else if (rewardMultiplier >= 2.0) {
        matchScore += 20;
        reasons.push(`Good ${rewardMultiplier}x points rate`);
      } else {
        matchScore += 10;
        reasons.push(`Standard ${rewardMultiplier}x points rate`);
      }

      // Bonus for no annual fee
      if (!card.annualFee || card.annualFee === 0) {
        matchScore += 20;
        reasons.push('No annual fee');
      } else if (card.annualFee <= 100) {
        matchScore += 10;
        reasons.push('Low annual fee');
      }

      // Bonus offer consideration
      if (card.bonusOffer) {
        matchScore += 15;
        reasons.push(`Sign-up bonus: ${card.bonusOffer}`);
      }

      // Category-specific bonuses
      if (categoryReward) {
        matchScore += 15;
        reasons.push(`Perfect for ${category} category`);
      }

      // Popular card bonus
      if (card.popular) {
        matchScore += 5;
        reasons.push('Popular choice');
      }

      // Distance bonus if business location provided
      if (business && lat && lng) {
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          business.latitude,
          business.longitude
        );
        
        if (distance <= 1609.34) { // Within 1 mile (converted to meters)
          matchScore += 5;
          reasons.push('Available nearby');
        }
      }

      return {
        card: {
          card_name: card.name,
          issuer: card.issuer,
          annual_fee: card.annualFee || 0,
          bonus_offer: card.bonusOffer,
          image: card.image,
          nickname: card.nickname,
          popular: card.popular
        },
        business,
        estimated_points: Math.round(estimatedPoints),
        annual_value: Math.round(annualValue * 100) / 100,
        match_score: Math.min(matchScore, 100),
        reasons,
        reward_multiplier: rewardMultiplier,
        target_category: rewardCategory
      };
    });

    // Sort by match score and annual value
    recommendations.sort((a, b) => {
      if (Math.abs(a.match_score - b.match_score) < 5) {
        return b.annual_value - a.annual_value;
      }
      return b.match_score - a.match_score;
    });

    console.log('✅ Generated', recommendations.length, 'recommendations');
    console.log('🥇 Top recommendation:', recommendations[0]?.card.card_name, 'with score:', recommendations[0]?.match_score);

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

// Helper function to calculate distance between two points (returns meters)
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
