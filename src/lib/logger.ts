/**
 * Structured Logger
 * 
 * Replaces console.log with structured, redacted logging.
 * Per AGENTS.md: No PII in logs; redact emails, tokens, card data.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  correlationId?: string;
  component?: string;
  action?: string;
  [key: string]: unknown;
}

// Patterns to redact from logs
const REDACT_PATTERNS = [
  // Email addresses
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // Credit card numbers (basic pattern)
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  // API keys / tokens
  /\b(sk_live_|pk_live_|api_key_|token_)[A-Za-z0-9]+/g,
  // Bearer tokens
  /Bearer\s+[A-Za-z0-9\-._~+\/]+=*/g,
  // Passwords in URLs
  /password=[^&\s]+/gi,
  // SSN pattern
  /\b\d{3}-\d{2}-\d{4}\b/g,
];

function redact(value: unknown): unknown {
  if (typeof value === 'string') {
    let redacted = value;
    for (const pattern of REDACT_PATTERNS) {
      redacted = redacted.replace(pattern, '[REDACTED]');
    }
    return redacted;
  }
  
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  
  if (value && typeof value === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      // Redact sensitive field names entirely
      if (/password|secret|token|apikey|authorization/i.test(k)) {
        redacted[k] = '[REDACTED]';
      } else {
        redacted[k] = redact(v);
      }
    }
    return redacted;
  }
  
  return value;
}

function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const redactedContext = context ? redact(context) : undefined;
  
  const logEntry = {
    timestamp,
    level,
    message,
    ...(redactedContext as object),
  };

  // In production, output JSON for log aggregators
  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(logEntry);
  }
  
  // In development, output human-readable format
  const prefix = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
  }[level];
  
  const contextStr = redactedContext 
    ? ` ${JSON.stringify(redactedContext, null, 2)}`
    : '';
    
  return `${prefix} [${timestamp}] ${message}${contextStr}`;
}

// Determine if we should log based on level
function shouldLog(level: LogLevel): boolean {
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
  const minLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  return levels.indexOf(level) >= levels.indexOf(minLevel);
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    if (shouldLog('debug')) {
       
      console.debug(formatLog('debug', message, context));
    }
  },

  info(message: string, context?: LogContext): void {
    if (shouldLog('info')) {
       
      console.info(formatLog('info', message, context));
    }
  },

  warn(message: string, context?: LogContext): void {
    if (shouldLog('warn')) {
       
      console.warn(formatLog('warn', message, context));
    }
  },

  error(message: string, context?: LogContext): void {
    if (shouldLog('error')) {
       
      console.error(formatLog('error', message, context));
    }
  },

  /**
   * Create a child logger with preset context
   */
  child(baseContext: LogContext) {
    return {
      debug: (msg: string, ctx?: LogContext) => logger.debug(msg, { ...baseContext, ...ctx }),
      info: (msg: string, ctx?: LogContext) => logger.info(msg, { ...baseContext, ...ctx }),
      warn: (msg: string, ctx?: LogContext) => logger.warn(msg, { ...baseContext, ...ctx }),
      error: (msg: string, ctx?: LogContext) => logger.error(msg, { ...baseContext, ...ctx }),
    };
  },
};

export default logger;
