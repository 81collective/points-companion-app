'use client';
import React from 'react';
import AIRecommendationEngine from '@/components/ai/AIRecommendationEngine';
import SmartInsights from '@/components/ai/SmartInsights';
import BusinessAssistant from '@/components/ai/BusinessAssistant';
import { CardComparisonCards } from '@/components/ai/CardComparisonCards';
import { useAssistantStore } from '@/stores/assistantStore';
import ErrorBoundary from '@/components/error/ErrorBoundary';

export default function AIPage() {
  const latest = useAssistantStore(s => s.latestRecs);
  const ctx = useAssistantStore(s => s.context);
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">AI-Powered Recommendations</h1>
            <p className="mt-2 text-lg text-gray-600">
              Get intelligent card recommendations powered by AI analysis of your spending patterns
            </p>
          </div>

          {/* Main Content - Tab Layout */}
          <div className="space-y-8">
            {/* New Business Assistant (Quick/Planning modes) */}
            <section>
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900">Business Assistant</h2>
                  <p className="text-gray-600">Fast in-store decisions and deeper planning conversations.</p>
                </div>
                <BusinessAssistant />
              </div>
            </section>

            {/* Transparent Math Deep Dive - reflects latest assistant picks */}
            <section>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900">Transparent Math</h2>
                  <p className="text-gray-600">Understand how we compute value: points, $ estimates, fee impact, and break-even.</p>
                </div>
                {latest?.length ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-700">
                      Showing latest picks{ctx?.place ? <> for <span className="font-medium">{ctx.place}</span></> : ''} ({ctx?.mode} · {ctx?.category})
                    </div>
                    <CardComparisonCards items={latest} />
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Use the Business Assistant above to generate live examples.</p>
                )}
              </div>
            </section>

            {/* Smart Insights */}
            <section>
              <SmartInsights />
            </section>

            {/* AI Recommendation Engine */}
            <section>
              <AIRecommendationEngine />
            </section>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
