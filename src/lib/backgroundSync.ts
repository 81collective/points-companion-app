// Background sync utility for offline data handling and synchronization
import React from 'react';
interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data: unknown;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'normal' | 'high';
}

interface SyncConfig {
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  enableBackgroundSync: boolean;
}

class BackgroundSyncManager {
  private queue: SyncQueueItem[] = [];
  private isOnline = true;
  private isProcessing = false;
  private config: SyncConfig = {
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
    batchSize: 10,
    enableBackgroundSync: true
  };

  constructor(config?: Partial<SyncConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Load persisted queue on initialization
    this.loadPersistedQueue();

    // Set up online/offline listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }

    // Set up periodic processing
    if (typeof global !== 'undefined') {
      setInterval(() => {
        if (this.isOnline && !this.isProcessing) {
          this.processQueue();
        }
      }, 30000); // Process every 30 seconds
    }
  }

  // Add item to sync queue
  async addToQueue(
    type: SyncQueueItem['type'],
    endpoint: string,
    data: unknown,
    options: {
      priority?: SyncQueueItem['priority'];
      maxRetries?: number;
    } = {}
  ): Promise<string> {
    const id = this.generateId();
    const item: SyncQueueItem = {
      id,
      type,
      endpoint,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries || this.config.maxRetries,
      priority: options.priority || 'normal'
    };

    this.queue.push(item);
    this.persistQueue();

    // Try to sync immediately if online
    if (this.isOnline && !this.isProcessing) {
      setTimeout(() => this.processQueue(), 100);
    }

    return id;
  }

  // Process sync queue
  private async processQueue(): Promise<void> {
    if (this.isProcessing || !this.isOnline || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Sort by priority and timestamp
      this.queue.sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.timestamp - b.timestamp;
      });

      // Process items in batches
      const batch = this.queue.slice(0, this.config.batchSize);
      const results = await Promise.allSettled(
        batch.map(item => this.processItem(item))
      );

      // Remove successfully processed items
      const successfulIds = new Set<string>();
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulIds.add(batch[index].id);
        }
      });

      this.queue = this.queue.filter(item => !successfulIds.has(item.id));
      this.persistQueue();

      // Notify about sync completion
      if (successfulIds.size > 0) {
        this.notifySyncComplete(successfulIds.size);
      }

    } catch (error) {
      console.error('Background sync processing failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Process individual queue item
  private async processItem(item: SyncQueueItem): Promise<void> {
    try {
      const method = this.getHttpMethod(item.type);
      const response = await fetch(item.endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Sync-Request': 'true'
        },
        body: method !== 'GET' ? JSON.stringify(item.data) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`Successfully synced ${item.type} to ${item.endpoint}`);
    } catch (error) {
      item.retryCount++;

      if (item.retryCount < item.maxRetries) {
        // Schedule retry with exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, item.retryCount - 1);
        setTimeout(() => {
          this.processItem(item);
        }, delay);
      } else {
        console.error(`Failed to sync ${item.type} to ${item.endpoint} after ${item.maxRetries} retries:`, error);
        // Could emit an event for failed syncs that need user attention
      }

      throw error;
    }
  }

  // Get HTTP method for sync type
  private getHttpMethod(type: SyncQueueItem['type']): string {
    switch (type) {
      case 'create': return 'POST';
      case 'update': return 'PUT';
      case 'delete': return 'DELETE';
      default: return 'POST';
    }
  }

  // Generate unique ID for queue items
  private generateId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Persist queue to localStorage
  private persistQueue(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      localStorage.setItem('background-sync-queue', JSON.stringify(this.queue));
    } catch (error) {
      console.warn('Failed to persist sync queue:', error);
    }
  }

  // Load persisted queue from localStorage
  private loadPersistedQueue(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const persisted = localStorage.getItem('background-sync-queue');
      if (persisted) {
        this.queue = JSON.parse(persisted);
        console.log(`Loaded ${this.queue.length} items from sync queue`);
      }
    } catch (error) {
      console.warn('Failed to load persisted sync queue:', error);
      localStorage.removeItem('background-sync-queue');
    }
  }

  // Notify about sync completion
  private notifySyncComplete(count: number): void {
    // Send message to service worker
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.controller?.postMessage({
        type: 'SYNC_COMPLETE',
        count
      });
    }

    // Dispatch custom event for UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backgroundSyncComplete', {
        detail: { syncedCount: count }
      }));
    }
  }

  // Get queue status
  getQueueStatus() {
    const pending = this.queue.length;
    const failed = this.queue.filter(item => item.retryCount >= item.maxRetries).length;
    const processing = this.isProcessing;

    return {
      pending,
      failed,
      processing,
      isOnline: this.isOnline,
      total: pending + failed
    };
  }

  // Clear failed items
  clearFailedItems(): number {
    const failedCount = this.queue.filter(item => item.retryCount >= item.maxRetries).length;
    this.queue = this.queue.filter(item => item.retryCount < item.maxRetries);
    this.persistQueue();
    return failedCount;
  }

  // Force immediate sync
  async forceSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    await this.processQueue();
  }
}

// Global background sync instance
export const backgroundSync = new BackgroundSyncManager();

// Utility functions for common sync operations
export const syncUserAction = async (
  type: SyncQueueItem['type'],
  endpoint: string,
  data: unknown,
  priority: SyncQueueItem['priority'] = 'normal'
) => {
  return backgroundSync.addToQueue(type, endpoint, data, { priority });
};

export const syncLocationData = async (locationData: unknown) => {
  return syncUserAction('update', '/api/location/sync', locationData, 'high');
};

export const syncUserPreferences = async (preferences: unknown) => {
  return syncUserAction('update', '/api/user/preferences', preferences, 'low');
};

// React hook for background sync status
export const useBackgroundSync = () => {
  const [status, setStatus] = React.useState(backgroundSync.getQueueStatus());

  React.useEffect(() => {
    const updateStatus = () => setStatus(backgroundSync.getQueueStatus());

    // Update status periodically
    const interval = setInterval(updateStatus, 5000);

    // Listen for sync completion events
    const handleSyncComplete = () => {
      updateStatus();
      // Could show a toast notification here
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('backgroundSyncComplete', handleSyncComplete);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('backgroundSyncComplete', handleSyncComplete);
      }
    };
  }, []);

  return {
    ...status,
    forceSync: backgroundSync.forceSync.bind(backgroundSync),
    clearFailed: backgroundSync.clearFailedItems.bind(backgroundSync)
  };
};
