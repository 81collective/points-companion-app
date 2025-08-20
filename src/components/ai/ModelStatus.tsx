import React, { useState } from 'react';
import { useModelAccess } from '@/hooks/useModelAccess';
import { UpgradeModal } from './UpgradeModal';

interface ModelStatusProps {
  className?: string;
}

export function ModelStatus({ className = '' }: ModelStatusProps) {
  const { bestModel, subscription, loading } = useModelAccess();

  if (loading) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        Loading model info...
      </div>
    );
  }

  if (!bestModel || !subscription) {
    return null;
  }

  const planColors = {
    free: 'text-gray-600',
    basic: 'text-blue-600',
    premium: 'text-purple-600',
    enterprise: 'text-gold-600'
  };

  const planColor = planColors[subscription.plan] || 'text-gray-600';

  return (
    <div className={`text-xs ${className}`}>
      <span className="text-gray-500">Model: </span>
      <span className={`font-medium ${planColor}`}>
        {bestModel.displayName}
      </span>
      {subscription.plan !== 'free' && (
        <>
          <span className="text-gray-400 mx-1">•</span>
          <span className={`${planColor} capitalize`}>
            {subscription.plan} Plan
          </span>
        </>
      )}
    </div>
  );
}

interface UpgradePromptProps {
  className?: string;
}

export function UpgradePrompt({ className = '' }: UpgradePromptProps) {
  const { modelAccess, subscription, refresh } = useModelAccess();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!modelAccess || subscription?.plan !== 'free') {
    return null;
  }

  const unavailableModels = modelAccess.models.filter(m => !m.isAvailable);
  
  if (unavailableModels.length === 0) {
    return null;
  }

  const handleUpgrade = async (plan: string) => {
    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      
      if (!response.ok) {
        throw new Error('Upgrade failed');
      }
      
      // Refresh the model access information
      await refresh();
      
      // Show success message (in a real app, you might want a toast notification)
      alert(`Successfully upgraded to ${plan} plan! New AI models are now available.`);
      
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Upgrade failed. Please try again.');
    }
  };

  return (
    <>
      <div className={`p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg ${className}`}>
        <div className="text-sm font-medium text-purple-800 mb-1">
          🚀 Unlock Advanced AI Models
        </div>
        <div className="text-xs text-purple-600 mb-2">
          Get access to more powerful models with better reasoning:
        </div>
        <div className="space-y-1">
          {unavailableModels.slice(0, 2).map(model => (
            <div key={model.model} className="text-xs text-gray-600">
              <span className="font-medium">{model.displayName}</span>
              <span className="text-purple-600 ml-1">({model.requiredPlan})</span>
            </div>
          ))}
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-2 text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
        >
          Upgrade Plan →
        </button>
      </div>
      
      <UpgradeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpgrade={handleUpgrade}
      />
    </>
  );
}