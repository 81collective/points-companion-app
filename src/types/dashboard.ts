export interface DashboardMetrics {
  cardCount: number;
  totalPoints: number;
  monthlyPoints: number;
  recentActivityCount: number;
}

export interface DashboardDataResult extends DashboardMetrics {
  // extend later with charts, distributions, etc.
}
