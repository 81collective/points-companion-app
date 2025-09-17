// Version bump (v3) to simplify strategy and avoid stale app shells causing perpetual loading spinners
const CACHE_NAME = 'points-companion-v3';
const STATIC_CACHE_NAME = 'points-companion-static-v3';
const DYNAMIC_CACHE_NAME = 'points-companion-dynamic-v3';

// Minimal static assets to precache. Avoid precaching dynamic routes to prevent stale shells.
// Root path is optional; Next.js can stream SSR. We cache only manifest & icons.
const STATIC_ASSETS = [
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
  STALE_WHILE_REVALIDATE: [],
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
        if ('navigationPreload' in self.registration) {
          try { self.registration.navigationPreload.enable(); } catch (_) {}
        }
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (!request.url.startsWith('http')) return;
  if (request.url.includes('/sw.js')) return;

  // For top-level navigation always try network first with timeout -> fallback to cached (if any) else network no-cache.
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  event.respondWith(handleRequest(request));
});

async function handleNavigationRequest(request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // fail fast to avoid spinner
  try {
    const networkResponse = await fetch(request, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timeout);
    if (networkResponse && networkResponse.ok) return networkResponse;
    // fallback to any cached root shell
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedRoot = await cache.match('/');
    if (cachedRoot) return cachedRoot;
    return networkResponse;
  } catch (err) {
    clearTimeout(timeout);
    // offline or timeout: serve cached root if present
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedRoot = await cache.match('/');
    if (cachedRoot) return cachedRoot;
    return new Response('<!DOCTYPE html><title>Offline</title><h1>Offline</h1><p>Content not cached.</p>', { status: 503, headers: { 'Content-Type': 'text/html' }});
  }
}

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
  // No longer used (strategies list empty) but kept for potential future selective usage.
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => undefined);
  return cachedResponse || fetchPromise || new Response('', { status: 504 });
}

async function handleOffline(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) return cachedResponse;
  if (request.mode === 'navigate') {
    const root = await cache.match('/');
    if (root) return root;
  }
  return new Response(JSON.stringify({ error: 'Offline', message: 'Not cached.' }), { status: 503, headers: { 'Content-Type': 'application/json' }});
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
  body: data.body || 'New notification from PointAdvisor',
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
  data.title || 'PointAdvisor',
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
