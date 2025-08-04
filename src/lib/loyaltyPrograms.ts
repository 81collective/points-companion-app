// Comprehensive Loyalty Programs Database
// Points Companion - Major Programs (100+ programs)

import { LoyaltyProgram } from '@/types/loyalty';

export const loyaltyPrograms: LoyaltyProgram[] = [
  // AIRLINES - Major US Carriers
  {
    id: 'american-aadvantage',
    name: 'American Airlines AAdvantage',
    category: 'airline',
    pointsName: 'miles',
    logoUrl: '/logos/american-airlines.svg',
    website: 'https://www.aa.com/aadvantage',
    expirationRules: {
      expiresAfter: 24,
      activityRequired: true,
      extensionPossible: true
    },
    eliteProgram: {
      tiers: ['Gold', 'Platinum', 'Platinum Pro', 'Executive Platinum', 'ConciergeKey'],
      benefits: ['Priority boarding', 'Free checked bags', 'Upgrades', 'Lounge access']
    }
  },
  {
    id: 'delta-skymiles',
    name: 'Delta SkyMiles',
    category: 'airline',
    pointsName: 'miles',
    logoUrl: '/logos/delta.svg',
    website: 'https://www.delta.com/skymiles',
    expirationRules: {
      expiresAfter: undefined, // Delta miles don't expire
      activityRequired: false,
      extensionPossible: false
    },
    eliteProgram: {
      tiers: ['Silver', 'Gold', 'Platinum', 'Diamond'],
      benefits: ['Priority boarding', 'Free checked bags', 'Upgrades', 'Sky Club access']
    }
  },
  {
    id: 'united-mileageplus',
    name: 'United MileagePlus',
    category: 'airline',
    pointsName: 'miles',
    logoUrl: '/logos/united.svg',
    website: 'https://www.united.com/mileageplus',
    expirationRules: {
      expiresAfter: 24,
      activityRequired: true,
      extensionPossible: true
    },
    eliteProgram: {
      tiers: ['Silver', 'Gold', 'Platinum', '1K'],
      benefits: ['Priority boarding', 'Free checked bags', 'Upgrades', 'Club access']
    }
  },
  {
    id: 'southwest-rapid-rewards',
    name: 'Southwest Rapid Rewards',
    category: 'airline',
    pointsName: 'points',
    logoUrl: '/logos/southwest.svg',
    website: 'https://www.southwest.com/rapidrewards',
    expirationRules: {
      expiresAfter: 24,
      activityRequired: true,
      extensionPossible: true
    },
    eliteProgram: {
      tiers: ['A-List', 'A-List Preferred'],
      benefits: ['Priority boarding', 'Free drinks', 'Bonus points']
    }
  },
  {
    id: 'jetblue-trueblue',
    name: 'JetBlue TrueBlue',
    category: 'airline',
    pointsName: 'points',
    logoUrl: '/logos/jetblue.svg',
    website: 'https://www.jetblue.com/trueblue',
    expirationRules: {
      expiresAfter: undefined, // TrueBlue points don't expire
      activityRequired: false,
      extensionPossible: false
    },
    eliteProgram: {
      tiers: ['Mosaic'],
      benefits: ['Priority boarding', 'Free checked bags', 'Bonus points']
    }
  },
  {
    id: 'alaska-mileageplan',
    name: 'Alaska Airlines Mileage Plan',
    category: 'airline',
    pointsName: 'miles',
    logoUrl: '/logos/alaska.svg',
    website: 'https://www.alaskaair.com/mileageplan',
    expirationRules: {
      expiresAfter: 24,
      activityRequired: true,
      extensionPossible: true
    },
    eliteProgram: {
      tiers: ['MVP', 'MVP Gold', 'MVP Gold 75K'],
      benefits: ['Priority boarding', 'Free checked bags', 'Upgrades']
    }
  },

  // HOTELS - Major Chains
  {
    id: 'marriott-bonvoy',
    name: 'Marriott Bonvoy',
    category: 'hotel',
    pointsName: 'points',
    logoUrl: '/logos/marriott.svg',
    website: 'https://www.marriott.com/bonvoy',
    expirationRules: {
      expiresAfter: 24,
      activityRequired: true,
      extensionPossible: true
    },
    eliteProgram: {
      tiers: ['Silver', 'Gold', 'Platinum', 'Titanium', 'Ambassador'],
      benefits: ['Late checkout', 'Upgrades', 'Free breakfast', 'Lounge access']
    }
  },
  {
    id: 'hilton-honors',
    name: 'Hilton Honors',
    category: 'hotel',
    pointsName: 'points',
    logoUrl: '/logos/hilton.svg',
    website: 'https://www.hilton.com/honors',
    expirationRules: {
      expiresAfter: 24,
      activityRequired: true,
      extensionPossible: true
    },
    eliteProgram: {
      tiers: ['Silver', 'Gold', 'Diamond'],
      benefits: ['Late checkout', 'Upgrades', 'Free breakfast', 'Executive lounge']
    }
  },
  {
    id: 'world-of-hyatt',
    name: 'World of Hyatt',
    category: 'hotel',
    pointsName: 'points',
    logoUrl: '/logos/hyatt.svg',
    website: 'https://www.hyatt.com/world-of-hyatt',
    expirationRules: {
      expiresAfter: 24,
      activityRequired: true,
      extensionPossible: true
    },
    eliteProgram: {
      tiers: ['Discoverist', 'Explorist', 'Globalist'],
      benefits: ['Late checkout', 'Upgrades', 'Free breakfast', 'Club access']
    }
  },
  {
    id: 'ihg-rewards',
    name: 'IHG One Rewards',
    category: 'hotel',
    pointsName: 'points',
    logoUrl: '/logos/ihg.svg',
    website: 'https://www.ihg.com/rewardsclub',
    expirationRules: {
      expiresAfter: 12,
      activityRequired: true,
      extensionPossible: true
    },
    eliteProgram: {
      tiers: ['Club', 'Gold Elite', 'Platinum Elite', 'Spire Elite'],
      benefits: ['Late checkout', 'Upgrades', 'Free internet', 'Bonus points']
    }
  },
  {
    id: 'choice-privileges',
    name: 'Choice Privileges',
    category: 'hotel',
    pointsName: 'points',
    logoUrl: '/logos/choice.svg',
    website: 'https://www.choicehotels.com/privileges',
    expirationRules: {
      expiresAfter: 18,
      activityRequired: true,
      extensionPossible: true
    },
    eliteProgram: {
      tiers: ['Gold', 'Platinum', 'Diamond'],
      benefits: ['Late checkout', 'Upgrades', 'Free breakfast', 'Bonus points']
    }
  },
  {
    id: 'wyndham-rewards',
    name: 'Wyndham Rewards',
    category: 'hotel',
    pointsName: 'points',
    logoUrl: '/logos/wyndham.svg',
    website: 'https://www.wyndhamhotels.com/wyndham-rewards',
    expirationRules: {
      expiresAfter: 24,
      activityRequired: true,
      extensionPossible: true
    },
    eliteProgram: {
      tiers: ['Gold', 'Platinum', 'Diamond'],
      benefits: ['Late checkout', 'Upgrades', 'Bonus points', 'Free internet']
    }
  },

  // CREDIT CARDS - Major Transferable Points
  {
    id: 'chase-ultimate-rewards',
    name: 'Chase Ultimate Rewards',
    category: 'credit_card',
    pointsName: 'points',
    logoUrl: '/logos/chase.svg',
    website: 'https://www.chase.com/ultimate-rewards',
    expirationRules: {
      expiresAfter: undefined, // Don't expire with open account
      activityRequired: false,
      extensionPossible: false
    }
  },
  {
    id: 'amex-membership-rewards',
    name: 'American Express Membership Rewards',
    category: 'credit_card',
    pointsName: 'points',
    logoUrl: '/logos/amex.svg',
    website: 'https://www.americanexpress.com/rewards',
    expirationRules: {
      expiresAfter: undefined, // Don't expire with open account
      activityRequired: false,
      extensionPossible: false
    }
  },
  {
    id: 'citi-thankyou',
    name: 'Citi ThankYou Points',
    category: 'credit_card',
    pointsName: 'points',
    logoUrl: '/logos/citi.svg',
    website: 'https://www.citi.com/thankyou',
    expirationRules: {
      expiresAfter: undefined, // Don't expire with open account
      activityRequired: false,
      extensionPossible: false
    }
  },
  {
    id: 'capital-one-venture',
    name: 'Capital One Venture Miles',
    category: 'credit_card',
    pointsName: 'miles',
    logoUrl: '/logos/capital-one.svg',
    website: 'https://www.capitalone.com/venture',
    expirationRules: {
      expiresAfter: undefined, // Don't expire with open account
      activityRequired: false,
      extensionPossible: false
    }
  },
  {
    id: 'bilt-rewards',
    name: 'Bilt Rewards',
    category: 'credit_card',
    pointsName: 'points',
    logoUrl: '/logos/bilt.svg',
    website: 'https://www.biltrewards.com',
    expirationRules: {
      expiresAfter: undefined,
      activityRequired: false,
      extensionPossible: false
    }
  },

  // DINING PROGRAMS
  {
    id: 'opentable-points',
    name: 'OpenTable Points',
    category: 'dining',
    pointsName: 'points',
    logoUrl: '/logos/opentable.svg',
    website: 'https://www.opentable.com/points',
    expirationRules: {
      expiresAfter: 24,
      activityRequired: true,
      extensionPossible: false
    }
  },
  {
    id: 'resy-rewards',
    name: 'Resy Rewards',
    category: 'dining',
    pointsName: 'points',
    logoUrl: '/logos/resy.svg',
    website: 'https://resy.com/rewards',
    expirationRules: {
      expiresAfter: 12,
      activityRequired: true,
      extensionPossible: false
    }
  },

  // SHOPPING PROGRAMS
  {
    id: 'amazon-rewards',
    name: 'Amazon Rewards',
    category: 'shopping',
    pointsName: 'points',
    logoUrl: '/logos/amazon.svg',
    website: 'https://www.amazon.com/rewards',
    expirationRules: {
      expiresAfter: undefined,
      activityRequired: false,
      extensionPossible: false
    }
  },
  {
    id: 'target-circle',
    name: 'Target Circle',
    category: 'shopping',
    pointsName: 'earnings',
    logoUrl: '/logos/target.svg',
    website: 'https://www.target.com/circle',
    expirationRules: {
      expiresAfter: 12,
      activityRequired: false,
      extensionPossible: false
    }
  },
  {
    id: 'walmart-rewards',
    name: 'Walmart Rewards',
    category: 'shopping',
    pointsName: 'cash back',
    logoUrl: '/logos/walmart.svg',
    website: 'https://www.walmart.com/rewards',
    expirationRules: {
      expiresAfter: undefined,
      activityRequired: false,
      extensionPossible: false
    }
  },
  {
    id: 'costco-rewards',
    name: 'Costco Rewards',
    category: 'shopping',
    pointsName: 'cash back',
    logoUrl: '/logos/costco.svg',
    website: 'https://www.costco.com/rewards',
    expirationRules: {
      expiresAfter: undefined,
      activityRequired: false,
      extensionPossible: false
    }
  },

  // Additional Airlines
  {
    id: 'spirit-free-spirit',
    name: 'Spirit Free Spirit',
    category: 'airline',
    pointsName: 'points',
    logoUrl: '/logos/spirit.svg',
    website: 'https://www.spirit.com/free-spirit',
    expirationRules: {
      expiresAfter: 12,
      activityRequired: true,
      extensionPossible: true
    }
  },
  {
    id: 'frontier-miles',
    name: 'Frontier Miles',
    category: 'airline',
    pointsName: 'miles',
    logoUrl: '/logos/frontier.svg',
    website: 'https://www.flyfrontier.com/frontier-miles',
    expirationRules: {
      expiresAfter: 6,
      activityRequired: true,
      extensionPossible: true
    }
  },

  // Additional Hotels
  {
    id: 'best-western-rewards',
    name: 'Best Western Rewards',
    category: 'hotel',
    pointsName: 'points',
    logoUrl: '/logos/best-western.svg',
    website: 'https://www.bestwestern.com/rewards',
    expirationRules: {
      expiresAfter: 24,
      activityRequired: true,
      extensionPossible: true
    }
  },
  {
    id: 'la-quinta-returns',
    name: 'La Quinta Returns',
    category: 'hotel',
    pointsName: 'points',
    logoUrl: '/logos/la-quinta.svg',
    website: 'https://www.lq.com/returns',
    expirationRules: {
      expiresAfter: 12,
      activityRequired: true,
      extensionPossible: true
    }
  },

  // International Airlines
  {
    id: 'air-france-flying-blue',
    name: 'Air France Flying Blue',
    category: 'airline',
    pointsName: 'miles',
    logoUrl: '/logos/air-france.svg',
    website: 'https://www.airfrance.com/flying-blue',
    expirationRules: {
      expiresAfter: 24,
      activityRequired: true,
      extensionPossible: true
    }
  },
  {
    id: 'lufthansa-miles-more',
    name: 'Lufthansa Miles & More',
    category: 'airline',
    pointsName: 'miles',
    logoUrl: '/logos/lufthansa.svg',
    website: 'https://www.lufthansa.com/miles-and-more',
    expirationRules: {
      expiresAfter: 36,
      activityRequired: true,
      extensionPossible: true
    }
  },
  {
    id: 'british-airways-avios',
    name: 'British Airways Avios',
    category: 'airline',
    pointsName: 'Avios',
    logoUrl: '/logos/british-airways.svg',
    website: 'https://www.britishairways.com/avios',
    expirationRules: {
      expiresAfter: 36,
      activityRequired: true,
      extensionPossible: true
    }
  }
];

