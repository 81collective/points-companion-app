import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  GamificationUser,
  Achievement,
  UserAchievement,
  ActivityLog,
  ProgressGoal,
  LeaderboardEntry,
  ActivityAction,
  ActivityCategory,
  AchievementCategory,
  LEVEL_SYSTEM,
  ACHIEVEMENT_TEMPLATES,
  POINTS_CONFIG
} from '@/types/gamification';

interface GamificationStore {
  // User State
  user: GamificationUser | null;
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  activityLog: ActivityLog[];
  goals: ProgressGoal[];
  leaderboard: LeaderboardEntry[];
  
  // UI State
  showAchievementToast: boolean;
  pendingAchievements: UserAchievement[];
  isLoading: boolean;
  lastUpdated: string | null;

  // Actions
  initializeUser: (userId: string) => Promise<void>;
  logActivity: (action: ActivityAction, metadata?: Record<string, unknown>) => Promise<void>;
  checkAchievements: () => Promise<void>;
  updateStreak: () => Promise<void>;
  addPoints: (points: number, reason: string) => Promise<void>;
  completeGoal: (goalId: string) => Promise<void>;
  createGoal: (goal: Omit<ProgressGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  dismissAchievementToast: () => void;
  refreshData: () => Promise<void>;
  getLevel: () => number;
  getExperienceProgress: () => { current: number; required: number; percentage: number };
  getRankingPosition: () => number;
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      achievements: ACHIEVEMENT_TEMPLATES.map((template, index) => ({
        ...template,
        id: `ach_${index}`,
        createdAt: new Date().toISOString()
      })),
      userAchievements: [],
      activityLog: [],
      goals: [],
      leaderboard: [],
      showAchievementToast: false,
      pendingAchievements: [],
      isLoading: false,
      lastUpdated: null,

      // Initialize User
      initializeUser: async (userId: string) => {
        set({ isLoading: true });

        try {
          // Check if user exists
          let user = get().user;
          
          if (!user || user.userId !== userId) {
            // Create new user
            user = {
              id: `gam_${userId}`,
              userId,
              totalPoints: 0,
              level: 1,
              experiencePoints: 0,
              currentStreak: 0,
              longestStreak: 0,
              lastActivityDate: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            set({ user });

            // Award initial achievement
            await get().logActivity(ActivityAction.DAILY_LOGIN);
          } else {
            // Update streak
            await get().updateStreak();
          }
        } catch (error) {
          console.error('Failed to initialize gamification user:', error);
        } finally {
          set({ isLoading: false, lastUpdated: new Date().toISOString() });
        }
      },

      // Log Activity
      logActivity: async (action: ActivityAction, metadata = {}) => {
        const { user } = get();
        if (!user) return;

        const pointsMap: Record<ActivityAction, number> = {
          [ActivityAction.DAILY_LOGIN]: POINTS_CONFIG.DAILY_LOGIN,
          [ActivityAction.ADD_CARD]: POINTS_CONFIG.ADD_CARD,
          [ActivityAction.OPTIMAL_USAGE]: POINTS_CONFIG.OPTIMAL_USAGE,
          [ActivityAction.COMPLETE_BONUS]: POINTS_CONFIG.COMPLETE_BONUS,
          [ActivityAction.SAVE_MONEY]: metadata.amount ? (metadata.amount as number) * POINTS_CONFIG.SAVE_MONEY_MULTIPLIER : 0,
          [ActivityAction.ADD_TRANSACTION]: POINTS_CONFIG.ADD_TRANSACTION,
          [ActivityAction.VIEW_ANALYTICS]: POINTS_CONFIG.VIEW_ANALYTICS,
          [ActivityAction.USE_AI_ASSISTANT]: POINTS_CONFIG.USE_AI_ASSISTANT,
          [ActivityAction.COMPLETE_PROFILE]: POINTS_CONFIG.COMPLETE_PROFILE,
          [ActivityAction.SHARE_ACHIEVEMENT]: POINTS_CONFIG.SHARE_ACHIEVEMENT
        };

        const points = pointsMap[action] || 0;
        const category = getActivityCategory(action);

        const activity: ActivityLog = {
          id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.userId,
          action,
          category,
          points,
          metadata,
          timestamp: new Date().toISOString()
        };

        // Add to activity log
        set(state => ({
          activityLog: [activity, ...state.activityLog.slice(0, 99)] // Keep last 100 activities
        }));

        // Add points if any
        if (points > 0) {
          await get().addPoints(points, `Activity: ${action}`);
        }

        // Check for achievements
        await get().checkAchievements();
      },

      // Add Points
      addPoints: async (points: number, reason: string) => {
        const { user } = get();
        if (!user) return;

        const newTotalPoints = user.totalPoints + points;
        const newExperiencePoints = user.experiencePoints + points;
        const newLevel = calculateLevel(newExperiencePoints);

        const updatedUser: GamificationUser = {
          ...user,
          totalPoints: newTotalPoints,
          experiencePoints: newExperiencePoints,
          level: newLevel,
          updatedAt: new Date().toISOString()
        };

        set({ user: updatedUser });

        // Check for level up
        if (newLevel > user.level) {
          // Level up achievement
          const levelUpActivity: ActivityLog = {
            id: `lvl_${Date.now()}`,
            userId: user.userId,
            action: 'level_up' as ActivityAction,
            category: ActivityCategory.ENGAGEMENT,
            points: newLevel * 10, // Bonus points for leveling up
            metadata: { newLevel, reason },
            timestamp: new Date().toISOString()
          };

          set(state => ({
            activityLog: [levelUpActivity, ...state.activityLog]
          }));
        }
      },

      // Update Streak
      updateStreak: async () => {
        const { user } = get();
        if (!user) return;

        const today = new Date().toDateString();
        const lastActivity = new Date(user.lastActivityDate).toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

        let newStreak = user.currentStreak;

        if (lastActivity === today) {
          // Already logged in today, no change
          return;
        } else if (lastActivity === yesterday) {
          // Consecutive day
          newStreak += 1;
        } else {
          // Streak broken
          newStreak = 1;
        }

        const updatedUser: GamificationUser = {
          ...user,
          currentStreak: newStreak,
          longestStreak: Math.max(user.longestStreak, newStreak),
          lastActivityDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set({ user: updatedUser });
      },

      // Check Achievements
      checkAchievements: async () => {
        const { user, achievements, userAchievements, activityLog } = get();
        if (!user) return;

        const newAchievements: UserAchievement[] = [];

        for (const achievement of achievements) {
          // Skip if already unlocked
          if (userAchievements.some(ua => ua.achievementId === achievement.id && ua.isCompleted)) {
            continue;
          }

          // Check level requirement
          if (achievement.requiredLevel && user.level < achievement.requiredLevel) {
            continue;
          }

          // Check condition
          let isUnlocked = false;
          let progress = 0;

          switch (achievement.condition.type) {
            case 'count':
              const count = activityLog.filter(log => 
                isActivityMatchingAchievement(log, achievement)
              ).length;
              progress = (count / achievement.condition.target) * 100;
              isUnlocked = count >= achievement.condition.target;
              break;

            case 'value':
              const value = activityLog
                .filter(log => isActivityMatchingAchievement(log, achievement))
                .reduce((sum, log) => sum + (log.metadata?.value as number || 0), 0);
              progress = (value / achievement.condition.target) * 100;
              isUnlocked = value >= achievement.condition.target;
              break;

            case 'streak':
              progress = (user.currentStreak / achievement.condition.target) * 100;
              isUnlocked = user.currentStreak >= achievement.condition.target;
              break;
          }

          if (isUnlocked) {
            const userAchievement: UserAchievement = {
              id: `ua_${Date.now()}_${achievement.id}`,
              userId: user.userId,
              achievementId: achievement.id,
              achievement,
              unlockedAt: new Date().toISOString(),
              progress: 100,
              isCompleted: true,
              notificationSent: false
            };

            newAchievements.push(userAchievement);

            // Award achievement points
            await get().addPoints(achievement.points, `Achievement: ${achievement.title}`);
          } else {
            // Update progress for existing achievement
            const existingUA = userAchievements.find(ua => ua.achievementId === achievement.id);
            if (existingUA && !existingUA.isCompleted) {
              existingUA.progress = Math.min(progress, 100);
            }
          }
        }

        if (newAchievements.length > 0) {
          set(state => ({
            userAchievements: [...state.userAchievements, ...newAchievements],
            pendingAchievements: newAchievements,
            showAchievementToast: true
          }));
        }
      },

      // Complete Goal
      completeGoal: async (goalId: string) => {
        const { goals } = get();
        const goal = goals.find(g => g.id === goalId);
        
        if (goal && !goal.isCompleted) {
          goal.isCompleted = true;
          goal.progress = 100;
          goal.updatedAt = new Date().toISOString();

          // Award goal reward
          await get().addPoints(goal.reward.points, `Goal completed: ${goal.title}`);

          set({ goals: [...goals] });
        }
      },

      // Create Goal
      createGoal: async (goalData) => {
        const { user, goals } = get();
        if (!user) return;

        const newGoal: ProgressGoal = {
          ...goalData,
          id: `goal_${Date.now()}`,
          userId: user.userId,
          progress: 0,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set({ goals: [...goals, newGoal] });
      },

      // Utility Functions
      dismissAchievementToast: () => {
        set({ showAchievementToast: false, pendingAchievements: [] });
      },

      refreshData: async () => {
        set({ lastUpdated: new Date().toISOString() });
      },

      getLevel: () => {
        const { user } = get();
        return user?.level || 1;
      },

      getExperienceProgress: () => {
        const { user } = get();
        if (!user) return { current: 0, required: 100, percentage: 0 };

        const currentLevel = LEVEL_SYSTEM.find(l => l.level === user.level);
        const nextLevel = LEVEL_SYSTEM.find(l => l.level === user.level + 1);

        if (!currentLevel) return { current: 0, required: 100, percentage: 0 };
        
        const current = user.experiencePoints - currentLevel.experienceRequired;
        const required = (nextLevel?.experienceRequired || currentLevel.experienceRequired) - currentLevel.experienceRequired;
        const percentage = (current / required) * 100;

        return { current, required, percentage: Math.min(percentage, 100) };
      },

      getRankingPosition: () => {
        const { user, leaderboard } = get();
        if (!user) return 0;

        const position = leaderboard.findIndex(entry => entry.userId === user.userId);
        return position >= 0 ? position + 1 : 0;
      }
    }),
    {
      name: 'gamification-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        userAchievements: state.userAchievements,
        activityLog: state.activityLog.slice(0, 50), // Persist only recent activities
        goals: state.goals,
        lastUpdated: state.lastUpdated
      })
    }
  )
);

