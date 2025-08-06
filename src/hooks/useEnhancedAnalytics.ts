// Enhanced analytics hook with advanced calculations
import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/hooks/useSupabase';

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  category: string;
  card_id: string;
  description?: string;
  merchant?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  type: string;
  rewards_rate: number;
  annual_fee: number;
  categories: string[];
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

export function useEnhancedAnalytics(timeRange: string = '12m') {
  const [analytics, setAnalytics] = useState<EnhancedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();

  const calculateTimeRange = useCallback((range: string) => {
    const now = new Date();
    const months = range === '3m' ? 3 : range === '6m' ? 6 : range === '12m' ? 12 : 24;
    return new Date(now.getFullYear(), now.getMonth() - months, 1);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    if (!supabase) return;
    
    setLoading(true);
    setError(null);

    try {
      const startDate = calculateTimeRange(timeRange);
      const lastYearStart = calculateTimeRange(`${parseInt(timeRange.replace('m', '')) + 12}m`);

      // Fetch transactions for current period
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true });

      if (txError) throw txError;

      // Fetch transactions for year-over-year comparison
      const { data: lastYearTransactions, error: lyError } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', lastYearStart.toISOString())
        .lt('date', startDate.toISOString());

      if (lyError) throw lyError;

      // Fetch credit cards
      const { data: cards, error: cardError } = await supabase
        .from('credit_cards')
        .select('*');

      if (cardError) throw cardError;

      const enhancedAnalytics = calculateEnhancedAnalytics(
        transactions || [],
        lastYearTransactions || [],
        cards || []
      );

      setAnalytics(enhancedAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, timeRange, calculateTimeRange]);

  const calculateEnhancedAnalytics = (
    transactions: Transaction[],
    lastYearTransactions: Transaction[],
    cards: CreditCard[]
  ): EnhancedAnalytics => {
    // Basic calculations
    const totalSpending = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalRewards = transactions.reduce((sum, tx) => {
      // Find card and calculate actual rewards
      const card = cards.find(c => c.id === tx.card_id);
      return sum + (card ? tx.amount * (card.rewards_rate / 100) : tx.amount * 0.01);
    }, 0);

    // Calculate potential rewards with optimal cards
    const potentialRewards = transactions.reduce((sum, tx) => {
      // Find best card for this category
      const bestCard = cards.find(c => c.categories.includes(tx.category)) || 
                      cards.reduce((best, current) => 
                        current.rewards_rate > best.rewards_rate ? current : best, cards[0]);
      return sum + (bestCard ? tx.amount * (bestCard.rewards_rate / 100) : tx.amount * 0.01);
    }, 0);

    const efficiency = potentialRewards > 0 ? (totalRewards / potentialRewards) * 100 : 0;

    // Monthly trends
    const monthlyData: { [key: string]: { spending: number; rewards: number; potential: number } } = {};
    transactions.forEach(tx => {
      const month = new Date(tx.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!monthlyData[month]) {
        monthlyData[month] = { spending: 0, rewards: 0, potential: 0 };
      }
      
      const card = cards.find(c => c.id === tx.card_id);
      const actualRewards = card ? tx.amount * (card.rewards_rate / 100) : tx.amount * 0.01;
      
      const bestCard = cards.find(c => c.categories.includes(tx.category)) || 
                      cards.reduce((best, current) => 
                        current.rewards_rate > best.rewards_rate ? current : best, cards[0]);
      const potentialReward = bestCard ? tx.amount * (bestCard.rewards_rate / 100) : tx.amount * 0.01;

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

    // Category breakdown
    const categoryData: { [key: string]: { amount: number; rewards: number; count: number } } = {};
    transactions.forEach(tx => {
      if (!categoryData[tx.category]) {
        categoryData[tx.category] = { amount: 0, rewards: 0, count: 0 };
      }
      
      const card = cards.find(c => c.id === tx.card_id);
      const rewards = card ? tx.amount * (card.rewards_rate / 100) : tx.amount * 0.01;
      
      categoryData[tx.category].amount += tx.amount;
      categoryData[tx.category].rewards += rewards;
      categoryData[tx.category].count += 1;
    });

    const categoryBreakdown = Object.entries(categoryData).map(([category, data]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount: Math.round(data.amount),
      rewards: Math.round(data.rewards),
      count: data.count,
      avgTransaction: Math.round(data.amount / data.count),
      efficiency: Math.round((data.rewards / data.amount) * 10000) / 100 // Percentage with 2 decimals
    }));

    // Card performance
    const cardData: { [key: string]: { spending: number; rewards: number; transactions: number } } = {};
    transactions.forEach(tx => {
      if (!cardData[tx.card_id]) {
        cardData[tx.card_id] = { spending: 0, rewards: 0, transactions: 0 };
      }
      
      const card = cards.find(c => c.id === tx.card_id);
      const rewards = card ? tx.amount * (card.rewards_rate / 100) : tx.amount * 0.01;
      
      cardData[tx.card_id].spending += tx.amount;
      cardData[tx.card_id].rewards += rewards;
      cardData[tx.card_id].transactions += 1;
    });

    const cardPerformance = Object.entries(cardData).map(([cardId, data]) => {
      const card = cards.find(c => c.id === cardId);
      const cardName = card?.name || 'Unknown Card';
      
      return {
        card: cardName,
        cardId,
        spending: Math.round(data.spending),
        rewards: Math.round(data.rewards),
        transactions: data.transactions,
        efficiency: Math.round((data.rewards / data.spending) * 10000) / 100,
        utilization: Math.round((data.spending / totalSpending) * 100)
      };
    });

    // Optimization opportunities
    const optimizationOpportunities = categoryBreakdown
      .filter(cat => cat.efficiency < 3.0) // Less than 3% rewards rate
      .map(cat => {
        const bestCard = cards.find(c => c.categories.includes(cat.category.toLowerCase())) ||
                        cards.reduce((best, current) => 
                          current.rewards_rate > best.rewards_rate ? current : best, cards[0]);
        
        const potentialRewards = bestCard ? cat.amount * (bestCard.rewards_rate / 100) : cat.rewards;
        const impact = potentialRewards - cat.rewards;
        
        return {
          type: 'category' as const,
          category: cat.category,
          currentRewards: cat.rewards,
          potentialRewards: Math.round(potentialRewards),
          impact: Math.round(impact),
          recommendation: `Use ${bestCard?.name || 'a better card'} for ${cat.category} to earn ${bestCard?.rewards_rate || 2}% instead of ${cat.efficiency}%`
        };
      })
      .filter(opp => opp.impact > 10) // Only show opportunities with >$10 impact
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 5); // Top 5 opportunities

    // Year-over-year comparison
    const lastYearSpending = lastYearTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const lastYearRewards = lastYearTransactions.reduce((sum, tx) => {
      const card = cards.find(c => c.id === tx.card_id);
      return sum + (card ? tx.amount * (card.rewards_rate / 100) : tx.amount * 0.01);
    }, 0);

    const yearOverYear = {
      spendingGrowth: lastYearSpending > 0 ? ((totalSpending - lastYearSpending) / lastYearSpending) * 100 : 0,
      rewardsGrowth: lastYearRewards > 0 ? ((totalRewards - lastYearRewards) / lastYearRewards) * 100 : 0,
      efficiencyChange: lastYearRewards > 0 ? 
        ((totalRewards / totalSpending) - (lastYearRewards / lastYearSpending)) * 100 : 0
    };

    // Forecasts
    const recentMonths = monthlyTrends.slice(-3);
    const avgMonthlySpending = recentMonths.reduce((sum, month) => sum + month.spending, 0) / recentMonths.length;
    const avgMonthlyRewards = recentMonths.reduce((sum, month) => sum + month.rewards, 0) / recentMonths.length;
    
    const forecasts = {
      annualSpending: Math.round(avgMonthlySpending * 12),
      annualRewards: Math.round(avgMonthlyRewards * 12),
      quarterlyTrend: yearOverYear.spendingGrowth > 5 ? 'up' as const : 
                     yearOverYear.spendingGrowth < -5 ? 'down' as const : 'stable' as const
    };

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
