'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain,
  Sparkles,
  MessageCircle,
  TrendingUp,
  Star,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AIRecommendation {
  id: string;
  cardName: string;
  reason: string;
  confidence: number;
  potentialRewards: number;
  category: string;
}

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'trend';
  title: string;
  impact: number;
  confidence: number;
}

const AISystemHeader: React.FC = () => {
  const [currentRecommendation, setCurrentRecommendation] = useState<AIRecommendation | null>(null);
  const [latestInsight, setLatestInsight] = useState<AIInsight | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    generateContextualRecommendation();
    generateLatestInsight();
    
    // Update every 30 seconds
    const interval = setInterval(() => {
      generateContextualRecommendation();
      generateLatestInsight();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const generateContextualRecommendation = () => {
    const currentHour = new Date().getHours();
    const timeContext = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';
    
    const recommendations: AIRecommendation[] = [
      {
        id: '1',
        cardName: 'Chase Sapphire Preferred',
        reason: `Perfect for ${timeContext} dining with 3x points`,
        confidence: 92,
        potentialRewards: 45,
        category: 'Dining'
      },
      {
        id: '2',
        cardName: 'Amex Gold',
        reason: 'Grocery shopping optimization with 4x points',
        confidence: 88,
        potentialRewards: 32,
        category: 'Groceries'
      },
      {
        id: '3',
        cardName: 'Chase Freedom Flex',
        reason: 'Q4 gas station bonus: 5x points',
        confidence: 95,
        potentialRewards: 28,
        category: 'Gas'
      }
    ];

    const randomRec = recommendations[Math.floor(Math.random() * recommendations.length)];
    setCurrentRecommendation(randomRec);
  };

  const generateLatestInsight = () => {
    const insights: AIInsight[] = [
      {
        id: '1',
        type: 'opportunity',
        title: 'Maximize Q4 Gas Station Bonus',
        impact: 45,
        confidence: 95
      },
      {
        id: '2',
        type: 'warning',
        title: 'Underutilizing Dining Category',
        impact: 65,
        confidence: 88
      },
      {
        id: '3',
        type: 'trend',
        title: 'Grocery Spending Trending Up',
        impact: 38,
        confidence: 92
      }
    ];

    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    setLatestInsight(randomInsight);
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-red-600 bg-red-100';
      case 'trend':
        return 'text-blue-600 bg-blue-100';
    }
  };

  const handleQuickAnalyze = () => {
    setIsProcessing(true);
    setTimeout(() => {
      generateContextualRecommendation();
      generateLatestInsight();
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-lg p-4 text-white">
      <div className="flex items-center justify-between">
        {/* AI Status */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
          <div>
            <h3 className="font-semibold">AI Advisor Active</h3>
            <p className="text-sm text-purple-100">Analyzing your spending patterns</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleQuickAnalyze}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-3 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            <span className="text-sm">
              {isProcessing ? 'Analyzing...' : 'Quick Analyze'}
            </span>
          </button>
        </div>
      </div>

      {/* Current Recommendations & Insights */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Recommendation */}
        {currentRecommendation && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white bg-opacity-10 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Smart Recommendation</span>
            </div>
            <h4 className="font-semibold mb-1">{currentRecommendation.cardName}</h4>
            <p className="text-sm text-purple-100 mb-2">{currentRecommendation.reason}</p>
            <div className="flex items-center justify-between text-sm">
              <span>+${currentRecommendation.potentialRewards} potential</span>
              <span className="text-green-200">{currentRecommendation.confidence}% match</span>
            </div>
          </motion.div>
        )}

        {/* Latest Insight */}
        {latestInsight && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white bg-opacity-10 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Latest Insight</span>
              <span className={`text-xs px-2 py-1 rounded-full ${getInsightColor(latestInsight.type)}`}>
                {latestInsight.type}
              </span>
            </div>
            <h4 className="font-semibold mb-2">{latestInsight.title}</h4>
            <div className="flex items-center justify-between text-sm">
              <span>Impact: +${latestInsight.impact}</span>
              <span className="text-green-200">{latestInsight.confidence}% confidence</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Navigation */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm">
          <a href="/ai" className="flex items-center space-x-1 text-purple-100 hover:text-white transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>Chat with AI</span>
          </a>
          <a href="/ai" className="flex items-center space-x-1 text-purple-100 hover:text-white transition-colors">
            <Brain className="w-4 h-4" />
            <span>View All Insights</span>
          </a>
        </div>
        
        <a href="/ai" className="flex items-center space-x-1 text-purple-100 hover:text-white transition-colors">
          <span className="text-sm">AI Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default AISystemHeader;
