import React, { useState } from 'react';
import type { Category } from '@/types/rewards';
import type { CategorizationResult } from '@/lib/transactionCategorizer';

const CATEGORY_LABELS: Record<Category, string> = {
  dining: 'Dining',
  groceries: 'Groceries',
  travel: 'Travel',
  gas: 'Gas',
  other: 'Other',
};

interface CategorySelectorProps {
  aiResult: CategorizationResult;
  onOverride?: (category: Category) => void;
  onFeedback?: (feedback: string) => void;
}

export default function CategorySelector({ aiResult, onOverride, onFeedback }: CategorySelectorProps) {
  const [selected, setSelected] = useState<Category>(aiResult.category);
  const [feedback, setFeedback] = useState('');

  const handleOverride = (cat: Category) => {
    setSelected(cat);
    onOverride?.(cat);
  };

  const handleFeedback = () => {
    if (feedback.trim()) {
      onFeedback?.(feedback);
      setFeedback('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-medium">AI Suggestion:</span>
        <span className="px-2 py-1 rounded bg-gray-100 text-gray-800">
          {CATEGORY_LABELS[aiResult.category]}
        </span>
        <span className="text-xs text-gray-500">Confidence: {(aiResult.confidence * 100).toFixed(0)}%</span>
      </div>
      {aiResult.reasoning && (
        <div className="text-xs text-gray-500">Reasoning: {aiResult.reasoning}</div>
      )}
      <div className="flex gap-2 mt-2">
        {Object.keys(CATEGORY_LABELS).map(cat => (
          <button
            key={cat}
            className={`px-3 py-1 rounded border ${selected === cat ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
            onClick={() => handleOverride(cat as Category)}
          >
            {CATEGORY_LABELS[cat as Category]}
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2 items-center">
        <input
          type="text"
          className="border rounded px-2 py-1 text-sm"
          placeholder="Feedback to improve categorization..."
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
        />
        <button
          className="px-2 py-1 rounded bg-primary text-white text-sm"
          onClick={handleFeedback}
        >
          Send Feedback
        </button>
      </div>
    </div>
  );
}
