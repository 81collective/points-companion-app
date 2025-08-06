'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Target, TrendingUp, Award } from 'lucide-react';
import { useGamificationStore } from '@/stores/gamificationStore';
import { LEVEL_SYSTEM } from '@/types/gamification';

const LevelProgressBar: React.FC = () => {
  const { user, getLevel, getExperienceProgress } = useGamificationStore();
  
  if (!user) return null;

  const currentLevel = getLevel();
  const progress = getExperienceProgress();
  const levelInfo = LEVEL_SYSTEM.find(l => l.level === currentLevel);
  const nextLevelInfo = LEVEL_SYSTEM.find(l => l.level === currentLevel + 1);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Level {currentLevel} - {levelInfo?.title}
            </h3>
            <p className="text-xs text-gray-500">{levelInfo?.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">{user.totalPoints.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Total Points</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600">
            {progress.current.toLocaleString()} / {progress.required.toLocaleString()} XP
          </span>
          <span className="text-gray-600">
            {nextLevelInfo ? `Next: ${nextLevelInfo.title}` : 'Max Level!'}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        
        <div className="text-xs text-center text-gray-600">
          {progress.percentage.toFixed(1)}% to next level
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
}> = ({ icon, title, value, subtitle, color }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
  >
    <div className="flex items-center space-x-3">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm font-medium text-gray-700">{title}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>
    </div>
  </motion.div>
);

const GamificationOverview: React.FC = () => {
  const { user, userAchievements, activityLog, goals } = useGamificationStore();

  if (!user) return null;

  const completedAchievements = userAchievements.filter(ua => ua.isCompleted).length;
  const completedGoals = goals.filter(g => g.isCompleted).length;
  const todayActivities = activityLog.filter(log => {
    const today = new Date().toDateString();
    const logDate = new Date(log.timestamp).toDateString();
    return today === logDate;
  }).length;

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <LevelProgressBar />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Zap className="w-5 h-5 text-white" />}
          title="Current Streak"
          value={user.currentStreak}
          subtitle={`Best: ${user.longestStreak} days`}
          color="bg-gradient-to-r from-orange-500 to-red-600"
        />
        
        <StatCard
          icon={<Award className="w-5 h-5 text-white" />}
          title="Achievements"
          value={completedAchievements}
          subtitle="Unlocked"
          color="bg-gradient-to-r from-yellow-500 to-orange-600"
        />
        
        <StatCard
          icon={<Target className="w-5 h-5 text-white" />}
          title="Goals"
          value={completedGoals}
          subtitle="Completed"
          color="bg-gradient-to-r from-green-500 to-emerald-600"
        />
        
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          title="Today&apos;s Activity"
          value={todayActivities}
          subtitle="Actions"
          color="bg-gradient-to-r from-blue-500 to-indigo-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Star className="w-5 h-5 text-blue-500" />
          <span>Recent Activity</span>
        </h3>
        
        {activityLog.length > 0 ? (
          <div className="space-y-3">
            {activityLog.slice(0, 5).map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {activity.action.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-green-600">
                  +{activity.points} pts
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No activities yet. Start using the app to earn points!
          </div>
        )}
      </div>
    </div>
  );
};

export default GamificationOverview;
