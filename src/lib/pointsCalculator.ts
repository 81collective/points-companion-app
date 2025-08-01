import type {
  Transaction,
  CreditCard,
  CardRewardsStructure,
  CardRewardCategory,
  PointsCalculationResult,
  CardRecommendation,
  PointsPotential,
} from '../types/rewards'

const CATEGORY_MAP: Record<string, string> = {
  restaurant: 'dining',
  dining: 'dining',
  food: 'dining',
  groceries: 'groceries',
  supermarket: 'groceries',
  gas: 'gas',
  'gas station': 'gas',
  travel: 'travel',
  airline: 'travel',
  hotel: 'travel',
  // Add more mappings as needed
}

function matchCategory(transactionCategory: string, cardCategories: CardRewardCategory[]): CardRewardCategory | null {
  const normalized = transactionCategory.toLowerCase()
  for (const cat of cardCategories) {
    if (normalized === cat.category.toLowerCase()) return cat
    // Try mapping
    if (CATEGORY_MAP[normalized] && CATEGORY_MAP[normalized] === cat.category.toLowerCase()) return cat
  }
  return null
}

export function calculatePoints(
  transaction: Transaction,
  card: CreditCard,
  yearToDateSpend: Record<string, number> = {}
): PointsCalculationResult {
  if (!card.rewardsStructure || !card.rewardsStructure.categories) {
    throw new Error('Invalid rewards structure for card: ' + card.name)
  }
  const { categories, baseRate } = card.rewardsStructure
  const matched = matchCategory(transaction.category, categories)
  let points = 0
  let bonusApplied = false
  let capReached = false
  let details = ''

  if (matched) {
    let eligibleAmount = transaction.amount
    if (matched.cap !== undefined) {
      const spent = yearToDateSpend[matched.category] || 0
      if (spent + transaction.amount > matched.cap) {
        eligibleAmount = Math.max(0, matched.cap - spent)
        capReached = true
        details += `Cap reached for ${matched.category}. `
      }
    }
    points = eligibleAmount * matched.pointsPerDollar
    bonusApplied = !!matched.promo || matched.pointsPerDollar > baseRate
    details += `Matched category: ${matched.category}. `
  } else {
    points = transaction.amount * baseRate
    details += 'No category match, used base rate. '
  }

  return {
    cardId: card.id,
    cardName: card.name,
    transactionId: transaction.id,
    pointsEarned: Math.round(points),
    categoryMatched: matched ? matched.category : 'base',
    bonusApplied,
    capReached,
    details,
  }
}

export function compareCardsForTransaction(
  transaction: Transaction,
  cards: CreditCard[],
  yearToDateSpend: Record<string, number> = {}
): CardRecommendation {
  let best: PointsCalculationResult | null = null
  for (const card of cards) {
    try {
      const result = calculatePoints(transaction, card, yearToDateSpend)
      if (!best || result.pointsEarned > best.pointsEarned) {
        best = result
      }
    } catch (e) {
      // Ignore cards with invalid structures
      continue
    }
  }
  if (!best) throw new Error('No valid cards for this transaction')
  return {
    cardId: best.cardId,
    cardName: best.cardName,
    pointsEarned: best.pointsEarned,
    reason: best.details,
  }
}

export function estimateAnnualPoints(
  card: CreditCard,
  transactions: Transaction[],
  yearToDateSpend: Record<string, number> = {}
): PointsPotential {
  let total = 0
  let details = ''
  for (const tx of transactions) {
    try {
      const result = calculatePoints(tx, card, yearToDateSpend)
      total += result.pointsEarned
      details += `Tx ${tx.id}: ${result.pointsEarned} points. `
    } catch (e) {
      details += `Tx ${tx.id}: Error. `
    }
  }
  return {
    cardId: card.id,
    cardName: card.name,
    estimatedAnnualPoints: Math.round(total),
    details,
  }
}
