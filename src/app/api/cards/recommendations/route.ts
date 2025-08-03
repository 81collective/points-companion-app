import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { creditCardDatabase } from '@/data/creditCardDatabase';
import { RewardCategory } from '@/types/creditCards';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const businessId = searchParams.get('businessId');
    const businessName = searchParams.get('businessName');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!category && !businessId) {
      return NextResponse.json(
        { error: 'Category or business ID is required', success: false },
        { status: 400 }
      );
    }

    console.log('🎯 Recommendations API called with:', { category, businessId, businessName, lat, lng });

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
      'shopping': RewardCategory.Department_stores,
      // Hotel brands
      'marriott': RewardCategory.Marriott,
      'hilton': RewardCategory.Hilton,
      'hyatt': RewardCategory.Hyatt,
      'ihg': RewardCategory.IHG,
      'wyndham': RewardCategory.Wyndham,
      'choice': RewardCategory.Choice,
      // Airline brands
      'united': RewardCategory.United,
      'delta': RewardCategory.Delta,
      'american': RewardCategory.American,
      'southwest': RewardCategory.Southwest,
      'jetblue': RewardCategory.JetBlue,
      'alaska': RewardCategory.Alaska
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

    // If no business found by ID but we have a business name, create a mock business object
    if (!business && businessName) {
      business = {
        id: businessId || 'temp',
        name: businessName,
        category: category || 'general',
        latitude: lat ? parseFloat(lat) : 0,
        longitude: lng ? parseFloat(lng) : 0,
        address: 'Location provided'
      };
      console.log('🏢 Created temporary business object for:', businessName);
    }

    // Calculate recommendations based on our credit card database
    const recommendations = creditCardDatabase.map(card => {
      // Find the best reward multiplier for the target category
      const categoryReward = card.rewards.find(r => r.category === targetCategory);
      const everythingElseReward = card.rewards.find(r => r.category === RewardCategory.EverythingElse);
      
      let rewardMultiplier = categoryReward?.multiplier || everythingElseReward?.multiplier || 1;
      let rewardCategory = categoryReward?.category || RewardCategory.EverythingElse;
      
      // Hotel brand-specific logic
      let hotelBrandBonus = 0;
      let airlineBrandBonus = 0;
      if (business) {
        const businessName = business.name.toLowerCase();
        console.log('🏨 Checking business for brand detection:', businessName);
        
        // Detect hotel brands and check for matching cards
        if (businessName.includes('marriott') || businessName.includes('bonvoy')) {
          console.log('🎯 MARRIOTT DETECTED! Looking for Marriott rewards on card:', card.name);
          const marriottReward = card.rewards.find(r => r.category === RewardCategory.Marriott);
          if (marriottReward) {
            console.log('✅ Found Marriott reward on', card.name, '- multiplier:', marriottReward.multiplier);
            rewardMultiplier = marriottReward.multiplier;
            rewardCategory = RewardCategory.Marriott;
            hotelBrandBonus = 30; // Major bonus for brand match
          } else {
            console.log('❌ No Marriott reward found on', card.name);
          }
        } else if (businessName.includes('hilton')) {
          const hiltonReward = card.rewards.find(r => r.category === RewardCategory.Hilton);
          if (hiltonReward) {
            rewardMultiplier = hiltonReward.multiplier;
            rewardCategory = RewardCategory.Hilton;
            hotelBrandBonus = 30;
          }
        } else if (businessName.includes('hyatt')) {
          const hyattReward = card.rewards.find(r => r.category === RewardCategory.Hyatt);
          if (hyattReward) {
            rewardMultiplier = hyattReward.multiplier;
            rewardCategory = RewardCategory.Hyatt;
            hotelBrandBonus = 30;
          }
        } else if (businessName.includes('ihg') || businessName.includes('holiday inn') || businessName.includes('intercontinental')) {
          const ihgReward = card.rewards.find(r => r.category === RewardCategory.IHG);
          if (ihgReward) {
            rewardMultiplier = ihgReward.multiplier;
            rewardCategory = RewardCategory.IHG;
            hotelBrandBonus = 30;
          }
        } else if (businessName.includes('wyndham') || businessName.includes('ramada') || businessName.includes('days inn') || businessName.includes('super 8')) {
          const wyndhamReward = card.rewards.find(r => r.category === RewardCategory.Wyndham);
          if (wyndhamReward) {
            rewardMultiplier = wyndhamReward.multiplier;
            rewardCategory = RewardCategory.Wyndham;
            hotelBrandBonus = 30;
          }
        } else if (businessName.includes('choice') || businessName.includes('comfort inn') || businessName.includes('quality inn') || businessName.includes('clarion')) {
          const choiceReward = card.rewards.find(r => r.category === RewardCategory.Choice);
          if (choiceReward) {
            rewardMultiplier = choiceReward.multiplier;
            rewardCategory = RewardCategory.Choice;
            hotelBrandBonus = 30;
          }
        }

        // Detect airline brands and check for matching cards
        if (businessName.includes('united airlines') || businessName.includes('united') && businessName.includes('airline')) {
          const unitedReward = card.rewards.find(r => r.category === RewardCategory.United);
          if (unitedReward) {
            rewardMultiplier = unitedReward.multiplier;
            rewardCategory = RewardCategory.United;
            airlineBrandBonus = 30; // Major bonus for brand match
          }
        } else if (businessName.includes('delta') || businessName.includes('delta air lines')) {
          const deltaReward = card.rewards.find(r => r.category === RewardCategory.Delta);
          if (deltaReward) {
            rewardMultiplier = deltaReward.multiplier;
            rewardCategory = RewardCategory.Delta;
            airlineBrandBonus = 30;
          }
        } else if (businessName.includes('american airlines') || (businessName.includes('american') && businessName.includes('airline'))) {
          const americanReward = card.rewards.find(r => r.category === RewardCategory.American);
          if (americanReward) {
            rewardMultiplier = americanReward.multiplier;
            rewardCategory = RewardCategory.American;
            airlineBrandBonus = 30;
          }
        } else if (businessName.includes('southwest') || businessName.includes('southwest airlines')) {
          const southwestReward = card.rewards.find(r => r.category === RewardCategory.Southwest);
          if (southwestReward) {
            rewardMultiplier = southwestReward.multiplier;
            rewardCategory = RewardCategory.Southwest;
            airlineBrandBonus = 30;
          }
        } else if (businessName.includes('jetblue') || businessName.includes('jet blue')) {
          const jetblueReward = card.rewards.find(r => r.category === RewardCategory.JetBlue);
          if (jetblueReward) {
            rewardMultiplier = jetblueReward.multiplier;
            rewardCategory = RewardCategory.JetBlue;
            airlineBrandBonus = 30;
          }
        } else if (businessName.includes('alaska airlines') || (businessName.includes('alaska') && businessName.includes('airline'))) {
          const alaskaReward = card.rewards.find(r => r.category === RewardCategory.Alaska);
          if (alaskaReward) {
            rewardMultiplier = alaskaReward.multiplier;
            rewardCategory = RewardCategory.Alaska;
            airlineBrandBonus = 30;
          }
        }
      }
      
      // Base calculation - assume $100 spending
      const estimatedPoints = 100 * rewardMultiplier;
      let annualValue = 0;
      let matchScore = hotelBrandBonus + airlineBrandBonus; // Start with brand bonuses
      const reasons: string[] = [];

      // Add brand bonus reasons
      if (hotelBrandBonus > 0) {
        reasons.push(`Perfect match for ${business?.name} - brand-specific hotel card`);
      }
      if (airlineBrandBonus > 0) {
        reasons.push(`Perfect match for ${business?.name} - brand-specific airline card`);
      }

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
