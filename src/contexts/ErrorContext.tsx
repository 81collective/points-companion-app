'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ErrorContextType {
  // Toast methods
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  
  // Error handling
  handleError: (error: Error | string, context?: string) => void;
  reportError: (error: Error, context?: string, metadata?: Record<string, unknown>) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const reportError = useCallback((error: Error, context?: string, metadata?: Record<string, unknown>) => {
    // Enhanced error reporting (SSR-safe)
    const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context,
      metadata,
      timestamp: new Date().toISOString(),
      userAgent: isBrowser ? navigator.userAgent : undefined,
      url: isBrowser ? window.location.href : undefined,
      userId: null, // TODO: Get from auth context
    } as const;

    console.error('Error reported:', errorReport);
    // TODO: Send to monitoring service (e.g., Sentry, LogRocket, etc.)
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const newToast: Toast = {
      ...toast,
      id: generateId(),
      duration: toast.duration ?? 5000
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(newToast.id);
      }, newToast.duration);
    }
  }, [generateId, removeToast]);

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message, duration: 7000 });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message, duration: 6000 });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  const handleError = useCallback((error: Error | string, context?: string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const title = context ? `${context} Error` : 'An error occurred';
    
    console.error('Error handled:', error, context);
    showError(title, errorMessage);
    
    // Report error for monitoring
    if (typeof error !== 'string') {
      reportError(error, context);
    }
  }, [showError, reportError]);

  const value: ErrorContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAllToasts,
    handleError,
    reportError
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ErrorContext.Provider>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col items-end justify-start space-y-4 p-4 sm:p-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Individual Toast Component
interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
      default:
        return <Info className="h-5 w-5 text-gray-400" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-200';
      case 'error':
        return 'border-red-200';
      case 'warning':
        return 'border-yellow-200';
      case 'info':
        return 'border-blue-200';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 border-l-4 ${getBorderColor()}`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">{toast.title}</p>
            {toast.message && (
              <p className="mt-1 text-sm text-gray-500">{toast.message}</p>
            )}
            {toast.action && (
              <div className="mt-3">
                <button
                  onClick={toast.action.onClick}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => onRemove(toast.id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorProvider;
