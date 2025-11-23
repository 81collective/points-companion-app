'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Users, 
  Wifi, 
  WifiOff, 
  TrendingUp, 
  DollarSign,
  CreditCard,
  Award,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
interface ApiTransaction {
  id: string;
  amount: number;
  date: string;
  merchantName?: string;
  merchant?: string;
  category?: string;
  cardId?: string | null;
  card?: { id: string } | null;
  pointsEarned?: number | null;
}

interface ApiRecommendation {
  id: string;
  recommendedCard?: string;
  cardName?: string;
  createdAt?: string;
}

interface NormalizedTransaction {
  amount: number;
  merchantName: string;
  date: string;
  pointsEarned: number;
  cardId: string | null;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

interface LiveMetric {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

interface LiveActivity {
  id: string;
  type: 'transaction' | 'recommendation' | 'bonus' | 'login';
  message: string;
  timestamp: string;
  user?: string;
}

const LiveDashboard: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetric[]>([]);
  const [recentActivity, setRecentActivity] = useState<LiveActivity[]>([]);
  const [connectionTime, setConnectionTime] = useState<Date | null>(null);
  const { user } = useAuth();

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const simulateLiveActivity = useCallback(() => {
    setTimeout(() => { addActivity({ type: 'recommendation', message: 'New card recommendation: Chase Sapphire Preferred for dining', timestamp: new Date().toISOString() }); }, 3000);
    setTimeout(() => { addActivity({ type: 'transaction', message: 'New transaction: $89.50 at Whole Foods', timestamp: new Date().toISOString() }); updateMetric('totalSpending', 89.50); }, 6000);
    setTimeout(() => { addActivity({ type: 'bonus', message: 'Earned 450 Chase Ultimate Rewards points', timestamp: new Date().toISOString() }); updateMetric('totalPoints', 450); }, 9000);
  }, []);

  const fetchLiveData = useCallback(async () => {
    try {
      const [transactionsResult, recommendationsResult] = await Promise.all([
        fetchJson<{ transactions?: ApiTransaction[] }>('/api/transactions'),
        fetchJson<{ recommendations?: ApiRecommendation[] }>('/api/recommendations?limit=50')
      ]);

      const transactions: NormalizedTransaction[] = (transactionsResult?.transactions || []).map((tx: ApiTransaction) => ({
        amount: Number(tx.amount || 0),
        merchantName: tx.merchantName || tx.merchant || 'Unknown merchant',
        date: tx.date,
        pointsEarned: Number(tx.pointsEarned || 0),
        cardId: tx.cardId || tx.card?.id || null
      }));

      const recommendations: ApiRecommendation[] = recommendationsResult?.recommendations || [];

      const totalSpendingValue = transactions.reduce((sum: number, tx: NormalizedTransaction) => sum + tx.amount, 0);
      const totalPoints = transactions.reduce((sum: number, tx: NormalizedTransaction) => sum + tx.pointsEarned, 0);
      const activeCards = new Set(transactions.map((tx: NormalizedTransaction) => tx.cardId).filter(Boolean)).size;

      setLiveMetrics(current => current.map(metric => {
        switch (metric.id) {
          case 'totalSpending':
            return { ...metric, value: totalSpendingValue, change: metric.value ? ((totalSpendingValue - Number(metric.value)) / Math.max(Number(metric.value), 1)) * 100 : 0, trend: totalSpendingValue >= Number(metric.value) ? 'up' : 'down' };
          case 'totalPoints':
            return { ...metric, value: totalPoints, change: metric.value ? ((totalPoints - Number(metric.value)) / Math.max(Number(metric.value), 1)) * 100 : 0, trend: totalPoints >= Number(metric.value) ? 'up' : 'down' };
          case 'activeCards':
            return { ...metric, value: activeCards };
          case 'recommendations':
            return { ...metric, value: recommendations.length };
          default:
            return metric;
        }
      }));

      const latestTransactions = transactions.slice(0, 5).map((tx: NormalizedTransaction) => ({
        type: 'transaction' as const,
        message: `New transaction: $${tx.amount.toFixed(2)} at ${tx.merchantName}`,
        timestamp: tx.date
      }));

      const latestRecommendations = recommendations.slice(0, 5).map((rec) => ({
        type: 'recommendation' as const,
        message: `Recommended ${rec.recommendedCard || rec.cardName || 'a card'} for recent spend`,
        timestamp: rec.createdAt || new Date().toISOString()
      }));

      setRecentActivity(prev => {
        const combined = [...latestTransactions, ...latestRecommendations].map(activity => ({
          ...activity,
          id: `${activity.type}_${activity.timestamp}_${Math.random().toString(36).slice(2)}`
        }));
        return [...combined, ...prev].slice(0, 20);
      });

      setActiveUsers(Math.max(1, Math.min(25, Math.round(transactions.length / 3) + Math.floor(Math.random() * 3))));
      setIsConnected(true);
      setConnectionTime(prev => prev ?? new Date());
    } catch (error) {
      console.error('Failed to load live data', error);
      setIsConnected(false);
    }
  }, []);

