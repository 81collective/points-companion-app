'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import SpendingAnalysis from '@/components/insights/SpendingAnalysis';
import AIInsights from '@/components/insights/AIInsights';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function InsightsPage() {
  const { profile } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center text-sm text-gray-500 gap-2">
            <Link 
              href="/dashboard" 
              className="flex items-center hover:text-primary gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Smart Spending Insights
            </h1>
            <p className="text-gray-600 mt-2">
              AI-powered analysis of your spending patterns and recommendations for maximizing rewards.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Spending Analysis - Takes up 2 columns */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Spending Analysis</h2>
                <SpendingAnalysis />
              </div>

              {/* Points Optimization Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Points Optimization</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-700">Current Annual Points</h3>
                    <p className="text-3xl font-bold text-green-800 mt-2">12,847</p>
                    <p className="text-sm text-green-600 mt-1">Based on current spending patterns</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-700">Potential Annual Points</h3>
                    <p className="text-3xl font-bold text-blue-800 mt-2">18,234</p>
                    <p className="text-sm text-blue-600 mt-1">With optimized card usage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights Section - Takes up 1 column */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Recommendations</h2>
                <AIInsights />
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link 
                    href="/dashboard/cards"
                    className="block w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-center"
                  >
                    Add New Card
                  </Link>
                  <button 
                    className="block w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Update Spending Goals
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
