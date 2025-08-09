'use client';
import React from 'react';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { Lightbulb, AlertTriangle, TrendingUp, Sparkles, Target, DollarSign, ArrowUpRight, Clock } from 'lucide-react';

interface Insight {
  type: 'tip' | 'alert' | 'opportunity' | 'achievement' | 'prediction';
  title: string;
  description: string;
  impact?: 'high' | 'medium' | 'low';
  actionable?: boolean;
  savings?: number;
  timeframe?: string;
}

interface Transaction {
  id: string;
  amount: number;
  date: string;
  merchant: string;
  category: string;
  card_id: string;
}

interface CreditCard {
  id: string;
  name: string;
  rewards: string[];
}

interface SpendingAnalysis {
  category: string;
  totalSpent: number;
  cardUsed: string;
  bestCard: string;
  potentialPoints: number;
  actualPoints: number;
}

export default function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'actionable'>('all');
  const { supabase } = useSupabase();

  const analyzeSpending = React.useCallback((transactions: Transaction[], cards: CreditCard[]): SpendingAnalysis[] => {
    const categorySpending: { [key: string]: SpendingAnalysis } = {};

    transactions.forEach(tx => {
      if (!categorySpending[tx.category]) {
        categorySpending[tx.category] = {
          category: tx.category,
          totalSpent: 0,
          cardUsed: '',
          bestCard: '',
          potentialPoints: 0,
          actualPoints: 0,
        };
      }

      const analysis = categorySpending[tx.category];
      analysis.totalSpent += tx.amount;

      // Find the card used for this transaction
      const usedCard = cards.find(card => card.id === tx.card_id);
      if (usedCard) {
        analysis.cardUsed = usedCard.name;
      }

      // Find the best card for this category
      const bestCard = findBestCard(tx.category, cards);
      if (bestCard) {
        analysis.bestCard = bestCard.name;
        analysis.potentialPoints += calculatePoints(tx.amount, bestCard, tx.category);
        analysis.actualPoints += calculatePoints(tx.amount, usedCard || bestCard, tx.category);
      }
    });

    return Object.values(categorySpending);
  }, []);

  const findBestCard = (category: string, cards: CreditCard[]): CreditCard | null => {
    let bestCard = null;
    let maxPoints = 0;

    cards.forEach(card => {
      const points = card.rewards.reduce((max, reward) => {
        const [cat, multiplier] = reward.split(':');
        if (cat.toLowerCase() === category.toLowerCase()) {
          return Math.max(max, parseFloat(multiplier));
        }
        return max;
      }, 1); // Default 1x points

      if (points > maxPoints) {
        maxPoints = points;
        bestCard = card;
      }
    });

    return bestCard;
  };

  const calculatePoints = (amount: number, card: CreditCard | null | undefined, category: string): number => {
    if (!card) return Math.round(amount); // default 1x if no card info
    const multiplier = card.rewards.reduce((max, reward) => {
      const [cat, mult] = reward.split(':');
      if (cat.toLowerCase() === category.toLowerCase()) {
        const parsed = parseFloat(mult);
        return isNaN(parsed) ? max : Math.max(max, parsed);
      }
      return max;
    }, 1);

    return Math.round(amount * multiplier);
  };

  const generateInsights = (analyses: SpendingAnalysis[]): Insight[] => {
    const insights: Insight[] = [];

    analyses.forEach(analysis => {
      if (analysis.potentialPoints > analysis.actualPoints) {
        const difference = analysis.potentialPoints - analysis.actualPoints;
        const savings = Math.round(difference * 0.01 * 100) / 100; // Assume 1 point = $0.01
        
        insights.push({
          type: 'alert',
          title: `Missed ${difference} Points in ${analysis.category}`,
          description: `Switch to ${analysis.bestCard} instead of ${analysis.cardUsed} for ${analysis.category} purchases to maximize rewards.`,
          impact: difference > 500 ? 'high' : difference > 100 ? 'medium' : 'low',
          actionable: true,
          savings: savings,
          timeframe: 'immediate'
        });
      }

      if (analysis.totalSpent > 1000 && analysis.cardUsed !== analysis.bestCard) {
        insights.push({
          type: 'opportunity',
          title: `Optimize High-Spend Category: ${analysis.category}`,
          description: `You spent $${analysis.totalSpent.toFixed(2)} on ${analysis.category}. Using ${analysis.bestCard} could earn significant bonus points.`,
          impact: 'high',
          actionable: true,
          savings: Math.round((analysis.totalSpent * 0.02) * 100) / 100,
          timeframe: 'ongoing'
        });
      }

      // Predictive insights
      if (analysis.totalSpent > 500) {
        insights.push({
          type: 'prediction',
          title: `${analysis.category} Spending Trend`,
          description: `Based on your current pace, you'll spend ~$${(analysis.totalSpent * 12).toFixed(0)} annually on ${analysis.category}. Consider a specialized rewards card.`,
          impact: 'medium',
          actionable: false,
          timeframe: 'annual'
        });
      }
    });

    // Achievement insights
    const totalPotentialSavings = insights
      .filter(i => i.savings)
      .reduce((sum, i) => sum + (i.savings || 0), 0);

    if (totalPotentialSavings > 50) {
      insights.push({
        type: 'achievement',
        title: 'Optimization Opportunity Detected!',
        description: `You could earn an additional $${totalPotentialSavings.toFixed(2)} monthly by optimizing your card usage patterns.`,
        impact: 'high',
        actionable: true,
        savings: totalPotentialSavings,
        timeframe: 'monthly'
      });
    }

    // Add smart tips
    insights.push({
      type: 'tip',
      title: 'Smart Spending Strategy',
      description: 'Set up automatic reminders to review your card usage monthly. Small optimizations compound into significant rewards over time.',
      impact: 'medium',
      actionable: true,
      timeframe: 'ongoing'
    });

    return insights.sort((a, b) => {
      const impactWeight = { high: 3, medium: 2, low: 1 };
      return (impactWeight[b.impact || 'low'] - impactWeight[a.impact || 'low']);
    });
  };

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const { data: transactions, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        if (txError) throw txError;

        const { data: cards, error: cardError } = await supabase
          .from('credit_cards')
          .select('*');
        if (cardError) throw cardError;

        if (!transactions || !cards || !transactions.length || !cards.length) {
          setInsights([]);
          return;
        }

        const analysis = analyzeSpending(transactions as Transaction[], cards as CreditCard[]);
        if (!analysis.length) {
          setInsights([]);
          return;
        }
        const newInsights = generateInsights(analysis);
        setInsights(newInsights);
      } catch (error) {
        console.error('Error fetching insights:', error);
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [analyzeSpending, supabase]);

  const filteredInsights = insights.filter(insight => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'high') return insight.impact === 'high';
    if (selectedFilter === 'actionable') return insight.actionable;
    return false;
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">AI Insights</h1>
      <div className="mb-4">
        <label className="mr-2">Filter:</label>
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'high' | 'actionable')}
          className="p-2 border rounded"
        >
          <option value="all">All</option>
          <option value="high">High Impact</option>
          <option value="actionable">Actionable</option>
        </select>
      </div>
      {loading ? (
        <p>Loading insights...</p>
      ) : (
        <div>
          {filteredInsights.length === 0 ? (
            <p>No insights available based on your spending data.</p>
          ) : (
            filteredInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 mb-4 rounded-lg border-l-4 ${insight.type === 'alert' ? 'border-red-500' : insight.type === 'opportunity' ? 'border-green-500' : 'border-blue-500'}`}
              >
                <div className="flex items-center mb-2">
                  {insight.type === 'tip' && <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />}
                  {insight.type === 'alert' && <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />}
                  {insight.type === 'opportunity' && <TrendingUp className="w-5 h-5 mr-2 text-green-500" />}
                  {insight.type === 'achievement' && <Sparkles className="w-5 h-5 mr-2 text-purple-500" />}
                  {insight.type === 'prediction' && <Target className="w-5 h-5 mr-2 text-orange-500" />}
                  <h2 className="text-lg font-semibold">{insight.title}</h2>
                </div>
                <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                {insight.savings && (
                  <p className="text-sm font-medium">
                    Potential Savings: ${insight.savings.toFixed(2)} {insight.timeframe && `(${insight.timeframe})`}
                  </p>
                )}
                <p className="text-xs text-gray-500">{insight.impact} impact</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
