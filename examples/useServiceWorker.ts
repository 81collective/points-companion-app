'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isInstalled: boolean;
  isUpdateAvailable: boolean;
  isOnline: boolean;
}

const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isInstalled: false,
    isUpdateAvailable: false,
    // Guard for SSR: navigator is not defined on the server
    isOnline: typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true,
  });

  useEffect(() => {
    // Guard for SSR and feature detection
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Online/offline status
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      setState(prev => ({ ...prev, isInstalled: true }));

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState(prev => ({ ...prev, isUpdateAvailable: true }));
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'BACKGROUND_SYNC_COMPLETE') {
          console.log('Background sync completed');
        }
      });

      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const updateServiceWorker = () => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }
      });
    }
  };

  return {
    ...state,
    updateServiceWorker,
  };
};

export default useServiceWorker;
