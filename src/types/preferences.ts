export interface DashboardPreferences {
  showCreditCards: boolean
  showAnalytics: boolean
  showAIInsights: boolean
  showTransactions: boolean
  showNotifications: boolean
  showLocationServices: boolean
  defaultDashboardView: 'overview' | 'cards' | 'analytics'
  cardDisplayMode: 'grid' | 'list'
  analyticsTimeRange: '30d' | '90d' | '1y'
}

export const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
  showCreditCards: true,
  showAnalytics: true,
  showAIInsights: true,
  showTransactions: true,
  showNotifications: true,
  showLocationServices: false,
  defaultDashboardView: 'overview',
  cardDisplayMode: 'grid',
  analyticsTimeRange: '30d'
}
