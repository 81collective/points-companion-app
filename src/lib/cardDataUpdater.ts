import { CreditCardTemplate, CardIssuer, RewardCategory } from '@/types/creditCards';

/**
 * Service to fetch and update credit card data from various sources
 */
export class CardDataUpdater {
  private static readonly API_ENDPOINTS = {
    // Public APIs and data sources
    nerdwallet: 'https://www.nerdwallet.com/api/credit-cards',
    creditkarma: 'https://www.creditkarma.com/api/credit-cards',
    // Issuer APIs (when available)
    chase: 'https://www.chase.com/api/cards',
    amex: 'https://www.americanexpress.com/api/cards',
  };

  /**
   * Fetch latest credit card data from multiple sources
   */
  static async fetchLatestCards(): Promise<CreditCardTemplate[]> {
    const cards: CreditCardTemplate[] = [];
    
    try {
      // Fetch from multiple sources and merge
      const sources = await Promise.allSettled([
        this.fetchChaseCards(),
        this.fetchAmexCards(),
        this.fetchCapitalOneCards(),
        this.fetchCitiCards(),
        this.fetchDiscoverCards(),
        this.fetchBankOfAmericaCards(),
        this.fetchWellsFargoCards(),
      ]);

      sources.forEach((result) => {
        if (result.status === 'fulfilled') {
          cards.push(...result.value);
        }
      });

      return cards;
    } catch (error) {
      console.error('Error fetching card data:', error);
      return [];
    }
  }

  /**
   * Fetch Chase credit cards
   */
  private static async fetchChaseCards(): Promise<CreditCardTemplate[]> {
    // In a real implementation, this would fetch from Chase API or scrape their website
    return [
      {
        id: 'chase-sapphire-preferred-2025',
        name: 'Chase Sapphire Preferred',
        issuer: CardIssuer.Chase,
        nickname: 'CSP',
        image: '/card-logos/chase-sapphire-preferred.png',
        rewards: [
          { category: RewardCategory.Travel, multiplier: 2 },
          { category: RewardCategory.Dining, multiplier: 2 },
          { category: RewardCategory.EverythingElse, multiplier: 1 },
        ],
        popular: true,
        version: '2025',
      },
      {
        id: 'chase-sapphire-reserve-2025',
        name: 'Chase Sapphire Reserve',
        issuer: CardIssuer.Chase,
        nickname: 'CSR',
        image: '/card-logos/chase-sapphire-reserve.png',
        rewards: [
          { category: RewardCategory.Travel, multiplier: 3 },
          { category: RewardCategory.Dining, multiplier: 3 },
          { category: RewardCategory.EverythingElse, multiplier: 1 },
        ],
        popular: true,
        version: '2025',
      },
      {
        id: 'chase-freedom-unlimited-2025',
        name: 'Chase Freedom Unlimited',
        issuer: CardIssuer.Chase,
        nickname: 'CFU',
        image: '/card-logos/chase-freedom-unlimited.png',
        rewards: [
          { category: RewardCategory.EverythingElse, multiplier: 1.5 },
          { category: RewardCategory.Rotating, multiplier: 5, notes: 'Rotating quarterly categories' },
        ],
        popular: true,
        version: '2025',
      },
      {
        id: 'chase-ink-business-preferred-2025',
        name: 'Chase Ink Business Preferred',
        issuer: CardIssuer.Chase,
        nickname: 'CIP',
        image: '/card-logos/chase-ink-business-preferred.png',
        rewards: [
          { category: RewardCategory.Business, multiplier: 3, cap: '$150k/year' },
          { category: RewardCategory.Travel, multiplier: 3 },
          { category: RewardCategory.EverythingElse, multiplier: 1 },
        ],
        business: true,
        popular: true,
        version: '2025',
      },
    ];
  }

