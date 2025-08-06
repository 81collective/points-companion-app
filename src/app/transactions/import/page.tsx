'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CSVUpload from '@/components/transactions/CSVUpload';
import CSVColumnMapper from '@/components/transactions/CSVColumnMapper';
import TransactionImportProcessor from '@/components/transactions/TransactionImportProcessor';
import { CSVColumnMapping } from '@/types/transactions';

type ImportStep = 'upload' | 'mapping' | 'processing';

export default function TransactionImportPage() {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleUploadComplete = (newSessionId: string) => {
    setSessionId(newSessionId);
    setCurrentStep('mapping');
  };

  const handleMappingComplete = (mapping: CSVColumnMapping) => {
    setCurrentStep('processing');
  };

  const handleProcessingComplete = () => {
    // Redirect to transactions list or dashboard
    window.location.href = '/transactions';
  };

  const handleBack = () => {
    if (currentStep === 'mapping') {
      setCurrentStep('upload');
      setSessionId(null);
    } else if (currentStep === 'processing') {
      setCurrentStep('mapping');
    }
  };

  const resetFlow = () => {
    setCurrentStep('upload');
    setSessionId(null);
  };

  const stepNumbers = {
    upload: 1,
    mapping: 2,
    processing: 3
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={() => window.history.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Import Transactions</h1>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-4">
            {(['upload', 'mapping', 'processing'] as const).map((step, index) => {
              const stepNumber = stepNumbers[step];
              const isActive = currentStep === step;
              const isCompleted = stepNumbers[currentStep] > stepNumber;
              
              return (
                <div key={step} className="flex items-center gap-2">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }
                  `}>
                    {stepNumber}
                  </div>
                  <span className={`
                    text-sm font-medium capitalize
                    ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                  `}>
                    {step === 'upload' ? 'Upload CSV' : step === 'mapping' ? 'Map Columns' : 'Process Import'}
                  </span>
                  {index < 2 && (
                    <div className={`
                      w-8 h-0.5 mx-2
                      ${isCompleted ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CSVUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={(error) => console.error('Upload error:', error)}
              />
            </motion.div>
          )}

          {currentStep === 'mapping' && sessionId && (
            <motion.div
              key="mapping"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CSVColumnMapper
                sessionId={sessionId}
                onMappingComplete={handleMappingComplete}
                onBack={handleBack}
              />
            </motion.div>
          )}

          {currentStep === 'processing' && sessionId && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <TransactionImportProcessor
                sessionId={sessionId}
                onProcessingComplete={handleProcessingComplete}
                onBack={handleBack}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6">
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>• <strong>Supported formats:</strong> CSV files with transaction data</p>
            <p>• <strong>Required columns:</strong> Date, Amount, Description</p>
            <p>• <strong>Optional columns:</strong> Category, Merchant, Payment Method</p>
            <p>• <strong>File limits:</strong> Max 10MB file size, up to 10,000 rows</p>
            <p>• <strong>AI Features:</strong> Automatic categorization and duplicate detection</p>
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={resetFlow}>
              Start Over
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
