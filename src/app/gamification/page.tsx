'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Star, TrendingUp, Medal } from 'lucide-react';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useAuth } from '@/contexts/AuthContext';
import GamificationOverview from '@/components/gamification/GamificationOverview';
import AchievementsGallery from '@/components/gamification/AchievementsGallery';
import GoalsProgress from '@/components/gamification/GoalsProgress';
import AchievementToast from '@/components/gamification/AchievementToast';
import { ActivityAction } from '@/types/gamification';

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}> = ({ active, onClick, icon, label, count }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200
      ${active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
        : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
      }
    `}
  >
    {icon}
    <span>{label}</span>
    {count !== undefined && (
      <span className={`
        px-2 py-1 rounded-full text-xs font-bold
        ${active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}
      `}>
        {count}
      </span>
    )}
  </button>
);

const GamificationDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    user: gamificationUser, 
    userAchievements, 
    goals,
    initializeUser, 
    logActivity,
    isLoading 
  } = useGamificationStore();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'goals'>('overview');

  useEffect(() => {
    if (user?.id && !gamificationUser) {
      initializeUser(user.id);
    }
  }, [user?.id, gamificationUser, initializeUser]);

  useEffect(() => {
    // Log dashboard visit
    if (gamificationUser) {
      logActivity(ActivityAction.VIEW_ANALYTICS, { page: 'gamification' });
    }
  }, [gamificationUser, logActivity]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!gamificationUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to Points Companion Gamification!
          </h2>
          <p className="text-gray-600 mb-6">
            Start using the app to earn points, unlock achievements, and level up!
          </p>
        </div>
      </div>
    );
  }

  const completedAchievements = userAchievements.filter(ua => ua.isCompleted).length;
  const activeGoals = goals.filter(g => !g.isCompleted).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <AchievementToast />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gamification Hub
              </h1>
              <p className="text-gray-600">
                Track your progress, unlock achievements, and level up your rewards game!
              </p>
            </div>
            
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  Level {gamificationUser.level}
                </div>
                <div className="text-sm text-gray-500">Current Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {gamificationUser.totalPoints.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Points</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{gamificationUser.currentStreak}</div>
                <div className="text-orange-100">Day Streak</div>
                <div className="text-sm text-orange-200 mt-1">
                  Best: {gamificationUser.longestStreak} days
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{completedAchievements}</div>
                <div className="text-yellow-100">Achievements</div>
                <div className="text-sm text-yellow-200 mt-1">
                  Unlocked
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <Medal className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{activeGoals}</div>
                <div className="text-green-100">Active Goals</div>
                <div className="text-sm text-green-200 mt-1">
                  In Progress
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-8 p-1 bg-gray-100 rounded-lg"
        >
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={<Star className="w-4 h-4" />}
            label="Overview"
          />
          <TabButton
            active={activeTab === 'achievements'}
            onClick={() => setActiveTab('achievements')}
            icon={<Trophy className="w-4 h-4" />}
            label="Achievements"
            count={completedAchievements}
          />
          <TabButton
            active={activeTab === 'goals'}
            onClick={() => setActiveTab('goals')}
            icon={<Target className="w-4 h-4" />}
            label="Goals"
            count={activeGoals}
          />
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <GamificationOverview />}
          {activeTab === 'achievements' && <AchievementsGallery />}
          {activeTab === 'goals' && <GoalsProgress />}
        </motion.div>
      </div>
    </div>
  );
};

export default GamificationDashboard;