  /**
   * Fetch American Express credit cards
   */
  private static async fetchAmexCards(): Promise<CreditCardTemplate[]> {
    return [
      {
        id: 'amex-platinum-2025',
        name: 'The Platinum Card® from American Express',
        issuer: CardIssuer.Amex,
        nickname: 'Amex Platinum',
        image: '/card-logos/amex-platinum.png',
        rewards: [
          { category: RewardCategory.Flights, multiplier: 5 },
          { category: RewardCategory.Hotels, multiplier: 5 },
          { category: RewardCategory.EverythingElse, multiplier: 1 },
        ],
        popular: true,
        version: '2025',
      },
      {
        id: 'amex-gold-2025',
        name: 'American Express® Gold Card',
        issuer: CardIssuer.Amex,
        nickname: 'Amex Gold',
        image: '/card-logos/amex-gold.png',
        rewards: [
          { category: RewardCategory.Dining, multiplier: 4 },
          { category: RewardCategory.Supermarkets, multiplier: 4, cap: '$25k/year' },
          { category: RewardCategory.EverythingElse, multiplier: 1 },
        ],
        popular: true,
        version: '2025',
      },
      {
        id: 'amex-business-platinum-2025',
        name: 'The Business Platinum Card® from American Express',
        issuer: CardIssuer.Amex,
        nickname: 'Amex Business Platinum',
        image: '/card-logos/amex-business-platinum.png',
        rewards: [
          { category: RewardCategory.Flights, multiplier: 5 },
          { category: RewardCategory.Hotels, multiplier: 5 },
          { category: RewardCategory.Business, multiplier: 1.5 },
          { category: RewardCategory.EverythingElse, multiplier: 1 },
        ],
        business: true,
        popular: true,
        version: '2025',
      },
    ];
  }

  /**
   * Fetch Capital One credit cards
   */
  private static async fetchCapitalOneCards(): Promise<CreditCardTemplate[]> {
    return [
      {
        id: 'capital-one-venture-x-2025',
        name: 'Capital One Venture X Rewards Credit Card',
        issuer: CardIssuer.CapitalOne,
        nickname: 'Venture X',
        image: '/card-logos/capital-one-venture-x.png',
        rewards: [
          { category: RewardCategory.Travel, multiplier: 10, notes: 'Hotels and rental cars booked through Capital One Travel' },
          { category: RewardCategory.EverythingElse, multiplier: 2 },
        ],
        popular: true,
        version: '2025',
      },
      {
        id: 'capital-one-savor-2025',
        name: 'Capital One Savor Cash Rewards Credit Card',
        issuer: CardIssuer.CapitalOne,
        nickname: 'Savor',
        image: '/card-logos/capital-one-savor.png',
        rewards: [
          { category: RewardCategory.Dining, multiplier: 4 },
          { category: RewardCategory.Groceries, multiplier: 2 },
          { category: RewardCategory.EverythingElse, multiplier: 1 },
        ],
        popular: true,
        version: '2025',
      },
    ];
  }

  /**
   * Fetch Citi credit cards
   */
  private static async fetchCitiCards(): Promise<CreditCardTemplate[]> {
    return [
      {
        id: 'citi-double-cash-2025',
        name: 'Citi Double Cash Card',
        issuer: CardIssuer.Citi,
        image: '/card-logos/citi-double-cash.png',
        rewards: [
          { category: RewardCategory.EverythingElse, multiplier: 2, notes: '1% purchase + 1% payment' },
        ],
        popular: true,
        version: '2025',
      },
      {
        id: 'citi-premier-2025',
        name: 'Citi Premier® Card',
        issuer: CardIssuer.Citi,
        nickname: 'Citi Premier',
        image: '/card-logos/citi-premier.png',
        rewards: [
          { category: RewardCategory.Travel, multiplier: 3 },
          { category: RewardCategory.Dining, multiplier: 3 },
          { category: RewardCategory.Supermarkets, multiplier: 3 },
          { category: RewardCategory.Gas, multiplier: 3 },
          { category: RewardCategory.EverythingElse, multiplier: 1 },
        ],
        popular: true,
        version: '2025',
      },
    ];
  }

