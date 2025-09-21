'use client';

import React from 'react';
import EnhancedAnalyticsDashboard from '@/components/analytics/EnhancedAnalyticsDashboard';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import UnifiedDashboardShell from '@/components/layout/UnifiedDashboardShell';

export default function AnalyticsPage() {
  return (
    <ErrorBoundary>
      <UnifiedDashboardShell>
        <EnhancedAnalyticsDashboard />
      </UnifiedDashboardShell>
    </ErrorBoundary>
  );
}
