'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Shield } from 'lucide-react';

// Memory interface for type safety
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// Performance interface extension
interface ExtendedPerformance extends Performance {
  memory?: MemoryInfo;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to error service (placeholder for future implementation)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Enhanced security-focused error logging
    const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined' && typeof document !== 'undefined';
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: isBrowser ? navigator.userAgent : undefined,
      url: isBrowser ? window.location.href : undefined,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      buildVersion: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      environment: process.env.NODE_ENV,
      severity: this.calculateErrorSeverity(error),
      securityContext: this.getSecurityContext(error),
      performanceMetrics: this.getPerformanceMetrics()
    };

    // Check for potential security-related errors
    if (this.isSecurityRelatedError(error)) {
      this.logSecurityEvent(error, errorData);
    }

    // Log to multiple services for redundancy
    this.logToErrorService(errorData);
    this.logToSecurityService(errorData);
    
    // Store locally for offline analysis
    this.storeErrorLocally(errorData);

    console.error('Enhanced error logged:', errorData);
  };

  private getCurrentUserId(): string | null {
    try {
      // Get user ID from session storage or context
  if (typeof window === 'undefined') return null;
  const userData = window.sessionStorage?.getItem('user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.id || null;
      }
    } catch {
      // Ignore parsing errors
    }
    return null;
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'session_server';
    let sessionId = window.sessionStorage?.getItem('session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      try { window.sessionStorage?.setItem('session_id', sessionId); } catch {}
    }
    return sessionId;
  }

  private calculateErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Critical errors
    if (message.includes('network') || message.includes('unauthorized') || 
        message.includes('permission') || message.includes('security') ||
        stack.includes('auth') || stack.includes('payment')) {
      return 'critical';
    }

    // High severity errors
    if (message.includes('failed') || message.includes('timeout') ||
        message.includes('connection') || stack.includes('supabase')) {
      return 'high';
    }

    // Medium severity errors
    if (message.includes('validation') || message.includes('format') ||
        message.includes('parse')) {
      return 'medium';
    }

    return 'low';
  }

  private isSecurityRelatedError(error: Error): boolean {
    const securityKeywords = [
      'unauthorized', 'forbidden', 'permission', 'authentication',
      'security', 'csrf', 'xss', 'injection', 'malicious', 'blocked'
    ];
    
    const errorText = (error.message + (error.stack || '')).toLowerCase();
    return securityKeywords.some(keyword => errorText.includes(keyword));
  }

  private getSecurityContext(error: Error): Record<string, unknown> {
    const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined' && typeof document !== 'undefined';
    return {
      referrer: isBrowser ? document.referrer : undefined,
      origin: isBrowser ? window.location.origin : undefined,
      protocol: isBrowser ? window.location.protocol : undefined,
      cookiesEnabled: isBrowser ? navigator.cookieEnabled : undefined,
      doNotTrack: isBrowser ? navigator.doNotTrack : undefined,
      language: isBrowser ? navigator.language : undefined,
      platform: isBrowser ? navigator.platform : undefined,
      isSecurityRelated: this.isSecurityRelatedError(error),
      localStorageEnabled: this.isLocalStorageEnabled(),
      sessionStorageEnabled: this.isSessionStorageEnabled()
    };
  }

  private getPerformanceMetrics(): Record<string, unknown> {
  if (typeof window !== 'undefined' && window.performance) {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memoryInfo = (window.performance as unknown as ExtendedPerformance).memory;
      return {
        loadTime: navigation?.loadEventEnd - navigation?.loadEventStart,
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        timeOrigin: window.performance.timeOrigin,
        memory: memoryInfo ? {
          usedJSHeapSize: memoryInfo.usedJSHeapSize,
          totalJSHeapSize: memoryInfo.totalJSHeapSize,
          jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit
        } : undefined
      };
    }
    return {};
  }

  private isLocalStorageEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private isSessionStorageEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
      const test = 'test';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private logSecurityEvent(error: Error, errorData: Record<string, unknown>): void {
    // Log security-related errors to specialized security monitoring
    const securityEvent = {
      type: 'application_error',
      severity: 'high',
      source: 'error_boundary',
      error: {
        message: error.message,
        type: error.constructor.name
      },
      context: errorData,
      timestamp: new Date().toISOString()
    };

    // In production, send to security monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToSecurityMonitoring(securityEvent);
    }

    console.warn('Security-related error detected:', securityEvent);
  }

  private logToErrorService(errorData: Record<string, unknown>): void {
    // In production, send to error tracking service (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorData });
      console.log('Error sent to tracking service:', errorData);
    }
  }

  private logToSecurityService(errorData: Record<string, unknown>): void {
    // In production, send to security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: SecurityMonitor.logEvent(errorData);
      console.log('Error sent to security monitoring:', errorData);
    }
  }

  private sendToSecurityMonitoring(securityEvent: Record<string, unknown>): void {
    // Send to specialized security monitoring service
    fetch('/api/security/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(securityEvent)
    }).catch(err => console.error('Failed to send security event:', err));
  }

  private storeErrorLocally(errorData: Record<string, unknown>): void {
    try {
  if (typeof window === 'undefined') return;
  const errors = JSON.parse(window.localStorage?.getItem('app_errors') || '[]');
      errors.push(errorData);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
  window.localStorage?.setItem('app_errors', JSON.stringify(errors));
    } catch {
      // Ignore storage errors
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <div className="relative">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <Shield className="h-4 w-4 text-red-800 absolute -top-1 -right-1" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 mb-8">
                We encountered an unexpected error. Our team has been notified and is working on a fix.
              </p>
            </div>

            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="space-y-4">
                <button
                  onClick={this.handleReset}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 p-4 bg-gray-50 rounded-md">
                  <summary className="text-sm font-medium text-gray-900 cursor-pointer">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-3 space-y-2">
                    <div className="text-sm">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                        {this.state.error.stack}
                      </pre>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                If this problem persists, please{' '}
                <a
                  href="mailto:support@pointadvisor.app"
                  className="text-blue-600 hover:text-blue-500"
                >
                  contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
