import { NextRequest, NextResponse } from 'next/server';
import getRequestUrl from '@/lib/getRequestUrl';
import prisma from '@/lib/prisma';
import { creditCardDatabase } from '@/data/creditCardDatabase';
import { RewardCategory } from '@/types/creditCards';
import { apiCache } from '@/lib/apiCache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = getRequestUrl(request);
    const category = searchParams.get('category');
    const businessId = searchParams.get('businessId');
    const businessName = searchParams.get('businessName');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const fields = searchParams.get('fields'); // Optional field selection

    if (!category && !businessId) {
      return NextResponse.json(
        { error: 'Category or business ID is required', success: false },
        { status: 400 }
      );
    }

    // Create cache key from request parameters
    const cacheKey = apiCache.generateKey({
      category,
      businessId,
      businessName,
      lat,
      lng,
      fields
    });

    // Check cache first
    const cachedResult = apiCache.get(cacheKey);
    if (cachedResult) {
      console.log('🚀 Cache hit for recommendations request');
      return NextResponse.json(cachedResult);
    }

    console.log('🎯 Recommendations API called with:', { category, businessId, businessName, lat, lng, fields });

    // Use deduplication for concurrent requests
    const result = await apiCache.dedupe(cacheKey, async () => {
      return await generateRecommendations({ category, businessId, businessName, lat, lng, fields });
    });

    // Cache the result for 5 minutes
    apiCache.set(cacheKey, result, { ttl: 300000 });

    return NextResponse.json(result);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

