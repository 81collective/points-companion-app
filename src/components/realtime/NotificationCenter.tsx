'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, CreditCard, TrendingUp, Award, AlertTriangle, X, Trash2, Settings, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabase } from '@/hooks/useSupabase';
import { createRealtimeChannel } from '@/lib/realtime';

export interface Notification {
  id: string;
  type: 'recommendation' | 'spending' | 'bonus' | 'alert' | 'achievement';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  expiresAt?: string;
}

interface RealtimeEvent {
  eventType: string;
  new: Record<string, unknown>;
  old?: Record<string, unknown>;
  [key: string]: unknown;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  // Derive unread count instead of storing separate state to avoid desync bugs
  const unreadCount = notifications.reduce((c, n) => c + (n.read ? 0 : 1), 0);
  const [_isConnected, setIsConnected] = useState(false);
  const seededRef = useRef(false); // prevent repeated demo seeding
  const unsubscribeRef = useRef<null | (() => void)>(null);
  const { user } = useAuth();
  const { supabase } = useSupabase();

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    setNotifications(prev => [{
      ...notificationData,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      read: false,
      timestamp: new Date().toISOString()
    }, ...prev].slice(0, 100));
  }, []);

  const handleTransactionEvent = useCallback((payload: RealtimeEvent) => {
    if (payload.eventType === 'INSERT' && payload.new) {
      const transaction = payload.new as { amount: number; merchant_name: string };
      addNotification({
        type: 'spending',
        title: 'New Transaction Added',
        message: `$${transaction.amount} spent at ${transaction.merchant_name}`,
        data: { transaction },
        priority: 'medium'
      });
    }
  }, [addNotification]);

  const handleLoyaltyEvent = useCallback((payload: RealtimeEvent) => {
    if (payload.eventType === 'UPDATE' && payload.new) {
      const account = payload.new as { program_name: string; points: number };
      addNotification({
        type: 'bonus',
        title: 'Loyalty Account Updated',
        message: `Points updated for ${account.program_name}`,
        data: { account },
        priority: 'low'
      });
    }
  }, [addNotification]);

  const generateDemoNotifications = useCallback(() => {
    if (!user || seededRef.current) return;
    seededRef.current = true;
    addNotification({
      type: 'recommendation',
      title: 'Optimize Dining Rewards',
      message: 'You could earn more points on dining with the Sapphire Preferred',
      data: {},
      priority: 'medium'
    });
  }, [user, addNotification]);

  const setupRealtimeSubscription = useCallback(() => {
    if (!user || !supabase) return;
    // If already subscribed for this user id, skip
    if ((unsubscribeRef.current as any)?.userId === user.id) return;
    // Clean previous subscription
    if (unsubscribeRef.current) {
      (unsubscribeRef.current as any)();
      unsubscribeRef.current = null;
    }
    const { unsubscribe } = createRealtimeChannel(supabase, {
      name: `user-notifications-${user.id}`,
      postgresChanges: [
        {
          event: '*',
          schema: 'public',
          table: 'user_transactions',
          filter: `user_id=eq.${user.id}`,
          handler: (payload: unknown) => handleTransactionEvent(payload as RealtimeEvent)
        },
        {
          event: '*',
          schema: 'public',
          table: 'loyalty_accounts',
          filter: `user_id=eq.${user.id}`,
          handler: (payload: unknown) => handleLoyaltyEvent(payload as RealtimeEvent)
        }
      ],
      presence: {
        enable: true,
        trackPayload: () => ({ user_id: user.id, online_at: new Date().toISOString() }),
        onSync: () => setIsConnected(true),
        onJoin: () => setIsConnected(true),
        onLeave: () => setIsConnected(false)
      },
      onStatusChange: (status) => { setIsConnected(status === 'SUBSCRIBED'); },
      autoTrackOnSubscribe: true
    });
  // store tagged unsubscribe
  const tagged = () => { unsubscribe(); };
  (tagged as any).userId = user.id;
  unsubscribeRef.current = tagged;
    generateDemoNotifications();
  }, [user, supabase, handleTransactionEvent, handleLoyaltyEvent, generateDemoNotifications]);

  // Load notifications from localStorage on mount & setup realtime
  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
          if (parsed.length > 0) seededRef.current = true;
        }
      }
    } catch { /* ignore */ }
    setupRealtimeSubscription();
    return () => { unsubscribeRef.current?.(); };
  }, [setupRealtimeSubscription]);

  // Persist notifications (debounced via microtask) when list changes
  useEffect(() => {
    Promise.resolve().then(() => {
      try { localStorage.setItem('app_notifications', JSON.stringify(notifications)); } catch { /* ignore */ }
    });
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'recommendation':
        return <CreditCard className="w-5 h-5 text-blue-500" />;
      case 'spending':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'bonus':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'achievement':
        return <CheckCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="relative">
        {/* Notification Bell */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Notifications"
        >
          {unreadCount > 0 ? (
            <BellRing className="w-6 h-6" />
          ) : (
            <Bell className="w-6 h-6" />
          )}
          
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </button>

        {/* Notification Panel */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Panel */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Notifications
                  </h3>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No notifications yet</p>
                      <p className="text-sm">We will notify you about new recommendations and activities</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                            !notification.read ? 'bg-blue-50 border-l-blue-500' : 'bg-white border-l-gray-200'
                          } hover:bg-gray-50 transition-colors cursor-pointer`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className={`text-sm font-medium ${
                                    !notification.read ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {formatTimestamp(notification.timestamp)}
                                  </p>
                                </div>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                    <button
                      onClick={clearAll}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear all</span>
                    </button>
                    
                    <button className="text-sm text-gray-600 hover:text-gray-700 flex items-center space-x-1">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default NotificationCenter;
