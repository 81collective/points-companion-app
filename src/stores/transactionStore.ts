import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Transaction,
  CSVImportSession,
  TransactionFilter,
  TransactionStats,
  DuplicateTransaction,
  TransactionBulkEdit,
  ImportStatus,
  DuplicateAction
} from '@/types/transactions';

interface TransactionStore {
  // State
  transactions: Transaction[];
  // Removed Plaid accounts in pre-Plaid baseline
  csvImportSessions: CSVImportSession[];
  duplicates: DuplicateTransaction[];
  isLoading: boolean;
  error: string | null;
  filter: TransactionFilter;
  selectedTransactions: string[];
  
  // Transaction Management
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  bulkEditTransactions: (edit: TransactionBulkEdit) => void;
  
  // CSV Import
  createCSVImportSession: (filename: string, fileSize: number) => string;
  updateCSVImportSession: (sessionId: string, updates: Partial<CSVImportSession>) => void;
  getCSVImportSession: (sessionId: string) => CSVImportSession | undefined;
  
  // Plaid integration removed
  
  // Filtering & Search
  setFilter: (filter: Partial<TransactionFilter>) => void;
  clearFilter: () => void;
  getFilteredTransactions: () => Transaction[];
  
  // Selection
  selectTransaction: (id: string) => void;
  deselectTransaction: (id: string) => void;
  selectAllTransactions: () => void;
  clearSelection: () => void;
  
  // Duplicate Detection
  detectDuplicates: (newTransactions: Transaction[]) => void;
  resolveDuplicate: (index: number, action: 'skip' | 'merge' | 'create_new') => void;
  
