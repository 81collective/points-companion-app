// Enhanced analytics hook with advanced calculations
import { useState, useEffect, useCallback } from 'react';
import { clientLogger } from '@/lib/clientLogger';

const log = clientLogger.child({ component: 'useEnhancedAnalytics' });

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  category: string;
  cardId?: string | null;
  description?: string;
  merchant?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  rewards?: string[];
}

export interface EnhancedAnalytics {
  totalSpending: number;
  totalRewards: number;
  efficiency: number;
  monthlyTrends: Array<{
    month: string;
    spending: number;
    rewards: number;
    potential: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    rewards: number;
    count: number;
    avgTransaction: number;
    efficiency: number;
  }>;
  cardPerformance: Array<{
    card: string;
    cardId: string;
    spending: number;
    rewards: number;
    transactions: number;
    efficiency: number;
    utilization: number;
  }>;
  optimizationOpportunities: Array<{
    type: 'category' | 'card' | 'timing';
    category?: string;
    currentRewards: number;
    potentialRewards: number;
    impact: number;
    recommendation: string;
  }>;
  yearOverYear: {
    spendingGrowth: number;
    rewardsGrowth: number;
    efficiencyChange: number;
  };
  forecasts: {
    annualSpending: number;
    annualRewards: number;
    quarterlyTrend: 'up' | 'down' | 'stable';
  };
}

const normalizeCategory = (value?: string) => (value ? value.trim().toLowerCase() : '');

const parseMultiplier = (raw?: string) => {
  if (!raw) return 1;
  const match = raw.match(/([0-9]+(?:\.[0-9]+)?)/);
  return match ? Number(match[1]) : 1;
};

const getRewardMultiplier = (card: CreditCard | undefined, category?: string) => {
  if (!card) return 1;
  const normalized = normalizeCategory(category);
  const rewards = card.rewards || [];

  if (normalized) {
    const matched = rewards
      .map((entry) => entry.split(':'))
      .find(([entryCategory]) => normalizeCategory(entryCategory) === normalized);
    if (matched) {
      return parseMultiplier(matched[1]);
    }
  }

  const maxMultiplier = rewards.reduce((max, entry) => {
    const [, value] = entry.split(':');
    const parsed = parseMultiplier(value);
    return parsed > max ? parsed : max;
  }, 0);

  return maxMultiplier || 1;
};

const getBestCardForCategory = (cards: CreditCard[], category?: string) => {
  let bestCard: CreditCard | undefined;
  let bestRate = 0;
  cards.forEach((card) => {
    const rate = getRewardMultiplier(card, category);
    if (rate > bestRate) {
      bestCard = card;
      bestRate = rate;
    }
  });
  return { card: bestCard, rate: bestRate || 1 };
};

