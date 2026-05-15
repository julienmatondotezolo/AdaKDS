// AdaKDS Service Worker - Basic offline caching

const CACHE_NAME = 'adakds-v1';
const STATIC_ASSETS = [
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('AdaKDS Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS.filter(url => url.endsWith('/')));
    })
  );
  
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('AdaKDS Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Fetch event - network first for API, cache first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Skip navigation requests (let browser handle redirects to auth, etc.)
  if (request.mode === 'navigate') {
    return;
  }

  // Cross-origin requests (API calls to api-kds.adasystems.app, auth.adasystems.app, etc.)
  // are NOT intercepted — the browser handles them directly. Intercepting them caused
  // CORS preflights to fail and masked real errors as synthetic 503s.
  if (url.hostname !== self.location.hostname) {
    return;
  }

  // Same-origin API: pass through, do not cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        
        return response;
      });
    })
  );
});

// Background sync for offline order updates (future feature)
self.addEventListener('sync', (event) => {
  if (event.tag === 'order-update') {
    console.log('Background sync: order-update');
    // Future: Handle offline order updates
  }
});

// Push notifications for urgent orders (future feature)
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.message || 'New kitchen notification',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'kds-notification',
      data: data,
      requireInteraction: data.urgent || false,
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'AdaKDS', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification);
  
  event.notification.close();
  
  // Focus the app window
  event.waitUntil(
    self.clients.openWindow('/')
  );
});