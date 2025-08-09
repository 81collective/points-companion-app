'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain,
  MessageSquare,
  Send,
  Star,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase';

interface AIRecommendation {
  id: string;
  cardName: string;
  cardIssuer: string;
  reason: string;
  confidence: number;
  potentialRewards: number;
  category: string;
  context: {
    merchant?: string;
    location?: string;
    amount?: number;
    time?: string;
  };
  insights: string[];
  alternatives?: AIRecommendation[];
}

interface UserQuery {
  id: string;
  query: string;
  timestamp: string;
  response?: AIRecommendation[];
  processing: boolean;
}

interface SpendingPattern {
  category: string;
  monthlySpend: number;
  preferredCards: string[];
  optimalRewards: number;
  currentRewards: number;
  improvement: number;
}

interface TransactionRow {
  category?: string | null;
  amount?: number | string | null;
  created_at?: string;
}

const AIRecommendationEngine: React.FC = () => {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<UserQuery[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [contextualRecommendations, setContextualRecommendations] = useState<AIRecommendation[]>([]);
  const [spendingPatterns, setSpendingPatterns] = useState<SpendingPattern[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  // future loading state placeholder (not currently displayed)
  const { user } = useAuth();
  const supabase = createClient();

  const generateContextualRecommendations = useCallback(() => {
    const currentHour = new Date().getHours();
    const timeContext = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';
    
    // Generate recommendations based on time and typical patterns
    const recommendations: AIRecommendation[] = [
      {
        id: '1',
        cardName: 'Chase Sapphire Preferred',
        cardIssuer: 'Chase',
        reason: `Perfect for ${timeContext} dining with 3x points on restaurants`,
        confidence: 92,
        potentialRewards: 45,
        category: 'Dining',
        context: {
          time: timeContext,
          location: currentLocation
        },
        insights: [
          'You typically spend $150 on dining during weekends',
          'This card offers the highest rewards for restaurant purchases',
          'Current 5x bonus offer expires in 3 days'
        ]
      },
      {
        id: '2',
        cardName: 'Amex Gold',
        cardIssuer: 'American Express',
        reason: 'Grocery shopping optimization with 4x points at supermarkets',
        confidence: 88,
        potentialRewards: 32,
        category: 'Groceries',
        context: {
          location: currentLocation
        },
        insights: [
          'You could earn 65% more rewards on grocery purchases',
          'Whole Foods nearby offers additional Amex benefits',
          'Current spending pattern suggests $200 weekly grocery budget'
        ]
      },
      {
        id: '3',
        cardName: 'Chase Freedom Flex',
        cardIssuer: 'Chase',
        reason: 'Quarterly category bonus: Gas stations earning 5x points',
        confidence: 85,
        potentialRewards: 28,
        category: 'Gas',
        context: {
          location: currentLocation
        },
        insights: [
          'Gas stations are the Q4 bonus category',
          'You could maximize $75 quarterly bonus',
          'Shell station 0.3 miles away accepts mobile payments'
        ]
      }
    ];

    setContextualRecommendations(recommendations);
  }, [currentLocation]);

  const loadSpendingPatterns = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_transactions')
        .select('category, amount, created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString());
      if (error) throw error;
      const rows = (data as TransactionRow[] | null) || [];
      const categoryTotals = rows.reduce<Record<string, number>>((acc, tx) => {
        const cat = tx.category || 'Other';
        const amt = typeof tx.amount === 'string' ? parseFloat(tx.amount) : Number(tx.amount || 0);
        acc[cat] = (acc[cat] || 0) + amt;
        return acc;
      }, {});
      const patterns: SpendingPattern[] = Object.entries(categoryTotals).map(([category, amount]) => {
        const numericAmount = Number(amount) || 0;
        const optimal = numericAmount * 0.03;
        const current = numericAmount * 0.015;
        return {
          category,
          monthlySpend: numericAmount,
          preferredCards: [],
          optimalRewards: Number(optimal.toFixed(2)),
          currentRewards: Number(current.toFixed(2)),
          improvement: Number((optimal - current).toFixed(2))
        };
      });
      setSpendingPatterns(patterns);
      if (typeof window !== 'undefined') localStorage.setItem('ai_cached_patterns', JSON.stringify(patterns));
    } catch (err) {
      console.error('Pattern load error:', err);
    }
  }, [user, supabase]);

  const getCurrentLocation = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    return new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation(`${pos.coords.latitude.toFixed(3)},${pos.coords.longitude.toFixed(3)}`);
          resolve();
        },
        () => resolve(),
        { enableHighAccuracy: false, timeout: 5000 }
      );
    });
  }, []);

  const initializeAIEngine = useCallback(async () => {
    if (!user) return;
  // optional: set loading state if UI hook-up added
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('ai_cached_patterns');
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as SpendingPattern[];
            if (Array.isArray(parsed)) setSpendingPatterns(parsed);
          } catch {/* ignore */}
        }
      }
      await loadSpendingPatterns();
      await getCurrentLocation();
      generateContextualRecommendations();
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      /* no-op */
    }
  }, [user, loadSpendingPatterns, getCurrentLocation, generateContextualRecommendations]);

  useEffect(() => { initializeAIEngine(); }, [initializeAIEngine]);

  const processNaturalLanguageQuery = async (userQuery: string): Promise<AIRecommendation[]> => {
    // Mock AI processing - in real app this would call OpenAI API
    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate relevant recommendations based on query
    const recommendations: AIRecommendation[] = [];
    
    if (userQuery.toLowerCase().includes('dining') || userQuery.toLowerCase().includes('restaurant')) {
      recommendations.push({
        id: 'ai-dining',
        cardName: 'Chase Sapphire Preferred',
        cardIssuer: 'Chase',
        reason: 'Optimal for dining with 3x points on restaurants',
        confidence: 94,
        potentialRewards: 42,
        category: 'Dining',
        context: {
          merchant: 'Fine dining restaurants',
          location: currentLocation
        },
        insights: [
          'Analyzed your dining preferences: you favor mid-to-high-end restaurants',
          'This card offers transfer partners for maximum value',
          'Consider pairing with Chase Freedom for rotating categories'
        ]
      });
    }
    
    if (userQuery.toLowerCase().includes('travel') || userQuery.toLowerCase().includes('flight')) {
      recommendations.push({
        id: 'ai-travel',
        cardName: 'Chase Sapphire Reserve',
        cardIssuer: 'Chase',
        reason: 'Premium travel card with 3x points and travel protections',
        confidence: 96,
        potentialRewards: 78,
        category: 'Travel',
        context: {
          merchant: 'Airlines and hotels',
          location: 'Worldwide'
        },
        insights: [
          'Your travel spending pattern suggests premium benefits are worthwhile',
          '$300 annual travel credit effectively reduces annual fee',
          'Priority Pass lounge access included for frequent travelers'
        ]
      });
    }
    
    if (userQuery.toLowerCase().includes('grocery') || userQuery.toLowerCase().includes('supermarket')) {
      recommendations.push({
        id: 'ai-grocery',
        cardName: 'Amex Gold',
        cardIssuer: 'American Express',
        reason: '4x points at U.S. supermarkets (up to $25k annually)',
        confidence: 89,
        potentialRewards: 52,
        category: 'Groceries',
        context: {
          merchant: 'Supermarkets',
          location: currentLocation
        },
        insights: [
          'Your monthly grocery spend of $650 maximizes this category',
          'Uber Eats credit can supplement dining rewards',
          'Consider Gold + Everyday Preferred combo for maximum efficiency'
        ]
      });
    }
    
    // Fallback recommendation
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'ai-general',
        cardName: 'Chase Freedom Unlimited',
        cardIssuer: 'Chase',
        reason: 'Versatile 1.5x points on all purchases with no categories to track',
        confidence: 75,
        potentialRewards: 24,
        category: 'General',
        context: {},
        insights: [
          'Good all-around option when category bonuses don\'t apply',
          'Pairs well with other Chase cards for maximum value',
          'No annual fee makes it a low-risk choice'
        ]
      });
    }
    
    setIsProcessing(false);
    return recommendations;
  };

  const handleSubmitQuery = async () => {
    if (!query.trim()) return;

    const newQuery: UserQuery = {
      id: `query_${Date.now()}`,
      query: query.trim(),
      timestamp: new Date().toISOString(),
      processing: true
    };

    setChatHistory(prev => [newQuery, ...prev]);
    setQuery('');

    try {
      const recommendations = await processNaturalLanguageQuery(newQuery.query);
      
      const updatedQuery = {
        ...newQuery,
        response: recommendations,
        processing: false
      };

      setChatHistory(prev => 
        prev.map(q => q.id === newQuery.id ? updatedQuery : q)
      );

      // Save to localStorage
      const updatedHistory = [updatedQuery, ...chatHistory];
      localStorage.setItem('ai_chat_history', JSON.stringify(updatedHistory.slice(0, 50)));

    } catch (error) {
      console.error('Error processing query:', error);
      setChatHistory(prev => 
        prev.map(q => q.id === newQuery.id ? { ...q, processing: false } : q)
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitQuery();
    }
  };

  const handleRecommendationFeedback = (recommendationId: string, positive: boolean) => {
    // In real app, this would send feedback to improve AI recommendations
    console.log(`Feedback for ${recommendationId}: ${positive ? 'positive' : 'negative'}`);
    
    // Mock feedback processing
    const feedbackType = positive ? 'positive' : 'negative';
    console.log(`Recorded ${feedbackType} feedback to improve future recommendations`);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const suggestedQueries = [
    "What card should I use for dining tonight?",
    "Best card for my upcoming flight to Paris?",
    "Optimize my grocery shopping rewards",
    "Which card for gas during road trip?",
    "Best card for online shopping this month?"
  ];

  return (
    <div className="space-y-6">
      {/* AI Engine Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Recommendation Engine</h2>
            <p className="text-purple-100">Intelligent card recommendations powered by your spending patterns</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="w-5 h-5" />
              <span className="font-medium">Smart Analysis</span>
            </div>
            <p className="text-sm text-purple-100">Learns from your spending patterns and preferences</p>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="w-5 h-5" />
              <span className="font-medium">Context Aware</span>
            </div>
            <p className="text-sm text-purple-100">Considers location, time, and merchant type</p>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="w-5 h-5" />
              <span className="font-medium">Optimized Rewards</span>
            </div>
            <p className="text-sm text-purple-100">Maximizes points and cashback potential</p>
          </div>
        </div>
      </div>

      {/* Natural Language Query Interface */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Ask AI Assistant</h3>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about card recommendations... (e.g., 'What card should I use for dining tonight?')"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isProcessing}
            />
            <button
              onClick={handleSubmitQuery}
              disabled={!query.trim() || isProcessing}
              className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <Star className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Suggested Queries */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Try asking:</span>
            {suggestedQueries.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setQuery(suggestion)}
                className="text-sm bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat History */}
      {chatHistory.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Conversations</h3>
          
          <div className="space-y-6">
            {chatHistory.slice(0, 5).map((chat) => (
              <div key={chat.id} className="border-l-4 border-blue-200 pl-4">
                <div className="mb-3">
                  <p className="font-medium text-gray-900">{chat.query}</p>
                  <p className="text-sm text-gray-500">{formatTimestamp(chat.timestamp)}</p>
                </div>

                {chat.processing ? (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Star className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                ) : chat.response && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {chat.response.map((rec) => (
                      <RecommendationCard
                        key={rec.id}
                        recommendation={rec}
                        onFeedback={handleRecommendationFeedback}
                        compact
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contextual Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Star className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-semibold text-gray-900">Smart Recommendations</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Star className="w-4 h-4" />
            <span>Updated based on current context</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contextualRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onFeedback={handleRecommendationFeedback}
              onSelect={setSelectedRecommendation}
            />
          ))}
        </div>
      </div>

      {/* Spending Pattern Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-semibold text-gray-900">Spending Pattern Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spendingPatterns.map((pattern) => (
            <div key={pattern.category} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{pattern.category}</h4>
                <span className="text-sm text-gray-600">${pattern.monthlySpend}/month</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Rewards:</span>
                  <span className="font-medium">${pattern.currentRewards}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Optimal Rewards:</span>
                  <span className="font-medium text-green-600">${pattern.optimalRewards}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Potential Improvement:</span>
                  <span className="font-medium text-blue-600">+${pattern.improvement}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600 mb-2">Recommended Cards:</p>
                <div className="flex flex-wrap gap-1">
                  {pattern.preferredCards.map((card) => (
                    <span key={card} className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1">
                      {card}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Recommendation Modal */}
      <AnimatePresence>
        {selectedRecommendation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setSelectedRecommendation(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6"
            >
              <RecommendationDetails
                recommendation={selectedRecommendation}
                onClose={() => setSelectedRecommendation(null)}
                onFeedback={handleRecommendationFeedback}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Recommendation Card Component
const RecommendationCard: React.FC<{
  recommendation: AIRecommendation;
  onFeedback: (id: string, positive: boolean) => void;
  onSelect?: (recommendation: AIRecommendation) => void;
  compact?: boolean;
}> = ({ recommendation, onFeedback, onSelect, compact = false }) => {
  const confidence = (() => {
    const c = recommendation.confidence
    if (c >= 90) return { label: 'Very High', color: 'bg-green-100 text-green-700' }
    if (c >= 80) return { label: 'High', color: 'bg-blue-100 text-blue-700' }
    if (c >= 70) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' }
    return { label: 'Low', color: 'bg-red-100 text-red-700' }
  })();

  return (
    <motion.div
      whileHover={{ scale: compact ? 1 : 1.02 }}
      className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
        compact ? '' : 'bg-white'
      }`}
      onClick={() => onSelect?.(recommendation)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{recommendation.cardName}</h4>
          <p className="text-sm text-gray-600">{recommendation.cardIssuer}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${confidence.color}`}>
          {confidence.label}
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3">{recommendation.reason}</p>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium">+${recommendation.potentialRewards} rewards</span>
        </div>
        <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-1">
          {recommendation.category}
        </span>
      </div>

      {!compact && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFeedback(recommendation.id, true);
              }}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            >
              <Star className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFeedback(recommendation.id, false);
              }}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Star className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-1 text-blue-600">
            <span className="text-sm">View details</span>
            <Star className="w-4 h-4" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Recommendation Details Component
const RecommendationDetails: React.FC<{
  recommendation: AIRecommendation;
  onClose: () => void;
  onFeedback: (id: string, positive: boolean) => void;
}> = ({ recommendation, onClose, onFeedback }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{recommendation.cardName}</h3>
          <p className="text-gray-600">{recommendation.cardIssuer}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Why this card?</h4>
          <p className="text-gray-700">{recommendation.reason}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Potential Rewards</span>
            </div>
            <p className="text-2xl font-bold text-green-600">+${recommendation.potentialRewards}</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Confidence</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{recommendation.confidence}%</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">AI Insights</h4>
          <div className="space-y-2">
            {recommendation.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Star className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Was this helpful?</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onFeedback(recommendation.id, true)}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Star className="w-4 h-4" />
                <span>Yes</span>
              </button>
              <button
                onClick={() => onFeedback(recommendation.id, false)}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
              >
                <Star className="w-4 h-4" />
                <span>No</span>
              </button>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendationEngine;
