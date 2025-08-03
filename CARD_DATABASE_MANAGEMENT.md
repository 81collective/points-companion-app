# Credit Card Database Management

This document explains how to keep your credit card database up to date with the latest reward cards and categories.

## Quick Start

### Update Card Database
```bash
npm run update-cards
```

### Check Database Status
```bash
npm run check-cards
```

### Manual API Update
```bash
curl -X POST http://localhost:3000/api/cards/update
```

## Available Credit Card APIs

### 1. Card Curator API (Recommended)
- **Website**: https://www.cardcurator.com/api
- **Features**: Real-time card data, bonus offers, reward rates
- **Setup**: Add `CARD_CURATOR_API_KEY=your_key` to `.env.local`

### 2. Credit Karma Partner API
- **Website**: https://www.creditkarma.com/partners
- **Features**: Comprehensive card database with personalized offers
- **Setup**: Requires partnership agreement

### 3. NerdWallet API
- **Website**: https://www.nerdwallet.com/partners
- **Features**: Card comparisons, rates, reviews
- **Setup**: Requires partnership agreement

### 4. Bankrate API
- **Website**: https://www.bankrate.com/partners
- **Features**: Current offers, APRs, terms
- **Setup**: Requires partnership agreement

### 5. Direct Issuer APIs
Some banks offer APIs for their card products:
- **Chase**: Limited public API
- **American Express**: Partner program available
- **Capital One**: Developer portal with select APIs
- **Citi**: Limited public access

## Automated Updates

### Daily Updates (Recommended)
Add this to your deployment pipeline:
```bash
# In your CI/CD or cron job
npm run update-cards
```

### API Endpoint
The app includes an API endpoint for external updates:
```bash
# GET latest data
curl http://localhost:3000/api/cards/update

# POST to force update
curl -X POST http://localhost:3000/api/cards/update
```

## Database Structure

### Current Categories (2025)
- Travel, Dining, Groceries, Gas
- Streaming, Fitness, Entertainment
- Electric Vehicle Charging
- Digital Wallets, Subscriptions
- Healthcare, Utilities, Cell Phone
- And more...

### Card Information Included
- Card name, issuer, nickname
- Reward multipliers by category
- Annual fees, bonus offers
- Popular/featured status
- Business vs personal cards

## Manual Updates

### Adding New Cards
1. Edit `src/data/creditCardDatabase.ts`
2. Add new card object with required fields
3. Update reward categories if needed
4. Test with `npm run dev`

### Adding New Categories
1. Update `src/types/creditCards.ts` RewardCategory enum
2. Add category to UI components
3. Update points calculator logic
4. Add to recommendation engine

## Best Practices

### Keep Data Fresh
- Update monthly for major changes
- Update weekly for bonus offers
- Update daily for competitive analysis

### Validate Data
- Cross-reference with official issuer websites
- Check for discontinued cards
- Verify current bonus offers and terms

### Monitor API Limits
- Most APIs have rate limits
- Cache responses when possible
- Use webhooks for real-time updates

## Troubleshooting

### Common Issues
1. **API Rate Limits**: Implement exponential backoff
2. **Stale Data**: Set up automated checks
3. **Missing Categories**: Regular category audits
4. **Invalid Rewards**: Validate against issuer terms

### Error Handling
```typescript
try {
  await CardDataUpdater.updateDatabase();
} catch (error) {
  console.error('Update failed:', error);
  // Fallback to cached data
}
```

## Integration Examples

### React Component
```tsx
import { getBestCardForCategory } from '@/data/creditCardDatabase';

const bestDiningCard = getBestCardForCategory(RewardCategory.Dining);
```

### API Route
```typescript
import { CardDataUpdater } from '@/lib/cardDataUpdater';

const latestCards = await CardDataUpdater.fetchLatestCards();
```

## Environment Variables

Add these to your `.env.local`:
```bash
# Optional - for automatic updates
CARD_CURATOR_API_KEY=your_key_here
CREDIT_KARMA_API_KEY=your_key_here
NERDWALLET_API_KEY=your_key_here
```

## Monitoring & Analytics

### Track Update Success
- Log successful updates
- Monitor API response times
- Alert on failed updates

### Data Quality Metrics
- Number of cards in database
- Last update timestamp
- Category coverage
- Popular card accuracy

---

For questions or issues, check the project documentation or create an issue in the repository.
