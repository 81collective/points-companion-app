// Security monitoring and threat detection system
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface SecurityEvent {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'data_access' | 'api_abuse' | 'injection_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  ip_address: string;
  user_agent: string;
  details: Record<string, unknown>;
  timestamp: string;
  resolved: boolean;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  suspiciousIPs: string[];
  failedLogins: number;
  lastIncident?: string;
}

export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private events: SecurityEvent[] = [];
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();
  private suspiciousIPs: Set<string> = new Set();
  
  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  // Test-only: reset internal state
  static __resetForTests() {
    if (SecurityMonitor.instance) {
      SecurityMonitor.instance.events = [];
      SecurityMonitor.instance.rateLimits.clear();
      SecurityMonitor.instance.suspiciousIPs.clear();
    }
  }

  // Log security events
  logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    this.events.push(securityEvent);
    
    // Keep only last 1000 events in memory
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // Check for patterns and trigger alerts
    this.analyzeSecurityPatterns();
    
    // Log to external security service in production
    if (process.env.NODE_ENV === 'production') {
      this.logToSecurityService(securityEvent);
    }

    console.warn('Security Event:', securityEvent);
  }

  // Rate limiting
  checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const rateLimitData = this.rateLimits.get(identifier);

    if (!rateLimitData || now > rateLimitData.resetTime) {
      this.rateLimits.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (rateLimitData.count >= limit) {
      this.logEvent({
        type: 'api_abuse',
        severity: 'high',
        ip_address: identifier,
        user_agent: navigator.userAgent,
        details: { limit, count: rateLimitData.count, window: windowMs },
        resolved: false
      });
      return false;
    }

    rateLimitData.count++;
    return true;
  }

  // Detect SQL injection attempts
  detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b)/i,
      /(\bUNION\b.*\bSELECT\b)/i,
      /(\bOR\b.*=.*)/i,
      /(\bAND\b.*=.*)/i,
      /('.*OR.*'.*=.*')/i,
      /(--|\#|\/\*)/,
      /(\bxp_cmdshell\b)/i
    ];

    const isSuspicious = sqlPatterns.some(pattern => pattern.test(input));
    
    if (isSuspicious) {
      this.logEvent({
        type: 'injection_attempt',
        severity: 'critical',
        ip_address: this.getClientIP(),
        user_agent: navigator.userAgent,
        details: { input: input.substring(0, 100), type: 'sql_injection' },
        resolved: false
      });
    }

    return isSuspicious;
  }

  // Detect XSS attempts
  detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]+src[\\s]*=[\\s]*["\']?[\\s]*javascript:/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi
    ];

    const isSuspicious = xssPatterns.some(pattern => pattern.test(input));
    
    if (isSuspicious) {
      this.logEvent({
        type: 'injection_attempt',
        severity: 'critical',
        ip_address: this.getClientIP(),
        user_agent: navigator.userAgent,
        details: { input: input.substring(0, 100), type: 'xss_attempt' },
        resolved: false
      });
    }

    return isSuspicious;
  }

  // Analyze security patterns
  private analyzeSecurityPatterns(): void {
    const recentEvents = this.events.filter(
      event => Date.now() - new Date(event.timestamp).getTime() < 300000 // Last 5 minutes
    );

    // Check for multiple failed logins
    const failedLogins = recentEvents.filter(event => event.type === 'failed_login');
    if (failedLogins.length >= 5) {
      const ips = [...new Set(failedLogins.map(event => event.ip_address))];
      ips.forEach(ip => this.suspiciousIPs.add(ip));
    }

    // Check for suspicious activity patterns
    const suspiciousEvents = recentEvents.filter(
      event => event.severity === 'critical' || event.severity === 'high'
    );
    
    if (suspiciousEvents.length >= 3) {
      this.triggerSecurityAlert(suspiciousEvents);
    }
  }

  private triggerSecurityAlert(events: SecurityEvent[]): void {
    console.error('SECURITY ALERT: Multiple suspicious events detected', events);
    
    // In production, this would notify security team
    if (process.env.NODE_ENV === 'production') {
      // Send alert to security team
      this.notifySecurityTeam(events);
    }
  }

  private logToSecurityService(event: SecurityEvent): void {
    // Placeholder for external security logging service
    // In production, this would send to services like Sentry, LogRocket, etc.
    console.log('Security event logged to external service:', event);
  }

  private notifySecurityTeam(events: SecurityEvent[]): void {
    // Placeholder for security team notification
    // In production, this would send alerts via email, Slack, PagerDuty, etc.
    console.error('Security team notified of critical events:', events);
  }

  private getClientIP(): string {
    // In a real application, this would get the actual client IP
    // For now, return a placeholder
    return 'client_ip_placeholder';
  }

  // Get security metrics
  getMetrics(): SecurityMetrics {
    const now = Date.now();
    const last24Hours = this.events.filter(
      event => now - new Date(event.timestamp).getTime() < 86400000
    );

    return {
      totalEvents: last24Hours.length,
      criticalEvents: last24Hours.filter(event => event.severity === 'critical').length,
      suspiciousIPs: Array.from(this.suspiciousIPs),
      failedLogins: last24Hours.filter(event => event.type === 'failed_login').length,
      lastIncident: this.events[this.events.length - 1]?.timestamp
    };
  }

  // Clear resolved events
  clearResolvedEvents(): void {
    this.events = this.events.filter(event => !event.resolved);
  }
}

export function useSecurityMonitor() {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    suspiciousIPs: [],
    failedLogins: 0
  });
  
  const { executeAsyncSafe } = useErrorHandler();
  const monitor = SecurityMonitor.getInstance();

  // Sanitize user input
  const sanitizeInput = useCallback((input: string): string => {
    // Check for malicious patterns
    if (monitor.detectSQLInjection(input) || monitor.detectXSS(input)) {
      throw new Error('Potentially malicious input detected');
    }

    // Basic sanitization
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }, [monitor]);

  // Secure API call wrapper
  const secureApiCall = useCallback(async <T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T | undefined> => {
    const clientIP = 'client_ip_placeholder'; // Would get real IP in production
    
    // Check rate limiting
    if (!monitor.checkRateLimit(clientIP)) {
      throw new Error('Rate limit exceeded');
    }

    // Log API access
    monitor.logEvent({
      type: 'data_access',
      severity: 'low',
      ip_address: clientIP,
      user_agent: navigator.userAgent,
      details: { context, timestamp: new Date().toISOString() },
      resolved: true
    });

    return await executeAsyncSafe(operation, { context });
  }, [monitor, executeAsyncSafe]);

  // Log security events
  const logSecurityEvent = useCallback((
    type: SecurityEvent['type'],
    severity: SecurityEvent['severity'],
    details: Record<string, unknown>
  ) => {
    monitor.logEvent({
      type,
      severity,
      ip_address: 'client_ip_placeholder',
      user_agent: navigator.userAgent,
      details,
      resolved: false
    });
  }, [monitor]);

  // Refresh metrics
  const refreshMetrics = useCallback(() => {
    setMetrics(monitor.getMetrics());
  }, [monitor]);

  useEffect(() => {
    refreshMetrics();
    const interval = setInterval(refreshMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  return {
    sanitizeInput,
    secureApiCall,
    logSecurityEvent,
    metrics,
    refreshMetrics,
    monitor
  };
}
