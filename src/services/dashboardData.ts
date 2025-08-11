import { createClient } from '@/lib/supabase';
import { DashboardDataResult } from '@/types/dashboard';

export async function fetchDashboardData(userId: string): Promise<DashboardDataResult> {
  const supabase = createClient();

  const [{ count: cardCount }, { data: txData }] = await Promise.all([
    supabase.from('credit_cards').select('*', { head: true, count: 'exact' }).eq('user_id', userId),
    supabase.from('transactions').select('amount, date, points_earned').eq('user_id', userId).order('date', { ascending: false }).limit(50)
  ]);

  const recent = txData || [];
  const monthlyPoints = recent
    .filter(r => {
      const d = new Date(r.date);
      const now = new Date();
      return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth();
    })
    .reduce((sum, r) => sum + (r.points_earned || 0), 0);

  const totalPoints = recent.reduce((sum, r) => sum + (r.points_earned || 0), 0);

  return {
    cardCount: cardCount || 0,
    totalPoints,
    monthlyPoints,
    recentActivityCount: recent.length,
  };
}
