// SmartNotifications.tsx - Intelligent notification system
'use client';

import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import {
  Bell,
  X,
  CreditCard,
  TrendingUp,
  Gift,
  Calendar,
  Target,
  Zap,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  date: string;
  category: string;
  card_id: string;
}

interface CreditCard {
  id: string;
  name: string;
}

interface SmartNotification {
  id: string;
  type: 'card_recommendation' | 'spending_alert' | 'bonus_opportunity' | 'payment_reminder' | 'achievement' | 'tip';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  timestamp: Date;
  read: boolean;
  dismissible: boolean;
  category?: string;
  amount?: number;
  cardName?: string;
  deadline?: Date;
}

export default function SmartNotifications() {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const { supabase } = useSupabase();

  const generateSmartNotifications = React.useCallback(async () => {
    try {
      // Fetch recent data for notifications
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(50);

      const { data: cards } = await supabase
        .from('credit_cards')
        .select('*');

      if (transactions && cards) {
        const smartNotifications = await analyzeAndGenerateNotifications(transactions);
        setNotifications(smartNotifications);
      }
    } catch (error) {
      console.error('Error generating notifications:', error);
    }
  }, [supabase]);

  useEffect(() => {
    generateSmartNotifications();
    // Set up real-time notifications
    const interval = setInterval(generateSmartNotifications, 300000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [generateSmartNotifications]);

  const analyzeAndGenerateNotifications = async (transactions: Transaction[]): Promise<SmartNotification[]> => {
    const notifications: SmartNotification[] = [];

    // 1. Card Recommendation Notifications
    const recentDining = transactions.filter(tx => 
      tx.category === 'dining' && 
      new Date(tx.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    if (recentDining.length >= 3) {
      notifications.push({
        id: 'dining-rec-' + Date.now(),
        type: 'card_recommendation',
        priority: 'medium',
        title: 'Optimize Your Dining Rewards',
        message: `You've made ${recentDining.length} dining purchases this week. Consider optimizing your card selection for dining rewards.`,
        actionText: 'View Best Cards',
        actionUrl: '/dashboard/cards',
        timestamp: new Date(),
        read: false,
        dismissible: true,
        category: 'dining'
      });
    }

    // 2. Spending Alert Notifications
    const thisMonthSpending = transactions
      .filter(tx => new Date(tx.date).getMonth() === new Date().getMonth())
      .reduce((sum, tx) => sum + tx.amount, 0);

    if (thisMonthSpending > 2000) {
      notifications.push({
        id: 'spending-alert-' + Date.now(),
        type: 'spending_alert',
        priority: 'high',
        title: 'High Spending This Month',
        message: `You've spent $${thisMonthSpending.toFixed(2)} this month. You're on track to earn bonus points if you reach $3,000.`,
        actionText: 'View Spending',
        actionUrl: '/dashboard/insights',
        timestamp: new Date(),
        read: false,
        dismissible: true,
        amount: thisMonthSpending
      });
    }

    // 3. Bonus Opportunity Notifications - only show seasonal/relevant ones
    const currentDate = new Date();
    const isHolidaySeason = currentDate.getMonth() >= 10; // Nov-Dec
    
    if (isHolidaySeason) {
      notifications.push({
        id: 'bonus-holiday-' + Date.now(),
        type: 'bonus_opportunity',
        priority: 'high',
        title: 'Holiday Shopping Season',
        message: 'Many credit cards offer bonus categories for online shopping during the holiday season. Check your card benefits!',
        actionText: 'View Cards',
        actionUrl: '/dashboard/cards',
        timestamp: new Date(),
        read: false,
        dismissible: true,
        deadline: new Date(currentDate.getFullYear(), 11, 31) // End of year
      });
    }

    // 4. Achievement Notifications - only show if user has actual achievements
    if (transactions.length > 50) {
      const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
      if (totalSpent > 5000) {
        notifications.push({
          id: 'achievement-spending-' + Date.now(),
          type: 'achievement',
          priority: 'medium',
          title: 'Spending Milestone Achieved! 🎉',
          message: `You've reached $${Math.round(totalSpent).toLocaleString()} in total spending. You're building great financial data!`,
          timestamp: new Date(),
          read: false,
          dismissible: true
        });
      }
    }

    // 5. Smart Tips
    notifications.push({
      id: 'tip-autopay-' + Date.now(),
      type: 'tip',
      priority: 'low',
      title: 'Pro Tip: Automate Your Payments',
      message: 'Set up autopay for all your credit cards to never miss a payment and maintain your excellent credit score.',
      actionText: 'Set Up Autopay',
      timestamp: new Date(),
      read: false,
      dismissible: true
    });

    // 6. Payment Reminders - remove mock payment reminder for now
    // Real payment reminders would be based on actual card due dates from bank integrations

    return notifications.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const getIcon = (type: SmartNotification['type']) => {
    switch (type) {
      case 'card_recommendation':
        return <CreditCard className="h-5 w-5" />;
      case 'spending_alert':
        return <TrendingUp className="h-5 w-5" />;
      case 'bonus_opportunity':
        return <Gift className="h-5 w-5" />;
      case 'payment_reminder':
        return <Calendar className="h-5 w-5" />;
      case 'achievement':
        return <Target className="h-5 w-5" />;
      case 'tip':
        return <Zap className="h-5 w-5" />;
    }
  };

  const getColors = (type: SmartNotification['type'], priority: SmartNotification['priority']) => {
    if (priority === 'urgent') {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    
    switch (type) {
      case 'card_recommendation':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'spending_alert':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'bonus_opportunity':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'payment_reminder':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'achievement':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'tip':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'high') return notif.priority === 'high' || notif.priority === 'urgent';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Smart Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex space-x-2 mt-3">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'high', label: 'Priority' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as 'all' | 'unread' | 'high')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === tab.key
                      ? 'bg-rose-100 text-rose-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                  {tab.key === 'unread' && unreadCount > 0 && (
                    <span className="ml-1 text-xs">({unreadCount})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>All caught up!</p>
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-25' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getColors(notification.type, notification.priority)}`}>
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {notification.priority === 'urgent' && (
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                          {notification.dismissible && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(notification.id);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {notification.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                          {notification.deadline && (
                            <span className="ml-2 text-red-500">
                              Due: {notification.deadline.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        
                        {notification.actionText && (
                          <button className="text-xs text-rose-600 hover:text-rose-800 font-medium">
                            {notification.actionText}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                }}
                className="w-full text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
