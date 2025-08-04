// Welcome Bonus Management System Types
// Points Companion - Phase 1, Prompt 3 Implementation

export interface WelcomeBonusTracker {
  id: string;
  userId: string;
  cardId: string;
  cardName: string;
  cardIssuer: string;
  requiredSpend: number;
  currentSpend: number;
  deadline: string; // ISO date string
  bonusAmount: number;
  bonusType: 'points' | 'miles' | 'cashback' | 'statement_credit';
  bonusDescription: string;
  progress: number; // percentage 0-100
  status: 'active' | 'completed' | 'expired' | 'paused';
  startDate: string;
  applicationDate?: string;
  completedDate?: string;
  milestones: BonusMilestone[];
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedValue: number; // in USD
  notes?: string;
}

export interface BonusMilestone {
  id: string;
  threshold: number; // spending amount
  reward: string; // description of the reward
  achieved: boolean;
  achievedDate?: string;
  pointsValue?: number;
  cashValue?: number;
}

export interface SpendingRecommendation {
  id: string;
  category: string;
  amount: number;
  description: string;
  suggestedMerchants: string[];
  pointsImpact: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string;
  estimatedCompletionDate: string;
  alternativeOptions: string[];
  tags: string[];
}

export interface SpendingVelocity {
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  projectedCompletion: string;
  confidenceLevel: number; // 0-100
}

export interface BonusAnalytics {
  totalBonusesEarned: number;
  totalValueEarned: number;
  averageCompletionTime: number; // days
  successRate: number; // percentage
  mostEffectiveCategories: string[];
  spendingPatterns: {
    category: string;
    percentage: number;
    averageAmount: number;
  }[];
  monthlyBreakdown: {
    month: string;
    bonusesCompleted: number;
    valueEarned: number;
    spendingVolume: number;
  }[];
}

export interface SpendingPlan {
  id: string;
  bonusId: string;
  totalRequired: number;
  remainingAmount: number;
  timeRemaining: number; // days
  recommendations: SpendingRecommendation[];
  timeline: {
    date: string;
    plannedSpending: number;
    category: string;
    description: string;
  }[];
  riskAssessment: {
    completionProbability: number;
    riskFactors: string[];
    mitigationStrategies: string[];
  };
}

export interface BonusNotification {
  id: string;
  bonusId: string;
  type: 'milestone' | 'deadline_warning' | 'completion' | 'expiration' | 'opportunity';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  actionRequired: boolean;
  actionUrl?: string;
  createdAt: string;
  read: boolean;
  dismissed: boolean;
}

export interface BonusOpportunity {
  id: string;
  cardName: string;
  cardIssuer: string;
  bonusAmount: number;
  bonusType: string;
  requiredSpend: number;
  timeLimit: number; // days
  estimatedValue: number;
  applicationUrl: string;
  restrictions: string[];
  bestForCategories: string[];
  competitorComparison: {
    rank: number;
    betterOptions: number;
    worstCaseValue: number;
    bestCaseValue: number;
  };
  personalizedScore: number; // 0-100 based on user profile
}

// Form Types
export interface AddBonusForm {
  cardId: string;
  cardName: string;
  cardIssuer: string;
  requiredSpend: number;
  deadline: string;
  bonusAmount: number;
  bonusType: WelcomeBonusTracker['bonusType'];
  bonusDescription: string;
  applicationDate?: string;
  milestones?: Omit<BonusMilestone, 'id' | 'achieved' | 'achievedDate'>[];
  notes?: string;
  priority?: WelcomeBonusTracker['priority'];
}

export interface UpdateSpendingForm {
  amount: number;
  category: string;
  merchant: string;
  date: string;
  description?: string;
  manual: boolean;
}

// API Response Types
export interface WelcomeBonusResponse {
  success: boolean;
  data?: WelcomeBonusTracker;
  error?: string;
}

export interface WelcomeBonusesResponse {
  success: boolean;
  data?: WelcomeBonusTracker[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface BonusAnalyticsResponse {
  success: boolean;
  data?: BonusAnalytics;
  error?: string;
}

export interface SpendingRecommendationsResponse {
  success: boolean;
  data?: SpendingRecommendation[];
  error?: string;
}

// Filter and Search Types
export interface BonusFilter {
  status?: WelcomeBonusTracker['status'][];
  priority?: WelcomeBonusTracker['priority'][];
  bonusType?: WelcomeBonusTracker['bonusType'][];
  minValue?: number;
  maxValue?: number;
  deadlineRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'deadline' | 'progress' | 'value' | 'priority' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface BonusSearchQuery {
  query?: string;
  filters?: BonusFilter;
  page?: number;
  limit?: number;
}

// Gamification Types
export interface BonusAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'completion' | 'speed' | 'value' | 'efficiency' | 'streak';
  criteria: {
    metric: string;
    threshold: number;
    timeframe?: string;
  };
  earned: boolean;
  earnedDate?: string;
  progress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  rewards: string[];
}

export interface BonusStreak {
  current: number;
  longest: number;
  startDate: string;
  type: 'completion' | 'on_time' | 'high_value';
}

// Integration Types
export interface BankConnection {
  id: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'credit';
  lastSync: string;
  syncStatus: 'connected' | 'error' | 'pending' | 'disconnected';
  autoSync: boolean;
  syncFrequency: 'real_time' | 'daily' | 'weekly';
}

export interface TransactionSync {
  id: string;
  bonusId: string;
  transactionId: string;
  amount: number;
  merchant: string;
  category: string;
  date: string;
  contributesToBonus: boolean;
  verified: boolean;
  source: 'manual' | 'bank_sync' | 'credit_monitoring';
}
