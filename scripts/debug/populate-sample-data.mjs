// Enhanced Sample Data Population Script
// Adds sample businesses for all categories including travel

const addSampleBusinesses = async () => {
  try {
    console.log('🌍 Adding Sample Travel & Other Category Businesses...');
    
    // Phoenix, AZ coordinates from the user's location
    const phoenixLat = 33.6330752;
    const phoenixLng = -111.9158272;
    
    // Sample businesses for different categories
    const sampleBusinesses = [
      // Travel Category
      {
        name: 'Phoenix Sky Harbor International Airport',
        address: '3400 E Sky Harbor Blvd, Phoenix, AZ 85034',
        category: 'travel',
        latitude: 33.4342, 
        longitude: -112.0080,
        rating: 4.1,
        price_level: 2,
        phone_number: '(602) 273-3300',
        place_id: 'ChIJH8uw_e8pK4cRk-xGNrOwKCg'
      },
      {
        name: 'Enterprise Rent-A-Car',
        address: '1805 E Sky Harbor Cir S, Phoenix, AZ 85034',
        category: 'travel',
        latitude: 33.4380,
        longitude: -112.0070,
        rating: 4.0,
        price_level: 2,
        phone_number: '(602) 225-0588',
        place_id: 'ChIJ123_travel_enterprise'
      },
      {
        name: 'Hertz Car Rental',
        address: '1805 E Sky Harbor Cir S, Phoenix, AZ 85034',
        category: 'travel',
        latitude: 33.4375,
        longitude: -112.0065,
        rating: 3.8,
        price_level: 3,
        phone_number: '(602) 267-8822',
        place_id: 'ChIJ456_travel_hertz'
      },
      {
        name: 'AAA Travel Agency',
        address: '2334 W Bell Rd, Phoenix, AZ 85023',
        category: 'travel',
        latitude: 33.6392,
        longitude: -112.1089,
        rating: 4.3,
        price_level: 2,
        phone_number: '(602) 274-1116',
        place_id: 'ChIJ789_travel_aaa'
      },
      {
        name: 'Expedia CruiseShipCenters',
        address: '4718 E Cactus Rd, Phoenix, AZ 85032',
        category: 'travel',
        latitude: 33.5942,
        longitude: -111.9847,
        rating: 4.5,
        price_level: 2,
        phone_number: '(602) 494-1115',
        place_id: 'ChIJ012_travel_expedia'
      },
      
      // Additional Dining for variety
      {
        name: 'The Capital Grille',
        address: '2502 E Camelback Rd, Phoenix, AZ 85016',
        category: 'dining',
        latitude: 33.5092,
        longitude: -112.0294,
        rating: 4.4,
        price_level: 4,
        phone_number: '(602) 952-8900',
        place_id: 'ChIJ345_dining_capital'
      },
      {
        name: 'Fogo de Chão Brazilian Steakhouse',
        address: '4609 E Washington St, Phoenix, AZ 85034',
        category: 'dining',
        latitude: 33.4484,
        longitude: -111.9647,
        rating: 4.3,
        price_level: 4,
        phone_number: '(602) 333-7344',
        place_id: 'ChIJ678_dining_fogo'
      },
      
      // Hotels Category
      {
        name: 'The Phoenician, a Luxury Collection Resort',
        address: '6000 E Camelback Rd, Scottsdale, AZ 85251',
        category: 'hotels',
        latitude: 33.5039,
        longitude: -111.9297,
        rating: 4.2,
        price_level: 4,
        phone_number: '(480) 941-8200',
        place_id: 'ChIJ901_hotels_phoenician'
      },
      {
        name: 'Arizona Grand Resort & Spa',
        address: '8000 S Arizona Grand Pkwy, Phoenix, AZ 85044',
        category: 'hotels',
        latitude: 33.3628,
        longitude: -112.0447,
        rating: 4.0,
        price_level: 3,
        phone_number: '(602) 438-9000',
        place_id: 'ChIJ234_hotels_arizona_grand'
      },
      
      // Shopping Category
      {
        name: 'Scottsdale Fashion Square',
        address: '7014 E Camelback Rd, Scottsdale, AZ 85251',
        category: 'shopping',
        latitude: 33.5028,
        longitude: -111.9292,
        rating: 4.1,
        price_level: 3,
        phone_number: '(480) 941-2140',
        place_id: 'ChIJ567_shopping_fashion_square'
      },
      
      // Gas Stations
      {
        name: 'Circle K',
        address: '1515 E Bell Rd, Phoenix, AZ 85022',
        category: 'gas',
        latitude: 33.6392,
        longitude: -112.0647,
        rating: 3.5,
        price_level: 2,
        phone_number: '(602) 942-8711',
        place_id: 'ChIJ890_gas_circle_k'
      }
    ];
    
    // Calculate distances from user's location
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 3959; // Earth's radius in miles
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c * 5280; // Convert to feet
    };
    
    // Add distance to each business
    const businessesWithDistance = sampleBusinesses.map(business => ({
      ...business,
      distance: calculateDistance(phoenixLat, phoenixLng, business.latitude, business.longitude)
    }));
    
    console.log('📍 Sample businesses prepared:');
    businessesWithDistance.forEach((business, index) => {
      console.log(`${index + 1}. ${business.name} (${business.category}) - ${Math.round(business.distance)}ft away`);
    });
    
    console.log('\n🎯 Travel category businesses:', businessesWithDistance.filter(b => b.category === 'travel').length);
    console.log('🏨 Hotel category businesses:', businessesWithDistance.filter(b => b.category === 'hotels').length);
    console.log('🍽️ Dining category businesses:', businessesWithDistance.filter(b => b.category === 'dining').length);
    console.log('🛍️ Shopping category businesses:', businessesWithDistance.filter(b => b.category === 'shopping').length);
    console.log('⛽ Gas category businesses:', businessesWithDistance.filter(b => b.category === 'gas').length);
    
    console.log('\n✅ Sample data script ready!');
    console.log('📝 To populate database, run this with a Supabase connection.');
    
    return businessesWithDistance;
    
  } catch (error) {
    console.error('❌ Error preparing sample data:', error);
  }
};

addSampleBusinesses();
