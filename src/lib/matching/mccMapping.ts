/**
 * MCC (Merchant Category Code) Mapping
 * 
 * Maps standard MCC codes to reward categories for accurate
 * credit card rewards matching.
 * 
 * @module lib/matching/mccMapping
 */

import { RewardCategory } from '@/types/creditCards'

/**
 * MCC code ranges and their corresponding reward categories
 */
export const MCC_CATEGORY_MAP: Record<string, RewardCategory> = {
  // Airlines (3000-3299 and 4511)
  '3000': RewardCategory.Flights,
  '3001': RewardCategory.Flights,
  '3002': RewardCategory.Flights,
  '3003': RewardCategory.Flights,
  '4511': RewardCategory.Flights,
  
  // Hotels and Motels (3500-3999 and 7011)
  '3500': RewardCategory.Hotels,
  '3501': RewardCategory.Hotels,
  '7011': RewardCategory.Hotels,
  
  // Car Rental (3351-3441 and 7512)
  '3351': RewardCategory.RentalCars,
  '7512': RewardCategory.RentalCars,
  '7513': RewardCategory.RentalCars,
  
  // Restaurants and Eating Places
  '5812': RewardCategory.Dining,
  '5813': RewardCategory.Dining, // Bars/Taverns
  '5814': RewardCategory.Dining, // Fast Food
  
  // Grocery Stores
  '5411': RewardCategory.Groceries,
  '5422': RewardCategory.Groceries, // Freezer/Locker Meat
  '5441': RewardCategory.Groceries, // Candy/Nut/Confectionery
  '5451': RewardCategory.Groceries, // Dairy Products
  '5462': RewardCategory.Groceries, // Bakeries
  '5499': RewardCategory.Groceries, // Misc Food Stores
  
  // Supermarkets
  '5300': RewardCategory.Supermarkets,
  '5311': RewardCategory.Department_stores, // Department Stores
  
  // Gas Stations
  '5541': RewardCategory.Gas,
  '5542': RewardCategory.Gas, // Automated Fuel Dispensers
  '5983': RewardCategory.Gas, // Fuel Dealers
  
  // Drugstores/Pharmacies
  '5122': RewardCategory.Drugstores, // Drugs/Drug Proprietaries
  '5292': RewardCategory.Drugstores, // Drug Stores/Pharmacies
  '5912': RewardCategory.Drugstores,
  
  // Home Improvement
  '5200': RewardCategory.HomeImprovement, // Home Supply Warehouse
  '5211': RewardCategory.HomeImprovement, // Lumber/Building Materials
  '5231': RewardCategory.HomeImprovement, // Glass/Paint/Wallpaper
  '5251': RewardCategory.HomeImprovement, // Hardware Stores
  '5261': RewardCategory.HomeImprovement, // Lawn/Garden Supply
  
  // Wholesale Clubs
  '5300': RewardCategory.Wholesale,
  '5310': RewardCategory.Wholesale, // Discount Stores
  '5399': RewardCategory.Wholesale, // Misc General Merchandise
  
  // Entertainment
  '7832': RewardCategory.Entertainment, // Motion Picture Theaters
  '7841': RewardCategory.Entertainment, // Video Tape Rental
  '7911': RewardCategory.Entertainment, // Dance Halls/Studios
  '7922': RewardCategory.Entertainment, // Theatrical Producers
  '7929': RewardCategory.Entertainment, // Bands/Orchestras
  '7932': RewardCategory.Entertainment, // Billiard/Pool
  '7933': RewardCategory.Entertainment, // Bowling Alleys
  '7941': RewardCategory.Entertainment, // Sports Clubs/Fields
  '7991': RewardCategory.Entertainment, // Tourist Attractions
  '7992': RewardCategory.Entertainment, // Golf Courses
  '7993': RewardCategory.Entertainment, // Video Game Arcades
  '7994': RewardCategory.Entertainment, // Video Game Supply
  '7996': RewardCategory.Entertainment, // Amusement Parks
  '7997': RewardCategory.Entertainment, // Country Clubs
  '7998': RewardCategory.Entertainment, // Aquariums
  '7999': RewardCategory.Entertainment, // Recreation Services
  
  // Streaming Services (typically fall under these categories)
  '5815': RewardCategory.Streaming, // Digital Goods: Media
  '5816': RewardCategory.Streaming, // Digital Goods: Games
  '5817': RewardCategory.Streaming, // Digital Goods: Applications
  '5818': RewardCategory.Streaming, // Digital Goods: Large Digital Goods Merchant
  
  // Utilities
  '4900': RewardCategory.Utilities,
  '4812': RewardCategory.CellPhone, // Telecommunication Equipment
  '4814': RewardCategory.CellPhone, // Telecommunication Services
  '4816': RewardCategory.Internet, // Computer Network Services
  
  // Transit/Transportation
  '4111': RewardCategory.PublicTransportation, // Local/Suburban Transit
  '4112': RewardCategory.PublicTransportation, // Passenger Railways
  '4121': RewardCategory.PublicTransportation, // Taxicabs/Limousines
  '4131': RewardCategory.PublicTransportation, // Bus Lines
  '4784': RewardCategory.Tolls, // Tolls/Bridge Fees
  
  // EV Charging
  '5552': RewardCategory.ElectricVehicleCharging, // Electric Vehicle Charging
  
  // Parking
  '7523': RewardCategory.Parking, // Auto Parking Lots/Garages
  
  // Office Supplies/Business
  '5943': RewardCategory.Business, // Stationery Stores
  '5044': RewardCategory.Business, // Office Equipment
  '5045': RewardCategory.Business, // Computers/Software
  '5047': RewardCategory.Business, // Medical Equipment
  '5111': RewardCategory.Business, // Stationery/Office Supplies
  
  // Shipping
  '4215': RewardCategory.Business, // Courier Services
  '4225': RewardCategory.Business, // Warehousing
  
  // Insurance
  '5960': RewardCategory.Insurance, // Direct Marketing Insurance
  '6300': RewardCategory.Insurance, // Insurance
  
  // Fitness/Health
  '7941': RewardCategory.Fitness, // Athletic Fields/Sports Clubs
  '7997': RewardCategory.Fitness, // Membership Clubs
  '8011': RewardCategory.Healthcare, // Doctors
  '8021': RewardCategory.Healthcare, // Dentists
  '8031': RewardCategory.Healthcare, // Chiropractors
  '8041': RewardCategory.Healthcare, // Optometrists
  '8042': RewardCategory.Healthcare, // Opticians
  '8049': RewardCategory.Healthcare, // Podiatrists
  '8050': RewardCategory.Healthcare, // Nursing Care
  '8062': RewardCategory.Healthcare, // Hospitals
  '8071': RewardCategory.Healthcare, // Medical Labs
  '8099': RewardCategory.Healthcare, // Medical Services
  
  // Department Stores
  '5311': RewardCategory.Department_stores,
  '5611': RewardCategory.Department_stores, // Men's Clothing
  '5621': RewardCategory.Department_stores, // Women's Clothing
  '5631': RewardCategory.Department_stores, // Women's Accessories
  '5641': RewardCategory.Department_stores, // Children's Clothing
  '5651': RewardCategory.Department_stores, // Family Clothing
  '5661': RewardCategory.Department_stores, // Shoe Stores
  '5681': RewardCategory.Department_stores, // Furriers
  '5691': RewardCategory.Department_stores, // Men's/Women's Clothing
  '5699': RewardCategory.Department_stores, // Misc Apparel
}

