'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Users, 
  Bell, 
  Zap,
  TrendingUp,
  Share2
} from 'lucide-react';
import LiveDashboard from '@/components/realtime/LiveDashboard';
import HouseholdCollaboration from '@/components/realtime/HouseholdCollaboration';
import ErrorBoundary from '@/components/error/ErrorBoundary';

const RealTimePage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'household'>('dashboard');

  const tabs = [
    {
      id: 'dashboard' as const,
      label: 'Live Dashboard',
      icon: <Activity className="w-5 h-5" />,
      description: 'Real-time metrics and activity'
    },
    {
      id: 'household' as const,
      label: 'Household',
      icon: <Users className="w-5 h-5" />,
      description: 'Collaborate with family members'
    }
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Real-Time Features</h1>
                <p className="text-gray-600">Live updates, notifications, and collaboration</p>
              </div>
            </div>

            {/* Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Bell className="w-6 h-6 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">Live Notifications</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Get instant alerts for new recommendations, transactions, and rewards
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  <h3 className="font-semibold text-gray-900">Live Metrics</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Monitor spending, points, and card performance in real-time
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Share2 className="w-6 h-6 text-purple-500" />
                  <h3 className="font-semibold text-gray-900">Collaboration</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Share insights and coordinate with household members
                </p>
              </motion.div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && <LiveDashboard />}
            {activeTab === 'household' && <HouseholdCollaboration />}
          </motion.div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default RealTimePage;
