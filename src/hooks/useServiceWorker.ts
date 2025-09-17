'use client';

import { useEffect, useState, useRef } from 'react';

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

  const recoveryAttempted = useRef(false);
  const SW_VERSION = 'v3';

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

    // Fallback: if page still shows loader due to stale SW not responding, attempt unregister once after timeout
    const recoveryTimer = setTimeout(async () => {
      if (recoveryAttempted.current) return;
      // Heuristic: if we don't have controller or installing state never progressed
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg && reg.active) {
            // Probe active worker for version; if no response in 2s, unregister
            const versionProbe = new Promise<boolean>((resolve) => {
              const channel = new MessageChannel();
              const timeout = setTimeout(() => resolve(false), 2000);
              channel.port1.onmessage = (e) => {
                clearTimeout(timeout);
                if (e.data && e.data.type === 'SW_VERSION' && e.data.version === SW_VERSION) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              };
              try { reg.active?.postMessage({ type: 'GET_VERSION' }, [channel.port2]); } catch { resolve(false); }
            });
            const upToDate = await versionProbe;
            if (!upToDate) {
              recoveryAttempted.current = true;
              await reg.unregister();
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }
          }
        } catch {
          /* silent */
        }
      }
    }, 8000); // 8s after mount

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
      clearTimeout(recoveryTimer);
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
        if (!event.data) return;
        if (event.data.type === 'BACKGROUND_SYNC_COMPLETE') {
          console.log('Background sync completed');
        }
        if (event.data.type === 'SW_VERSION') {
          // If version mismatch and we haven't flagged update, request refresh
          if (event.data.version !== SW_VERSION) {
            setState(prev => ({ ...prev, isUpdateAvailable: true }));
          }
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
        // If no waiting worker but active is outdated, force unregister flow
        else if (registration?.active) {
          registration.active.postMessage({ type: 'GET_VERSION' });
          setTimeout(async () => {
            if (state.isUpdateAvailable) {
              await registration.unregister();
              if (typeof window !== 'undefined') window.location.reload();
            }
          }, 1500);
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