/**
 * MCC ranges for common categories (for range matching)
 */
export const MCC_RANGES: Array<{
  start: number
  end: number
  category: RewardCategory
  description: string
}> = [
  { start: 3000, end: 3299, category: RewardCategory.Flights, description: 'Airlines' },
  { start: 3351, end: 3441, category: RewardCategory.RentalCars, description: 'Car Rental' },
  { start: 3500, end: 3999, category: RewardCategory.Hotels, description: 'Hotels' },
  { start: 5411, end: 5499, category: RewardCategory.Groceries, description: 'Grocery Stores' },
  { start: 5812, end: 5814, category: RewardCategory.Dining, description: 'Restaurants' },
  { start: 5541, end: 5542, category: RewardCategory.Gas, description: 'Gas Stations' },
  { start: 5200, end: 5261, category: RewardCategory.HomeImprovement, description: 'Home Improvement' },
  { start: 5912, end: 5912, category: RewardCategory.Drugstores, description: 'Drugstores' },
  { start: 5815, end: 5818, category: RewardCategory.Streaming, description: 'Digital Goods' },
]

/**
 * Specific airline MCC codes
 */
export const AIRLINE_MCCS: Record<string, string> = {
  '3000': 'united',
  '3001': 'american',
  '3005': 'delta',
  '3006': 'southwest',
  '3058': 'delta',
  '3065': 'jetblue',
  '3136': 'alaska',
  '4511': 'general_airline', // Airline Ticket Agencies
}

