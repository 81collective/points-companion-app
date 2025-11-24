import { NextRequest, NextResponse } from 'next/server';
import getRequestUrl from '@/lib/getRequestUrl';
import prisma from '@/lib/prisma';
import { creditCardDatabase } from '@/data/creditCardDatabase';
import { RewardCategory } from '@/types/creditCards';
import { apiCache } from '@/lib/apiCache';
import { matchMerchant } from '@/lib/matching/merchantMatcher';

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

    // Use fuzzy matching if we have a business name
    let matchResult = null;
    if (businessName) {
      matchResult = matchMerchant(businessName);
      console.log('🔍 Fuzzy match result for', businessName, ':', {
        category: matchResult.category,
        confidence: matchResult.confidence,
        hotelBrand: matchResult.hotelBrand,
        airlineBrand: matchResult.airlineBrand,
        notes: matchResult.notes
      });
    }

    // Determine target category - prefer fuzzy match if confident
    let targetCategory = RewardCategory.EverythingElse;
    if (matchResult && matchResult.confidence >= 0.7) {
      targetCategory = matchResult.category;
      console.log('🎯 Using fuzzy-matched category:', targetCategory);
    } else if (category) {
      targetCategory = categoryMap[category] || RewardCategory.EverythingElse;
      console.log('🎯 Using provided category:', targetCategory);
    }

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
      
      // Hotel/Airline brand-specific logic using fuzzy match results
      let hotelBrandBonus = 0;
      let airlineBrandBonus = 0;
      const reasons: string[] = [];
      
      // Use fuzzy matching results if available
      if (matchResult && matchResult.confidence >= 0.7) {
        // Check for hotel brand match
        if (matchResult.hotelBrand) {
          const hotelBrandCategoryMap: Record<string, RewardCategory> = {
            'marriott': RewardCategory.Marriott,
            'hilton': RewardCategory.Hilton,
            'hyatt': RewardCategory.Hyatt,
            'ihg': RewardCategory.IHG,
            'wyndham': RewardCategory.Wyndham,
            'choice': RewardCategory.Choice,
          };
          const brandCategory = hotelBrandCategoryMap[matchResult.hotelBrand];
          if (brandCategory) {
            const brandReward = card.rewards.find(r => r.category === brandCategory);
            if (brandReward) {
              console.log(`✅ Fuzzy match: ${matchResult.hotelBrand} card found - ${card.name}`);
              rewardMultiplier = brandReward.multiplier;
              rewardCategory = brandCategory;
              hotelBrandBonus = 50;
              reasons.push(`Perfect for ${business?.name || businessName} - ${matchResult.hotelBrand} brand card`);
            }
          }
        }
        
        // Check for airline brand match
        if (matchResult.airlineBrand) {
          const airlineBrandCategoryMap: Record<string, RewardCategory> = {
            'united': RewardCategory.United,
            'delta': RewardCategory.Delta,
            'american': RewardCategory.American,
            'southwest': RewardCategory.Southwest,
            'jetblue': RewardCategory.JetBlue,
            'alaska': RewardCategory.Alaska,
          };
          const brandCategory = airlineBrandCategoryMap[matchResult.airlineBrand];
          if (brandCategory) {
            const brandReward = card.rewards.find(r => r.category === brandCategory);
            if (brandReward) {
              console.log(`✅ Fuzzy match: ${matchResult.airlineBrand} card found - ${card.name}`);
              rewardMultiplier = brandReward.multiplier;
              rewardCategory = brandCategory;
              airlineBrandBonus = 30;
              reasons.push(`Perfect for ${business?.name || businessName} - ${matchResult.airlineBrand} brand card`);
            }
          }
        }
      }
      
      // Fallback to legacy string matching if no fuzzy match
      if (business && !hotelBrandBonus && !airlineBrandBonus) {
        const legacyBusinessName = business.name.toLowerCase();
        console.log('🏨 Checking business for brand detection (legacy):', legacyBusinessName);
        
        // Detect hotel brands and check for matching cards
        if (legacyBusinessName.includes('marriott') || legacyBusinessName.includes('bonvoy') || 
            legacyBusinessName.includes('courtyard') || legacyBusinessName.includes('residence inn') || 
            legacyBusinessName.includes('fairfield inn') || legacyBusinessName.includes('springhill suites') ||
            legacyBusinessName.includes('towneplace suites') || legacyBusinessName.includes('aloft') ||
            legacyBusinessName.includes('w hotel') || legacyBusinessName.includes('edition') ||
            legacyBusinessName.includes('st. regis') || legacyBusinessName.includes('luxury collection') ||
            legacyBusinessName.includes('ritz-carlton') || legacyBusinessName.includes('ritz carlton')) {
          console.log('🎯 MARRIOTT BRAND DETECTED! Business:', legacyBusinessName);
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
        } else if (legacyBusinessName.includes('hilton') || legacyBusinessName.includes('hampton inn') || 
                   legacyBusinessName.includes('doubletree') || legacyBusinessName.includes('embassy suites') ||
                   legacyBusinessName.includes('homewood suites') || legacyBusinessName.includes('home2 suites') ||
                   legacyBusinessName.includes('waldorf astoria') || legacyBusinessName.includes('conrad') ||
                   legacyBusinessName.includes('canopy') || legacyBusinessName.includes('curio')) {
          console.log('🎯 HILTON BRAND DETECTED! Business:', legacyBusinessName);
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
        } else if (legacyBusinessName.includes('hyatt') || legacyBusinessName.includes('grand hyatt') ||
                   legacyBusinessName.includes('park hyatt') || legacyBusinessName.includes('andaz') ||
                   legacyBusinessName.includes('hyatt house') || legacyBusinessName.includes('hyatt place') ||
                   legacyBusinessName.includes('alila') || legacyBusinessName.includes('destination hotels')) {
          console.log('🎯 HYATT BRAND DETECTED! Business:', legacyBusinessName);
          const hyattReward = card.rewards.find(r => r.category === RewardCategory.Hyatt);
          if (hyattReward) {
            rewardMultiplier = hyattReward.multiplier;
            rewardCategory = RewardCategory.Hyatt;
            hotelBrandBonus = 50;
            reasons.push(`Perfect for ${business.name} - Hyatt brand card`);
          }
        } else if (legacyBusinessName.includes('ihg') || legacyBusinessName.includes('holiday inn') || 
                   legacyBusinessName.includes('intercontinental') || legacyBusinessName.includes('crowne plaza') ||
                   legacyBusinessName.includes('hotel indigo') || legacyBusinessName.includes('even hotels') ||
                   legacyBusinessName.includes('staybridge suites') || legacyBusinessName.includes('candlewood suites') ||
                   legacyBusinessName.includes('avid hotels') || legacyBusinessName.includes('atwell suites')) {
          console.log('🎯 IHG BRAND DETECTED! Business:', legacyBusinessName);
          const ihgReward = card.rewards.find(r => r.category === RewardCategory.IHG);
          if (ihgReward) {
            rewardMultiplier = ihgReward.multiplier;
            rewardCategory = RewardCategory.IHG;
            hotelBrandBonus = 50;
            reasons.push(`Perfect for ${business.name} - IHG brand card`);
          }
        } else if (legacyBusinessName.includes('wyndham') || legacyBusinessName.includes('ramada') || 
                   legacyBusinessName.includes('days inn') || legacyBusinessName.includes('super 8') ||
                   legacyBusinessName.includes('howard johnson') || legacyBusinessName.includes('travelodge') ||
                   legacyBusinessName.includes('wingate') || legacyBusinessName.includes('baymont') ||
                   legacyBusinessName.includes('microtel') || legacyBusinessName.includes('la quinta')) {
          console.log('🎯 WYNDHAM BRAND DETECTED! Business:', legacyBusinessName);
          const wyndhamReward = card.rewards.find(r => r.category === RewardCategory.Wyndham);
          if (wyndhamReward) {
            rewardMultiplier = wyndhamReward.multiplier;
            rewardCategory = RewardCategory.Wyndham;
            hotelBrandBonus = 50;
            reasons.push(`Perfect for ${business.name} - Wyndham brand card`);
          }
        } else if (legacyBusinessName.includes('choice') || legacyBusinessName.includes('comfort inn') || 
                   legacyBusinessName.includes('quality inn') || legacyBusinessName.includes('clarion') ||
                   legacyBusinessName.includes('sleep inn') || legacyBusinessName.includes('mainstay suites') ||
                   legacyBusinessName.includes('suburban') || legacyBusinessName.includes('econo lodge') ||
                   legacyBusinessName.includes('rodeway inn') || legacyBusinessName.includes('ascend')) {
          console.log('🎯 CHOICE BRAND DETECTED! Business:', legacyBusinessName);
          const choiceReward = card.rewards.find(r => r.category === RewardCategory.Choice);
          if (choiceReward) {
            rewardMultiplier = choiceReward.multiplier;
            rewardCategory = RewardCategory.Choice;
            hotelBrandBonus = 50;
            reasons.push(`Perfect for ${business.name} - Choice brand card`);
          }
        }

        // Detect airline brands and check for matching cards
        if (legacyBusinessName.includes('united airlines') || legacyBusinessName.includes('united') && legacyBusinessName.includes('airline')) {
          const unitedReward = card.rewards.find(r => r.category === RewardCategory.United);
          if (unitedReward) {
            rewardMultiplier = unitedReward.multiplier;
            rewardCategory = RewardCategory.United;
            airlineBrandBonus = 30; // Major bonus for brand match
          }
        } else if (legacyBusinessName.includes('delta') || legacyBusinessName.includes('delta air lines')) {
          const deltaReward = card.rewards.find(r => r.category === RewardCategory.Delta);
          if (deltaReward) {
            rewardMultiplier = deltaReward.multiplier;
            rewardCategory = RewardCategory.Delta;
            airlineBrandBonus = 30;
          }
        } else if (legacyBusinessName.includes('american airlines') || (legacyBusinessName.includes('american') && legacyBusinessName.includes('airline'))) {
          const americanReward = card.rewards.find(r => r.category === RewardCategory.American);
          if (americanReward) {
            rewardMultiplier = americanReward.multiplier;
            rewardCategory = RewardCategory.American;
            airlineBrandBonus = 30;
          }
        } else if (legacyBusinessName.includes('southwest') || legacyBusinessName.includes('southwest airlines')) {
          const southwestReward = card.rewards.find(r => r.category === RewardCategory.Southwest);
          if (southwestReward) {
            rewardMultiplier = southwestReward.multiplier;
            rewardCategory = RewardCategory.Southwest;
            airlineBrandBonus = 30;
          }
        } else if (legacyBusinessName.includes('jetblue') || legacyBusinessName.includes('jet blue')) {
          const jetblueReward = card.rewards.find(r => r.category === RewardCategory.JetBlue);
          if (jetblueReward) {
            rewardMultiplier = jetblueReward.multiplier;
            rewardCategory = RewardCategory.JetBlue;
            airlineBrandBonus = 30;
          }
        } else if (legacyBusinessName.includes('alaska airlines') || (legacyBusinessName.includes('alaska') && legacyBusinessName.includes('airline'))) {
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
