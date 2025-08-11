'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SpendingAnalysis from '@/components/insights/SpendingAnalysis';
import AIInsights from '@/components/insights/AIInsights';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function InsightsPage() {

  return (
    <ProtectedRoute>
      <div className="page-container py-8 max-w-7xl mx-auto">
        <main>
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center text-xs text-dim gap-2">
            <Link href="/dashboard" className="flex items-center gap-1 hover:text-[var(--color-text)]">
              <ChevronLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <span>/</span>
            <span className="text-[var(--color-text)]">Insights</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight">Smart Spending Insights</h1>
            <p className="text-dim mt-2 text-sm max-w-prose">AI-powered analysis of spending patterns and recommendations for maximizing rewards.</p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Spending Analysis - Takes up 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <div className="surface p-6 surface-hover">
                <h2 className="text-lg font-medium mb-4">Monthly Spending Analysis</h2>
                <SpendingAnalysis />
              </div>

              {/* Points Optimization Section */}
              <div className="surface p-6 surface-hover">
                <h2 className="text-lg font-medium mb-4">Points Optimization</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-alt)]/60">
                    <h3 className="font-medium text-sm">Current Annual Points</h3>
                    <p className="text-2xl font-semibold mt-2">12,847</p>
                    <p className="text-xs text-dim mt-1">Current spending patterns</p>
                  </div>
                  <div className="p-4 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-alt)]/60">
                    <h3 className="font-medium text-sm">Potential Annual Points</h3>
                    <p className="text-2xl font-semibold mt-2">18,234</p>
                    <p className="text-xs text-dim mt-1">Optimized card usage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights Section - Takes up 1 column */}
            <div className="space-y-6">
              <div className="surface p-6 surface-hover">
                <h2 className="text-lg font-medium mb-4">AI Recommendations</h2>
                <AIInsights />
              </div>

              {/* Quick Actions */}
              <div className="surface p-6 surface-hover">
                <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Link href="/dashboard/cards" className="btn-minimal btn-accent w-full justify-center text-sm">Add New Card</Link>
                  <button className="btn-minimal w-full justify-center text-sm">Update Spending Goals</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
