"use client";
import React, { useState } from 'react';
import TransactionList from '@/components/transactions/TransactionList';
import { useAuth } from '@/contexts/AuthContext';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);

  async function handleCsvImport() {
    if (!csvFile || !user?.id) return;
    setImporting(true);
    setImportError(null);
    try {
      const text = await csvFile.text();
      const rows = text
        .split('\n')
        .slice(1)
        .map(r => r.split(','))
        .filter(cells => cells.length >= 4);

      for (const [amount, merchantName, category, transactionDate, pointsEarned, notes] of rows) {
        const parsedAmount = Number(amount);
        if (Number.isNaN(parsedAmount)) continue;
        const parsedDate = new Date(transactionDate || Date.now());
        if (Number.isNaN(parsedDate.getTime())) continue;

        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            amount: parsedAmount,
            merchantName: merchantName?.trim() || 'Unknown merchant',
            category: category?.trim() || 'other',
            date: parsedDate.toISOString(),
            pointsEarned: pointsEarned ? Number(pointsEarned) : null,
            description: notes?.trim() || null
          })
        });

        if (!response.ok) {
          const details = await response.json().catch(() => ({}));
          throw new Error(details?.error || 'Transaction import failed');
        }
      }

      setRefreshKey(prev => prev + 1);
      setCsvFile(null);
    } catch (error) {
      console.error('CSV import failed', error);
      setImportError('Failed to import CSV. Please verify the file format.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="page-container py-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">Transactions</h1>
      <div className="surface p-4 mb-6 flex flex-col sm:flex-row gap-4 sm:items-center">
        <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} className="text-sm" />
        <button
          className="btn-minimal btn-accent text-sm"
          disabled={!csvFile || importing}
          onClick={handleCsvImport}
        >
          {importing ? 'Importing…' : 'Import CSV'}
        </button>
        {importError && <p className="text-sm text-red-600">{importError}</p>}
      </div>
      <div className="surface p-4 surface-hover">
        <TransactionList key={refreshKey} />
      </div>
    </div>
  );
}
