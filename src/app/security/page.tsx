'use client';

import React from 'react';
import SecurityDashboard from '@/components/security/SecurityDashboard';
import ErrorBoundary from '@/components/error/ErrorBoundary';

export default function SecurityPage() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SecurityDashboard />
        </div>
      </div>
    </ErrorBoundary>
  );
}
