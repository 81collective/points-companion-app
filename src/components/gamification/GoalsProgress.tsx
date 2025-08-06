'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Calendar, CheckCircle, Trophy, X, Star } from 'lucide-react';
import { useGamificationStore } from '@/stores/gamificationStore';
import { GoalType, ProgressGoal } from '@/types/gamification';

const ProgressBar: React.FC<{ progress: number; className?: string }> = ({ progress, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <motion.div
      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(progress, 100)}%` }}
      transition={{ duration: 1, ease: "easeOut" }}
    />
  </div>
);

const GoalCard: React.FC<{ goal: ProgressGoal }> = ({ goal }) => {
  const { completeGoal } = useGamificationStore();

  const handleComplete = async () => {
    if (goal.progress >= 100 && !goal.isCompleted) {
      await completeGoal(goal.id);
    }
  };

  const timeLeft = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
  const isOverdue = timeLeft !== null && timeLeft < 0;
  const canComplete = goal.progress >= 100 && !goal.isCompleted;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        bg-white rounded-lg border-2 p-4 transition-all duration-200
        ${goal.isCompleted ? 'border-green-300 bg-green-50' : 
          canComplete ? 'border-blue-300 shadow-md' : 
          'border-gray-200 hover:border-gray-300'}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <motion.div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${goal.isCompleted ? 'bg-green-500 text-white' :
                canComplete ? 'bg-blue-500 text-white' :
                'bg-gray-100 text-gray-600'}
            `}
            animate={canComplete ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {goal.isCompleted ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Target className="w-5 h-5" />
            )}
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold ${goal.isCompleted ? 'text-green-700' : 'text-gray-900'}`}>
              {goal.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
          </div>
        </div>

        {goal.isCompleted && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
          >
            <Trophy className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="text-gray-600">
            {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()}
          </span>
          <span className={`font-medium ${goal.isCompleted ? 'text-green-600' : 'text-gray-700'}`}>
            {Math.round(goal.progress)}%
          </span>
        </div>
        <ProgressBar progress={goal.progress} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {goal.deadline && (
            <div className="flex items-center space-x-1 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className={`
                ${isOverdue ? 'text-red-600' : 
                  timeLeft !== null && timeLeft <= 3 ? 'text-orange-600' : 
                  'text-gray-600'}
              `}>
                {isOverdue ? `${Math.abs(timeLeft!)} days overdue` :
                 timeLeft !== null ? `${timeLeft} days left` :
                 'No deadline'}
              </span>
            </div>
          )}
          
          <div className="flex items-center space-x-1 text-sm">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-600">{goal.reward.points} points</span>
          </div>
        </div>

        {canComplete && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleComplete}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Complete Goal
          </motion.button>
        )}
      </div>

      {goal.isCompleted && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <div className="text-sm text-green-700">
            Completed on {new Date(goal.updatedAt).toLocaleDateString()}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const CreateGoalModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
}> = ({ isOpen, onClose }) => {
  const { createGoal } = useGamificationStore();
  const [formData, setFormData] = useState({
    type: GoalType.POINTS,
    title: '',
    description: '',
    targetValue: 0,
    deadline: '',
    rewardPoints: 50
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createGoal({
      type: formData.type,
      title: formData.title,
      description: formData.description,
      targetValue: formData.targetValue,
      currentValue: 0,
      progress: 0,
      isCompleted: false,
      deadline: formData.deadline || undefined,
      reward: {
        points: formData.rewardPoints
      }
    });

    onClose();
    setFormData({
      type: GoalType.POINTS,
      title: '',
      description: '',
      targetValue: 0,
      deadline: '',
      rewardPoints: 50
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Create New Goal</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as GoalType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={GoalType.POINTS}>Points</option>
                <option value={GoalType.SAVINGS}>Savings</option>
                <option value={GoalType.CARDS}>Cards</option>
                <option value={GoalType.TRANSACTIONS}>Transactions</option>
                <option value={GoalType.STREAK}>Streak</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Earn 1000 points"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describe your goal..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Value
              </label>
              <input
                type="number"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline (Optional)
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reward Points
              </label>
              <input
                type="number"
                value={formData.rewardPoints}
                onChange={(e) => setFormData({ ...formData, rewardPoints: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Goal
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const GoalsProgress: React.FC = () => {
  const { goals } = useGamificationStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredGoals = goals.filter(goal => {
    switch (filter) {
      case 'active':
        return !goal.isCompleted;
      case 'completed':
        return goal.isCompleted;
      default:
        return true;
    }
  });

  const activeGoals = goals.filter(g => !g.isCompleted).length;
  const completedGoals = goals.filter(g => g.isCompleted).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Target className="w-6 h-6 text-green-500" />
            <span>Goals & Progress</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Set and track personal goals to stay motivated
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Goal</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-4">
          <div className="text-2xl font-bold">{activeGoals}</div>
          <div className="text-blue-100">Active Goals</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-4">
          <div className="text-2xl font-bold">{completedGoals}</div>
          <div className="text-green-100">Completed Goals</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {[
          { key: 'all', label: 'All Goals' },
          { key: 'active', label: 'Active' },
          { key: 'completed', label: 'Completed' }
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key as typeof filter)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${filter === filterOption.key
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Goals List */}
      <AnimatePresence>
        <div className="space-y-4">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </AnimatePresence>

      {filteredGoals.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="mb-4">
            {filter === 'all' ? 'No goals created yet.' : `No ${filter} goals found.`}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first goal
            </button>
          )}
        </div>
      )}

      {/* Create Goal Modal */}
      <CreateGoalModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default GoalsProgress;
