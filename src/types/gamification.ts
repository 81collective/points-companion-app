// Gamification Types
export interface GamificationUser {
  id: string;
  userId: string;
  totalPoints: number;
  level: number;
  experiencePoints: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  type: AchievementType;
  condition: AchievementCondition;
  points: number;
  rarity: AchievementRarity;
  unlockable?: boolean;
  requiredLevel?: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement?: Achievement;
  unlockedAt: string;
  progress: number;
  isCompleted: boolean;
  notificationSent: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: ActivityAction;
  category: ActivityCategory;
  points: number;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface LevelSystem {
  level: number;
  experienceRequired: number;
  title: string;
  description: string;
  unlocks: string[];
  badge?: string;
}

export interface ProgressGoal {
  id: string;
  userId: string;
  type: GoalType;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  progress: number;
  deadline?: string;
  isCompleted: boolean;
  reward: GoalReward;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  username?: string;
  totalPoints: number;
  level: number;
  rank: number;
  avatar?: string;
  achievements: number;
}

// Enums
export enum AchievementCategory {
  SPENDING = 'spending',
  REWARDS = 'rewards',
  LOYALTY = 'loyalty',
  STREAKS = 'streaks',
  ENGAGEMENT = 'engagement',
  OPTIMIZATION = 'optimization'
}

export enum AchievementType {
  MILESTONE = 'milestone',
  STREAK = 'streak',
  ACCUMULATIVE = 'accumulative',
  PERCENTAGE = 'percentage',
  FIRST_TIME = 'first_time'
}

export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum ActivityAction {
  ADD_CARD = 'add_card',
  OPTIMAL_USAGE = 'optimal_usage',
  DAILY_LOGIN = 'daily_login',
  COMPLETE_BONUS = 'complete_bonus',
  SAVE_MONEY = 'save_money',
  ADD_TRANSACTION = 'add_transaction',
  VIEW_ANALYTICS = 'view_analytics',
  SHARE_ACHIEVEMENT = 'share_achievement',
  COMPLETE_PROFILE = 'complete_profile',
  USE_AI_ASSISTANT = 'use_ai_assistant'
}

export enum ActivityCategory {
  ENGAGEMENT = 'engagement',
  OPTIMIZATION = 'optimization',
  FINANCIAL = 'financial',
  SOCIAL = 'social'
}

export enum GoalType {
  POINTS = 'points',
  SAVINGS = 'savings',
  CARDS = 'cards',
  TRANSACTIONS = 'transactions',
  STREAK = 'streak'
}

export interface GoalReward {
  points: number;
  achievement?: string;
  unlockFeature?: string;
}

export interface AchievementCondition {
  type: 'count' | 'value' | 'streak' | 'percentage';
  target: number;
  operator: 'gte' | 'lte' | 'eq';
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
  metadata?: Record<string, unknown>;
}

// Constants
export const LEVEL_SYSTEM: LevelSystem[] = [
  { level: 1, experienceRequired: 0, title: 'Rookie', description: 'Starting your points journey', unlocks: ['Basic dashboard'] },
  { level: 2, experienceRequired: 100, title: 'Explorer', description: 'Learning the ropes', unlocks: ['Card recommendations'] },
  { level: 3, experienceRequired: 250, title: 'Optimizer', description: 'Making smart choices', unlocks: ['AI Assistant'] },
  { level: 4, experienceRequired: 500, title: 'Strategist', description: 'Mastering rewards', unlocks: ['Advanced analytics'] },
  { level: 5, experienceRequired: 1000, title: 'Expert', description: 'Points optimization expert', unlocks: ['Custom goals'] },
  { level: 6, experienceRequired: 2000, title: 'Master', description: 'Rewards master', unlocks: ['Portfolio optimizer'] },
  { level: 7, experienceRequired: 3500, title: 'Guru', description: 'Points guru', unlocks: ['Real-time features'] },
  { level: 8, experienceRequired: 5500, title: 'Legend', description: 'Legendary optimizer', unlocks: ['Premium insights'] },
  { level: 9, experienceRequired: 8000, title: 'Champion', description: 'Championship level', unlocks: ['Exclusive features'] },
  { level: 10, experienceRequired: 12000, title: 'Grandmaster', description: 'Ultimate points master', unlocks: ['All features'] }
];

export const ACHIEVEMENT_TEMPLATES: Omit<Achievement, 'id' | 'createdAt'>[] = [
  {
    title: 'First Steps',
    description: 'Add your first credit card',
    icon: '🎯',
    category: AchievementCategory.ENGAGEMENT,
    type: AchievementType.FIRST_TIME,
    condition: { type: 'count', target: 1, operator: 'gte' },
    points: 10,
    rarity: AchievementRarity.COMMON,
    isActive: true
  },
  {
    title: 'Card Collector',
    description: 'Add 5 credit cards to your wallet',
    icon: '💳',
    category: AchievementCategory.ENGAGEMENT,
    type: AchievementType.MILESTONE,
    condition: { type: 'count', target: 5, operator: 'gte' },
    points: 50,
    rarity: AchievementRarity.UNCOMMON,
    isActive: true
  },
  {
    title: 'Perfect Week',
    description: 'Use optimal cards for 7 consecutive days',
    icon: '🔥',
    category: AchievementCategory.OPTIMIZATION,
    type: AchievementType.STREAK,
    condition: { type: 'streak', target: 7, operator: 'gte' },
    points: 100,
    rarity: AchievementRarity.RARE,
    isActive: true
  },
  {
    title: 'Money Saver',
    description: 'Save $100 through optimal card usage',
    icon: '💰',
    category: AchievementCategory.REWARDS,
    type: AchievementType.ACCUMULATIVE,
    condition: { type: 'value', target: 100, operator: 'gte' },
    points: 200,
    rarity: AchievementRarity.EPIC,
    isActive: true
  },
  {
    title: 'Streak Master',
    description: 'Maintain a 30-day login streak',
    icon: '⚡',
    category: AchievementCategory.STREAKS,
    type: AchievementType.STREAK,
    condition: { type: 'streak', target: 30, operator: 'gte' },
    points: 300,
    rarity: AchievementRarity.LEGENDARY,
    isActive: true
  },
  {
    title: 'AI Assistant',
    description: 'Use AI recommendations 10 times',
    icon: '🤖',
    category: AchievementCategory.ENGAGEMENT,
    type: AchievementType.MILESTONE,
    condition: { type: 'count', target: 10, operator: 'gte' },
    points: 75,
    rarity: AchievementRarity.UNCOMMON,
    requiredLevel: 3,
    isActive: true
  }
];

export const POINTS_CONFIG = {
  DAILY_LOGIN: 5,
  ADD_CARD: 10,
  OPTIMAL_USAGE: 15,
  COMPLETE_BONUS: 25,
  SAVE_MONEY_MULTIPLIER: 0.1, // 10% of savings as points
  ADD_TRANSACTION: 2,
  VIEW_ANALYTICS: 3,
  USE_AI_ASSISTANT: 5,
  COMPLETE_PROFILE: 20,
  SHARE_ACHIEVEMENT: 10
};
