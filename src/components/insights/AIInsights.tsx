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
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-rose-500" />;
      case 'opportunity':
        return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case 'achievement':
        return <Target className="h-5 w-5 text-purple-500" />;
      case 'prediction':
        return <Sparkles className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: Insight['type']) => {
    switch (type) {
      case 'tip':
        return 'bg-amber-50 border-amber-200';
      case 'alert':
        return 'bg-rose-50 border-rose-200';
      case 'opportunity':
        return 'bg-emerald-50 border-emerald-200';
      case 'achievement':
        return 'bg-purple-50 border-purple-200';
      case 'prediction':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getImpactBadge = (impact?: string) => {
    if (!impact) return null;
    
    const colors = {
      high: 'bg-rose-100 text-rose-800',
      medium: 'bg-amber-100 text-amber-800',
      low: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[impact as keyof typeof colors]}`}>
        {impact.toUpperCase()} IMPACT
      </span>
    );
  };

  const filteredInsights = insights.filter(insight => {
    if (selectedFilter === 'high') return insight.impact === 'high';
    if (selectedFilter === 'actionable') return insight.actionable;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Summary Stats */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">AI Insights Dashboard</h2>
            <p className="text-purple-100">Smart recommendations powered by your spending patterns</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{insights.length}</div>
            <div className="text-sm text-purple-100">Active Insights</div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">
              ${insights.filter(i => i.savings).reduce((sum, i) => sum + (i.savings || 0), 0).toFixed(0)}
            </div>
            <div className="text-sm text-purple-100">Potential Monthly Savings</div>
          </div>
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">
              {insights.filter(i => i.impact === 'high').length}
            </div>
            <div className="text-sm text-purple-100">High Impact Opportunities</div>
          </div>
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">
              {insights.filter(i => i.actionable).length}
            </div>
            <div className="text-sm text-purple-100">Actionable Items</div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-700">Filter by:</span>
        {['all', 'high', 'actionable'].map((filter) => (
          <button
            key={filter}
                              onClick={() => setSelectedFilter(filter as 'all' | 'high' | 'actionable')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              selectedFilter === filter
                ? 'bg-rose-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter === 'all' ? 'All Insights' : filter === 'high' ? 'High Impact' : 'Actionable'}
          </button>
        ))}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insights match your filter</h3>
            <p className="text-gray-600">Try adjusting your filter or check back later for new insights.</p>
          </div>
        ) : (
          filteredInsights.map((insight, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${getBackgroundColor(insight.type)}`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white shadow-sm">
                  {getIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{insight.title}</h3>
                    <div className="flex items-center space-x-2">
                      {getImpactBadge(insight.impact)}
                      {insight.actionable && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          ACTIONABLE
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">{insight.description}</p>
                  
                  {/* Action Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {insight.savings && (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${insight.savings.toFixed(2)} potential savings</span>
                        </div>
                      )}
                      {insight.timeframe && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{insight.timeframe}</span>
                        </div>
                      )}
                    </div>
                    {insight.actionable && (
                      <button className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 transition-colors text-sm">
                        Take Action
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
