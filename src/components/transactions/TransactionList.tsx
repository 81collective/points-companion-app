import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  merchant_name: string;
  category: string;
  transaction_date: string;
  recommended_card_id?: string;
  actual_card_used?: string;
  points_earned?: number;
  notes?: string;
  created_at: string;
}

export default function TransactionList({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<'date' | 'amount'>('date');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  useEffect(() => {
    async function fetchTransactions() {
      const supabase = createClient();
      let query = supabase.from('transactions').select('*').eq('user_id', userId);
      if (category) query = query.eq('category', category);
      if (search) query = query.ilike('merchant_name', `%${search}%`);
      query = query.order(sort === 'date' ? 'transaction_date' : 'amount', { ascending: false });
      query = query.range((page - 1) * pageSize, page * pageSize - 1);
      const { data } = await query;
      setTransactions(data || []);
    }
    fetchTransactions();
  }, [userId, search, category, sort, page, pageSize]);

  return (
    <div className="bg-white rounded shadow p-4">
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          className="border rounded px-2 py-1"
          placeholder="Search merchant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="border rounded px-2 py-1" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="dining">Dining</option>
          <option value="groceries">Groceries</option>
          <option value="travel">Travel</option>
          <option value="gas">Gas</option>
          <option value="other">Other</option>
        </select>
        <select className="border rounded px-2 py-1" value={sort} onChange={e => setSort(e.target.value as 'date' | 'amount')}>
          <option value="date">Date</option>
          <option value="amount">Amount</option>
        </select>
      </div>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Merchant</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Points</th>
            <th className="p-2 border">Notes</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id} className="border-b">
              <td className="p-2 border">{new Date(tx.transaction_date).toLocaleDateString()}</td>
              <td className="p-2 border">{tx.merchant_name}</td>
              <td className="p-2 border">{tx.category}</td>
              <td className="p-2 border">${tx.amount.toFixed(2)}</td>
              <td className="p-2 border">{tx.points_earned ?? '-'}</td>
              <td className="p-2 border">{tx.notes ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <button className="px-2 py-1 rounded bg-gray-200" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span>Page {page}</span>
        <button className="px-2 py-1 rounded bg-gray-200" disabled={transactions.length < pageSize} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}
