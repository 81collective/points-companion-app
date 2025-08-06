'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, X } from 'lucide-react';
import { useGamificationStore } from '@/stores/gamificationStore';
import { AchievementRarity } from '@/types/gamification';

const AchievementToast: React.FC = () => {
  const { showAchievementToast, pendingAchievements, dismissAchievementToast } = useGamificationStore();

  useEffect(() => {
    if (showAchievementToast && pendingAchievements.length > 0) {
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        dismissAchievementToast();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showAchievementToast, pendingAchievements.length, dismissAchievementToast]);

  if (!showAchievementToast || pendingAchievements.length === 0) {
    return null;
  }

  const achievement = pendingAchievements[0].achievement;
  if (!achievement) return null;

  const getRarityColor = (rarity: AchievementRarity) => {
    switch (rarity) {
      case AchievementRarity.COMMON:
        return 'from-gray-500 to-gray-600';
      case AchievementRarity.UNCOMMON:
        return 'from-green-500 to-green-600';
      case AchievementRarity.RARE:
        return 'from-blue-500 to-blue-600';
      case AchievementRarity.EPIC:
        return 'from-purple-500 to-purple-600';
      case AchievementRarity.LEGENDARY:
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: AchievementRarity) => {
    switch (rarity) {
      case AchievementRarity.COMMON:
        return 'border-gray-400';
      case AchievementRarity.UNCOMMON:
        return 'border-green-400';
      case AchievementRarity.RARE:
        return 'border-blue-400';
      case AchievementRarity.EPIC:
        return 'border-purple-400';
      case AchievementRarity.LEGENDARY:
        return 'border-yellow-400 shadow-yellow-400/50';
      default:
        return 'border-gray-400';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.8 }}
        className="fixed top-4 right-4 z-50 max-w-sm"
      >
        <motion.div
          className={`
            relative bg-white rounded-lg shadow-2xl border-2 overflow-hidden
            ${getRarityBorder(achievement.rarity)}
          `}
          initial={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          animate={{ 
            boxShadow: achievement.rarity === AchievementRarity.LEGENDARY 
              ? '0 20px 25px -5px rgba(251, 191, 36, 0.3), 0 10px 10px -5px rgba(251, 191, 36, 0.1)'
              : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          {/* Gradient Background */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${getRarityColor(achievement.rarity)} opacity-5`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
          />
          
          {/* Sparkles for Legendary */}
          {achievement.rarity === AchievementRarity.LEGENDARY && (
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.random() * 200,
                    y: Math.random() * 100
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          )}

          <div className="relative p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  className="text-2xl"
                >
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </motion.div>
                <span className="text-sm font-medium text-yellow-600 uppercase tracking-wide">
                  Achievement Unlocked!
                </span>
              </div>
              
              <button
                onClick={dismissAchievementToast}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Achievement Content */}
            <div className="flex items-start space-x-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`
                  w-12 h-12 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)}
                  flex items-center justify-center text-white text-xl shadow-lg
                `}
              >
                {achievement.icon}
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <motion.h3
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg font-semibold text-gray-900 truncate"
                >
                  {achievement.title}
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-gray-600 mt-1"
                >
                  {achievement.description}
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center space-x-2 mt-2"
                >
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      +{achievement.points} points
                    </span>
                  </div>
                  
                  <div className={`
                    px-2 py-1 rounded-full text-xs font-medium capitalize
                    ${achievement.rarity === AchievementRarity.LEGENDARY ? 'bg-yellow-100 text-yellow-800' :
                      achievement.rarity === AchievementRarity.EPIC ? 'bg-purple-100 text-purple-800' :
                      achievement.rarity === AchievementRarity.RARE ? 'bg-blue-100 text-blue-800' :
                      achievement.rarity === AchievementRarity.UNCOMMON ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  `}>
                    {achievement.rarity}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementToast;
