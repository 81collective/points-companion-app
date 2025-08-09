import { processMonthlyData, processCategoryData, analyzeSpending, generateInsights, findBestCard, calculatePoints, type TransactionLike, type CreditCardLike } from '../insightsUtils'

describe('insightsUtils', () => {
  const baseTx: TransactionLike[] = [
    { amount: 100, date: '2025-01-15', category: 'Dining', card_id: 'c1' },
    { amount: 200, date: '2025-01-20', category: 'Groceries', card_id: 'c2' },
    { amount: 150, date: '2025-02-05', category: 'Dining', card_id: 'c1' },
    { amount: 400, date: '2025-02-10', category: 'Travel', card_id: 'c2' },
    { amount: 50, date: '2025-02-12', category: 'Misc', card_id: 'c2' },
  ]
  const cards: CreditCardLike[] = [
    { id: 'c1', name: 'Dining Plus', rewards: ['dining:3', 'groceries:1', 'travel:1'] },
    { id: 'c2', name: 'Travel Pro', rewards: ['travel:4', 'groceries:2'] },
  ]

  test('processMonthlyData aggregates correctly', () => {
    const months = processMonthlyData(baseTx)
    expect(months.length).toBe(2)
    const jan = months.find(m => m.month === 'Jan')!
    expect(jan.dining).toBe(100)
    expect(jan.groceries).toBe(200)
  })

  test('processCategoryData totals categories including other', () => {
    const cats = processCategoryData(baseTx)
    const other = cats.find(c => c.name === 'Other')
    expect(other?.value).toBeGreaterThan(0)
  })

  test('findBestCard selects card with highest multiplier', () => {
    const bestDining = findBestCard('Dining', cards)
    expect(bestDining?.name).toBe('Dining Plus')
    const bestTravel = findBestCard('Travel', cards)
    expect(bestTravel?.name).toBe('Travel Pro')
  })

  test('calculatePoints respects multipliers', () => {
    const c1Dining = calculatePoints(100, cards[0], 'Dining')
    expect(c1Dining).toBe(300)
    const c2Travel = calculatePoints(100, cards[1], 'Travel')
    expect(c2Travel).toBe(400)
  })

  test('analyzeSpending computes potential vs actual points', () => {
    const analysis = analyzeSpending(baseTx, cards)
    const dining = analysis.find(a => a.category === 'Dining')!
    expect(dining.totalSpent).toBe(250)
    expect(dining.potentialPoints).toBeGreaterThan(0)
    expect(dining.actualPoints).toBeGreaterThan(0)
  })

  test('generateInsights produces alerts and tip', () => {
    const analysis = analyzeSpending(baseTx, cards)
    const insights = generateInsights(analysis)
    const tip = insights.find(i => i.type === 'tip')
    expect(tip).toBeTruthy()
    const hasAny = insights.length > 0
    expect(hasAny).toBe(true)
  })
})
