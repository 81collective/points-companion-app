'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Star, Medal, Award, Filter, Search } from 'lucide-react';
import { useGamificationStore } from '@/stores/gamificationStore';
import { Achievement, UserAchievement, AchievementCategory, AchievementRarity } from '@/types/gamification';

const AchievementCard: React.FC<{
  achievement: Achievement;
  userAchievement?: UserAchievement;
  isLocked?: boolean;
}> = ({ achievement, userAchievement, isLocked = false }) => {
  const getRarityColor = (rarity: AchievementRarity) => {
    switch (rarity) {
      case AchievementRarity.COMMON:
        return 'from-gray-400 to-gray-500';
      case AchievementRarity.UNCOMMON:
        return 'from-green-400 to-green-500';
      case AchievementRarity.RARE:
        return 'from-blue-400 to-blue-500';
      case AchievementRarity.EPIC:
        return 'from-purple-400 to-purple-500';
      case AchievementRarity.LEGENDARY:
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityBorder = (rarity: AchievementRarity) => {
    switch (rarity) {
      case AchievementRarity.COMMON:
        return 'border-gray-300';
      case AchievementRarity.UNCOMMON:
        return 'border-green-300';
      case AchievementRarity.RARE:
        return 'border-blue-300';
      case AchievementRarity.EPIC:
        return 'border-purple-300';
      case AchievementRarity.LEGENDARY:
        return 'border-yellow-300 shadow-lg shadow-yellow-200/50';
      default:
        return 'border-gray-300';
    }
  };

  const isCompleted = userAchievement?.isCompleted;
  const progress = userAchievement?.progress || 0;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative bg-white rounded-lg border-2 p-4 transition-all duration-200
        ${isCompleted ? getRarityBorder(achievement.rarity) : 'border-gray-200'}
        ${isLocked ? 'opacity-60' : 'hover:shadow-md'}
      `}
    >
      {/* Legendary glow effect */}
      {isCompleted && achievement.rarity === AchievementRarity.LEGENDARY && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-lg" />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <motion.div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center text-xl
                ${isCompleted 
                  ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white shadow-lg`
                  : isLocked 
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-gray-100 text-gray-600'
                }
              `}
              animate={isCompleted && achievement.rarity === AchievementRarity.LEGENDARY ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              {isLocked ? <Lock className="w-5 h-5" /> : achievement.icon}
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                {isLocked ? '???' : achievement.title}
              </h3>
              <p className={`text-sm ${isLocked ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                {isLocked ? 'Achievement locked' : achievement.description}
              </p>
            </div>
          </div>

          {isCompleted && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Trophy className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </div>

        {/* Progress Bar */}
        {!isLocked && !isCompleted && progress > 0 && (
          <div className="mb-3">
            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className={`text-sm font-medium ${isLocked ? 'text-gray-400' : 'text-gray-700'}`}>
                {isLocked ? '???' : `${achievement.points} points`}
              </span>
            </div>
          </div>

          <div className={`
            px-2 py-1 rounded-full text-xs font-medium capitalize
            ${isCompleted ? (
              achievement.rarity === AchievementRarity.LEGENDARY ? 'bg-yellow-100 text-yellow-800' :
              achievement.rarity === AchievementRarity.EPIC ? 'bg-purple-100 text-purple-800' :
              achievement.rarity === AchievementRarity.RARE ? 'bg-blue-100 text-blue-800' :
              achievement.rarity === AchievementRarity.UNCOMMON ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            ) : 'bg-gray-50 text-gray-500'}
          `}>
            {isLocked ? 'Locked' : achievement.rarity}
          </div>
        </div>

        {/* Unlock requirement */}
        {isLocked && achievement.requiredLevel && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Lock className="w-3 h-3" />
              <span>Requires Level {achievement.requiredLevel}</span>
            </div>
          </div>
        )}

        {/* Completion timestamp */}
        {isCompleted && userAchievement?.unlockedAt && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const AchievementsGallery: React.FC = () => {
  const { achievements, userAchievements, user } = useGamificationStore();
  const [filter, setFilter] = useState<'all' | 'completed' | 'locked' | AchievementCategory>('all');
  const [search, setSearch] = useState('');

  if (!user) return null;

  // Filter achievements
  const filteredAchievements = achievements.filter(achievement => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      if (!achievement.title.toLowerCase().includes(searchLower) &&
          !achievement.description.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Category/status filter
    if (filter === 'all') return true;
    if (filter === 'completed') {
      return userAchievements.some(ua => ua.achievementId === achievement.id && ua.isCompleted);
    }
    if (filter === 'locked') {
      return achievement.requiredLevel && user.level < achievement.requiredLevel;
    }
    return achievement.category === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>Achievements</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Unlock achievements by using the app and reaching milestones
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search achievements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All', icon: Award },
          { key: 'completed', label: 'Completed', icon: Trophy },
          { key: 'locked', label: 'Locked', icon: Lock },
          { key: AchievementCategory.ENGAGEMENT, label: 'Engagement', icon: Star },
          { key: AchievementCategory.OPTIMIZATION, label: 'Optimization', icon: Medal },
          { key: AchievementCategory.REWARDS, label: 'Rewards', icon: Award },
          { key: AchievementCategory.STREAKS, label: 'Streaks', icon: Filter }
        ].map((filterOption) => {
          const Icon = filterOption.icon;
          return (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as typeof filter)}
              className={`
                flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${filter === filterOption.key
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{filterOption.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg p-4">
          <div className="text-2xl font-bold">
            {userAchievements.filter(ua => ua.isCompleted).length}
          </div>
          <div className="text-yellow-100">Completed</div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4">
          <div className="text-2xl font-bold">
            {userAchievements.filter(ua => !ua.isCompleted && ua.progress > 0).length}
          </div>
          <div className="text-blue-100">In Progress</div>
        </div>
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg p-4">
          <div className="text-2xl font-bold">
            {achievements.filter(a => a.requiredLevel && user.level < a.requiredLevel).length}
          </div>
          <div className="text-gray-100">Locked</div>
        </div>
      </div>

      {/* Achievements Grid */}
      <AnimatePresence>
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredAchievements.map((achievement) => {
            const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
            const isLocked = Boolean(achievement.requiredLevel && user.level < achievement.requiredLevel);

            return (
              <motion.div
                key={achievement.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <AchievementCard
                  achievement={achievement}
                  userAchievement={userAchievement}
                  isLocked={isLocked}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No achievements found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsGallery;
