'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Users, 
  Wifi, 
  WifiOff, 
  TrendingUp, 
  Bell,
  Eye,
  BarChart3,
  DollarSign,
  CreditCard,
  Award,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';

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

  // Initialize Supabase client for real-time
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const setupRealtimeConnection = useCallback(() => {
    if (!user) return;

    const channel = supabase
      .channel('live-dashboard')
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setActiveUsers(Object.keys(state).length);
        setIsConnected(true);
        setConnectionTime(new Date());
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setActiveUsers(prev => prev + newPresences.length);
        addActivity({
          type: 'login',
          message: `User ${key} joined`,
          timestamp: new Date().toISOString()
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        setActiveUsers(prev => Math.max(0, prev - leftPresences.length));
        addActivity({
          type: 'login',
          message: `User ${key} left`,
          timestamp: new Date().toISOString()
        });
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_transactions'
        },
        (payload: Record<string, unknown>) => {
          handleTransactionUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loyalty_accounts'
        },
        (payload: Record<string, unknown>) => {
          handleLoyaltyUpdate(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setConnectionTime(new Date());
          
          // Track this user's presence
          channel.track({
            user_id: user.id,
            email: user.email,
            online_at: new Date().toISOString()
          });
        } else {
          setIsConnected(false);
          setConnectionTime(null);
        }
      });

    // Simulate some live activity for demo
    simulateLiveActivity();
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      setupRealtimeConnection();
      initializeLiveMetrics();
    }

    return () => {
      supabase.removeAllChannels();
    };
  }, [user, setupRealtimeConnection]);

  const handleTransactionUpdate = (payload: Record<string, unknown>) => {
    if (payload.eventType === 'INSERT') {
      const transaction = payload.new as Record<string, unknown>;
      addActivity({
        type: 'transaction',
        message: `New transaction: $${transaction.amount} at ${transaction.merchant_name}`,
        timestamp: new Date().toISOString()
      });
      
      // Update live metrics
      updateMetric('totalSpending', parseFloat(transaction.amount as string));
    }
  };

  const handleLoyaltyUpdate = (payload: Record<string, unknown>) => {
    if (payload.eventType === 'UPDATE') {
      const account = payload.new as Record<string, unknown>;
      const oldAccount = payload.old as Record<string, unknown>;
      
      if (Number(account.points) > Number(oldAccount.points)) {
        const pointsEarned = Number(account.points) - Number(oldAccount.points);
        addActivity({
          type: 'bonus',
          message: `Earned ${pointsEarned} ${account.program_name} points`,
          timestamp: new Date().toISOString()
        });
        
        updateMetric('totalPoints', pointsEarned);
      }
    }
  };

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

  const initializeLiveMetrics = () => {
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
  };

  const simulateLiveActivity = () => {
    // Add some demo activities
    setTimeout(() => {
      addActivity({
        type: 'recommendation',
        message: 'New card recommendation: Chase Sapphire Preferred for dining',
        timestamp: new Date().toISOString()
      });
    }, 3000);

    setTimeout(() => {
      addActivity({
        type: 'transaction',
        message: 'New transaction: $89.50 at Whole Foods',
        timestamp: new Date().toISOString()
      });
      updateMetric('totalSpending', 89.50);
    }, 6000);

    setTimeout(() => {
      addActivity({
        type: 'bonus',
        message: 'Earned 450 Chase Ultimate Rewards points',
        timestamp: new Date().toISOString()
      });
      updateMetric('totalPoints', 450);
    }, 9000);
  };

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
