'use client';

import { useEffect, useCallback } from 'react';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityAction } from '@/types/gamification';

export const useGamification = () => {
  const { user } = useAuth();
  const { initializeUser, logActivity, addPoints } = useGamificationStore();

  // Initialize gamification when user logs in
  useEffect(() => {
    if (user?.id) {
      initializeUser(user.id);
    }
  }, [user?.id, initializeUser]);

  // Activity tracking functions
  const trackActivity = useCallback(async (action: ActivityAction, metadata?: Record<string, unknown>) => {
    if (user?.id) {
      await logActivity(action, metadata);
    }
  }, [user?.id, logActivity]);

  const trackCardAdded = useCallback(async (cardName?: string) => {
    await trackActivity(ActivityAction.ADD_CARD, { cardName });
  }, [trackActivity]);

  const trackOptimalUsage = useCallback(async (amount?: number, merchant?: string) => {
    await trackActivity(ActivityAction.OPTIMAL_USAGE, { amount, merchant });
  }, [trackActivity]);

  const trackBonusCompleted = useCallback(async (bonusValue?: number, cardName?: string) => {
    await trackActivity(ActivityAction.COMPLETE_BONUS, { bonusValue, cardName });
  }, [trackActivity]);

  const trackMoneySaved = useCallback(async (amount: number, context?: string) => {
    await trackActivity(ActivityAction.SAVE_MONEY, { amount, context });
  }, [trackActivity]);

  const trackTransactionAdded = useCallback(async (amount?: number, category?: string) => {
    await trackActivity(ActivityAction.ADD_TRANSACTION, { amount, category });
  }, [trackActivity]);

  const trackAnalyticsViewed = useCallback(async (page?: string) => {
    await trackActivity(ActivityAction.VIEW_ANALYTICS, { page });
  }, [trackActivity]);

  const trackAIAssistantUsed = useCallback(async (query?: string, type?: string) => {
    await trackActivity(ActivityAction.USE_AI_ASSISTANT, { query, type });
  }, [trackActivity]);

  const trackProfileCompleted = useCallback(async () => {
    await trackActivity(ActivityAction.COMPLETE_PROFILE);
  }, [trackActivity]);

  const trackAchievementShared = useCallback(async (achievementId?: string) => {
    await trackActivity(ActivityAction.SHARE_ACHIEVEMENT, { achievementId });
  }, [trackActivity]);

  const awardPoints = useCallback(async (points: number, reason: string) => {
    if (user?.id) {
      await addPoints(points, reason);
    }
  }, [user?.id, addPoints]);

  return {
    trackActivity,
    trackCardAdded,
    trackOptimalUsage,
    trackBonusCompleted,
    trackMoneySaved,
    trackTransactionAdded,
    trackAnalyticsViewed,
    trackAIAssistantUsed,
    trackProfileCompleted,
    trackAchievementShared,
    awardPoints
  };
};

// Hook for automatic daily login tracking
export const useGamificationAutoTracker = () => {
  const { user } = useAuth();
  const { logActivity } = useGamificationStore();

  useEffect(() => {
    const trackDailyLogin = async () => {
      if (user?.id) {
        // Check if already logged activity today
        const today = new Date().toDateString();
        const lastLogin = localStorage.getItem('lastGamificationLogin');
        
        if (lastLogin !== today) {
          await logActivity(ActivityAction.DAILY_LOGIN);
          localStorage.setItem('lastGamificationLogin', today);
        }
      }
    };

    // Track on mount (page load)
    trackDailyLogin();

    // Track on visibility change (returning to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        trackDailyLogin();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.id, logActivity]);
};

export default useGamification;
