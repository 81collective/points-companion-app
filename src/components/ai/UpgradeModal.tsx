import React, { useState } from 'react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: string) => Promise<void>;
}

export function UpgradeModal({ isOpen, onClose, onUpgrade }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$9/month',
      features: ['GPT-4o Mini access', 'Faster responses', 'Priority support'],
      models: ['gpt-3.5-turbo', 'gpt-4o-mini']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$19/month',
      features: ['All Basic features', 'GPT-4o access', 'o1 Mini reasoning', 'Advanced strategies'],
      models: ['gpt-3.5-turbo', 'gpt-4o-mini', 'gpt-4o', 'o1-mini'],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$49/month',
      features: ['All Premium features', 'o1 Preview access', 'Custom training', 'White-glove support'],
      models: ['gpt-3.5-turbo', 'gpt-4o-mini', 'gpt-4o', 'o1-mini', 'o1-preview']
    }
  ];

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    
    setIsUpgrading(true);
    try {
      await onUpgrade(selectedPlan);
      onClose();
    } catch (error) {
      console.error('Upgrade failed:', error);
      // Handle error - in a real app, show error message
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all relative ${
                  selectedPlan === plan.id 
                    ? 'border-purple-600 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <div className="text-2xl font-bold text-purple-600 mb-4">{plan.price}</div>
                  
                  <div className="space-y-2 mb-4">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="text-sm text-gray-600">✓ {feature}</div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="text-xs text-gray-500 mb-1">Available Models:</div>
                    {plan.models.map((model, i) => (
                      <div key={i} className="text-xs text-gray-700">
                        {model}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button 
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              disabled={isUpgrading}
            >
              Cancel
            </button>
            <button 
              onClick={handleUpgrade}
              disabled={!selectedPlan || isUpgrading}
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {isUpgrading ? 'Upgrading...' : `Upgrade to ${plans.find(p => p.id === selectedPlan)?.name}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}