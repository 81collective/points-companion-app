'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import UnifiedDashboardShell from '@/components/layout/UnifiedDashboardShell';

const DynamicEnhancedAnalyticsDashboard = dynamic(
  () => import('@/components/analytics/EnhancedAnalyticsDashboard'),
  {
    loading: () => <p>Loading dashboard...</p>,
    ssr: false,
  }
);

export default function AnalyticsPage() {
  return (
    <ErrorBoundary>
      <UnifiedDashboardShell>
        <DynamicEnhancedAnalyticsDashboard />
      </UnifiedDashboardShell>
    </ErrorBoundary>
  );
}
