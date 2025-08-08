// Performance monitoring and optimization utilities
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
}

// Web Vitals monitoring
export function reportWebVitals(metric: WebVitalsMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Web Vital: ${metric.name}`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta
    });
  }

  // In production, you would send to analytics service
  // Example: analytics.track('Web Vital', { metric });
}

// Initialize Web Vitals monitoring
export function initWebVitals() {
  onCLS(reportWebVitals);
  onINP(reportWebVitals); // INP replaced FID in web-vitals v3
  onFCP(reportWebVitals);
  onLCP(reportWebVitals);
  onTTFB(reportWebVitals);
}

// Performance mark utility
export function performanceMark(name: string) {
  if (typeof window !== 'undefined' && window.performance && typeof window.performance.mark === 'function') {
    window.performance.mark(name);
  }
}

// Performance measure utility
export function performanceMeasure(name: string, startMark: string, endMark?: string) {
  if (typeof window !== 'undefined' && window.performance && typeof window.performance.measure === 'function') {
    try {
      if (endMark) {
        window.performance.measure(name, startMark, endMark);
      } else {
        window.performance.measure(name, startMark);
      }
      const measureEntries = window.performance.getEntriesByName(name, 'measure') as PerformanceEntry[];
      const measure = measureEntries[0];
      if (measure && typeof measure.duration === 'number') {
        console.log(`Performance: ${name} took ${measure.duration.toFixed(2)}ms`);
        return measure.duration;
      }
    } catch (error) {
      console.warn('Performance measurement failed:', error);
    }
  }
  return 0;
}

// Bundle size analyzer
export function analyzeBundleSize() {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const scripts = Array.from(document.scripts);
    const styles = Array.from(document.styleSheets);

    console.group('Bundle Analysis');
    console.log('Scripts loaded:', scripts.length);
    console.log('Stylesheets loaded:', styles.length);
    console.log('DOM elements:', document.querySelectorAll('*').length);
    console.groupEnd();
  }
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    type MemoryInfo = {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
    type PerformanceWithMemory = Performance & { memory?: MemoryInfo };

    const perf = window.performance as PerformanceWithMemory;
    const memory = perf.memory;
    if (memory) {
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
  }
  return null;
}

// Image loading optimization
export function preloadCriticalImages(imageUrls: string[]) {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    imageUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }
}

// Resource hints
export function addResourceHints(domains: string[]) {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });
  }
}
