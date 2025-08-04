// Enhanced Loyalty Program Tracking System Types
// Points Companion - Phase 1 Implementation

export interface LoyaltyProgram {
  id: string;
  name: string;
  description?: string;
  category: 'airline' | 'hotel' | 'credit_card' | 'dining' | 'shopping' | 'other';
  pointsName: string; // e.g., "miles", "points", "cashback"
  logoUrl?: string;
  website?: string;
  expirationRules: {
    expiresAfter?: number; // months
    activityRequired?: boolean;
    extensionPossible?: boolean;
  };
  eliteProgram?: {
    tiers: string[];
    benefits: string[];
  };
  eliteTiers?: string[];
}

export interface Certificate {
  id: string;
  type: 'free-night' | 'companion' | 'upgrade' | 'lounge-access' | 'other';
  name: string;
  description: string;
  expirationDate: string;
  restrictions: string[];
  estimatedValue: number;
  category?: string;
  usageInstructions?: string;
  transferable?: boolean;
}

export interface LoyaltyAccount {
  id: string;
  userId: string;
  programId: string;
  accountNumber: string;
  accountName?: string;
  balance: {
    current: number;
    pending?: number;
    lifetime?: number;
  };
  expirationDate?: string;
  expiringPoints?: {
    amount: number;
    expirationDate: string;
  }[];
  eliteStatus?: {
    currentTier: string;
    qualifyingActivity: number;
    nextTierRequirement?: number;
    yearEndDate: string;
  };
  certificates: Certificate[];
  lastUpdated: string;
  syncEnabled: boolean;
  syncFrequency: 'manual' | 'daily' | 'weekly' | 'monthly';
  credentials?: {
    encrypted: boolean;
    lastSync?: string;
    syncStatus: 'connected' | 'error' | 'pending' | 'disconnected';
  };
}

export interface LoyaltyTrend {
  date: string;
  balance: number;
  activity: {
    earned: number;
    redeemed: number;
    expired: number;
  };
}

export interface LoyaltyInsight {
  id: string;
  type: 'expiration_warning' | 'optimization_tip' | 'certificate_reminder' | 'elite_progress' | 'value_alert';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  actionUrl?: string;
  expiresAt?: string;
  dismissed?: boolean;
}

export interface LoyaltyGoal {
  id: string;
  userId: string;
  type: 'elite_status' | 'award_redemption' | 'certificate_earning' | 'point_accumulation';
  title: string;
  description: string;
  targetValue: number;
  currentProgress: number;
  targetDate: string;
  associatedAccounts: string[];
  strategies: string[];
  completed: boolean;
}

// API Response Types
export interface LoyaltyAccountResponse {
  success: boolean;
  data?: LoyaltyAccount;
  error?: string;
}

export interface LoyaltyAccountsResponse {
  success: boolean;
  data?: LoyaltyAccount[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface LoyaltyInsightsResponse {
  success: boolean;
  data?: LoyaltyInsight[];
  error?: string;
}

// Form Types
export interface AddLoyaltyAccountForm {
  programId: string;
  accountNumber: string;
  accountName?: string;
  initialBalance?: number;
  eliteStatus?: string;
  syncEnabled: boolean;
  syncFrequency: LoyaltyAccount['syncFrequency'];
  credentials?: {
    username?: string;
    password?: string;
    securityQuestions?: Record<string, string>;
  };
}

export interface LoyaltyAccountUpdate {
  accountName?: string;
  balance?: Partial<LoyaltyAccount['balance']>;
  eliteStatus?: Partial<LoyaltyAccount['eliteStatus']>;
  syncEnabled?: boolean;
  syncFrequency?: LoyaltyAccount['syncFrequency'];
  certificates?: Certificate[];
}

// Filter and Search Types
export interface LoyaltyFilter {
  category?: LoyaltyProgram['category'][];
  hasExpiringPoints?: boolean;
  hasCertificates?: boolean;
  eliteStatus?: boolean;
  syncStatus?: ('connected' | 'error' | 'pending' | 'disconnected')[];
  sortBy?: 'balance' | 'name' | 'expiration' | 'lastUpdated' | 'value';
  sortOrder?: 'asc' | 'desc';
}

export interface LoyaltySearchQuery {
  query?: string;
  filters?: LoyaltyFilter;
  page?: number;
  limit?: number;
}

// Analytics Types
export interface LoyaltyAnalytics {
  totalValue: number;
  totalAccounts: number;
  categoriesBreakdown: Record<LoyaltyProgram['category'], {
    count: number;
    totalValue: number;
    averageBalance: number;
  }>;
  expirationSummary: {
    expiring30Days: number;
    expiring60Days: number;
    expiring90Days: number;
    totalExpiring: number;
  };
  certificateSummary: {
    total: number;
    estimatedValue: number;
    expiringCount: number;
  };
  eliteStatusSummary: {
    currentTiers: Record<string, number>;
    progressToNextTier: Array<{
      programName: string;
      currentTier: string;
      nextTier: string;
      progress: number;
    }>;
  };
  trends: {
    timeframe: '7d' | '30d' | '90d' | '1y';
    data: LoyaltyTrend[];
  };
}
