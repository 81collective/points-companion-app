'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  X,
  Download,
  RefreshCw,
  FileText,
  TrendingUp,
  DollarSign,
  Calendar,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTransactionStore } from '@/stores/transactionStore';
import { 
  CSVImportSession, 
  ImportStatus, 
  Transaction, 
  TransactionSource,
  CSVRow,
  DuplicateTransaction,
  TRANSACTION_CATEGORIES,
  CSVErrorType,
  CSVError
} from '@/types/transactions';

interface TransactionImportProcessorProps {
  sessionId: string;
  onProcessingComplete: () => void;
  onBack: () => void;
}

interface ProcessingStats {
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  errorRows: number;
  duplicateRows: number;
  currentStep: string;
}

export default function TransactionImportProcessor({ 
  sessionId, 
  onProcessingComplete, 
  onBack 
}: TransactionImportProcessorProps) {
  const {
    getCSVImportSession,
    updateCSVImportSession,
    addTransaction,
    detectDuplicates,
    duplicates
  } = useTransactionStore();

  const [session, setSession] = useState<CSVImportSession | null>(null);
  const [stats, setStats] = useState<ProcessingStats>({
    totalRows: 0,
    processedRows: 0,
    successfulRows: 0,
    errorRows: 0,
    duplicateRows: 0,
    currentStep: 'Initializing...'
  });
  const [processedTransactions, setProcessedTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);

  useEffect(() => {
    const importSession = getCSVImportSession(sessionId);
    if (importSession) {
      setSession(importSession);
      setStats(prev => ({
        ...prev,
        totalRows: importSession.totalRows
      }));
      
      // Start processing automatically
      if (importSession.status !== ImportStatus.FAILED) {
        startProcessing(importSession);
      }
    }
  }, [sessionId, getCSVImportSession]);

  const startProcessing = async (importSession: CSVImportSession) => {
    setIsProcessing(true);
    updateCSVImportSession(sessionId, { status: ImportStatus.PROCESSING });

    try {
      await processTransactions(importSession);
    } catch (error) {
      console.error('Processing failed:', error);
      updateCSVImportSession(sessionId, { 
        status: ImportStatus.FAILED,
        errors: [{ row: 0, message: 'Processing failed', type: CSVErrorType.INVALID_FORMAT }]
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processTransactions = async (importSession: CSVImportSession) => {
    const { mapping, previewData } = importSession;
    const transactions: Transaction[] = [];
    const errors: CSVError[] = [];
    
    setStats(prev => ({ ...prev, currentStep: 'Parsing transactions...' }));

    // Process each row
    for (let i = 0; i < previewData.length; i++) {
      const row = previewData[i];
      
      try {
        setStats(prev => ({
          ...prev,
          processedRows: i + 1,
          currentStep: `Processing row ${i + 1} of ${previewData.length}...`
        }));

        const transaction = await parseRowToTransaction(row, mapping, i);
        if (transaction) {
          transactions.push(transaction);
          setStats(prev => ({ ...prev, successfulRows: prev.successfulRows + 1 }));
        }

        // Simulate processing delay for demo
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        errors.push({
          row: i,
          message: error instanceof Error ? error.message : 'Unknown error',
          type: CSVErrorType.INVALID_FORMAT
        });
        setStats(prev => ({ ...prev, errorRows: prev.errorRows + 1 }));
      }
    }

    setStats(prev => ({ ...prev, currentStep: 'Detecting duplicates...' }));
    
    // Detect duplicates
    detectDuplicates(transactions);
    const duplicateCount = duplicates.length;
    setStats(prev => ({ ...prev, duplicateRows: duplicateCount }));

    setStats(prev => ({ ...prev, currentStep: 'Applying AI categorization...' }));
    
    // Apply AI categorization
    const categorizedTransactions = await applyCategorization(transactions);

    setStats(prev => ({ ...prev, currentStep: 'Finalizing import...' }));

    // Add successful transactions
    categorizedTransactions.forEach(transaction => {
      addTransaction(transaction);
    });

    setProcessedTransactions(categorizedTransactions);

    // Update session
    updateCSVImportSession(sessionId, {
      status: ImportStatus.COMPLETED,
      successfulRows: categorizedTransactions.length,
      errorRows: errors.length,
      errors,
      finalData: categorizedTransactions
    });

    setProcessingComplete(true);
    setStats(prev => ({ ...prev, currentStep: 'Import completed successfully!' }));
  };

  const parseRowToTransaction = async (
    row: CSVRow, 
    mapping: CSVImportSession['mapping'], 
    index: number
  ): Promise<Transaction | null> => {
    const data = row.data;

    // Extract required fields
    const dateStr = data[mapping.date];
    const amountStr = data[mapping.amount];
    const description = data[mapping.description];

    if (!dateStr || !amountStr || !description) {
      throw new Error('Missing required fields');
    }

    // Parse date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${dateStr}`);
    }

    // Parse amount
    const amount = parseFloat(amountStr.replace(/[,$\s]/g, ''));
    if (isNaN(amount)) {
      throw new Error(`Invalid amount format: ${amountStr}`);
    }

    // Extract optional fields
    const category = mapping.category ? data[mapping.category] || 'Other' : 'Other';
    const merchantName = mapping.merchant ? data[mapping.merchant] : extractMerchantFromDescription(description);
    const paymentMethod = mapping.paymentMethod ? data[mapping.paymentMethod] : '';

    return {
      id: crypto.randomUUID(),
      userId: 'current-user', // Replace with actual user ID
      amount,
      description,
      merchantName,
      category,
      subcategory: '',
      date: date.toISOString(),
      pending: false,
      source: TransactionSource.CSV_IMPORT,
      paymentMethod,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const extractMerchantFromDescription = (description: string): string => {
    // Simple merchant extraction logic
    // Remove common prefixes/suffixes
    const cleaned = description
      .replace(/^(DEBIT|CREDIT|PURCHASE|PAYMENT)\s+/i, '')
      .replace(/\s+\d{4}$/, '') // Remove trailing card numbers
      .replace(/\s+[A-Z]{2}$/, '') // Remove state codes
      .trim();

    return cleaned;
  };

  const applyCategorization = async (transactions: Transaction[]): Promise<Transaction[]> => {
    return transactions.map(transaction => {
      // Simple rule-based categorization
      const description = transaction.description.toLowerCase();
      const merchant = transaction.merchantName?.toLowerCase() || '';
      
      let suggestedCategory = transaction.category;
      let confidence = 0.5;

      // Food & Dining
      if (description.includes('restaurant') || description.includes('cafe') || 
          merchant.includes('starbucks') || merchant.includes('mcdonald')) {
        suggestedCategory = 'Food & Dining';
        confidence = 0.9;
      }
      // Gas/Transportation
      else if (description.includes('gas') || description.includes('fuel') ||
               merchant.includes('shell') || merchant.includes('bp')) {
        suggestedCategory = 'Transportation';
        confidence = 0.9;
      }
      // Groceries
      else if (description.includes('grocery') || description.includes('market') ||
               merchant.includes('walmart') || merchant.includes('target')) {
        suggestedCategory = 'Food & Dining';
        confidence = 0.8;
      }
      // Bills & Utilities
      else if (description.includes('electric') || description.includes('water') ||
               description.includes('internet') || description.includes('phone')) {
        suggestedCategory = 'Bills & Utilities';
        confidence = 0.9;
      }

      return {
        ...transaction,
        category: suggestedCategory,
        confidence,
        originalCategory: transaction.category !== suggestedCategory ? transaction.category : undefined
      };
    });
  };

  const retryProcessing = () => {
    if (session) {
      setProcessingComplete(false);
      setStats({
        totalRows: session.totalRows,
        processedRows: 0,
        successfulRows: 0,
        errorRows: 0,
        duplicateRows: 0,
        currentStep: 'Retrying...'
      });
      startProcessing(session);
    }
  };

  const downloadErrorReport = () => {
    if (!session?.errors) return;

    const errorReport = session.errors.map(error => ({
      Row: error.row + 1,
      Error: error.message,
      Type: error.type,
      Column: error.column || 'N/A'
    }));

    const csvContent = [
      Object.keys(errorReport[0]).join(','),
      ...errorReport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import_errors_${session.filename}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!session) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <p>Loading import session...</p>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = stats.totalRows > 0 ? (stats.processedRows / stats.totalRows) * 100 : 0;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isProcessing ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : processingComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          )}
          Transaction Import Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Processing Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{stats.currentStep}</span>
            <span className="text-sm text-gray-500">
              {stats.processedRows} / {stats.totalRows} rows
            </span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{stats.totalRows}</div>
              <div className="text-sm text-gray-500">Total Rows</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.successfulRows}</div>
              <div className="text-sm text-gray-500">Successful</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.errorRows}</div>
              <div className="text-sm text-gray-500">Errors</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{stats.duplicateRows}</div>
              <div className="text-sm text-gray-500">Duplicates</div>
            </CardContent>
          </Card>
        </div>

        {/* Processing Complete */}
        {processingComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Import completed successfully! {stats.successfulRows} transactions have been added to your account.
              </AlertDescription>
            </Alert>

            {/* Sample Transactions Preview */}
            {processedTransactions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Imported Transactions Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {processedTransactions.slice(0, 5).map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{transaction.merchantName || transaction.description}</span>
                            {transaction.confidence && transaction.confidence > 0.8 && (
                              <Badge variant="secondary" className="text-xs">
                                AI Categorized
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(transaction.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {transaction.category}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {processedTransactions.length > 5 && (
                      <p className="text-sm text-gray-500 text-center pt-2">
                        And {processedTransactions.length - 5} more transactions...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Error Summary */}
        {session.errors && session.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>{session.errors.length} errors occurred during import</span>
                <Button variant="outline" size="sm" onClick={downloadErrorReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Error Report
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Duplicate Detection Results */}
        {duplicates.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Found {duplicates.length} potential duplicate transactions that need review.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            Back to Mapping
          </Button>
          <div className="flex gap-2">
            {session.status === ImportStatus.FAILED && (
              <Button onClick={retryProcessing} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Import
              </Button>
            )}
            {processingComplete && (
              <Button onClick={onProcessingComplete}>
                View Transactions
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