  // Analytics
  getTransactionStats: (dateRange?: { start: string; end: string }) => TransactionStats;
  
  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  transactions: [],
  // plaidAccounts removed
  csvImportSessions: [],
  duplicates: [],
  isLoading: false,
  error: null,
  filter: {},
  selectedTransactions: []
};

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Transaction Management
      addTransaction: (transactionData) => {
        const transaction: Transaction = {
          ...transactionData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set((state) => ({
          transactions: [...state.transactions, transaction]
        }));
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === id
              ? { ...transaction, ...updates, updatedAt: new Date().toISOString() }
              : transaction
          )
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((transaction) => transaction.id !== id),
          selectedTransactions: state.selectedTransactions.filter((selectedId) => selectedId !== id)
        }));
      },

      bulkEditTransactions: ({ transactionIds, updates }) => {
        set((state) => ({
          transactions: state.transactions.map((transaction) =>
            transactionIds.includes(transaction.id)
              ? { ...transaction, ...updates, updatedAt: new Date().toISOString() }
              : transaction
          )
        }));
      },

      // CSV Import
      createCSVImportSession: (filename, fileSize) => {
        const sessionId = crypto.randomUUID();
        const session: CSVImportSession = {
          id: sessionId,
          userId: 'current-user', // Replace with actual user ID
          filename,
          fileSize,
          totalRows: 0,
          processedRows: 0,
          successfulRows: 0,
          errorRows: 0,
          errors: [],
          mapping: {
            date: '',
            amount: '',
            description: ''
          },
          status: ImportStatus.PENDING,
          previewData: [],
          finalData: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set((state) => ({
          csvImportSessions: [...state.csvImportSessions, session]
        }));

        return sessionId;
      },

      updateCSVImportSession: (sessionId, updates) => {
        set((state) => ({
          csvImportSessions: state.csvImportSessions.map((session) =>
            session.id === sessionId
              ? { ...session, ...updates, updatedAt: new Date().toISOString() }
              : session
          )
        }));
      },

      getCSVImportSession: (sessionId) => {
        return get().csvImportSessions.find((session) => session.id === sessionId);
      },

  // Plaid integration removed

      // Filtering & Search
      setFilter: (newFilter) => {
        set((state) => ({
          filter: { ...state.filter, ...newFilter }
        }));
      },

      clearFilter: () => {
        set({ filter: {} });
      },

      getFilteredTransactions: () => {
        const { transactions, filter } = get();
        
        return transactions.filter((transaction) => {
          // Date range filter
          if (filter.dateRange) {
            const transactionDate = new Date(transaction.date);
            const startDate = new Date(filter.dateRange.start);
            const endDate = new Date(filter.dateRange.end);
            if (transactionDate < startDate || transactionDate > endDate) {
              return false;
            }
          }

          // Amount range filter
          if (filter.amountRange) {
            if (transaction.amount < filter.amountRange.min || transaction.amount > filter.amountRange.max) {
              return false;
            }
          }

          // Categories filter
          if (filter.categories && filter.categories.length > 0) {
            if (!filter.categories.includes(transaction.category)) {
              return false;
            }
          }

          // Merchants filter
          if (filter.merchants && filter.merchants.length > 0) {
            if (!transaction.merchantName || !filter.merchants.includes(transaction.merchantName)) {
              return false;
            }
          }

          // Sources filter
          if (filter.sources && filter.sources.length > 0) {
            if (!filter.sources.includes(transaction.source)) {
              return false;
            }
          }

          // Search query filter
          if (filter.searchQuery) {
            const query = filter.searchQuery.toLowerCase();
            const searchableText = [
              transaction.description,
              transaction.merchantName,
              transaction.category,
              transaction.subcategory,
              transaction.notes,
              ...transaction.tags
            ].join(' ').toLowerCase();
            
            if (!searchableText.includes(query)) {
              return false;
            }
          }

          // Tags filter
          if (filter.tags && filter.tags.length > 0) {
            if (!filter.tags.some(tag => transaction.tags.includes(tag))) {
              return false;
            }
          }

          // Card IDs filter
          if (filter.cardIds && filter.cardIds.length > 0) {
            if (!transaction.cardId || !filter.cardIds.includes(transaction.cardId)) {
              return false;
            }
          }

          // Pending filter
          if (filter.pending !== undefined) {
            if (transaction.pending !== filter.pending) {
              return false;
            }
          }

          return true;
        });
      },

      // Selection
      selectTransaction: (id) => {
        set((state) => ({
          selectedTransactions: [...state.selectedTransactions, id]
        }));
      },

      deselectTransaction: (id) => {
        set((state) => ({
          selectedTransactions: state.selectedTransactions.filter((selectedId) => selectedId !== id)
        }));
      },

      selectAllTransactions: () => {
        const filteredTransactions = get().getFilteredTransactions();
        set({
          selectedTransactions: filteredTransactions.map((transaction) => transaction.id)
        });
      },

      clearSelection: () => {
        set({ selectedTransactions: [] });
      },

      // Duplicate Detection
      detectDuplicates: (newTransactions) => {
        const { transactions } = get();
        const duplicates: DuplicateTransaction[] = [];

        newTransactions.forEach((newTransaction) => {
          transactions.forEach((existingTransaction) => {
            const similarity = calculateSimilarity(newTransaction, existingTransaction);
            if (similarity > 0.7) {
              duplicates.push({
                existing: existingTransaction,
                potential: newTransaction,
                similarity,
                matchingFields: getMatchingFields(newTransaction, existingTransaction),
                suggestedAction: similarity > 0.9 ? DuplicateAction.SKIP : DuplicateAction.MERGE
              });
            }
          });
        });

        set({ duplicates });
      },

      resolveDuplicate: (index, action) => {
        const { duplicates } = get();
        const duplicate = duplicates[index];
        
        if (action === 'create_new' && duplicate.potential.id) {
          get().addTransaction(duplicate.potential as Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>);
        } else if (action === 'merge' && duplicate.potential.id) {
          // Merge logic - combine data from both transactions
          get().updateTransaction(duplicate.existing.id, {
            ...duplicate.potential,
            tags: [...new Set([...duplicate.existing.tags, ...duplicate.potential.tags || []])]
          });
        }

        // Remove resolved duplicate
        set((state) => ({
          duplicates: state.duplicates.filter((_, i) => i !== index)
        }));
      },

      // Analytics
      getTransactionStats: (dateRange) => {
        const transactions = dateRange 
          ? get().transactions.filter((t) => {
              const date = new Date(t.date);
              return date >= new Date(dateRange.start) && date <= new Date(dateRange.end);
            })
          : get().transactions;

        const totalTransactions = transactions.length;
        const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const averageTransaction = totalAmount / totalTransactions || 0;

        const categoryCounts: Record<string, number> = {};
        transactions.forEach((t) => {
          categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
        });

        // Monthly totals
        const monthlyTotals = transactions.reduce((acc, t) => {
          const month = new Date(t.date).toISOString().substring(0, 7);
          const existing = acc.find((m) => m.month === month);
          if (existing) {
            existing.amount += Math.abs(t.amount);
            existing.count += 1;
          } else {
            acc.push({ month, amount: Math.abs(t.amount), count: 1 });
          }
          return acc;
        }, [] as Array<{ month: string; amount: number; count: number }>);

        // Top merchants
        const merchantTotals: Record<string, { amount: number; count: number }> = {};
        transactions.forEach((t) => {
          if (t.merchantName) {
            if (!merchantTotals[t.merchantName]) {
              merchantTotals[t.merchantName] = { amount: 0, count: 0 };
            }
            merchantTotals[t.merchantName].amount += Math.abs(t.amount);
            merchantTotals[t.merchantName].count += 1;
          }
        });

        const topMerchants = Object.entries(merchantTotals)
          .map(([merchant, data]) => ({ merchant, ...data }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10);

        return {
          totalTransactions,
          totalAmount,
          averageTransaction,
          categoryCounts,
          monthlyTotals,
          topMerchants
        };
      },

      // Utility
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState)
    }),
    {
      name: 'transaction-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactions: state.transactions,
  // plaidAccounts removed
        filter: state.filter
      })
    }
  )
);

