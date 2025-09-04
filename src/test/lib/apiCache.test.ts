import { apiCache } from '../../lib/apiCache';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('apiCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset cache state
    apiCache.clear();
  });

  describe('Basic Cache Operations', () => {
    it('should store and retrieve data correctly', async () => {
      const testData = { message: 'Hello World' };
      const cacheKey = 'test-key';

      await apiCache.set(cacheKey, testData);
      const retrieved = await apiCache.get(cacheKey);

      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', async () => {
      const retrieved = await apiCache.get('non-existent-key');
      expect(retrieved).toBeNull();
    });

    it('should handle cache expiration', async () => {
      const testCache = new (apiCache.constructor as any)({
        maxSize: 50 * 1024 * 1024,
        defaultTTL: 5 * 60 * 1000,
        enablePersistence: false,
        lruEnabled: true
      });

      const testData = { message: 'Expires quickly' };
      const cacheKey = 'expiring-key';

      // Set with very short TTL (0ms)
      await testCache.set(cacheKey, testData, { ttl: 0 });

      const retrieved = await testCache.get(cacheKey);
      expect(retrieved).toBeNull();
    });

    it('should clear all cache entries', async () => {
      await apiCache.set('key1', 'value1');
      await apiCache.set('key2', 'value2');

      apiCache.clear();

      expect(await apiCache.get('key1')).toBeNull();
      expect(await apiCache.get('key2')).toBeNull();
    });
  });

  describe('LRU Eviction', () => {
    it('should evict least recently used items when capacity is exceeded', async () => {
      // Create a cache with very small capacity for testing
      const testCache = new (apiCache.constructor as any)({
        maxSize: 25, // Even smaller capacity
        defaultTTL: 5 * 60 * 1000,
        enablePersistence: false,
        lruEnabled: true
      });

      // Set small data that will fit
      await testCache.set('key1', 'val1'); // ~6 bytes
      await testCache.set('key2', 'val2'); // ~6 bytes
      await testCache.set('key3', 'val3'); // ~6 bytes
      await testCache.set('key4', 'value4');
  // Sanity-check keys via assertions

      expect(await testCache.get('key1')).toBeNull(); // Should be evicted
      expect(await testCache.get('key2')).toEqual('val2');
      expect(await testCache.get('key3')).toEqual('val3');
      expect(await testCache.get('key4')).toEqual('value4');
    });

    it('should update LRU order on access', async () => {
      const testCache = new (apiCache.constructor as any)({
        maxSize: 20, // Even smaller capacity
        defaultTTL: 5 * 60 * 1000,
        enablePersistence: false,
        lruEnabled: true
      });

      await testCache.set('key1', 'val1'); // ~6 bytes
      await testCache.set('key2', 'val2'); // ~6 bytes
      await testCache.set('key3', 'val3'); // ~6 bytes

      // Access key1 to make it most recently used
      await testCache.get('key1');

      // Add key4, should evict key2 (least recently used)
      await testCache.set('key4', 'val4'); // ~6 bytes

      expect(await testCache.get('key1')).toEqual('val1'); // Still there
      expect(await testCache.get('key2')).toBeNull(); // Should be evicted
      expect(await testCache.get('key3')).toEqual('val3');
      expect(await testCache.get('key4')).toEqual('val4');
    });
  });

  describe('Cache Persistence', () => {
    it('should persist cache to localStorage', async () => {
      const testData = { persistent: true };

      await apiCache.set('persistent-key', testData);

      // Force persistence by calling the private method
      (apiCache as any).persistCache();

      // Check that localStorage.setItem was called
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const callArgs = localStorageMock.setItem.mock.calls.find(call =>
        call[0] === 'points-companion-cache-v2'
      );
      expect(callArgs).toBeTruthy();
    });

    it('should load cache from localStorage on initialization', () => {
      const mockCacheData = {
        data: [['loaded-key', {
          data: 'loaded-value',
          timestamp: Date.now(),
          ttl: 3600000,
          accessCount: 0,
          lastAccessed: Date.now(),
          size: 26,
          tags: []
        }]],
        timestamp: Date.now()
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockCacheData));

      // Create new cache instance to test loading
  const _newCache = new (apiCache.constructor as any)({
        maxSize: 100 * 1024 * 1024,
        defaultTTL: 5 * 60 * 1000,
        enablePersistence: true,
        persistenceKey: 'test-cache-key',
        lruEnabled: true
      });

      // The cache should have loaded the data
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-cache-key');
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache hits and misses', async () => {
      // Clear cache and reset stats
      apiCache.clear();
      (apiCache as any).stats.hits = 0;
      (apiCache as any).stats.misses = 0;

      await apiCache.set('stats-key', 'stats-value');

      // Hit
      await apiCache.get('stats-key');
      // Miss
      await apiCache.get('non-existent-key');

      const stats = apiCache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(apiCache.getHitRate()).toBe(0.5);
    });

    it('should track cache size and capacity', async () => {
      await apiCache.set('size-key1', 'value1');
      await apiCache.set('size-key2', 'value2');

      const stats = apiCache.getStats();
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.itemCount).toBe(2);
    });
  });

  describe('Request Deduplication', () => {
    it('should deduplicate concurrent requests for the same key', async () => {
      let callCount = 0;
      const mockFetcher = jest.fn(() => {
        callCount++;
        return Promise.resolve('fetched-data');
      });

      // Simulate concurrent requests
      const promises = [
        apiCache.dedupe('dedupe-key', mockFetcher),
        apiCache.dedupe('dedupe-key', mockFetcher),
        apiCache.dedupe('dedupe-key', mockFetcher),
      ];

      const results = await Promise.all(promises);

      // All should return the same data
      results.forEach((result: any) => {
        expect(result).toBe('fetched-data');
      });

      // But fetcher should only be called once
      expect(callCount).toBe(1);
    });

    it('should handle fetch errors gracefully', async () => {
      const mockFetcher = jest.fn(() => Promise.reject(new Error('Fetch failed')));

      await expect(
        apiCache.dedupe('error-key', mockFetcher)
      ).rejects.toThrow('Fetch failed');

      // Should not cache the error
      expect(await apiCache.get('error-key')).toBeNull();
    });
  });

  describe('Tag-based Invalidation', () => {
    it('should invalidate entries by tag', async () => {
      await apiCache.set('tagged-key1', 'value1', { tags: ['tag1'] });
      await apiCache.set('tagged-key2', 'value2', { tags: ['tag1', 'tag2'] });
      await apiCache.set('untagged-key', 'value3');

      apiCache.clearByTags(['tag1']);

      expect(await apiCache.get('tagged-key1')).toBeNull();
      expect(await apiCache.get('tagged-key2')).toBeNull();
      expect(await apiCache.get('untagged-key')).toEqual('value3');
    });

    it('should handle multiple tags correctly', async () => {
      await apiCache.set('multi-key', 'value', { tags: ['tag1', 'tag2', 'tag3'] });

      apiCache.clearByTags(['tag2']);

      expect(await apiCache.get('multi-key')).toBeNull();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle large datasets efficiently', async () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        data: 'x'.repeat(1000), // 1KB per item
      }));

      const startTime = performance.now();

      for (let i = 0; i < largeData.length; i++) {
        await apiCache.set(`large-key-${i}`, largeData[i]);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds max

      // Should be able to retrieve items
      const retrieved = await apiCache.get('large-key-500');
      expect(retrieved).toEqual(largeData[500]);
    });

    it('should maintain performance under concurrent load', async () => {
      const concurrentOperations = 100;
      const promises = [];

      for (let i = 0; i < concurrentOperations; i++) {
        promises.push(apiCache.set(`concurrent-key-${i}`, `value-${i}`));
      }

      const startTime = performance.now();
      await Promise.all(promises);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds max

      // Verify all operations completed
      for (let i = 0; i < concurrentOperations; i++) {
        const value = await apiCache.get(`concurrent-key-${i}`);
        expect(value).toBe(`value-${i}`);
      }
    });
  });
});
