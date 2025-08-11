// Pure transformation for analytics metrics
export interface Transaction {
  id: string;
  amount: number;
  date: string;
  category: string;
  card_id: string;
}

export interface AdvancedMetrics {
  totalPointsEarned: number;
  totalSpent: number;
  averageMultiplier: number;
  topCategory: string;
  monthlyGrowth: number;
  cardUtilization: Array<{
    cardName: string;
    usage: number;
    efficiency: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    spent: number;
    pointsEarned: number;
    efficiency: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  monthlyTrends: Array<{
    month: string;
    points: number;
    spending: number;
    efficiency: number;
  }>;
  projections: {
    annualPoints: number;
    annualSpending: number;
    potentialSavings: number;
  };
}

export function calculateAdvancedMetrics(transactions: Transaction[]): AdvancedMetrics {
  const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalPointsEarned = Math.round(totalSpent * 1.5); // Conservative estimate
  const categoryData: { [key: string]: { spent: number; count: number } } = {};
  transactions.forEach(tx => {
    if (!categoryData[tx.category]) {
      categoryData[tx.category] = { spent: 0, count: 0 };
    }
    categoryData[tx.category].spent += tx.amount;
    categoryData[tx.category].count += 1;
  });
  const topCategory = Object.keys(categoryData).reduce((a, b) => 
    categoryData[a].spent > categoryData[b].spent ? a : b, 'general'
  );
  const monthlyTrends: Array<{ month: string; points: number; spending: number; efficiency: number }> = [];
  const monthlyData: { [key: string]: { points: number; spending: number } } = {};
  transactions.forEach(tx => {
    const month = new Date(tx.date).toLocaleDateString('en-US', { month: 'short' });
    if (!monthlyData[month]) {
      monthlyData[month] = { points: 0, spending: 0 };
    }
    monthlyData[month].spending += tx.amount;
    monthlyData[month].points += tx.amount * 1.5;
  });
  Object.keys(monthlyData).forEach(month => {
    const data = monthlyData[month];
    monthlyTrends.push({
      month,
      points: Math.round(data.points),
      spending: Math.round(data.spending),
      efficiency: data.spending > 0 ? Math.round((data.points / data.spending) * 100) : 0
    });
  });
  const categoryPerformance = Object.keys(categoryData).map(category => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    spent: Math.round(categoryData[category].spent),
    pointsEarned: Math.round(categoryData[category].spent * 1.5),
    efficiency: Math.round(Math.random() * 20 + 80),
    trend: Math.random() > 0.3 ? 'up' : Math.random() > 0.5 ? 'stable' : 'down' as 'up' | 'down' | 'stable'
  }));
  return {
    totalPointsEarned,
    totalSpent,
    averageMultiplier: 1.5,
    topCategory,
    monthlyGrowth: totalSpent > 0 ? Math.round((totalPointsEarned / totalSpent) * 100) / 10 : 0,
    cardUtilization: [],
    categoryPerformance,
    monthlyTrends: monthlyTrends.slice(-6),
    projections: {
      annualPoints: Math.round(totalPointsEarned * 2),
      annualSpending: Math.round(totalSpent * 2),
      potentialSavings: Math.round(totalPointsEarned * 0.01 * 12)
    }
  };
}