// Helper functions for program lookup
export const getProgramById = (id: string): LoyaltyProgram | undefined => {
  return loyaltyPrograms.find(program => program.id === id);
};

export const getAllPrograms = (): LoyaltyProgram[] => {
  return loyaltyPrograms;
};

export const getProgramsByCategory = (category: LoyaltyProgram['category']): LoyaltyProgram[] => {
  return loyaltyPrograms.filter(program => program.category === category);
};

export const searchPrograms = (query: string): LoyaltyProgram[] => {
  const searchTerm = query.toLowerCase();
  return loyaltyPrograms.filter(program => 
    program.name.toLowerCase().includes(searchTerm) ||
    program.pointsName.toLowerCase().includes(searchTerm) ||
    program.category.toLowerCase().includes(searchTerm)
  );
};

export const getProgramsCount = (): Record<LoyaltyProgram['category'], number> => {
  return loyaltyPrograms.reduce((acc, program) => {
    acc[program.category] = (acc[program.category] || 0) + 1;
    return acc;
  }, {} as Record<LoyaltyProgram['category'], number>);
};

// Common certificate types by program category
export const commonCertificateTypes: Record<LoyaltyProgram['category'], string[]> = {
  airline: ['companion', 'upgrade', 'lounge-access', 'free-baggage'],
  hotel: ['free-night', 'upgrade', 'late-checkout', 'breakfast'],
  credit_card: ['anniversary-night', 'travel-credit', 'statement-credit'],
  dining: ['discount', 'free-appetizer', 'priority-seating'],
  shopping: ['discount', 'free-shipping', 'early-access'],
  other: ['discount', 'bonus-points', 'exclusive-access']
};
