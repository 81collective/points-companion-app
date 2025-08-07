import dynamic from 'next/dynamic';
import { Skeleton, CardSkeleton } from '@/components/ui/lazy-load';

// Transaction components (using existing components)
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

// Real-time components (using existing)
export const NotificationCenter = dynamic(
  () => import('@/components/realtime/NotificationCenter'),
  {
    loading: () => <Skeleton className="h-10 w-10 rounded-full" />,
    ssr: false
  }
);

// Card components (using existing)
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

// Performance optimization utilities
export const performanceAnalytics = {
  // Preload critical components
  preloadComponents: () => {
    if (typeof window !== 'undefined') {
      // Preload most commonly used components
      import('@/components/transactions/TransactionList');
      import('@/components/cards/CardList');
      import('@/components/realtime/NotificationCenter');
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
    const dynamicComponents = [
      'TransactionList',
      'CSVUpload', 
      'NotificationCenter',
      'CardList'
    ];
    
    console.group('Dynamic Components Analysis');
    console.log('Total dynamic components:', dynamicComponents.length);
    console.log('Components:', dynamicComponents);
    console.groupEnd();
  }
};
