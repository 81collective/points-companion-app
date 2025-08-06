// Transaction Import System Types
export interface Transaction {
  id: string;
  userId: string;
  accountId?: string;
  plaidTransactionId?: string;
  amount: number;
  description: string;
  merchantName?: string;
  category: string;
  subcategory?: string;
  date: string;
  pending: boolean;
  source: TransactionSource;
  location?: TransactionLocation;
  paymentMethod?: string;
  cardId?: string;
  tags: string[];
  notes?: string;
  isRecurring?: boolean;
  confidence?: number; // AI categorization confidence
  originalCategory?: string; // Original category before AI modification
  createdAt: string;
  updatedAt: string;
}

export interface TransactionLocation {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  lat?: number;
  lon?: number;
}

export interface PlaidAccount {
  id: string;
  userId: string;
  plaidAccountId: string;
  plaidItemId: string;
  accessToken: string;
  institutionId: string;
  institutionName: string;
  accountName: string;
  accountType: PlaidAccountType;
  accountSubtype: string;
  mask?: string;
  balance?: number;
  isActive: boolean;
  lastSyncAt?: string;
  cursor?: string; // For incremental updates
  createdAt: string;
  updatedAt: string;
}

export interface CSVImportSession {
  id: string;
  userId: string;
  filename: string;
  fileSize: number;
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  errorRows: number;
  errors: CSVError[];
  mapping: CSVColumnMapping;
  status: ImportStatus;
  previewData: CSVRow[];
  finalData: Transaction[];
  createdAt: string;
  updatedAt: string;
}

export interface CSVColumnMapping {
  date: string;
  amount: string;
  description: string;
  category?: string;
  merchant?: string;
  paymentMethod?: string;
}

export interface CSVRow {
  rowIndex: number;
  data: Record<string, string>;
  errors: string[];
  isValid: boolean;
  parsedTransaction?: Partial<Transaction>;
}

export interface CSVError {
  row: number;
  column?: string;
  message: string;
  type: CSVErrorType;
}

export interface DuplicateTransaction {
  existing: Transaction;
  potential: Partial<Transaction>;
  similarity: number;
  matchingFields: string[];
  suggestedAction: DuplicateAction;
}

export interface TransactionFilter {
  dateRange?: {
    start: string;
    end: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  categories?: string[];
  merchants?: string[];
  sources?: TransactionSource[];
  searchQuery?: string;
  tags?: string[];
  cardIds?: string[];
  pending?: boolean;
}

export interface TransactionBulkEdit {
  transactionIds: string[];
  updates: Partial<Pick<Transaction, 'category' | 'subcategory' | 'tags' | 'notes' | 'merchantName'>>;
}

export interface CategorySuggestion {
  category: string;
  subcategory?: string;
  confidence: number;
  reason: string;
  alternatives: Array<{
    category: string;
    subcategory?: string;
    confidence: number;
  }>;
}

export interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  averageTransaction: number;
  categoryCounts: Record<string, number>;
  monthlyTotals: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
  topMerchants: Array<{
    merchant: string;
    amount: number;
    count: number;
  }>;
}

// Enums
export enum TransactionSource {
  PLAID = 'plaid',
  CSV_IMPORT = 'csv_import',
  MANUAL_ENTRY = 'manual_entry',
  API_IMPORT = 'api_import'
}

export enum PlaidAccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT_CARD = 'credit',
  INVESTMENT = 'investment',
  LOAN = 'loan',
  OTHER = 'other'
}

export enum ImportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum CSVErrorType {
  INVALID_DATE = 'invalid_date',
  INVALID_AMOUNT = 'invalid_amount',
  MISSING_REQUIRED = 'missing_required',
  INVALID_FORMAT = 'invalid_format',
  DUPLICATE_ENTRY = 'duplicate_entry'
}

export enum DuplicateAction {
  SKIP = 'skip',
  MERGE = 'merge',
  CREATE_NEW = 'create_new',
  REPLACE = 'replace'
}

// Transaction Categories
export const TRANSACTION_CATEGORIES = {
  'Food & Dining': [
    'Restaurants',
    'Fast Food',
    'Coffee Shops',
    'Bars & Nightlife',
    'Groceries'
  ],
  'Shopping': [
    'Clothing',
    'Electronics',
    'Home & Garden',
    'Sporting Goods',
    'Books'
  ],
  'Transportation': [
    'Gas',
    'Public Transportation',
    'Taxi & Rideshare',
    'Parking',
    'Car Maintenance'
  ],
  'Bills & Utilities': [
    'Internet',
    'Mobile Phone',
    'Utilities',
    'Insurance',
    'Rent/Mortgage'
  ],
  'Entertainment': [
    'Movies & Shows',
    'Music',
    'Gaming',
    'Sports',
    'Hobbies'
  ],
  'Healthcare': [
    'Doctor Visits',
    'Pharmacy',
    'Dental',
    'Vision',
    'Medical Supplies'
  ],
  'Travel': [
    'Flights',
    'Hotels',
    'Car Rental',
    'Travel Insurance',
    'Activities'
  ],
  'Financial': [
    'Bank Fees',
    'Interest',
    'Investments',
    'Loans',
    'Transfers'
  ],
  'Income': [
    'Salary',
    'Freelance',
    'Investment Income',
    'Refunds',
    'Other Income'
  ],
  'Other': [
    'Miscellaneous',
    'Cash Withdrawal',
    'Charitable Donations',
    'Gifts'
  ]
} as const;

// Constants
export const CSV_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_ROWS: 10000,
  PREVIEW_ROWS: 10
} as const;

export const DUPLICATE_DETECTION_THRESHOLDS = {
  HIGH_SIMILARITY: 0.9,
  MEDIUM_SIMILARITY: 0.7,
  LOW_SIMILARITY: 0.5
} as const;

export const PLAID_CONFIG = {
  WEBHOOK_URL: process.env.PLAID_WEBHOOK_URL,
  REDIRECT_URI: process.env.PLAID_REDIRECT_URI,
  COUNTRY_CODES: ['US', 'CA'] as const,
  PRODUCTS: ['transactions', 'accounts'] as const
} as const;
