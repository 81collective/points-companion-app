export interface DashboardMetrics {
  cardCount: number;
  totalPoints: number;
  monthlyPoints: number;
  recentActivityCount: number;
}

// Extend with charts, distributions, etc. when needed; placeholder generic for future augmentation.
export type DashboardDataResult = DashboardMetrics & {
  // future: charts?: ChartSeries[]; trends?: TrendMetric[];
};
