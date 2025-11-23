// Real-time notifications system using Supabase
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabase } from '../lib/supabaseStub';
import { startDemoRealtime, getDemoNotifications, getDemoMetrics } from '../lib/demoRealtime';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import {
  Bell,
  X,
  CreditCard,
  TrendingUp,
  Gift,
  AlertTriangle,
  Info,
  Star
} from 'lucide-react';

interface RealTimeNotification {
  id: string;
  type: 'spending_alert' | 'bonus_opportunity' | 'card_recommendation' | 'reward_milestone' | 'system_update';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  created_at: string;
  expires_at?: string;
  action_url?: string;
  action_text?: string;
  metadata?: Record<string, unknown>;
}

interface LiveMetric {
  id: string;
  metric_name: string;
  current_value: number;
  previous_value: number;
  change_percentage: number;
  last_updated: string;
  target_value?: number;
}

const NOTIFICATION_ICONS = {
  spending_alert: AlertTriangle,
  bonus_opportunity: Gift,
  card_recommendation: CreditCard,
  reward_milestone: Star,
  system_update: Info
};

const PRIORITY_COLORS = {
  low: 'bg-blue-50 border-blue-200 text-blue-800',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  high: 'bg-orange-50 border-orange-200 text-orange-800',
  urgent: 'bg-red-50 border-red-200 text-red-800'
};

export default function RealTimeSystem() {
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetric[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { supabase } = useSupabase();
  const { executeAsyncSafe, showError } = useErrorHandler();

  // Subscribe to real-time notifications
  const subscribeToNotifications = useCallback(async () => {
    if (!supabase) return;

    try {
      // Initial fetch
      const { data: initialNotifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (initialNotifications) {
        setNotifications(initialNotifications);
      }

      // Set up real-time subscription
      const notificationChannel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications'
          },
          (payload) => {
            console.log('Real-time notification:', payload);
            
            if (payload.eventType === 'INSERT') {
              const newNotification = payload.new as RealTimeNotification;
              setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
              
              // Show browser notification if permission granted
              if (Notification.permission === 'granted') {
                new Notification(newNotification.title, {
                  body: newNotification.message,
                  icon: '/favicon.ico'
                });
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedNotification = payload.new as RealTimeNotification;
              setNotifications(prev =>
                prev.map(notif =>
                  notif.id === updatedNotification.id ? updatedNotification : notif
                )
              );
            } else if (payload.eventType === 'DELETE') {
              setNotifications(prev =>
                prev.filter(notif => notif.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
        });

      return () => {
        supabase.removeChannel(notificationChannel);
      };
    } catch (error) {
      console.error('Error setting up notifications subscription:', error);
      showError('Failed to connect to real-time notifications');
    }
  }, [supabase, showError]);

  // Subscribe to live metrics
  const subscribeToMetrics = useCallback(async () => {
    if (!supabase) return;

    try {
      // Initial fetch
      const { data: initialMetrics } = await supabase
        .from('live_metrics')
        .select('*')
        .order('last_updated', { ascending: false });

      if (initialMetrics) {
        setLiveMetrics(initialMetrics);
      }

      // Set up real-time subscription
      const metricsChannel = supabase
        .channel('live_metrics')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'live_metrics'
          },
          (payload) => {
            console.log('Real-time metric update:', payload);
            
            if (payload.eventType === 'UPDATE') {
              const updatedMetric = payload.new as LiveMetric;
              setLiveMetrics(prev =>
                prev.map(metric =>
                  metric.id === updatedMetric.id ? updatedMetric : metric
                )
              );
            } else if (payload.eventType === 'INSERT') {
              const newMetric = payload.new as LiveMetric;
              setLiveMetrics(prev => [...prev, newMetric]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(metricsChannel);
      };
    } catch (error) {
      console.error('Error setting up metrics subscription:', error);
    }
  }, [supabase]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!supabase) return;

    await executeAsyncSafe(async () => {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
    });
  }, [supabase, executeAsyncSafe]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!supabase) return;

    await executeAsyncSafe(async () => {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);
      
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    });
  }, [supabase, executeAsyncSafe]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!supabase) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      return;
    }

    await executeAsyncSafe(async () => {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    });
  }, [supabase, executeAsyncSafe]);

  const addNotification = useCallback((notification: RealTimeNotification) => {
    setNotifications(prev => {
      const deduped = prev.filter(n => n.id !== notification.id);
      return [notification, ...deduped].slice(0, 25);
    });
  }, []);

  const pushNotification = useCallback((partial: Partial<RealTimeNotification> & Pick<RealTimeNotification, 'type' | 'title' | 'message' | 'priority'>) => {
    addNotification({
      id: partial.id ?? `demo_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      read: partial.read ?? false,
      created_at: partial.created_at ?? new Date().toISOString(),
      ...partial,
    } as RealTimeNotification);
  }, [addNotification]);

  useEffect(() => {
    requestNotificationPermission();

    if (!supabase) {
      setNotifications(getDemoNotifications());
      setLiveMetrics(getDemoMetrics());
      setIsConnected(true);
      const stopDemo = startDemoRealtime({
        onTransaction: (tx) => {
          pushNotification({
            type: 'spending_alert',
            title: 'Demo transaction',
            message: `$${tx.amount.toFixed(2)} at ${tx.merchant_name}`,
            priority: 'medium'
          });
        },
        onNotification: (notification) => {
          pushNotification({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            read: notification.read,
            created_at: notification.created_at
          });
        }
      });
      return () => stopDemo?.();
    }

    const unsubscribeNotifications = subscribeToNotifications();
    const unsubscribeMetrics = subscribeToMetrics();

    return () => {
      unsubscribeNotifications?.then(cleanup => cleanup?.());
      unsubscribeMetrics?.then(cleanup => cleanup?.());
    };
  }, [supabase, subscribeToNotifications, subscribeToMetrics, requestNotificationPermission, pushNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`relative p-2 rounded-lg transition-colors ${
            unreadCount > 0 
              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Bell className="w-5 h-5" />
          
          {/* Connection status indicator */}
          <div className={`absolute -top-1 -left-1 w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          
          {/* Unread count badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </button>

        {/* Notifications Dropdown */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-xs text-gray-500">
                    {isConnected ? 'Live' : 'Disconnected'}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => {
                    const Icon = NOTIFICATION_ICONS[notification.type] || Info;
                    const priorityClass = PRIORITY_COLORS[notification.priority];
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${priorityClass}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </h4>
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <p className="text-sm text-gray-700 mt-1">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {new Date(notification.created_at).toLocaleTimeString()}
                              </span>
                              
                              {notification.action_url && (
                                <button
                                  onClick={() => {
                                    markAsRead(notification.id);
                                    // Navigate to action URL
                                    window.location.href = notification.action_url!;
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  {notification.action_text || 'View'}
                                </button>
                              )}
                              
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No notifications</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live Metrics Widget (optional overlay) */}
      {liveMetrics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-40 max-w-sm"
        >
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
            Live Metrics
          </h4>
          
          <div className="space-y-2">
            {liveMetrics.slice(0, 3).map((metric) => (
              <div key={metric.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{metric.metric_name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {metric.current_value.toLocaleString()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    metric.change_percentage > 0 
                      ? 'bg-green-100 text-green-700' 
                      : metric.change_percentage < 0
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {metric.change_percentage > 0 ? '+' : ''}{metric.change_percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
}
