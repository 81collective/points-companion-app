'use client';

import { useEffect } from 'react';
import { initWebVitals, performanceMark, monitorMemoryUsage } from '@/lib/performance';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Initialize Web Vitals monitoring
    initWebVitals();

    // Performance marks for page load
    performanceMark('app-start');

    // Monitor memory usage periodically
    const memoryInterval = setInterval(() => {
      const memory = monitorMemoryUsage();
      if (memory && memory.usage > 80) {
        console.warn('High memory usage detected:', memory);
      }
    }, 30000); // Check every 30 seconds

    // Performance observer for long tasks
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'longtask') {
            console.warn('Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime
            });
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task observer not supported');
      }
    }

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);

  return null; // This component doesn't render anything
}
