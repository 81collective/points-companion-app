import TransactionTester from '../transactions/TransactionTester';
import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';


interface Transaction {
  id: string;
  amount: number;
  date: string;
  merchant: string;
  category: string;
  card_id: string;
}

interface SpendingData {
  month: string;
  dining: number;
  groceries: number;
  travel: number;
  gas: number;
  other: number;
}

interface CategoryTotal {
  name: string;
  value: number;
  color: string;
}

const CATEGORY_COLORS: { [key: string]: string } = {
  dining: '#FF6B6B',
  groceries: '#4ECDC4',
  travel: '#45B7D1',
  gas: '#96CEB4',
  other: '#FFEEAD',
};

export default function SpendingAnalysis() {
  const [monthlyData, setMonthlyData] = useState<SpendingData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryTotal[]>([]);
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const { data: transactions, error } = await supabase
          .from('transactions')
          .select('*')
          .gte('date', sixMonthsAgo.toISOString())
          .order('date', { ascending: true });

        if (error) throw error;

        // Process monthly data
        setMonthlyData(processMonthlyData(transactions));
        // Process category data
        setCategoryData(processCategoryData(transactions));
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        // no loading state
      }
    };
    fetchTransactions();
  }, [supabase]);

  function processMonthlyData(transactions: Transaction[]): SpendingData[] {
    const monthlySpending: { [key: string]: SpendingData } = {};
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      if (!monthlySpending[monthKey]) {
        monthlySpending[monthKey] = {
          month: monthKey,
          dining: 0,
          groceries: 0,
          travel: 0,
          gas: 0,
          other: 0,
        };
      }
      const category = tx.category.toLowerCase();
      if (["dining","groceries","travel","gas"].includes(category)) {
        (monthlySpending[monthKey][category as "dining"|"groceries"|"travel"|"gas"] as number) += Number(tx.amount);
      } else {
        (monthlySpending[monthKey].other as number) += Number(tx.amount);
      }
    });
    return Object.values(monthlySpending);
  }

  function processCategoryData(transactions: Transaction[]): CategoryTotal[] {
    const categoryTotals: { [key: string]: number } = {
      dining: 0,
      groceries: 0,
      travel: 0,
      gas: 0,
      other: 0,
    };
    transactions.forEach(tx => {
      const category = tx.category.toLowerCase();
      if (["dining","groceries","travel","gas"].includes(category)) {
        categoryTotals[category] += Number(tx.amount);
      } else {
        categoryTotals.other += Number(tx.amount);
      }
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: CATEGORY_COLORS[name],
    }));
  }

  return (
    <div>
      <div className="space-y-8">
        {/* Monthly Spending Trends */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Spending Trends</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="dining" fill={CATEGORY_COLORS.dining} name="Dining" />
                <Bar dataKey="groceries" fill={CATEGORY_COLORS.groceries} name="Groceries" />
                <Bar dataKey="travel" fill={CATEGORY_COLORS.travel} name="Travel" />
                <Bar dataKey="gas" fill={CATEGORY_COLORS.gas} name="Gas" />
                <Bar dataKey="other" fill={CATEGORY_COLORS.other} name="Other" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Category Breakdown</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    onMouseEnter={() => {/* highlight logic if needed */}}
                    onMouseLeave={() => {/* highlight logic if needed */}}
                  >
                    {categoryData.map((entry: CategoryTotal, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card Recommendations */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Optimize Your Categories</h3>
            <div className="space-y-4">
              {categoryData.filter(cat => cat.value > 0).map((category) => (
                <div key={category.name} className="p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-600">${Math.round(category.value).toLocaleString()} spent</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Potential for</p>
                      <span className="text-blue-600 font-semibold">Better rewards</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {categoryData.filter(cat => cat.value > 0).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg font-medium mb-2">No spending data yet</p>
                  <p className="text-sm">Add transactions to see personalized recommendations</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* AI Transaction Categorization Tester */}
      <div className="mt-12">
        <TransactionTester />
      </div>
    </div>
  );
}
