import { NextWebVitalsMetric } from 'next/app';
import { clientLogger } from '@/lib/clientLogger';

const log = clientLogger.child({ component: 'performance-monitor' });

// Extend window interface for gtag
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, unknown>) => void;
  }
}

export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    log.info('Web Vitals', { metric: metric.name, value: metric.value, id: metric.id });
  }

  // Send to analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(
        metric.name === 'CLS' ? metric.value * 1000 : metric.value
      ),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Optional: Send to custom analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_URL) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        id: metric.id,
        timestamp: Date.now(),
      }),
    }).catch((err) => log.error('Failed to send analytics', { error: String(err) }));
  }
}

// Bundle size monitoring
export const logBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    // This will be logged during build
    log.info('Bundle analysis available at: /analyze');
  }
};

// Module marker to ensure TypeScript treats this file as a module
export {};