// Helper functions
function calculateSimilarity(transaction1: Partial<Transaction>, transaction2: Transaction): number {
  let matches = 0;
  let total = 0;

  // Amount similarity (exact match or very close)
  total += 1;
  if (transaction1.amount && Math.abs(transaction1.amount - transaction2.amount) < 0.01) {
    matches += 1;
  }

  // Date similarity (same day)
  total += 1;
  if (transaction1.date && transaction2.date) {
    const date1 = new Date(transaction1.date).toDateString();
    const date2 = new Date(transaction2.date).toDateString();
    if (date1 === date2) {
      matches += 1;
    }
  }

  // Description similarity
  total += 1;
  if (transaction1.description && transaction2.description) {
    const similarity = stringSimilarity(transaction1.description, transaction2.description);
    if (similarity > 0.8) {
      matches += 1;
    }
  }

  // Merchant similarity
  total += 1;
  if (transaction1.merchantName && transaction2.merchantName) {
    const similarity = stringSimilarity(transaction1.merchantName, transaction2.merchantName);
    if (similarity > 0.8) {
      matches += 1;
    }
  }

  return matches / total;
}

function getMatchingFields(transaction1: Partial<Transaction>, transaction2: Transaction): string[] {
  const matches: string[] = [];

  if (transaction1.amount && Math.abs(transaction1.amount - transaction2.amount) < 0.01) {
    matches.push('amount');
  }

  if (transaction1.date && transaction2.date) {
    const date1 = new Date(transaction1.date).toDateString();
    const date2 = new Date(transaction2.date).toDateString();
    if (date1 === date2) {
      matches.push('date');
    }
  }

  if (transaction1.description && transaction2.description && 
      stringSimilarity(transaction1.description, transaction2.description) > 0.8) {
    matches.push('description');
  }

  if (transaction1.merchantName && transaction2.merchantName && 
      stringSimilarity(transaction1.merchantName, transaction2.merchantName) > 0.8) {
    matches.push('merchant');
  }

  return matches;
}

function stringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