  const startLiveUpdates = useCallback(() => {
    if (!user) return;
    fetchLiveData();
    simulateLiveActivity();
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    const interval = setInterval(() => {
      fetchLiveData();
      simulateLiveActivity();
    }, 15000);
    pollingRef.current = interval;
    setIsConnected(true);
    setConnectionTime(new Date());
  }, [user, fetchLiveData, simulateLiveActivity]);

  const initializeLiveMetrics = useCallback(() => {
    setLiveMetrics([
      {
        id: 'totalSpending',
        label: 'Total Spending',
        value: 2847.50,
        change: 5.2,
        trend: 'up',
        icon: <DollarSign className="w-5 h-5" />,
        color: 'text-green-600'
      },
      {
        id: 'activeCards',
        label: 'Active Cards',
        value: 8,
        change: 0,
        trend: 'stable',
        icon: <CreditCard className="w-5 h-5" />,
        color: 'text-blue-600'
      },
      {
        id: 'totalPoints',
        label: 'Points Earned',
        value: 45820,
        change: 12.8,
        trend: 'up',
        icon: <Award className="w-5 h-5" />,
        color: 'text-purple-600'
      },
      {
        id: 'recommendations',
        label: 'Active Recommendations',
        value: 3,
        change: -10,
        trend: 'down',
        icon: <Zap className="w-5 h-5" />,
        color: 'text-orange-600'
      }
    ]);
  }, []);

  useEffect(() => {
    if (user) {
      initializeLiveMetrics();
      startLiveUpdates();
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [user, startLiveUpdates, initializeLiveMetrics]);

  const addActivity = (activity: Omit<LiveActivity, 'id'>) => {
    const newActivity: LiveActivity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    setRecentActivity(prev => [newActivity, ...prev].slice(0, 20));
  };

  const updateMetric = (metricType: string, value: number) => {
    setLiveMetrics(prev => prev.map(metric => {
      if (metric.id === metricType) {
        const newValue = typeof metric.value === 'number' ? metric.value + value : value;
        const change = typeof metric.value === 'number' ? 
          ((newValue - metric.value) / metric.value) * 100 : 0;
        
        return {
          ...metric,
          value: newValue,
          change,
          trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
        };
      }
      return metric;
    }));
  };

  // moved initializeLiveMetrics above and wrapped with useCallback

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getActivityIcon = (type: LiveActivity['type']) => {
    switch (type) {
      case 'transaction':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'recommendation':
        return <Zap className="w-4 h-4 text-orange-500" />;
      case 'bonus':
        return <Award className="w-4 h-4 text-purple-500" />;
      case 'login':
        return <Users className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const connectionDuration = connectionTime ? 
    Math.floor((new Date().getTime() - connectionTime.getTime()) / 1000) : 0;

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <>
                <div className="flex items-center space-x-2">
                  <Wifi className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-700">Connected</span>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-700">Disconnected</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{activeUsers} active</span>
            </div>
            {connectionTime && (
              <div className="flex items-center space-x-1">
                <Activity className="w-4 h-4" />
                <span>{connectionDuration}s connected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {liveMetrics.map((metric) => (
          <motion.div
            key={metric.id}
            className="bg-white rounded-lg border border-gray-200 p-4"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`${metric.color}`}>
                {metric.icon}
              </div>
              {metric.change !== undefined && (
                <div className={`flex items-center text-xs ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  <TrendingUp className={`w-3 h-3 mr-1 ${
                    metric.trend === 'down' ? 'rotate-180' : ''
                  }`} />
                  {Math.abs(metric.change).toFixed(1)}%
                </div>
              )}
            </div>
            
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {typeof metric.value === 'number' && metric.id === 'totalSpending' ? 
                  `$${metric.value.toLocaleString()}` : 
                  metric.value.toLocaleString()
                }
              </p>
              <p className="text-sm text-gray-600">{metric.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Live Activity</h3>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No recent activity</p>
              <p className="text-sm">Activity will appear here in real-time</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard;
