// src/app/page.tsx - Airbnb-inspired landing page with auth redirect
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Shield, Zap, TrendingUp, CreditCard, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import CardFinder from '@/components/public/CardFinder';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Maximize your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">
                {" "}credit card rewards
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Smart AI recommendations help you earn more points, cashback, and travel rewards. 
              Never miss out on the best card for each purchase again.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/auth')}
                className="inline-flex items-center px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get started
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/auth')}
                className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-xl border-2 border-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Learn more
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to optimize rewards
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you make the most of every purchase.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">AI-Powered Recommendations</h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant suggestions for the best credit card to use for each purchase, 
                maximizing your points and cashback.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Smart Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Track your spending patterns and discover opportunities to earn more rewards 
                with detailed insights and reports.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Secure & Private</h3>
              <p className="text-gray-600 leading-relaxed">
                Your financial data is encrypted and secure. We never store your full credit card 
                numbers or sensitive information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Card Finder Demo Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CardFinder />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">2.5x</div>
              <div className="text-gray-600 font-medium">Average rewards increase</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">$1,200</div>
              <div className="text-gray-600 font-medium">Extra rewards earned per year</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">50k+</div>
              <div className="text-gray-600 font-medium">Happy users optimizing rewards</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rose-500 to-pink-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to maximize your rewards?
          </h2>
          <p className="text-xl text-rose-100 mb-10 leading-relaxed">
            Join thousands of users who are already earning more with smart credit card optimization.
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Start optimizing today
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">Points Companion</span>
            </div>
            <div className="text-gray-600">
              © 2025 Points Companion. Made with ❤️ for smart spenders.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}