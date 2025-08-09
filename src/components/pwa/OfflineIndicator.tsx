'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const [_isOnline, setIsOnline] = useState(true); // underscore to suppress unused until UI uses it
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(false);
      
      // Show online toast briefly
      const onlineToast = document.createElement('div');
      onlineToast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
      onlineToast.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
          </svg>
          <span>Back online!</span>
        </div>
      `;
      document.body.appendChild(onlineToast);
      
      setTimeout(() => {
        if (onlineToast.parentNode) {
          document.body.removeChild(onlineToast);
        }
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    // Attempt to reload the page or retry last action
    window.location.reload();
  };

  if (!showOfflineToast) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">You&apos;re offline</span>
        </div>
        <button
          onClick={handleRetry}
          className="ml-3 text-red-200 hover:text-white transition-colors"
          title="Retry connection"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-red-200 mt-1">
        Some features may be limited. We&apos;ll sync when you&apos;re back online.
      </p>
    </div>
  );
};

// Hook for components to check online status
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default OfflineIndicator;
