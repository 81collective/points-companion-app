import dynamic from 'next/dynamic';
import { Skeleton, ChartSkeleton, CardSkeleton } from '@/components/ui/lazy-load';

// Analytics components with loading fallbacks
export const AnalyticsChart = dynamic(
  () => import('@/components/analytics/AnalyticsChart').then(mod => ({ default: mod.AnalyticsChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
);

export const SpendingTrends = dynamic(
  () => import('@/components/analytics/SpendingTrends').then(mod => ({ default: mod.SpendingTrends })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
);

export const RewardsChart = dynamic(
  () => import('@/components/analytics/RewardsChart').then(mod => ({ default: mod.RewardsChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
);

// Card components
export const CardRecommendations = dynamic(
  () => import('@/components/cards/CardRecommendations').then(mod => ({ default: mod.CardRecommendations })),
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

export const CardComparison = dynamic(
  () => import('@/components/cards/CardComparison').then(mod => ({ default: mod.CardComparison })),
  {
    loading: () => <Skeleton className="h-96 w-full" />
  }
);

// Transaction components
export const TransactionList = dynamic(
  () => import('@/components/transactions/TransactionList').then(mod => ({ default: mod.TransactionList })),
  {
    loading: () => <Skeleton className="h-64 w-full" />
  }
);

export const TransactionImport = dynamic(
  () => import('@/components/transactions/TransactionImport').then(mod => ({ default: mod.TransactionImport })),
  {
    loading: () => <Skeleton className="h-96 w-full" />
  }
);

export const CSVUpload = dynamic(
  () => import('@/components/transactions/CSVUpload').then(mod => ({ default: mod.CSVUpload })),
  {
    loading: () => <Skeleton className="h-64 w-full" />
  }
);

// AI components
export const AIRecommendations = dynamic(
  () => import('@/components/ai/AIRecommendations').then(mod => ({ default: mod.AIRecommendations })),
  {
    loading: () => (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }
);

export const SmartInsights = dynamic(
  () => import('@/components/ai/SmartInsights').then(mod => ({ default: mod.SmartInsights })),
  {
    loading: () => <Skeleton className="h-48 w-full" />
  }
);

// Gamification components
export const AchievementsList = dynamic(
  () => import('@/components/gamification/AchievementsList').then(mod => ({ default: mod.AchievementsList })),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }
);

export const LevelProgress = dynamic(
  () => import('@/components/gamification/LevelProgress').then(mod => ({ default: mod.LevelProgress })),
  {
    loading: () => <Skeleton className="h-32 w-full" />
  }
);

// Real-time components
export const NotificationCenter = dynamic(
  () => import('@/components/realtime/NotificationCenter').then(mod => ({ default: mod.NotificationCenter })),
  {
    loading: () => <Skeleton className="h-10 w-10 rounded-full" />,
    ssr: false
  }
);

export const LiveUpdates = dynamic(
  () => import('@/components/realtime/LiveUpdates').then(mod => ({ default: mod.LiveUpdates })),
  {
    loading: () => <Skeleton className="h-6 w-32" />,
    ssr: false
  }
);

// Advanced components that should only load on interaction
export const DataExport = dynamic(
  () => import('@/components/settings/DataExport').then(mod => ({ default: mod.DataExport })),
  {
    loading: () => <Skeleton className="h-64 w-full" />
  }
);

export const AdvancedFilters = dynamic(
  () => import('@/components/common/AdvancedFilters').then(mod => ({ default: mod.AdvancedFilters })),
  {
    loading: () => <Skeleton className="h-48 w-full" />
  }
);

// Admin components (only load when needed)
export const AdminDashboard = dynamic(
  () => import('@/components/admin/AdminDashboard').then(mod => ({ default: mod.AdminDashboard })),
  {
    loading: () => <Skeleton className="h-screen w-full" />
  }
);

// Map components (heavy libraries)
export const LocationMap = dynamic(
  () => import('@/components/maps/LocationMap').then(mod => ({ default: mod.LocationMap })),
  {
    loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
    ssr: false
  }
);

// PDF generation (heavy library)
export const ReportGenerator = dynamic(
  () => import('@/components/reports/ReportGenerator').then(mod => ({ default: mod.ReportGenerator })),
  {
    loading: () => <Skeleton className="h-32 w-full" />
  }
);

// Chart libraries (only load when charts are visible)
export const PieChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.PieChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
);

export const LineChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.LineChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
);

export const BarChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.BarChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
);

// Form libraries
export const RichTextEditor = dynamic(
  () => import('@/components/ui/rich-text-editor').then(mod => ({ default: mod.RichTextEditor })),
  {
    loading: () => <Skeleton className="h-32 w-full" />
  }
);

// Image editor (heavy library)
export const ImageEditor = dynamic(
  () => import('@/components/ui/image-editor').then(mod => ({ default: mod.ImageEditor })),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false
  }
);
