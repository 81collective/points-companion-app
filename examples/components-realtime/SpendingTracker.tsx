// Real-time spending tracker
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSupabase } from '../lib/supabaseStub';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle, X, Calendar } from 'lucide-react';

interface SpendingAlert {
  id: string;
  type: 'budget_warning' | 'category_limit' | 'unusual_spending' | 'bonus_progress';
  threshold_amount: number;
  current_amount: number;
  category?: string;
  card_id?: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  created_at: string;
}

interface BudgetProgress {
  category: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  daysRemaining: number;
  trend: 'on_track' | 'behind' | 'ahead' | 'over_budget';
}

export default function RealTimeSpendingTracker() {
  const [alerts, setAlerts] = useState<SpendingAlert[]>([]);
  const [budgetProgress, setBudgetProgress] = useState<BudgetProgress[]>([]);
  const [dailySpending, setDailySpending] = useState(0);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  
  const { supabase } = useSupabase();
  const { executeAsyncSafe, showError, showWarning, showInfo } = useErrorHandler();

  // (moved subscribeToSpending below dependent callbacks for proper declaration order)

  const fetchCurrentSpending = useCallback(async () => {
    if (!supabase) return;

    await executeAsyncSafe(async () => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

      // Fetch daily spending
      const { data: dailyTx } = await supabase
        .from('transactions')
        .select('amount')
        .gte('date', startOfDay);

      const dailyTotal = dailyTx?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      setDailySpending(dailyTotal);

      // Fetch monthly spending
      const { data: monthlyTx } = await supabase
        .from('transactions')
        .select('amount')
        .gte('date', startOfMonth);

      const monthlyTotal = monthlyTx?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      setMonthlySpending(monthlyTotal);
    });
  }, [supabase, executeAsyncSafe]);

  const fetchBudgetProgress = useCallback(async () => {
    if (!supabase) return;

    await executeAsyncSafe(async () => {
      // Get user budgets
      const { data: budgets } = await supabase
        .from('user_budgets')
        .select('*')
        .eq('month', new Date().getMonth() + 1)
        .eq('year', new Date().getFullYear());

      if (!budgets || budgets.length === 0) return;

      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      
      // Get spending by category for current month
      const { data: categorySpending } = await supabase
        .from('transactions')
        .select('category, amount')
        .gte('date', startOfMonth);

      if (!categorySpending) return;

      // Calculate progress for each budget
      const progress = budgets.map(budget => {
        const spent = categorySpending
          .filter(tx => tx.category === budget.category)
          .reduce((sum, tx) => sum + tx.amount, 0);

        const remaining = budget.amount - spent;
        const percentage = (spent / budget.amount) * 100;
        
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const daysRemaining = daysInMonth - today.getDate();
        
        let trend: BudgetProgress['trend'] = 'on_track';
        const expectedSpending = (budget.amount / daysInMonth) * today.getDate();
        
        if (spent > budget.amount) {
          trend = 'over_budget';
        } else if (spent > expectedSpending * 1.1) {
          trend = 'ahead';
        } else if (spent < expectedSpending * 0.9) {
          trend = 'behind';
        }

        return {
          category: budget.category,
          budgetAmount: budget.amount,
          spentAmount: spent,
          remainingAmount: remaining,
          percentage: Math.min(percentage, 100),
          daysRemaining,
          trend
        };
      });

      setBudgetProgress(progress);
    });
  }, [supabase, executeAsyncSafe]);

  const fetchSpendingAlerts = useCallback(async () => {
    if (!supabase) return;

    await executeAsyncSafe(async () => {
      const { data: alertsData } = await supabase
        .from('spending_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (alertsData) {
        setAlerts(alertsData);
      }
    });
  }, [supabase, executeAsyncSafe]);

  const handleNewTransaction = useCallback((transaction: {
    id: string;
    amount: number;
    date: string;
    category: string;
    card_id: string;
  }) => {
    // Update daily/monthly spending
    const today = new Date().toDateString();
    const txDate = new Date(transaction.date).toDateString();
    
    if (txDate === today) {
      setDailySpending(prev => prev + transaction.amount);
    }
    
    setMonthlySpending(prev => prev + transaction.amount);
    
    // Re-fetch budget progress to get updated calculations
    fetchBudgetProgress();
  }, [fetchBudgetProgress]);

  const dismissAlert = useCallback(async (alertId: string) => {
    if (!supabase) return;

    await executeAsyncSafe(async () => {
      await supabase
        .from('spending_alerts')
        .delete()
        .eq('id', alertId);

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    });
  }, [supabase, executeAsyncSafe]);

  // Subscribe to real-time spending updates (after dependencies defined)
  const subscribeToSpending = useCallback(async () => {
    if (!supabase) return;

    try {
      setIsTracking(true);

      // Initial data fetch
      await fetchCurrentSpending();
      await fetchBudgetProgress();
      await fetchSpendingAlerts();

      // Set up real-time subscription for transactions
      const transactionChannel = supabase
        .channel('spending_tracker')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions'
          },
          (payload) => {
            console.log('New transaction detected:', payload);
            handleNewTransaction(payload.new as {
              id: string;
              amount: number;
              date: string;
              category: string;
              card_id: string;
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'spending_alerts'
          },
          (payload) => {
            console.log('New spending alert:', payload);
            const newAlert = payload.new as SpendingAlert;
            setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
            
            // Show user notification based on severity
            if (newAlert.severity === 'critical') {
              showError(newAlert.message);
            } else if (newAlert.severity === 'warning') {
              showWarning(newAlert.message);
            } else {
              showInfo(newAlert.message);
            }
          }
        )
        .subscribe((status) => {
          setIsTracking(status === 'SUBSCRIBED');
        });

      return () => { supabase.removeChannel(transactionChannel); };
    } catch (error) {
      console.error('Error setting up spending tracker:', error);
      showError('Failed to connect to real-time spending tracker');
      setIsTracking(false);
    }
  }, [supabase, showError, showWarning, showInfo, fetchCurrentSpending, fetchBudgetProgress, fetchSpendingAlerts, handleNewTransaction]);

  useEffect(() => {
    const unsubscribe = subscribeToSpending();
    return () => { unsubscribe?.then(cleanup => cleanup?.()); };
  }, [subscribeToSpending]);

  const getTrendColor = (trend: BudgetProgress['trend']) => {
    switch (trend) {
      case 'on_track': return 'text-green-600';
      case 'behind': return 'text-blue-600';
      case 'ahead': return 'text-yellow-600';
      case 'over_budget': return 'text-red-600';
    }
  };

  const getTrendIcon = (trend: BudgetProgress['trend']) => {
    switch (trend) {
      case 'on_track': return CheckCircle;
      case 'behind': return TrendingDown;
      case 'ahead': return TrendingUp;
      case 'over_budget': return AlertCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Real-Time Spending</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isTracking ? 'Live Tracking' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Daily & Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              ${dailySpending.toLocaleString()}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Today&apos;s Spending</h3>
          <p className="text-xs text-gray-500 mt-1">
            Updated in real-time
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              ${monthlySpending.toLocaleString()}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Monthly Spending</h3>
          <p className="text-xs text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </motion.div>
      </div>

      {/* Budget Progress */}
      {budgetProgress.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h3>
          <div className="space-y-4">
            {budgetProgress.map((budget, index) => {
              const TrendIcon = getTrendIcon(budget.trend);
              return (
                <motion.div
                  key={budget.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{budget.category}</span>
                      <TrendIcon className={`w-4 h-4 ${getTrendColor(budget.trend)}`} />
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">
                        ${budget.spentAmount.toLocaleString()} / ${budget.budgetAmount.toLocaleString()}
                      </span>
                      <div className="text-xs text-gray-500">
                        {budget.daysRemaining} days left
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        budget.percentage > 100 ? 'bg-red-500' :
                        budget.percentage > 80 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                  {budget.remainingAmount < 0 && (
                    <p className="text-xs text-red-600">
                      Over budget by ${Math.abs(budget.remainingAmount).toLocaleString()}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border-l-4 ${
                  alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
                  alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