async function generateRecommendations({ category, businessId, businessName, lat, lng, fields }: {
  category: string | null;
  businessId: string | null;
  businessName: string | null;
  lat: string | null;
  lng: string | null;
  fields: string | null;
}) {

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
    let business: Awaited<ReturnType<typeof prisma.business.findUnique>> | null = null;
    if (businessId) {
      business = await prisma.business.findUnique({ where: { id: businessId } });
    }

    // If no business found by ID but we have a business name, create a mock business object
    if (!business && businessName) {
      business = {
        id: businessId || 'temp',
        name: businessName,
        category: category || 'general',
        latitude: lat ? parseFloat(lat) : 0,
        longitude: lng ? parseFloat(lng) : 0,
        address: 'Location provided',
        website: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        placeId: null,
        rating: null,
        priceLevel: null,
        phone: null
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
      const reasons: string[] = []; // Move reasons array here
      if (business) {
        const businessName = business.name.toLowerCase();
        console.log('🏨 Checking business for brand detection:', businessName);
        
        // Detect hotel brands and check for matching cards
        if (businessName.includes('marriott') || businessName.includes('bonvoy') || 
            businessName.includes('courtyard') || businessName.includes('residence inn') || 
            businessName.includes('fairfield inn') || businessName.includes('springhill suites') ||
            businessName.includes('towneplace suites') || businessName.includes('aloft') ||
            businessName.includes('w hotel') || businessName.includes('edition') ||
            businessName.includes('st. regis') || businessName.includes('luxury collection') ||
            businessName.includes('ritz-carlton') || businessName.includes('ritz carlton')) {
          console.log('🎯 MARRIOTT BRAND DETECTED! Business:', businessName);
          const marriottReward = card.rewards.find(r => r.category === RewardCategory.Marriott);
          if (marriottReward) {
            console.log('✅ Found Marriott reward on', card.name, '- multiplier:', marriottReward.multiplier);
            rewardMultiplier = marriottReward.multiplier;
            rewardCategory = RewardCategory.Marriott;
            hotelBrandBonus = 50; // Major bonus for exact brand match
            reasons.push(`Perfect for ${business.name} - Marriott brand card`);
          } else {
            console.log('❌ No Marriott reward found on', card.name);
          }
        } else if (businessName.includes('hilton') || businessName.includes('hampton inn') || 
                   businessName.includes('doubletree') || businessName.includes('embassy suites') ||
                   businessName.includes('homewood suites') || businessName.includes('home2 suites') ||
                   businessName.includes('waldorf astoria') || businessName.includes('conrad') ||
                   businessName.includes('canopy') || businessName.includes('curio')) {
          console.log('🎯 HILTON BRAND DETECTED! Business:', businessName);
          const hiltonReward = card.rewards.find(r => r.category === RewardCategory.Hilton);
          if (hiltonReward) {
            console.log('✅ Found Hilton reward on', card.name, '- multiplier:', hiltonReward.multiplier);
            rewardMultiplier = hiltonReward.multiplier;
            rewardCategory = RewardCategory.Hilton;
            hotelBrandBonus = 50;
            reasons.push(`Perfect for ${business.name} - Hilton brand card`);
          } else {
            console.log('❌ No Hilton reward found on', card.name);
          }
        } else if (businessName.includes('hyatt') || businessName.includes('grand hyatt') ||
                   businessName.includes('park hyatt') || businessName.includes('andaz') ||
                   businessName.includes('hyatt house') || businessName.includes('hyatt place') ||
                   businessName.includes('alila') || businessName.includes('destination hotels')) {
          console.log('🎯 HYATT BRAND DETECTED! Business:', businessName);
          const hyattReward = card.rewards.find(r => r.category === RewardCategory.Hyatt);
          if (hyattReward) {
            rewardMultiplier = hyattReward.multiplier;
            rewardCategory = RewardCategory.Hyatt;
            hotelBrandBonus = 50;
            reasons.push(`Perfect for ${business.name} - Hyatt brand card`);
          }
        } else if (businessName.includes('ihg') || businessName.includes('holiday inn') || 
                   businessName.includes('intercontinental') || businessName.includes('crowne plaza') ||
                   businessName.includes('hotel indigo') || businessName.includes('even hotels') ||
                   businessName.includes('staybridge suites') || businessName.includes('candlewood suites') ||
                   businessName.includes('avid hotels') || businessName.includes('atwell suites')) {
          console.log('🎯 IHG BRAND DETECTED! Business:', businessName);
          const ihgReward = card.rewards.find(r => r.category === RewardCategory.IHG);
          if (ihgReward) {
            rewardMultiplier = ihgReward.multiplier;
            rewardCategory = RewardCategory.IHG;
            hotelBrandBonus = 50;
            reasons.push(`Perfect for ${business.name} - IHG brand card`);
          }
        } else if (businessName.includes('wyndham') || businessName.includes('ramada') || 
                   businessName.includes('days inn') || businessName.includes('super 8') ||
                   businessName.includes('howard johnson') || businessName.includes('travelodge') ||
                   businessName.includes('wingate') || businessName.includes('baymont') ||
                   businessName.includes('microtel') || businessName.includes('la quinta')) {
          console.log('🎯 WYNDHAM BRAND DETECTED! Business:', businessName);
          const wyndhamReward = card.rewards.find(r => r.category === RewardCategory.Wyndham);
          if (wyndhamReward) {
            rewardMultiplier = wyndhamReward.multiplier;
            rewardCategory = RewardCategory.Wyndham;
            hotelBrandBonus = 50;
            reasons.push(`Perfect for ${business.name} - Wyndham brand card`);
          }
        } else if (businessName.includes('choice') || businessName.includes('comfort inn') || 
                   businessName.includes('quality inn') || businessName.includes('clarion') ||
                   businessName.includes('sleep inn') || businessName.includes('mainstay suites') ||
                   businessName.includes('suburban') || businessName.includes('econo lodge') ||
                   businessName.includes('rodeway inn') || businessName.includes('ascend')) {
          console.log('🎯 CHOICE BRAND DETECTED! Business:', businessName);
          const choiceReward = card.rewards.find(r => r.category === RewardCategory.Choice);
          if (choiceReward) {
            rewardMultiplier = choiceReward.multiplier;
            rewardCategory = RewardCategory.Choice;
            hotelBrandBonus = 50;
            reasons.push(`Perfect for ${business.name} - Choice brand card`);
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

    // Apply field selection if requested
    let filteredRecommendations: unknown[] = recommendations.slice(0, 10); // Top 10 recommendations
    
    if (fields) {
      const requestedFields = fields.split(',').map(f => f.trim());
      filteredRecommendations = filteredRecommendations.map(rec => {
        const recommendation = rec as typeof recommendations[0];
        const filtered: Record<string, unknown> = {};
        
        requestedFields.forEach(field => {
          if (field.startsWith('card.')) {
            const cardField = field.replace('card.', '');
            if (!filtered.card) filtered.card = {};
            if (recommendation.card[cardField as keyof typeof recommendation.card] !== undefined) {
              (filtered.card as Record<string, unknown>)[cardField] = recommendation.card[cardField as keyof typeof recommendation.card];
            }
          } else if (field.startsWith('business.')) {
            const businessField = field.replace('business.', '');
            if (!filtered.business) filtered.business = {};
            if (recommendation.business && recommendation.business[businessField as keyof typeof recommendation.business] !== undefined) {
              (filtered.business as Record<string, unknown>)[businessField] = recommendation.business[businessField as keyof typeof recommendation.business];
            }
          } else if (recommendation[field as keyof typeof recommendation] !== undefined) {
            filtered[field] = recommendation[field as keyof typeof recommendation];
          }
        });
        
        return filtered;
      });
    }

    return {
      recommendations: filteredRecommendations,
      business,
      category,
      success: true
    };
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
