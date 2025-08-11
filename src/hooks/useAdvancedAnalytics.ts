import { useQuery } from '@tanstack/react-query';
import { calculateAdvancedMetrics, AdvancedMetrics, Transaction } from '../lib/analyticsTransform';

// Replace with your actual data fetcher
async function fetchTransactions(): Promise<Transaction[]> {
  // Example: fetch from API or Supabase
  const res = await fetch('/api/transactions');
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export function useAdvancedAnalytics() {
  return useQuery<AdvancedMetrics, Error>({
    queryKey: ['advanced-analytics'],
    queryFn: async () => {
      const transactions = await fetchTransactions();
      return calculateAdvancedMetrics(transactions);
    },
    staleTime: 1000 * 60 * 5,
  });
}
