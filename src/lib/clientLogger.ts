/**
 * Client-side Logger
 * 
 * A browser-safe logging utility that mirrors the server logger interface.
 * In production, errors are silently suppressed or could be sent to an error service.
 * In development, logs are shown in the browser console.
 * 
 * @module lib/clientLogger
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Redact PII from log context
 */
function redactPII(context: LogContext): LogContext {
  const redacted = { ...context };
  const sensitiveKeys = ['email', 'password', 'token', 'apiKey', 'secret', 'cardNumber', 'ssn'];
  
  for (const key of Object.keys(redacted)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      redacted[key] = '[REDACTED]';
    }
  }
  return redacted;
}

/**
 * Format log message for console
 */
function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  return context 
    ? `${prefix} ${message} ${JSON.stringify(redactPII(context))}`
    : `${prefix} ${message}`;
}

/**
 * Client-side logger with component context support
 */
class ClientLogger {
  private component?: string;

  constructor(component?: string) {
    this.component = component;
  }

  private getContext(context?: LogContext): LogContext | undefined {
    if (!this.component && !context) return undefined;
    return {
      ...(this.component ? { component: this.component } : {}),
      ...context,
    };
  }

  debug(message: string, context?: LogContext): void {
    if (isDev) {
      console.debug(formatMessage('debug', message, this.getContext(context)));
    }
  }

  info(message: string, context?: LogContext): void {
    if (isDev) {
      console.info(formatMessage('info', message, this.getContext(context)));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (isDev) {
      console.warn(formatMessage('warn', message, this.getContext(context)));
    }
  }

  error(message: string, context?: LogContext): void {
    // Always log errors, even in production (but redact PII)
    console.error(formatMessage('error', message, this.getContext(context)));
    
    // TODO: In production, send to error tracking service (e.g., Sentry)
    // if (!isDev && typeof window !== 'undefined') {
    //   captureException(new Error(message), { extra: redactPII(context || {}) });
    // }
  }

  /**
   * Create a child logger with component context
   */
  child(context: { component: string }): ClientLogger {
    return new ClientLogger(context.component);
  }
}

export const clientLogger = new ClientLogger();
export default clientLogger;
