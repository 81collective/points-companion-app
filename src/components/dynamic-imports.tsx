import dynamic from 'next/dynamic';
import { Skeleton, CardSkeleton, ChartSkeleton } from '@/components/ui/lazy-load';

// Transaction components (existing)
export const TransactionList = dynamic(
  () => import('@/components/transactions/TransactionList'),
  {
    loading: () => <Skeleton className="h-64 w-full" />
  }
);

export const CSVUpload = dynamic(
  () => import('@/components/transactions/CSVUpload'),
  {
    loading: () => <Skeleton className="h-96 w-full" />
  }
);

export const CSVColumnMapper = dynamic(
  () => import('@/components/transactions/CSVColumnMapper'),
  {
    loading: () => <Skeleton className="h-96 w-full" />
  }
);

export const TransactionImportProcessor = dynamic(
  () => import('@/components/transactions/TransactionImportProcessor'),
  {
    loading: () => <Skeleton className="h-96 w-full" />
  }
);

export const ManualTransactionEntry = dynamic(
  () => import('@/components/transactions/ManualTransactionEntry'),
  {
    loading: () => <Skeleton className="h-96 w-full" />
  }
);

// Realtime components (notifications disabled for now)

// Analytics components (existing)
export const EnhancedAnalyticsDashboard = dynamic(
  () => import('@/components/analytics/EnhancedAnalyticsDashboard'),
  { loading: () => <ChartSkeleton />, ssr: false }
);

export const AdvancedAnalytics = dynamic(
  () => import('@/components/analytics/AdvancedAnalytics'),
  { loading: () => <ChartSkeleton />, ssr: false }
);

export const AIPerformanceMetrics = dynamic(
  () => import('@/components/analytics/AIPerformanceMetrics'),
  { loading: () => <ChartSkeleton />, ssr: false }
);

export const RecommendationHistory = dynamic(
  () => import('@/components/analytics/RecommendationHistory'),
  { loading: () => <ChartSkeleton />, ssr: false }
);

// Card components (existing)
export const CardList = dynamic(
  () => import('@/components/cards/CardList'),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }
);

// AI components (existing)
export const SmartInsights = dynamic(
  () => import('@/components/ai/SmartInsights'),
  { loading: () => <Skeleton className="h-48 w-full" /> }
);

// Maps (existing)
export const BusinessMap = dynamic(
  () => import('@/components/maps/BusinessMap'),
  { loading: () => <Skeleton className="h-64 w-full rounded-lg" />, ssr: false }
);

// Charts (external lib)
export const PieChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.PieChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

export const LineChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.LineChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

export const BarChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.BarChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

// Performance optimization utilities
export const performanceAnalytics = {
  // Preload critical components
  preloadComponents: () => {
    if (typeof window !== 'undefined') {
      // Preload most commonly used components
      import('@/components/transactions/TransactionList');
      import('@/components/cards/CardList');
    }
  },

  // Memory management
  clearComponentCache: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Clear dynamic import cache if memory usage is high
      const performance = window.performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } };
      const memory = performance.memory;
      if (memory && memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
        console.warn('High memory usage detected, consider clearing component cache');
      }
    }
  },

  // Bundle analysis helper
  analyzeBundleComponents: () => {
  const dynamicComponents = ['TransactionList','CSVUpload','CardList','EnhancedAnalyticsDashboard','BusinessMap'];

    console.group('Dynamic Components Analysis');
    console.log('Total dynamic components:', dynamicComponents.length);
    console.log('Components:', dynamicComponents);
    console.groupEnd();
  }
};