/**
 * Specific hotel chain MCC codes
 */
export const HOTEL_MCCS: Record<string, string> = {
  '3501': 'hilton',
  '3502': 'marriott',
  '3503': 'hyatt',
  '3504': 'sheraton',
  '3505': 'best_western',
  '3506': 'holiday_inn',
  '3507': 'ramada',
  '3508': 'howard_johnson',
  '3509': 'red_roof',
  '3510': 'la_quinta',
  '3512': 'wyndham',
  '3513': 'westin',
  '3515': 'fairmont',
  '3516': 'omni',
  '3517': 'loews',
  '3518': 'radisson',
  '3519': 'red_lion',
  '3520': 'intercontinental',
  '3522': 'doubletree',
  '3523': 'embassy_suites',
  '3527': 'extended_stay',
  '3528': 'renaissance',
  '3530': 'residence_inn',
  '3531': 'courtyard',
  '3532': 'fairfield_inn',
  '3533': 'marriott_vacation',
  '3534': 'hampton_inn',
  '3535': 'embassy_suites',
  '3536': 'doubletree',
  '3537': 'homewood_suites',
  '3542': 'club_med',
  '3543': 'four_seasons',
  '3544': 'ritz_carlton',
  '3546': 'w_hotels',
  '3548': 'st_regis',
  '3550': 'luxury_collection',
  '3554': 'le_meridien',
  '3615': 'aloft',
  '3616': 'element',
  '3617': 'tribute',
  '3635': 'park_hyatt',
  '3636': 'grand_hyatt',
  '3637': 'hyatt_regency',
  '3638': 'hyatt_place',
  '3639': 'hyatt_house',
  '3640': 'andaz',
  '3641': 'thompson',
  '7011': 'general_hotel', // Hotels/Motels
}

/**
 * Get reward category from MCC code
 */
export function getCategoryFromMCC(mcc: string | number): RewardCategory | null {
  const mccStr = String(mcc).padStart(4, '0')
  const mccNum = parseInt(mccStr, 10)
  
  // Check direct mapping first
  if (MCC_CATEGORY_MAP[mccStr]) {
    return MCC_CATEGORY_MAP[mccStr]
  }
  
  // Check ranges
  for (const range of MCC_RANGES) {
    if (mccNum >= range.start && mccNum <= range.end) {
      return range.category
    }
  }
  
  return null
}

/**
 * Get hotel brand from MCC code
 */
export function getHotelBrandFromMCC(mcc: string | number): string | null {
  const mccStr = String(mcc).padStart(4, '0')
  return HOTEL_MCCS[mccStr] || null
}

/**
 * Get airline brand from MCC code
 */
export function getAirlineBrandFromMCC(mcc: string | number): string | null {
  const mccStr = String(mcc).padStart(4, '0')
  return AIRLINE_MCCS[mccStr] || null
}

/**
 * Determine if MCC indicates a bonus category for a specific card
 */
export function isBonusCategoryMCC(
  mcc: string | number, 
  bonusCategories: RewardCategory[]
): boolean {
  const category = getCategoryFromMCC(mcc)
  if (!category) return false
  return bonusCategories.includes(category)
}

export default {
  MCC_CATEGORY_MAP,
  MCC_RANGES,
  AIRLINE_MCCS,
  HOTEL_MCCS,
  getCategoryFromMCC,
  getHotelBrandFromMCC,
  getAirlineBrandFromMCC,
  isBonusCategoryMCC,
}
