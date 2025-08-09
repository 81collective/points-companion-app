// Utility functions extracted from insights components for testability
// These functions are pure and can be unit tested independently.

export interface TransactionLike {
  id?: string;
  amount: number;
  date: string; // ISO or parseable date
  merchant?: string;
  category?: string; // may be undefined / null
  card_id?: string;
  points_earned?: number;
}

export interface CreditCardLike {
  id: string;
  name: string;
  rewards: string[]; // format: "category:multiplier"
}

export interface SpendingAnalysisRecord {
  category: string;
  totalSpent: number;
  cardUsed: string;
  bestCard: string;
  potentialPoints: number;
  actualPoints: number;
}

export type InsightRecord = {
  type: 'tip' | 'alert' | 'opportunity' | 'achievement' | 'prediction';
  title: string;
  description: string;
  impact?: 'high' | 'medium' | 'low';
  actionable?: boolean;
  savings?: number;
  timeframe?: string;
};

// --- SpendingAnalysis helpers ---
export function processMonthlyData(transactions: TransactionLike[]) {
  interface MonthlyBucket { month: string; dining: number; groceries: number; travel: number; gas: number; other: number }
  const monthlySpending: Record<string, MonthlyBucket> = {};
  transactions.forEach(tx => {
    const date = new Date(tx.date);
    if (Number.isNaN(date.getTime())) return; // skip invalid
    const monthKey = date.toLocaleString('default', { month: 'short' });
    if (!monthlySpending[monthKey]) {
      monthlySpending[monthKey] = { month: monthKey, dining: 0, groceries: 0, travel: 0, gas: 0, other: 0 };
    }
    const category = (tx.category || 'Other').toLowerCase();
    if (["dining","groceries","travel","gas"].includes(category)) {
      switch (category) {
        case 'dining': monthlySpending[monthKey].dining += Number(tx.amount) || 0; break;
        case 'groceries': monthlySpending[monthKey].groceries += Number(tx.amount) || 0; break;
        case 'travel': monthlySpending[monthKey].travel += Number(tx.amount) || 0; break;
        case 'gas': monthlySpending[monthKey].gas += Number(tx.amount) || 0; break;
      }
    } else {
      monthlySpending[monthKey].other += Number(tx.amount) || 0;
    }
  });
  return Object.values(monthlySpending).map(m => ({
    month: m.month,
    dining: m.dining,
    groceries: m.groceries,
    travel: m.travel,
    gas: m.gas,
    other: m.other,
  }));
}

export function processCategoryData(transactions: TransactionLike[]) {
  const totals: Record<string, number> = { dining: 0, groceries: 0, travel: 0, gas: 0, other: 0 };
  transactions.forEach(tx => {
    const category = (tx.category || 'Other').toLowerCase();
    if (["dining","groceries","travel","gas"].includes(category)) {
      totals[category] += Number(tx.amount) || 0;
    } else {
      totals.other += Number(tx.amount) || 0;
    }
  });
  return Object.entries(totals).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
}

// --- AI Insights helpers ---
export function findBestCard(category: string, cards: CreditCardLike[]): CreditCardLike | null {
  let best: CreditCardLike | null = null;
  let max = 0;
  cards.forEach(card => {
    const points = card.rewards.reduce((acc, reward) => {
      const [cat, multiplier] = reward.split(':');
      if (cat.toLowerCase() === category.toLowerCase()) {
        const mult = parseFloat(multiplier);
        return mult > acc ? mult : acc;
      }
      return acc;
    }, 1);
    if (points > max) {
      max = points;
      best = card;
    }
  });
  return best;
}

export function calculatePoints(amount: number, card: CreditCardLike | null | undefined, category: string): number {
  if (!card) return Math.round(amount);
  const multiplier = card.rewards.reduce((max, reward) => {
    const [cat, mult] = reward.split(':');
    if (cat.toLowerCase() === category.toLowerCase()) {
      const parsed = parseFloat(mult);
      return isNaN(parsed) ? max : Math.max(max, parsed);
    }
    return max;
  }, 1);
  return Math.round(amount * multiplier);
}

export function analyzeSpending(transactions: TransactionLike[], cards: CreditCardLike[]): SpendingAnalysisRecord[] {
  const categorySpending: Record<string, SpendingAnalysisRecord> = {};
  transactions.forEach(tx => {
    const cat = tx.category || 'Other';
    if (!categorySpending[cat]) {
      categorySpending[cat] = { category: cat, totalSpent: 0, cardUsed: '', bestCard: '', potentialPoints: 0, actualPoints: 0 };
    }
    const rec = categorySpending[cat];
    rec.totalSpent += tx.amount;
    const used = cards.find(c => c.id === tx.card_id);
    if (used) rec.cardUsed = used.name;
    const best = findBestCard(cat, cards);
    if (best) {
      rec.bestCard = best.name;
      rec.potentialPoints += calculatePoints(tx.amount, best, cat);
      rec.actualPoints += calculatePoints(tx.amount, used || best, cat);
    }
  });
  return Object.values(categorySpending);
}

export function generateInsights(analyses: SpendingAnalysisRecord[]): InsightRecord[] {
  const insights: InsightRecord[] = [];
  analyses.forEach(a => {
    if (a.potentialPoints > a.actualPoints) {
      const diff = a.potentialPoints - a.actualPoints;
      const savings = Math.round(diff * 0.01 * 100) / 100;
      insights.push({
        type: 'alert',
        title: `Missed ${diff} Points in ${a.category}`,
        description: `Switch to ${a.bestCard} instead of ${a.cardUsed} for ${a.category} purchases to maximize rewards.`,
        impact: diff > 500 ? 'high' : diff > 100 ? 'medium' : 'low',
        actionable: true,
        savings,
        timeframe: 'immediate'
      });
    }
    if (a.totalSpent > 1000 && a.cardUsed !== a.bestCard) {
      insights.push({
        type: 'opportunity',
        title: `Optimize High-Spend Category: ${a.category}`,
        description: `You spent $${a.totalSpent.toFixed(2)} on ${a.category}. Using ${a.bestCard} could earn significant bonus points.`,
        impact: 'high',
        actionable: true,
        savings: Math.round((a.totalSpent * 0.02) * 100) / 100,
        timeframe: 'ongoing'
      });
    }
    if (a.totalSpent > 500) {
      insights.push({
        type: 'prediction',
        title: `${a.category} Spending Trend`,
        description: `Based on your current pace, you'll spend ~$${(a.totalSpent * 12).toFixed(0)} annually on ${a.category}. Consider a specialized rewards card.`,
        impact: 'medium',
        actionable: false,
        timeframe: 'annual'
      });
    }
  });
  const totalPotential = insights.filter(i => i.savings).reduce((sum, i) => sum + (i.savings || 0), 0);
  if (totalPotential > 50) {
    insights.push({
      type: 'achievement',
      title: 'Optimization Opportunity Detected!',
      description: `You could earn an additional $${totalPotential.toFixed(2)} monthly by optimizing your card usage patterns.`,
      impact: 'high',
      actionable: true,
      savings: totalPotential,
      timeframe: 'monthly'
    });
  }
  insights.push({
    type: 'tip',
    title: 'Smart Spending Strategy',
    description: 'Set up automatic reminders to review your card usage monthly. Small optimizations compound over time.',
    impact: 'medium',
    actionable: true,
    timeframe: 'ongoing'
  });
  const weight = { high: 3, medium: 2, low: 1 } as const;
  return insights.sort((a, b) => (weight[b.impact || 'low'] - weight[a.impact || 'low']));
}
