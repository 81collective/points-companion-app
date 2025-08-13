import React from 'react';
import AIRecommendationEngine from '@/components/ai/AIRecommendationEngine';
import SmartInsights from '@/components/ai/SmartInsights';
import NaturalLanguageChat from '@/components/ai/NaturalLanguageChat';
import BusinessAssistant from '@/components/ai/BusinessAssistant';
import ErrorBoundary from '@/components/error/ErrorBoundary';

export default function AIPage() {
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

            {/* AI Chat Assistant */}
            <section>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">AI Chat Assistant</h2>
                  <p className="text-gray-600">
                    Ask natural language questions about credit cards and get personalized recommendations
                  </p>
                </div>
                <NaturalLanguageChat />
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
