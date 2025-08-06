'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  CreditCard,
  Star,
  AlertCircle,
  Target,
  Zap,
  Filter,
  Search,
  ChevronDown,
  ExternalLink
} from 'lucide-react';

interface SmartInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'trend' | 'optimization';
  title: string;
  description: string;
  impact: number;
  confidence: number;
  category: string;
  timeframe: string;
  actionable: boolean;
  relatedCards: string[];
  data?: {
    current: number;
    potential: number;
    difference: number;
  };
}

interface SpendingOptimization {
  id: string;
  category: string;
  currentCard: string;
  recommendedCard: string;
  monthlySpend: number;
  currentRewards: number;
  potentialRewards: number;
  improvement: number;
  confidence: number;
  reasoning: string[];
}

interface TrendAnalysis {
  period: string;
  totalSpending: number;
  totalRewards: number;
  topCategories: {
    name: string;
    spend: number;
    percentage: number;
  }[];
  rewardsRate: number;
  trend: 'up' | 'down' | 'stable';
}

const SmartInsights: React.FC = () => {
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [optimizations, setOptimizations] = useState<SpendingOptimization[]>([]);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'impact' | 'confidence' | 'recent'>('impact');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    generateSmartInsights();
    generateOptimizations();
    generateTrendAnalysis();
  }, []);

  const generateSmartInsights = () => {
    const mockInsights: SmartInsight[] = [
      {
        id: '1',
        type: 'opportunity',
        title: 'Maximize Q4 Gas Station Bonus',
        description: 'Chase Freedom Flex offers 5x points on gas stations this quarter. You could earn an extra $45 by using this card for gas purchases.',
        impact: 45,
        confidence: 95,
        category: 'Gas',
        timeframe: '3 months remaining',
        actionable: true,
        relatedCards: ['Chase Freedom Flex'],
        data: {
          current: 15,
          potential: 60,
          difference: 45
        }
      },
      {
        id: '2',
        type: 'warning',
        title: 'Underutilizing Dining Category',
        description: 'You spent $650 on dining last month but only earned 1x points. Chase Sapphire Preferred would have earned 3x points.',
        impact: 65,
        confidence: 88,
        category: 'Dining',
        timeframe: 'Monthly recurring',
        actionable: true,
        relatedCards: ['Chase Sapphire Preferred', 'Amex Gold'],
        data: {
          current: 650,
          potential: 1950,
          difference: 1300
        }
      },
      {
        id: '3',
        type: 'trend',
        title: 'Grocery Spending Trending Up',
        description: 'Your grocery spending has increased 23% over the past 3 months. Consider optimizing with a grocery-focused card.',
        impact: 38,
        confidence: 92,
        category: 'Groceries',
        timeframe: '3 month trend',
        actionable: true,
        relatedCards: ['Amex Gold', 'Chase Freedom Flex'],
        data: {
          current: 580,
          potential: 710,
          difference: 130
        }
      },
      {
        id: '4',
        type: 'optimization',
        title: 'Travel Card Portfolio Gap',
        description: 'You have strong dining and grocery coverage but lack a premium travel card. Consider adding travel benefits for upcoming trips.',
        impact: 120,
        confidence: 85,
        category: 'Travel',
        timeframe: 'Long-term',
        actionable: true,
        relatedCards: ['Chase Sapphire Reserve', 'Amex Platinum'],
        data: {
          current: 0,
          potential: 120,
          difference: 120
        }
      },
      {
        id: '5',
        type: 'opportunity',
        title: 'Welcome Bonus Timing',
        description: 'Chase Sapphire Preferred welcome bonus increases to 80k points next month. Time your application for maximum value.',
        impact: 200,
        confidence: 78,
        category: 'Welcome Bonus',
        timeframe: '2 weeks optimal window',
        actionable: true,
        relatedCards: ['Chase Sapphire Preferred'],
        data: {
          current: 60000,
          potential: 80000,
          difference: 20000
        }
      },
      {
        id: '6',
        type: 'warning',
        title: 'Annual Fee Not Justified',
        description: 'Your Amex Platinum annual fee ($695) exceeds your benefits usage by $280. Consider downgrading or increasing utilization.',
        impact: -280,
        confidence: 94,
        category: 'Fees',
        timeframe: 'Annual review needed',
        actionable: true,
        relatedCards: ['Amex Platinum', 'Amex Gold'],
        data: {
          current: 695,
          potential: 415,
          difference: -280
        }
      }
    ];

    setInsights(mockInsights);
  };

  const generateOptimizations = () => {
    const mockOptimizations: SpendingOptimization[] = [
      {
        id: '1',
        category: 'Dining',
        currentCard: 'Chase Freedom Unlimited',
        recommendedCard: 'Chase Sapphire Preferred',
        monthlySpend: 650,
        currentRewards: 9.75,
        potentialRewards: 19.50,
        improvement: 9.75,
        confidence: 94,
        reasoning: [
          '3x points vs 1.5x points on dining',
          'Transfer partners provide higher value',
          'No foreign transaction fees for international dining'
        ]
      },
      {
        id: '2',
        category: 'Groceries',
        currentCard: 'Chase Freedom Unlimited',
        recommendedCard: 'Amex Gold',
        monthlySpend: 580,
        currentRewards: 8.70,
        potentialRewards: 23.20,
        improvement: 14.50,
        confidence: 89,
        reasoning: [
          '4x points vs 1.5x points at supermarkets',
          'Up to $25k annually in grocery spending',
          'Uber Eats credit adds additional value'
        ]
      },
      {
        id: '3',
        category: 'Gas',
        currentCard: 'Chase Freedom Unlimited',
        recommendedCard: 'Chase Freedom Flex',
        monthlySpend: 280,
        currentRewards: 4.20,
        potentialRewards: 14.00,
        improvement: 9.80,
        confidence: 96,
        reasoning: [
          '5x points during Q4 bonus category',
          'Rotating categories provide variety',
          'No annual fee'
        ]
      }
    ];

    setOptimizations(mockOptimizations);
  };

  const generateTrendAnalysis = () => {
    const mockTrend: TrendAnalysis = {
      period: 'Last 3 months',
      totalSpending: 4850,
      totalRewards: 73.80,
      topCategories: [
        { name: 'Dining', spend: 1950, percentage: 40.2 },
        { name: 'Groceries', spend: 1740, percentage: 35.9 },
        { name: 'Gas', spend: 840, percentage: 17.3 },
        { name: 'Shopping', spend: 320, percentage: 6.6 }
      ],
      rewardsRate: 1.52,
      trend: 'up'
    };

    setTrendAnalysis(mockTrend);
  };

  const filteredInsights = insights.filter(insight => {
    const matchesFilter = selectedFilter === 'all' || insight.type === selectedFilter;
    const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedInsights = [...filteredInsights].sort((a, b) => {
    switch (sortBy) {
      case 'impact':
        return Math.abs(b.impact) - Math.abs(a.impact);
      case 'confidence':
        return b.confidence - a.confidence;
      case 'recent':
        return parseInt(a.id) - parseInt(b.id);
      default:
        return 0;
    }
  });

  const getInsightIcon = (type: SmartInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return <Star className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'optimization':
        return <Target className="w-5 h-5 text-purple-600" />;
    }
  };

  const getInsightColor = (type: SmartInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-red-500 bg-red-50';
      case 'trend':
        return 'border-l-blue-500 bg-blue-50';
      case 'optimization':
        return 'border-l-purple-500 bg-purple-50';
    }
  };

  const formatImpact = (impact: number) => {
    const sign = impact >= 0 ? '+' : '';
    const color = impact >= 0 ? 'text-green-600' : 'text-red-600';
    return { sign, color, value: Math.abs(impact) };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Smart Insights</h2>
            <p className="text-blue-100">AI-powered analysis of your spending patterns and optimization opportunities</p>
          </div>
        </div>

        {trendAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Total Spending</span>
              </div>
              <p className="text-2xl font-bold">${trendAnalysis.totalSpending.toLocaleString()}</p>
              <p className="text-sm text-blue-100">{trendAnalysis.period}</p>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-5 h-5" />
                <span className="font-medium">Total Rewards</span>
              </div>
              <p className="text-2xl font-bold">${trendAnalysis.totalRewards}</p>
              <p className="text-sm text-blue-100">{trendAnalysis.rewardsRate}% rate</p>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Top Category</span>
              </div>
              <p className="text-2xl font-bold">{trendAnalysis.topCategories[0]?.name}</p>
              <p className="text-sm text-blue-100">{trendAnalysis.topCategories[0]?.percentage}% of spend</p>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-5 h-5" />
                <span className="font-medium">Insights Found</span>
              </div>
              <p className="text-2xl font-bold">{insights.length}</p>
              <p className="text-sm text-blue-100">optimization opportunities</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Insights</option>
                <option value="opportunity">Opportunities</option>
                <option value="warning">Warnings</option>
                <option value="trend">Trends</option>
                <option value="optimization">Optimizations</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'impact' | 'confidence' | 'recent')}
                className="appearance-none bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="impact">Sort by Impact</option>
                <option value="confidence">Sort by Confidence</option>
                <option value="recent">Sort by Recent</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search insights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {sortedInsights.map((insight) => {
          const impact = formatImpact(insight.impact);
          
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-l-4 rounded-lg p-6 ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                    <p className="text-gray-700 mt-1">{insight.description}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-2xl font-bold ${impact.color}`}>
                    {impact.sign}${impact.value}
                  </div>
                  <div className="text-sm text-gray-600">{insight.confidence}% confidence</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Category: {insight.category}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Timeframe: {insight.timeframe}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    Cards: {insight.relatedCards.join(', ')}
                  </span>
                </div>
              </div>

              {insight.data && (
                <div className="mt-4 p-4 bg-white bg-opacity-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Current</p>
                      <p className="text-lg font-semibold">${insight.data.current}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Potential</p>
                      <p className="text-lg font-semibold text-green-600">${insight.data.potential}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Difference</p>
                      <p className={`text-lg font-semibold ${impact.color}`}>
                        {impact.sign}${insight.data.difference}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {insight.actionable && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    ✨ Actionable insight
                  </span>
                  <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors">
                    <span className="text-sm">Take action</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Spending Optimizations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-900">Spending Optimizations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {optimizations.map((opt) => (
            <div key={opt.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{opt.category}</h4>
                <span className="text-sm bg-purple-100 text-purple-800 rounded-full px-2 py-1">
                  {opt.confidence}% match
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Current: {opt.currentCard}</p>
                  <p className="text-sm text-gray-600">Recommended: {opt.recommendedCard}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Monthly spend:</span>
                    <span className="font-medium">${opt.monthlySpend}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Current rewards:</span>
                    <span>${opt.currentRewards}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Potential rewards:</span>
                    <span className="text-green-600 font-medium">${opt.potentialRewards}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Monthly improvement:</span>
                    <span className="text-green-600">+${opt.improvement}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  {opt.reasoning.map((reason, index) => (
                    <p key={index} className="text-xs text-gray-600">• {reason}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredInsights.length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No insights found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
};

export default SmartInsights;