  /**
   * Fetch Discover credit cards
   */
  private static async fetchDiscoverCards(): Promise<CreditCardTemplate[]> {
    return [
      {
        id: 'discover-it-cash-back-2025',
        name: 'Discover it® Cash Back',
        issuer: CardIssuer.Discover,
        image: '/card-logos/discover-it-cash-back.png',
        rewards: [
          { category: RewardCategory.Rotating, multiplier: 5, notes: 'Rotating quarterly categories, up to $1,500 quarterly limit' },
          { category: RewardCategory.EverythingElse, multiplier: 1 },
        ],
        popular: true,
        version: '2025',
      },
    ];
  }

  /**
   * Fetch Bank of America credit cards
   */
  private static async fetchBankOfAmericaCards(): Promise<CreditCardTemplate[]> {
    return [
      {
        id: 'boa-customized-cash-rewards-2025',
        name: 'Bank of America® Customized Cash Rewards Credit Card',
        issuer: CardIssuer.BankOfAmerica,
        image: '/card-logos/boa-customized-cash.png',
        rewards: [
          { category: RewardCategory.Gas, multiplier: 3, notes: 'Choose your 3% category' },
          { category: RewardCategory.Groceries, multiplier: 2 },
          { category: RewardCategory.Wholesale, multiplier: 2 },
          { category: RewardCategory.EverythingElse, multiplier: 1 },
        ],
        popular: true,
        version: '2025',
      },
    ];
  }

  /**
   * Fetch Wells Fargo credit cards
   */
  private static async fetchWellsFargoCards(): Promise<CreditCardTemplate[]> {
    return [
      {
        id: 'wells-fargo-active-cash-2025',
        name: 'Wells Fargo Active Cash® Card',
        issuer: CardIssuer.WellsFargo,
        image: '/card-logos/wells-fargo-active-cash.png',
        rewards: [
          { category: RewardCategory.EverythingElse, multiplier: 2 },
        ],
        popular: true,
        version: '2025',
      },
      {
        id: 'wells-fargo-autograph-2025',
        name: 'Wells Fargo Autograph℠ Card',
        issuer: CardIssuer.WellsFargo,
        nickname: 'Autograph',
        image: '/card-logos/wells-fargo-autograph.png',
        rewards: [
          { category: RewardCategory.Travel, multiplier: 3 },
          { category: RewardCategory.Dining, multiplier: 3 },
          { category: RewardCategory.Gas, multiplier: 3 },
          { category: RewardCategory.EverythingElse, multiplier: 1 },
        ],
        popular: true,
        version: '2025',
      },
    ];
  }

  /**
   * Update the local database with latest card data
   */
  static async updateDatabase(): Promise<void> {
    try {
      const latestCards = await this.fetchLatestCards();
      
      // In a real implementation, you would:
      // 1. Compare with existing database
      // 2. Update changed cards
      // 3. Add new cards
      // 4. Mark discontinued cards
      // 5. Update the database file or API

      console.log(`Fetched ${latestCards.length} latest credit cards`);
      
      // For now, we'll update the static file
      await this.writeToDatabase(latestCards);
    } catch (error) {
      console.error('Error updating card database:', error);
    }
  }

  /**
   * Write updated cards to the database file
   */
  private static async writeToDatabase(cards: CreditCardTemplate[]): Promise<void> {
    // This would write to your database file or API
    // For demo purposes, we'll just log the structure
    console.log('Updated card database with latest data:', cards.length, 'cards');
  }

  /**
   * Get current quarterly rotating categories (for Chase Freedom, Discover, etc.)
   */
  static async getCurrentQuarterlyCategories(): Promise<Record<string, RewardCategory[]>> {
    // This would fetch current quarterly categories from card issuers
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
    const year = new Date().getFullYear();
    
    // Example quarterly categories for Q3 2025
    return {
      'chase-freedom-flex': [RewardCategory.Gas, RewardCategory.Drugstores],
      'discover-it-cash-back': [RewardCategory.Groceries, RewardCategory.Wholesale],
      // Add more as needed
    };
  }
}
