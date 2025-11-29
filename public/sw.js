// Service Worker for Jimpitan App PWA
const CACHE_NAME = 'jimpitan-v1.0.0';
const RUNTIME_CACHE = 'jimpitan-runtime';

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event - precache essential files
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip Google Apps Script API calls (always need network)
  if (request.url.includes('script.google.com')) {
    return;
  }

  // Network first strategy for HTML
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the response
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Cache first strategy for static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone and cache the response
        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      });
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Background sync for offline transactions (future feature)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  // TODO: Implement offline transaction sync
  console.log('[SW] Syncing offline transactions');
}

// Push notification support (future feature)
self.addEventListener('push', (event) => {
  // Push payload may be JSON or plain text. Be defensive and handle both.
  let data = {};

  if (event.data) {
    try {
      // Prefer structured JSON payload
      data = event.data.json();
    } catch (err) {
      // Not valid JSON: fallback to raw text
      try {
        const raw = (typeof event.data.text === 'function') ? event.data.text() : String(event.data);
        // Try parse text as JSON in case it's a JSON string
        data = JSON.parse(raw);
      } catch (e) {
        // Final fallback -> use raw text as body
        const raw = (typeof event.data.text === 'function') ? event.data.text() : String(event.data);
        data = { title: 'Jimpitan App', body: raw, url: '/' };
      }
    }
  }

  const title = data.title || 'Jimpitan App';
  const options = {
    body: data.body || 'New notification',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: (typeof data.url === 'string') ? data.url : (data.url || '/')
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const payload = event.notification.data;
      let url = '/';
      if (typeof payload === 'string') {
        url = payload;
      } else if (payload && typeof payload.url === 'string') {
        url = payload.url;
      }
      try {
        await clients.openWindow(url);
      } catch (err) {
        // ignore
      }
    })()
  );
});
