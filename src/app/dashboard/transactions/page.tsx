"use client";
import React, { useState } from 'react';
import TransactionList from '@/components/transactions/TransactionList';
import { createClient } from '@/lib/supabase';

export default function TransactionsPage() {
  const [userId, setUserId] = useState<string>('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  React.useEffect(() => {
    async function getUserId() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || '');
    }
    getUserId();
  }, []);

  async function handleCsvImport() {
    if (!csvFile || !userId) return;
    setImporting(true);
    const text = await csvFile.text();
    // Parse CSV and insert transactions
    // (Assume columns: amount,merchant_name,category,transaction_date,points_earned,notes)
    const rows = text.split('\n').slice(1).map(r => r.split(','));
    const supabase = createClient();
    const inserts = rows.map(([amount, merchant_name, category, transaction_date, points_earned, notes]) => ({
      user_id: userId,
      amount: parseFloat(amount),
      merchant_name,
      category,
      transaction_date,
      points_earned: points_earned ? parseInt(points_earned) : null,
      notes,
    }));
    await supabase.from('transactions').insert(inserts);
    setImporting(false);
    setCsvFile(null);
    // Optionally refresh list
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Transactions</h1>
        <div className="mb-6 flex gap-4 items-center">
          <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
          <button
            className="px-4 py-2 bg-primary text-white rounded"
            disabled={!csvFile || importing}
            onClick={handleCsvImport}
          >
            {importing ? 'Importing...' : 'Import CSV'}
          </button>
        </div>
        <TransactionList />
        {/* TODO: Add edit/delete/bulk actions UI */}
      </main>
    </div>
  );
}
