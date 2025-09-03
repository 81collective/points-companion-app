'use client';

import { useEffect } from 'react';

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
}

interface PerformanceWithMemory extends Performance {
  memory: PerformanceMemory;
}

export default function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals using Performance Observer API
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Monitor Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            console.log('LCP:', lastEntry.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Monitor First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const perfEntry = entry as PerformanceEventTiming;
            if ('processingStart' in perfEntry) {
              console.log('FID:', perfEntry.processingStart - entry.startTime);
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Monitor Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const layoutShiftEntry = entry as LayoutShiftEntry;
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
            }
          });
          console.log('CLS:', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Monitor First Contentful Paint (FCP)
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              console.log('FCP:', entry.startTime);
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

        // Monitor Time to First Byte (TTFB)
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('TTFB:', navEntry.responseStart);
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });

        return () => {
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
          fcpObserver.disconnect();
          navigationObserver.disconnect();
        };
      } catch (error) {
        console.warn('Performance monitoring not fully supported:', error);
      }
    }

    // Monitor memory usage periodically
    const memoryInterval = setInterval(() => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const perf = window.performance as PerformanceWithMemory;
        const memory = perf.memory;
        if (memory) {
          const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
          if (usagePercent > 80) {
            console.warn('High memory usage detected:', {
              used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
              limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`,
              usage: `${usagePercent.toFixed(1)}%`
            });
          }
        }
      }
    }, 30000); // Check every 30 seconds

    // Performance observer for long tasks
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'longtask') {
            console.warn('Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime
            });

            // Report long task to analytics
            if (window.gtag) {
              window.gtag('event', 'long_task', {
                event_category: 'Performance',
                event_label: 'Long Task',
                value: Math.round(entry.duration)
              });
            }
          }
        });
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('Long task observer not supported:', error);
      }
    }

    return () => clearInterval(memoryInterval);
  }, []);

  return null; // This component doesn't render anything
}