// Helper Functions
function calculateLevel(experiencePoints: number): number {
  for (let i = LEVEL_SYSTEM.length - 1; i >= 0; i--) {
    if (experiencePoints >= LEVEL_SYSTEM[i].experienceRequired) {
      return LEVEL_SYSTEM[i].level;
    }
  }
  return 1;
}

function getActivityCategory(action: ActivityAction): ActivityCategory {
  const categoryMap: Record<ActivityAction, ActivityCategory> = {
    [ActivityAction.ADD_CARD]: ActivityCategory.ENGAGEMENT,
    [ActivityAction.OPTIMAL_USAGE]: ActivityCategory.OPTIMIZATION,
    [ActivityAction.DAILY_LOGIN]: ActivityCategory.ENGAGEMENT,
    [ActivityAction.COMPLETE_BONUS]: ActivityCategory.FINANCIAL,
    [ActivityAction.SAVE_MONEY]: ActivityCategory.FINANCIAL,
    [ActivityAction.ADD_TRANSACTION]: ActivityCategory.ENGAGEMENT,
    [ActivityAction.VIEW_ANALYTICS]: ActivityCategory.ENGAGEMENT,
    [ActivityAction.SHARE_ACHIEVEMENT]: ActivityCategory.SOCIAL,
    [ActivityAction.COMPLETE_PROFILE]: ActivityCategory.ENGAGEMENT,
    [ActivityAction.USE_AI_ASSISTANT]: ActivityCategory.OPTIMIZATION
  };

  return categoryMap[action] || ActivityCategory.ENGAGEMENT;
}

function isActivityMatchingAchievement(activity: ActivityLog, achievement: Achievement): boolean {
  // This is a simplified matching logic - can be expanded based on specific achievement requirements
  switch (achievement.category) {
    case AchievementCategory.ENGAGEMENT:
      return [
        ActivityAction.ADD_CARD,
        ActivityAction.DAILY_LOGIN,
        ActivityAction.ADD_TRANSACTION,
        ActivityAction.VIEW_ANALYTICS,
        ActivityAction.USE_AI_ASSISTANT
      ].includes(activity.action);
    
    case AchievementCategory.OPTIMIZATION:
      return activity.action === ActivityAction.OPTIMAL_USAGE;
    
    case AchievementCategory.REWARDS:
      return activity.action === ActivityAction.SAVE_MONEY;
    
    case AchievementCategory.STREAKS:
      return activity.action === ActivityAction.DAILY_LOGIN;
    
    default:
      return false;
  }
}
