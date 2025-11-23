// Lightweight realtime simulator for examples. Generates predictable data without Supabase.
// These helpers should only be used inside /examples — production code should supply a real backend.

export type DemoTransaction = {
  id: string;
  amount: number;
  date: string;
  category: string;
  merchant_name: string;
  card_id?: string;
};

export type DemoLoyaltyAccount = {
  id: string;
  program_name: string;
  points: number;
};

export type DemoNotification = {
  id: string;
  type: 'spending_alert' | 'bonus_opportunity' | 'card_recommendation' | 'reward_milestone' | 'system_update';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  created_at: string;
};

export type DemoMetric = {
  id: string;
  metric_name: string;
  current_value: number;
  previous_value: number;
  change_percentage: number;
  last_updated: string;
};

export type DemoBudget = {
  category: string;
  amount: number;
};

export type DemoSpendingAlert = {
  id: string;
  type: 'budget_warning' | 'category_limit' | 'unusual_spending' | 'bonus_progress';
  threshold_amount: number;
  current_amount: number;
  category?: string;
  card_id?: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  created_at: string;
};

const seedTransactions: DemoTransaction[] = [
  { id: 't1', amount: 89.5, date: daysAgo(1), category: 'dining', merchant_name: 'Whole Foods' },
  { id: 't2', amount: 42.75, date: daysAgo(2), category: 'dining', merchant_name: 'Shake Shack' },
  { id: 't3', amount: 132.1, date: daysAgo(3), category: 'travel', merchant_name: 'Delta Airlines' },
  { id: 't4', amount: 68.0, date: daysAgo(0), category: 'groceries', merchant_name: 'Trader Joe\'s' },
  { id: 't5', amount: 210.25, date: daysAgo(5), category: 'shopping', merchant_name: 'Apple Store' },
  { id: 't6', amount: 35.0, date: daysAgo(0), category: 'dining', merchant_name: 'Blue Bottle Coffee' }
];

const seedLoyalty: DemoLoyaltyAccount[] = [
  { id: 'l1', program_name: 'Chase Ultimate Rewards', points: 48210 },
  { id: 'l2', program_name: 'Marriott Bonvoy', points: 35500 }
];

const seedNotifications: DemoNotification[] = [
  {
    id: 'n1',
    type: 'card_recommendation',
    title: 'Optimize dining rewards',
    message: 'You could earn 3x on dining with Sapphire Preferred.',
    priority: 'medium',
    read: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'n2',
    type: 'bonus_opportunity',
    title: 'Limited time grocery bonus',
    message: 'Earn an extra 5% on groceries this weekend.',
    priority: 'high',
    read: false,
    created_at: daysAgo(0)
  }
];

const seedMetrics: DemoMetric[] = [
  { id: 'm1', metric_name: 'Monthly Spending', current_value: 2847.5, previous_value: 2500, change_percentage: 13.9, last_updated: new Date().toISOString() },
  { id: 'm2', metric_name: 'Active Cards', current_value: 8, previous_value: 8, change_percentage: 0, last_updated: new Date().toISOString() },
  { id: 'm3', metric_name: 'Points Earned', current_value: 45820, previous_value: 43000, change_percentage: 6.5, last_updated: new Date().toISOString() }
];

const seedBudgets: DemoBudget[] = [
  { category: 'dining', amount: 600 },
  { category: 'groceries', amount: 500 },
  { category: 'travel', amount: 800 }
];

const seedAlerts: DemoSpendingAlert[] = [
  {
    id: 'a1',
    type: 'budget_warning',
    threshold_amount: 500,
    current_amount: 520,
    category: 'dining',
    message: 'Dining budget exceeded by $20.',
    severity: 'warning',
    created_at: new Date().toISOString()
  }
];

export function getDemoTransactions(limit?: number, since?: Date) {
  let data = [...seedTransactions];
  if (since) {
    data = data.filter((tx) => new Date(tx.date) >= since);
  }
  if (limit) {
    data = data.slice(0, limit);
  }
  return data;
}

export function getDemoLoyaltyAccounts() {
  return [...seedLoyalty];
}

export function getDemoNotifications(limit = 20) {
  return [...seedNotifications].slice(0, limit);
}

export function getDemoMetrics() {
  return [...seedMetrics];
}

export function getDemoBudgets() {
  return [...seedBudgets];
}

export function getDemoAlerts() {
  return [...seedAlerts];
}

export interface DemoRealtimeHandlers {
  onTransaction?: (tx: DemoTransaction) => void;
  onLoyaltyUpdate?: (account: DemoLoyaltyAccount, delta: number) => void;
  onNotification?: (notification: DemoNotification) => void;
}

export function startDemoRealtime(handlers: DemoRealtimeHandlers) {
  const timers: Array<ReturnType<typeof setInterval>> = [];

  if (handlers.onTransaction) {
    timers.push(setInterval(() => {
      const tx = randomTransaction();
      handlers.onTransaction?.(tx);
    }, 7000));
  }

  if (handlers.onLoyaltyUpdate) {
    timers.push(setInterval(() => {
      const account = pickRandom(seedLoyalty);
      const delta = Math.floor(Math.random() * 400 + 50);
      account.points += delta;
      handlers.onLoyaltyUpdate?.({ ...account }, delta);
    }, 11000));
  }

  if (handlers.onNotification) {
    timers.push(setInterval(() => {
      const notif = {
        id: `demo_${Date.now()}`,
        type: 'system_update' as const,
        title: 'Demo realtime ping',
        message: 'Replace startDemoRealtime with your realtime provider.',
        priority: 'low' as const,
        read: false,
        created_at: new Date().toISOString()
      } satisfies DemoNotification;
      handlers.onNotification?.(notif);
    }, 15000));
  }

  return () => {
    timers.forEach((timer) => clearInterval(timer));
  };
}

function randomTransaction(): DemoTransaction {
  const base = pickRandom(seedTransactions);
  const variance = (Math.random() * 40 - 20);
  const amount = Math.max(5, base.amount + variance);
  return {
    ...base,
    id: `tx_${Date.now()}`,
    amount,
    date: new Date().toISOString()
  };
}

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function daysAgo(delta: number) {
  const date = new Date();
  date.setDate(date.getDate() - delta);
  return date.toISOString();
}
