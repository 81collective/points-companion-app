// SmartNotifications.tsx - Intelligent notification system (inline tips)
'use client';

import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { CreditCard, TrendingUp, Gift, Calendar, Target, Zap, Clock, X, ExternalLink } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  date: string;
  category: string;
  card_id: string;
}

// Removed unused CreditCardRec interface

export type SmartNotification = {
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

export default function SmartNotifications({ max = 3, types = ['tip', 'card_recommendation', 'bonus_opportunity', 'achievement'] as SmartNotification['type'][], className = '' }: { max?: number; types?: SmartNotification['type'][]; className?: string }) {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const { supabase } = useSupabase();

  const generateSmartNotifications = React.useCallback(async () => {
    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(50);

      // Cards fetched for future recommendation context if needed
      await supabase.from('credit_cards').select('id, name').limit(1);

      if (transactions) {
        const smartNotifications = await analyzeAndGenerateNotifications(transactions);
        setNotifications(smartNotifications);
      }
    } catch (error) {
      console.error('Error generating notifications:', error);
    }
  }, [supabase]);

  useEffect(() => {
    generateSmartNotifications();
    const interval = setInterval(generateSmartNotifications, 300000);
    return () => clearInterval(interval);
  }, [generateSmartNotifications]);

  const analyzeAndGenerateNotifications = async (transactions: Transaction[]): Promise<SmartNotification[]> => {
    const out: SmartNotification[] = [];

    // Tip: Autopay
    out.push({
      id: 'tip-autopay-' + Date.now(),
      type: 'tip',
      priority: 'low',
      title: 'Automate your payments',
      message: 'Set up autopay to avoid missed payments and protect your score.',
      actionText: 'Learn more',
      actionUrl: '/help/payments',
      timestamp: new Date(),
      read: false,
      dismissible: true,
    });

    // Spending alert as insight chip if high
    const thisMonthSpending = transactions
      .filter(tx => new Date(tx.date).getMonth() === new Date().getMonth())
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    if (thisMonthSpending > 2000) {
      out.push({
        id: 'spending-alert-' + Date.now(),
        type: 'spending_alert',
        priority: 'high',
        title: 'High spending this month',
        message: `Spent $${Math.round(thisMonthSpending).toLocaleString()} so far. Check category bonuses.`,
        actionText: 'View insights',
        actionUrl: '/dashboard/insights',
        timestamp: new Date(),
        read: false,
        dismissible: true,
        amount: thisMonthSpending,
      });
    }

    // Card recommendation hint when recent dining activity
    const recentDining = transactions.filter(tx => tx.category === 'dining' && new Date(tx.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    if (recentDining.length >= 3) {
      out.push({
        id: 'dining-rec-' + Date.now(),
        type: 'card_recommendation',
        priority: 'medium',
        title: 'Optimize dining rewards',
        message: `You made ${recentDining.length} dining purchases this week. Consider a dining bonus card.`,
        actionText: 'See cards',
        actionUrl: '/dashboard/cards',
        timestamp: new Date(),
        read: false,
        dismissible: true,
        category: 'dining',
      });
    }

    return out.sort((a, b) => {
      const order = { urgent: 4, high: 3, medium: 2, low: 1 } as const;
      return order[b.priority] - order[a.priority];
    });
  };

  const iconFor = (type: SmartNotification['type']) => {
    switch (type) {
      case 'card_recommendation':
        return <CreditCard className="h-4 w-4" />;
      case 'spending_alert':
        return <TrendingUp className="h-4 w-4" />;
      case 'bonus_opportunity':
        return <Gift className="h-4 w-4" />;
      case 'payment_reminder':
        return <Calendar className="h-4 w-4" />;
      case 'achievement':
        return <Target className="h-4 w-4" />;
      case 'tip':
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const colorFor = (priority: SmartNotification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'high':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'medium':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'low':
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const filtered = notifications.filter(n => types.includes(n.type) && !dismissed[n.id]).slice(0, max);
  if (filtered.length === 0) return null;

  return (
    <div className={`w-full ${className}`} aria-label="Smart tips">
      <div className="flex flex-col gap-2">
        {filtered.map(n => (
          <div key={n.id} className={`flex items-start gap-3 rounded-xl border p-3 ${colorFor(n.priority)}`}>
            <div className="mt-0.5">{iconFor(n.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-sm text-gray-600">{n.message}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {n.actionText && n.actionUrl && (
                  <a href={n.actionUrl} className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium">
                    {n.actionText} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
            {n.dismissible && (
              <button aria-label="Dismiss tip" className="text-gray-400 hover:text-gray-600" onClick={() => setDismissed(prev => ({ ...prev, [n.id]: true }))}>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
