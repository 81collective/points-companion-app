// Enhanced error handling utilities for API calls and async operations
// src/lib/errorHandling.ts

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface ErrorMetadata {
  context?: string;
  userId?: string;
  timestamp?: string;
  userAgent?: string;
  url?: string;
  additionalData?: Record<string, unknown>;
}

/**
 * Retry an async operation with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = (error: Error) => isRetryableError(error),
    onRetry
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Check if error is retryable
      if (!retryCondition(lastError)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);
      
      // Call retry callback if provided
      onRetry?.(attempt, lastError);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Operation failed without specific error');
}

/**
 * Determine if an error is retryable based on common patterns
 */
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  
  // Network errors
  if (message.includes('network') || message.includes('fetch')) {
    return true;
  }

  // Timeout errors
  if (message.includes('timeout')) {
    return true;
  }

  // Rate limiting (should retry with backoff)
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return true;
  }

  // Server errors (5xx)
  if (message.includes('server error') || message.includes('internal error')) {
    return true;
  }

  // Supabase specific retryable errors
  if (message.includes('connection') || message.includes('unavailable')) {
    return true;
  }

  return false;
}

/**
 * Wrap an API call with comprehensive error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  options: {
    showToast?: boolean;
    retry?: boolean | RetryOptions;
    fallbackValue?: T;
    metadata?: ErrorMetadata;
  } = {}
): Promise<T | undefined> {
  const {
    showToast = true,
    retry = false,
    fallbackValue,
    metadata = {}
  } = options;

  try {
    const wrappedOperation = retry 
      ? () => withRetry(operation, typeof retry === 'boolean' ? {} : retry)
      : operation;

    return await wrappedOperation();
  } catch (error) {
    const enhancedError = enhanceError(error as Error, context, metadata);
    
    // Log error
    console.error(`[${context}] Operation failed:`, enhancedError);

    // Show toast notification if enabled
    if (showToast && typeof window !== 'undefined') {
      // This would be called from a component with access to useError hook
      console.error('Error to be displayed:', enhancedError.message);
    }

    // Return fallback value if provided
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }

    // Re-throw enhanced error
    throw enhancedError;
  }
}

/**
 * Enhance error with additional context and metadata
 */
export function enhanceError(
  error: Error,
  context: string,
  metadata: ErrorMetadata = {}
): Error {
  const enhancedError = new Error(error.message);
  enhancedError.name = `${context}Error`;
  enhancedError.stack = error.stack;

  // Add metadata as properties
  Object.assign(enhancedError, {
    originalError: error,
    context,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }
  });

  return enhancedError;
}

/**
 * Create a safe async operation wrapper that never throws
 */
export function createSafeAsync<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context: string,
  fallbackValue?: R
) {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`[${context}] Safe operation failed:`, error);
      return fallbackValue;
    }
  };
}

/**
 * Debounced error handler to prevent spam
 */
export class DebouncedErrorHandler {
  private errorCounts = new Map<string, number>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly resetInterval = 60000; // 1 minute

  handleError(error: Error, context: string, maxCount = 5): boolean {
    const key = `${context}:${error.message}`;
    const currentCount = this.errorCounts.get(key) || 0;

    if (currentCount >= maxCount) {
      return false; // Don't handle this error anymore
    }

    this.errorCounts.set(key, currentCount + 1);

    // Reset count after interval
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
    }

    this.timers.set(key, setTimeout(() => {
      this.errorCounts.delete(key);
      this.timers.delete(key);
    }, this.resetInterval));

    return true; // Handle this error
  }
}

// Global instance
export const globalErrorHandler = new DebouncedErrorHandler();

/**
 * Promise-based timeout utility
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    )
  ]);
}

/**
 * Utility to handle form validation errors
 */
export interface ValidationError {
  field: string;
  message: string;
}

export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0].message;
  
  return `Multiple errors: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`;
}

/**
 * Check if error is a specific type
 */
export function isNetworkError(error: Error): boolean {
  return error.message.toLowerCase().includes('network') ||
         error.message.toLowerCase().includes('fetch') ||
         error.name === 'NetworkError';
}

export function isAuthError(error: Error): boolean {
  return error.message.toLowerCase().includes('unauthorized') ||
         error.message.toLowerCase().includes('authentication') ||
         error.message.toLowerCase().includes('token');
}

export function isValidationError(error: Error): boolean {
  return error.message.toLowerCase().includes('validation') ||
         error.message.toLowerCase().includes('invalid') ||
         error.name === 'ValidationError';
}
