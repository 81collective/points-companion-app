'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Download,
  Eye,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTransactionStore } from '@/stores/transactionStore';
import { ImportStatus, CSV_UPLOAD_LIMITS } from '@/types/transactions';
import { parseCSV, ParsedCSVData } from '@/lib/csv/parser';

interface CSVUploadProps {
  onUploadComplete?: (sessionId: string) => void;
  onUploadError?: (error: string) => void;
}

// ParsedCSVData imported from csv/parser

export default function CSVUpload({ onUploadComplete, onUploadError }: CSVUploadProps) {
  const {
    createCSVImportSession,
    updateCSVImportSession
    // getCSVImportSession not needed here currently
  } = useTransactionStore();

  const [uploadState, setUploadState] = useState<{
    sessionId: string | null;
    status: ImportStatus;
    progress: number;
    error: string | null;
    parsedData: ParsedCSVData | null;
  }>({
    sessionId: null,
    status: ImportStatus.PENDING,
    progress: 0,
    error: null,
    parsedData: null
  });

  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file
    if (file.size > CSV_UPLOAD_LIMITS.MAX_FILE_SIZE) {
      const error = `File size exceeds ${CSV_UPLOAD_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB limit`;
      setUploadState(prev => ({ ...prev, error }));
      onUploadError?.(error);
      return;
    }

    if (!file.name.endsWith('.csv')) {
      const error = 'Please upload a CSV file';
      setUploadState(prev => ({ ...prev, error }));
      onUploadError?.(error);
      return;
    }

    try {
      setUploadState(prev => ({ 
        ...prev, 
        status: ImportStatus.PROCESSING, 
        progress: 10,
        error: null 
      }));

      // Create import session
      const sessionId = createCSVImportSession(file.name, file.size);
      setUploadState(prev => ({ ...prev, sessionId, progress: 20 }));

      // Parse CSV file
      const text = await file.text();
      setUploadState(prev => ({ ...prev, progress: 40 }));

      const parsedData = parseCSV(text);
      setUploadState(prev => ({ ...prev, progress: 60, parsedData }));

      // Validate row count
      if (parsedData.totalRows > CSV_UPLOAD_LIMITS.MAX_ROWS) {
        const error = `File contains ${parsedData.totalRows} rows. Maximum allowed is ${CSV_UPLOAD_LIMITS.MAX_ROWS}`;
        setUploadState(prev => ({ ...prev, error, status: ImportStatus.FAILED }));
        onUploadError?.(error);
        return;
      }

      // Update session with parsed data
      updateCSVImportSession(sessionId, {
        totalRows: parsedData.totalRows,
        previewData: parsedData.previewRows.map((row, index) => ({
          rowIndex: index,
          data: parsedData.headers.reduce((acc, header, i) => {
            acc[header] = row[i] || '';
            return acc;
          }, {} as Record<string, string>),
          errors: [],
          isValid: true
        })),
        status: ImportStatus.COMPLETED
      });

      setUploadState(prev => ({ 
        ...prev, 
        progress: 100, 
        status: ImportStatus.COMPLETED 
      }));

      onUploadComplete?.(sessionId);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse CSV file';
      setUploadState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        status: ImportStatus.FAILED 
      }));
      onUploadError?.(errorMessage);
    }
  }, [createCSVImportSession, updateCSVImportSession, onUploadComplete, onUploadError]);

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  });

  const resetUpload = () => {
    setUploadState({
      sessionId: null,
      status: ImportStatus.PENDING,
      progress: 0,
      error: null,
      parsedData: null
    });
    setIsDragActive(false);
  };

  const downloadTemplate = () => {
    const template = [
      ['Date', 'Amount', 'Description', 'Category', 'Merchant', 'Payment Method'],
      ['2024-01-15', '-25.99', 'Coffee Shop Purchase', 'Food & Dining', 'Starbucks', 'Credit Card'],
      ['2024-01-16', '-150.00', 'Grocery Shopping', 'Food & Dining', 'Whole Foods', 'Debit Card'],
      ['2024-01-17', '-45.00', 'Gas Station', 'Transportation', 'Shell', 'Credit Card']
    ];

    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transaction_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          CSV Transaction Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <AnimatePresence mode="wait">
          {uploadState.status === ImportStatus.PENDING && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              key="upload-area"
            >
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                  ${(isDragActive || dropzoneActive) 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                  }
                `}
              >
                <input {...getInputProps()} />
                <motion.div
                  animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
                  className="space-y-4"
                >
                  <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      {isDragActive ? 'Drop your CSV file here' : 'Upload CSV file'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Drag and drop or click to select a CSV file
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Max file size: {CSV_UPLOAD_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB | 
                      Max rows: {CSV_UPLOAD_LIMITS.MAX_ROWS.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  CSV Only
                </Badge>
              </div>
            </motion.div>
          )}

          {/* Processing State */}
          {uploadState.status === ImportStatus.PROCESSING && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              key="processing"
              className="space-y-4"
            >
              <div className="text-center">
                <div className="animate-spin mx-auto w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                <p className="font-medium">Processing CSV file...</p>
              </div>
              <Progress value={uploadState.progress} className="w-full" />
              <p className="text-sm text-gray-500 text-center">
                {uploadState.progress}% complete
              </p>
            </motion.div>
          )}

          {/* Success State */}
          {uploadState.status === ImportStatus.COMPLETED && uploadState.parsedData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              key="success"
              className="space-y-4"
            >
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  CSV file parsed successfully! Found {uploadState.parsedData.totalRows} transactions.
                </AlertDescription>
              </Alert>

              {/* Preview Data */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Data Preview ({CSV_UPLOAD_LIMITS.PREVIEW_ROWS} rows)
                  </h4>
                  <Badge variant="outline">
                    {uploadState.parsedData.headers.length} columns
                  </Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {uploadState.parsedData.headers.map((header, index) => (
                          <th key={index} className="text-left p-2 font-medium">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {uploadState.parsedData.previewRows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-100">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="p-2 text-gray-600">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={resetUpload} variant="outline" size="sm">
                  Upload Different File
                </Button>
                <Button 
                  onClick={() => uploadState.sessionId && onUploadComplete?.(uploadState.sessionId)}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Configure Import
                </Button>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {uploadState.status === ImportStatus.FAILED && uploadState.error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              key="error"
              className="space-y-4"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {uploadState.error}
                </AlertDescription>
              </Alert>
              <Button onClick={resetUpload} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// CSV parsing helpers moved to lib/csv/parser for testability