const calculateEnhancedAnalytics = (
  transactions: Transaction[],
  lastYearTransactions: Transaction[],
  cards: CreditCard[]
): EnhancedAnalytics => {
  // Basic calculations
  const totalSpending = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalRewards = transactions.reduce((sum, tx) => {
    const card = cards.find((c) => c.id === tx.cardId);
    const multiplier = getRewardMultiplier(card, tx.category);
    return sum + tx.amount * (multiplier / 100);
  }, 0);

  const potentialRewards = transactions.reduce((sum, tx) => {
    const { card: bestCard, rate } = getBestCardForCategory(cards, tx.category);
    return sum + tx.amount * ((bestCard ? rate : 1) / 100);
  }, 0);

  const efficiency = potentialRewards > 0 ? (totalRewards / potentialRewards) * 100 : 0;

  const monthlyData: { [key: string]: { spending: number; rewards: number; potential: number } } = {};
  transactions.forEach((tx) => {
    const month = new Date(tx.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!monthlyData[month]) {
      monthlyData[month] = { spending: 0, rewards: 0, potential: 0 };
    }

    const card = cards.find((c) => c.id === tx.cardId);
    const actualRewards = tx.amount * (getRewardMultiplier(card, tx.category) / 100);
    const { card: bestCard, rate } = getBestCardForCategory(cards, tx.category);
    const potentialReward = tx.amount * ((bestCard ? rate : 1) / 100);

    monthlyData[month].spending += tx.amount;
    monthlyData[month].rewards += actualRewards;
    monthlyData[month].potential += potentialReward;
  });

  const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    spending: Math.round(data.spending),
    rewards: Math.round(data.rewards),
    potential: Math.round(data.potential)
  }));

  const categoryData: { [key: string]: { amount: number; rewards: number; count: number } } = {};
  transactions.forEach((tx) => {
    if (!categoryData[tx.category]) {
      categoryData[tx.category] = { amount: 0, rewards: 0, count: 0 };
    }

    const card = cards.find((c) => c.id === tx.cardId);
    const rewards = tx.amount * (getRewardMultiplier(card, tx.category) / 100);

    categoryData[tx.category].amount += tx.amount;
    categoryData[tx.category].rewards += rewards;
    categoryData[tx.category].count += 1;
  });

  const categoryBreakdown = Object.entries(categoryData).map(([category, data]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount: Math.round(data.amount),
    rewards: Math.round(data.rewards),
    count: data.count,
    avgTransaction: data.count ? Math.round(data.amount / data.count) : 0,
    efficiency: data.amount > 0 ? Math.round((data.rewards / data.amount) * 10000) / 100 : 0
  }));

  const cardData: { [key: string]: { spending: number; rewards: number; transactions: number } } = {};
  transactions.forEach((tx) => {
    const key = tx.cardId || 'unassigned';
    if (!cardData[key]) {
      cardData[key] = { spending: 0, rewards: 0, transactions: 0 };
    }

    const card = cards.find((c) => c.id === tx.cardId);
    const rewards = tx.amount * (getRewardMultiplier(card, tx.category) / 100);

    cardData[key].spending += tx.amount;
    cardData[key].rewards += rewards;
    cardData[key].transactions += 1;
  });

  const totalCardSpending = Object.values(cardData).reduce((sum, data) => sum + data.spending, 0);

  const cardPerformance = Object.entries(cardData).map(([cardId, data]) => {
    const card = cards.find((c) => c.id === cardId);
    const cardName = card?.name || 'Unknown Card';

    return {
      card: cardName,
      cardId,
      spending: Math.round(data.spending),
      rewards: Math.round(data.rewards),
      transactions: data.transactions,
      efficiency: data.spending > 0 ? Math.round((data.rewards / data.spending) * 10000) / 100 : 0,
      utilization: totalCardSpending > 0 ? Math.round((data.spending / totalCardSpending) * 100) : 0
    };
  });

  const optimizationOpportunities = categoryBreakdown
    .filter((cat) => cat.efficiency < 3.0)
    .map((cat) => {
      const { card: bestCard, rate } = getBestCardForCategory(cards, cat.category);
      const potentialRewardsValue = bestCard ? cat.amount * (rate / 100) : cat.rewards;
      const impact = potentialRewardsValue - cat.rewards;

      return {
        type: 'category' as const,
        category: cat.category,
        currentRewards: cat.rewards,
        potentialRewards: Math.round(potentialRewardsValue),
        impact: Math.round(impact),
        recommendation: `Use ${bestCard?.name || 'a better card'} for ${cat.category} to earn ${(bestCard ? rate : 2).toFixed(
          1
        )}% instead of ${cat.efficiency}%`
      };
    })
    .filter((opp) => opp.impact > 10)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5);

  const lastYearSpending = lastYearTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const lastYearRewards = lastYearTransactions.reduce((sum, tx) => {
    const card = cards.find((c) => c.id === tx.cardId);
    return sum + tx.amount * (getRewardMultiplier(card, tx.category) / 100);
  }, 0);

  const yearOverYear = {
    spendingGrowth: lastYearSpending > 0 ? ((totalSpending - lastYearSpending) / lastYearSpending) * 100 : 0,
    rewardsGrowth: lastYearRewards > 0 ? ((totalRewards - lastYearRewards) / lastYearRewards) * 100 : 0,
    efficiencyChange:
      lastYearRewards > 0 ? (totalRewards / totalSpending - lastYearRewards / lastYearSpending) * 100 : 0
  };

  const recentMonths = monthlyTrends.slice(-3);
  const avgMonthlySpending = recentMonths.reduce((sum, month) => sum + month.spending, 0) / recentMonths.length || 0;
  const avgMonthlyRewards = recentMonths.reduce((sum, month) => sum + month.rewards, 0) / recentMonths.length || 0;

  const forecasts = {
    annualSpending: Math.round(avgMonthlySpending * 12),
    annualRewards: Math.round(avgMonthlyRewards * 12),
    quarterlyTrend: yearOverYear.spendingGrowth > 5 ? 'up' : yearOverYear.spendingGrowth < -5 ? 'down' : 'stable'
  } as const;

  return {
    totalSpending: Math.round(totalSpending),
    totalRewards: Math.round(totalRewards),
    efficiency: Math.round(efficiency * 100) / 100,
    monthlyTrends,
    categoryBreakdown,
    cardPerformance,
    optimizationOpportunities,
    yearOverYear,
    forecasts
  };
};

export function useEnhancedAnalytics(timeRange: string = '12m') {
  const [analytics, setAnalytics] = useState<EnhancedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateTimeRange = useCallback((range: string) => {
    const now = new Date();
    const months = range === '3m' ? 3 : range === '6m' ? 6 : range === '12m' ? 12 : 24;
    return new Date(now.getFullYear(), now.getMonth() - months, 1);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const startDate = calculateTimeRange(timeRange);
      const lastYearStart = calculateTimeRange(`${parseInt(timeRange.replace('m', '')) + 12}m`);
      const [transactionsResponse, cardsResponse] = await Promise.all([
        fetch('/api/transactions', { credentials: 'include' }),
        fetch('/api/cards', { credentials: 'include' })
      ]);

      if (!transactionsResponse.ok) {
        throw new Error('Failed to load transactions');
      }

      if (!cardsResponse.ok) {
        throw new Error('Failed to load cards');
      }

      const transactionsPayload = (await transactionsResponse.json()) as { transactions?: Transaction[] };
      const cardsPayload = (await cardsResponse.json()) as { cards?: CreditCard[] };

      const allTransactions = (transactionsPayload.transactions || []).map((tx) => ({
        ...tx,
        amount: typeof tx.amount === 'number' ? tx.amount : Number(tx.amount)
      }));

      const transactions = allTransactions.filter((tx) => new Date(tx.date) >= startDate);
      const lastYearTransactions = allTransactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return txDate >= lastYearStart && txDate < startDate;
      });

      const cards = cardsPayload.cards || [];

      const enhancedAnalytics = calculateEnhancedAnalytics(
        transactions || [],
        lastYearTransactions || [],
        cards || []
      );

      setAnalytics(enhancedAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      log.error('Error fetching analytics', { error: err });
    } finally {
      setLoading(false);
    }
  }, [timeRange, calculateTimeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
}
