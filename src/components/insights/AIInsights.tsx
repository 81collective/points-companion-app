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

  const calculatePoints = (amount: number, card: CreditCard, category: string): number => {
    const multiplier = card.rewards.reduce((max, reward) => {
      const [cat, mult] = reward.split(':');
      if (cat.toLowerCase() === category.toLowerCase()) {
        return Math.max(max, parseFloat(mult));
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
        insights.push({
          type: 'alert',
          title: `Missed Points in ${analysis.category}`,
          description: `Using ${analysis.bestCard} instead of ${analysis.cardUsed} would have earned you ${difference} more points on ${analysis.category} purchases.`,
        });
      }

      if (analysis.totalSpent > 1000 && analysis.cardUsed !== analysis.bestCard) {
        insights.push({
          type: 'opportunity',
          title: `High Spend Category: ${analysis.category}`,
          description: `You spent $${analysis.totalSpent.toFixed(2)} on ${analysis.category}. Consider using ${analysis.bestCard} to maximize your rewards.`,
        });
      }
    });

    // Add a general tip
    insights.push({
      type: 'tip',
      title: 'Optimize Your Spending',
      description: 'Review your category spending patterns monthly and adjust which cards you use to maximize points earned.',
    });

    return insights;
  };

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        // Get recent transactions
        const { data: transactions, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (txError) throw txError;

        // Get user's cards
        const { data: cards, error: cardError } = await supabase
          .from('credit_cards')
          .select('*');

        if (cardError) throw cardError;

        // Analyze spending patterns
        const analysis = analyzeSpending(transactions as Transaction[], cards as CreditCard[]);
        
        // Generate insights from analysis
        const newInsights = generateInsights(analysis);
        setInsights(newInsights);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [analyzeSpending, supabase]);

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'opportunity':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
    }
  };

  const getBackgroundColor = (type: Insight['type']) => {
    switch (type) {
      case 'tip':
        return 'bg-yellow-50';
      case 'alert':
        return 'bg-red-50';
      case 'opportunity':
        return 'bg-green-50';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg ${getBackgroundColor(insight.type)}`}
        >
          <div className="flex gap-3">
            {getIcon(insight.type)}
            <div>
              <h3 className="font-medium text-gray-900">{insight.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
