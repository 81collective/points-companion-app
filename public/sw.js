// Version bump (v2) to ensure clients activate updated logic that avoids caching non-GET requests
const CACHE_NAME = 'points-companion-v2';
const STATIC_CACHE_NAME = 'points-companion-static-v2';
const DYNAMIC_CACHE_NAME = 'points-companion-dynamic-v2';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/ai',
  '/analytics',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Runtime caching patterns
const CACHE_STRATEGIES = {
  // Cache first for static assets
  CACHE_FIRST: [
    /\.(?:js|css|png|jpg|jpeg|svg|ico|woff|woff2)$/,
    /\/icons\//,
    /\/api\/static\//,
  ],
  
  // Network first for API calls
  NETWORK_FIRST: [
    /\/api\/(?!static)/,
    /\/auth\//,
  ],
  
  // Stale while revalidate for pages
  STALE_WHILE_REVALIDATE: [
    /\/dashboard/,
    /\/ai/,
    /\/analytics/,
  ],
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Skip requests for service worker updates
  if (request.url.includes('/sw.js')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Determine caching strategy
    if (shouldUseCacheFirst(request)) {
      return await cacheFirst(request);
    } else if (shouldUseNetworkFirst(request)) {
      return await networkFirst(request);
    } else {
      return await staleWhileRevalidate(request);
    }
  } catch (error) {
    console.error('[SW] Request handling failed:', error);
    return await handleOffline(request);
  }
}

function shouldUseCacheFirst(request) {
  return CACHE_STRATEGIES.CACHE_FIRST.some(pattern => 
    pattern.test(request.url)
  );
}

function shouldUseNetworkFirst(request) {
  return CACHE_STRATEGIES.NETWORK_FIRST.some(pattern => 
    pattern.test(request.url)
  );
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    }).catch(() => {
      // Ignore network errors for background updates
    });
    
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    
    // Only cache safe idempotent GET requests; some browsers throw on cache.put with POST/other
    if (networkResponse.ok && request.method === 'GET') {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Always try to fetch and update cache
  const fetchPromise = request.method === 'GET'
    ? fetch(request).then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      }).catch(() => {
        // Ignore network errors
      })
    : fetch(request); // For non-GET just passthrough without caching
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network if no cache
  return await fetchPromise;
}

async function handleOffline(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  // Try to serve from cache
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // For navigation requests, serve offline page
  if (request.mode === 'navigate') {
    const offlinePage = await cache.match('/offline');
    if (offlinePage) {
      return offlinePage;
    }
  }
  
  // Return a basic offline response
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'You are currently offline and this content is not cached.'
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  try {
    // Handle any queued actions when coming back online
    console.log('[SW] Background sync triggered');
    
    // Notify clients that sync completed
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_COMPLETE'
      });
    });
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New notification from Points Companion',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      vibrate: [100, 50, 100],
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/action-view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/action-dismiss.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Points Companion',
        options
      )
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the app to relevant page
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
