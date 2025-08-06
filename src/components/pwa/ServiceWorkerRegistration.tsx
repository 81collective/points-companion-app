'use client';

import { useEffect } from 'react';
import useServiceWorker from '@/hooks/useServiceWorker';

const ServiceWorkerRegistration = () => {
  const { isInstalled, isUpdateAvailable, updateServiceWorker } = useServiceWorker();

  useEffect(() => {
    if (isUpdateAvailable) {
      // Automatically update service worker
      updateServiceWorker();
    }
  }, [isUpdateAvailable, updateServiceWorker]);

  // This component doesn't render anything visible
  return null;
};

export default ServiceWorkerRegistration;
