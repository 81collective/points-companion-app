import type { CategorizationResult } from '@/lib/transactionCategorizer';
import React, { useState } from 'react';
import { categorizeTransaction } from '@/lib/transactionCategorizer';
import CategorySelector from './CategorySelector';
import { getOptimalCardForCategory } from '@/lib/pointsCalculator';

export default function TransactionTester() {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [aiResult, setAIResult] = useState<CategorizationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    const amt = Number(amount) || 0;
    const result = await categorizeTransaction(merchant, amt, description);
    setAIResult(result);
    setLoading(false);
  };

  // Real-time categorization as user types merchant
  React.useEffect(() => {
    if (merchant.trim()) {
      handleTest();
    } else {
      setAIResult(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchant, amount, description]);

  return (
    <div className="p-6 bg-white rounded shadow max-w-lg mx-auto space-y-4">
      <h2 className="text-xl font-semibold mb-2">Test Transaction Categorization</h2>
      <div className="space-y-2">
        <input
          type="text"
          className="border rounded px-2 py-1 w-full"
          placeholder="Merchant name (e.g. Starbucks)"
          value={merchant}
          onChange={e => setMerchant(e.target.value)}
        />
        <input
          type="number"
          className="border rounded px-2 py-1 w-full"
          placeholder="Amount (optional)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <input
          type="text"
          className="border rounded px-2 py-1 w-full"
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      {loading && <div className="text-sm text-gray-500">Categorizing...</div>}
      {aiResult && (
        <div className="mt-4">
          <CategorySelector aiResult={aiResult} />
          <div className="mt-2 text-sm text-gray-700">
            <strong>Optimal Card:</strong> {getOptimalCardForCategory(aiResult.category)}
          </div>
        </div>
      )}
    </div>
  );
}
