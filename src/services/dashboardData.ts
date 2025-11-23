import prisma from '@/lib/prisma';
import { DashboardDataResult } from '@/types/dashboard';

export async function fetchDashboardData(userId: string): Promise<DashboardDataResult> {
  const [cardCount, recentTransactions] = await Promise.all([
    prisma.creditCard.count({ where: { userId } }),
    prisma.transaction.findMany({
      where: { userId },
      select: { date: true, pointsEarned: true },
      orderBy: { date: 'desc' },
      take: 50
    })
  ]);

  const monthlyPoints = recentTransactions
    .filter((tx) => {
      const date = new Date(tx.date);
      const now = new Date();
      return date.getUTCFullYear() === now.getUTCFullYear() && date.getUTCMonth() === now.getUTCMonth();
    })
    .reduce((sum, tx) => sum + (tx.pointsEarned ?? 0), 0);

  const totalPoints = recentTransactions.reduce((sum, tx) => sum + (tx.pointsEarned ?? 0), 0);

  return {
    cardCount,
    totalPoints,
    monthlyPoints,
    recentActivityCount: recentTransactions.length
  };
}
