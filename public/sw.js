// AdaKDS Service Worker - Basic offline caching

const CACHE_NAME = 'adakds-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/_next/static/css/',
  '/_next/static/js/',
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

  // API requests - network first
  if (url.pathname.startsWith('/api/') || url.hostname !== self.location.hostname) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache API responses - they need to be fresh
          return response;
        })
        .catch(() => {
          // Return offline message for API failures
          if (url.pathname.startsWith('/api/')) {
            return new Response(
              JSON.stringify({ error: 'OFFLINE', message: 'No network connection' }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          }
          throw new Error('Network error');
        })
    );
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