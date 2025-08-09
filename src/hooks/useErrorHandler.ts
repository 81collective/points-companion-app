// Enhanced hook for error handling in components
// src/hooks/useErrorHandler.ts

import { useCallback } from 'react';
import { useError } from '@/contexts/ErrorContext';
import { withRetry, RetryOptions } from '@/lib/errorHandling';

export interface UseErrorHandlerOptions {
  context?: string;
  showToast?: boolean;
  retry?: boolean | RetryOptions;
}

export function useErrorHandler(defaultOptions: UseErrorHandlerOptions = {}) {
  const { showError, showSuccess, showWarning, showInfo, handleError } = useError();

  const executeAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    options: UseErrorHandlerOptions & {
      successMessage?: string;
      fallbackValue?: T;
    } = {}
  ): Promise<T | undefined> => {
    const mergedOptions = { ...defaultOptions, ...options };
    const { context = 'Operation', showToast = true, retry = false, successMessage, fallbackValue } = mergedOptions;

    try {
      const wrappedOperation = retry 
        ? () => withRetry(operation, typeof retry === 'boolean' ? {} : retry)
        : operation;

      const result = await wrappedOperation();
      
      if (successMessage && showToast) {
        showSuccess('Success', successMessage);
      }
      
      return result;
    } catch (_error) {
      const errorMessage = _error instanceof Error ? _error.message : 'An unexpected error occurred';
      
      if (showToast) {
        showError(`${context} Failed`, errorMessage);
      }
      
  console.error(`[${context}] Operation failed:`, _error);
      
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
      
  throw _error;
    }
  }, [defaultOptions, showError, showSuccess]);

  const executeAsyncSafe = useCallback(async <T>(
    operation: () => Promise<T>,
    options: UseErrorHandlerOptions & {
      successMessage?: string;
      fallbackValue?: T;
    } = {}
  ): Promise<T | undefined> => {
    try {
      return await executeAsync(operation, options);
  } catch (_error) {
      // Safe version that never throws
      return options.fallbackValue;
    }
  }, [executeAsync]);

  const wrapApiCall = useCallback(<TArgs extends unknown[], TReturn>(
    apiFunction: (...args: TArgs) => Promise<TReturn>,
    context: string = 'API Call'
  ) => {
    return async (...args: TArgs): Promise<TReturn | undefined> => {
      return executeAsyncSafe(
        () => apiFunction(...args),
        { context, showToast: true }
      );
    };
  }, [executeAsyncSafe]);

  const handleAsyncError = useCallback((error: Error | string, context?: string) => {
    handleError(error, context || defaultOptions.context);
  }, [handleError, defaultOptions.context]);

  return {
    executeAsync,
    executeAsyncSafe,
    wrapApiCall,
    handleAsyncError,
    showError,
    showSuccess,
    showWarning,
    showInfo
  };
}

export default useErrorHandler;
