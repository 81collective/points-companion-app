'use client';

import React, { useState } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

// Example component demonstrating the error handling system
export default function ErrorHandlingDemo() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<string | null>(null);
  
  const { executeAsyncSafe, showSuccess, showError, showWarning, showInfo } = useErrorHandler({
    context: 'Demo',
    showToast: true,
    retry: { maxAttempts: 3, baseDelay: 1000 }
  });

  const simulateSuccess = async () => {
    setLoading(true);
    await executeAsyncSafe(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        setData('Operation completed successfully!');
        return 'success';
      },
      {
        successMessage: 'Demo operation completed successfully!',
        context: 'Success Demo'
      }
    );
    setLoading(false);
  };

  const simulateError = async () => {
    setLoading(true);
    await executeAsyncSafe(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        throw new Error('This is a simulated error for testing');
      },
      {
        context: 'Error Demo',
        fallbackValue: 'Error handled gracefully'
      }
    );
    setLoading(false);
  };

  const simulateRetryableError = async () => {
    setLoading(true);
    let attempts = 0;
    await executeAsyncSafe(
      async () => {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 500));
        if (attempts < 3) {
          throw new Error('Temporary network error (will retry)');
        }
        setData('Success after retries!');
        return 'success';
      },
      {
        context: 'Retry Demo',
        successMessage: 'Operation succeeded after retries!',
        retry: { maxAttempts: 3, baseDelay: 500 }
      }
    );
    setLoading(false);
  };

  const showToastExamples = () => {
    showSuccess('Success!', 'This is a success toast');
    setTimeout(() => showInfo('Info', 'This is an info toast'), 500);
    setTimeout(() => showWarning('Warning', 'This is a warning toast'), 1000);
    setTimeout(() => showError('Error', 'This is an error toast'), 1500);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Error Handling System Demo
        </h2>
        <p className="text-gray-600 mb-6">
          This demonstrates the new error handling system with toast notifications, retry logic, and loading states.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={simulateSuccess}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Simulate Success
          </button>
          
          <button
            onClick={simulateError}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            Simulate Error
          </button>
          
          <button
            onClick={simulateRetryableError}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Simulate Retry Logic
          </button>
          
          <button
            onClick={showToastExamples}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            Show Toast Examples
          </button>
        </div>

        {loading && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Loading State:</h3>
            <LoadingSkeleton lines={3} className="mb-4" />
          </div>
        )}

        {data && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Result:</h3>
            <p className="text-green-700">{data}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Loading Skeleton Examples
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Card Skeleton:</h4>
            <LoadingSkeleton variant="rectangular" width="100%" height="200px" className="rounded-lg" />
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Text Skeleton:</h4>
            <LoadingSkeleton lines={4} />
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Circular Skeleton:</h4>
            <div className="flex items-center space-x-4">
              <LoadingSkeleton variant="circular" width={60} height={60} />
              <div className="flex-1">
                <LoadingSkeleton lines={2} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
