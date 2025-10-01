// Service Worker for InfoScope OSINT PWA
const CACHE_NAME = 'infoscope-v2.1.0';
const STATIC_CACHE = 'infoscope-static-v2.1.0';
const DYNAMIC_CACHE = 'infoscope-dynamic-v2.1.0';
const API_CACHE = 'infoscope-api-v2.1.0';

const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/sitemap.xml',
  '/robots.txt'
];

// SEO-friendly routes to cache
const IMPORTANT_ROUTES = [
  '/',
  '/tools',
  '/investigation',
  '/profile',
  '/about',
  '/browser',
  '/tools/reconnaissance',
  '/tools/people',
  '/tools/domains',
  '/tools/email',
  '/tools/social',
  '/tools/security',
  '/tools/communication'
];

// API endpoints to cache for offline functionality
const API_ENDPOINTS = [
  '/api/osint-tools',
  '/api/user-data',
  '/api/favorites'
];

// Push notification configuration
const NOTIFICATION_CONFIG = {
  badge: '/logo192.png',
  icon: '/logo192.png',
  tag: 'infoscope-notification',
  renotify: true,
  requireInteraction: false,
  silent: false
};

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[SW] InfoScope OSINT v2.0.0 installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets for SEO');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Service Worker installed successfully');
        self.skipWaiting(); // Force activation of new service worker
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Fetch event - enhanced caching strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          // For HTML requests, fetch in background to update cache
          if (event.request.destination === 'document') {
            fetch(event.request)
              .then((networkResponse) => {
                if (networkResponse.ok) {
                  caches.open(DYNAMIC_CACHE)
                    .then((cache) => cache.put(event.request, networkResponse.clone()));
                }
              })
              .catch(() => {
                // Network failed, but we have cache
              });
          }
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response
            const responseToCache = networkResponse.clone();

            // Add to cache for future use
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // Network failed and no cache, return offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
            throw new Error('Network failed and no cache available');
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker activated');
      return self.clients.claim(); // Take control of all pages
    })
  );
});

// Push event - handle push notifications (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/logo192.png',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open InfoScope',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close notification',
        icon: '/favicon.ico'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('InfoScope OSINT', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open InfoScope
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync (for future use)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations
      console.log('Background sync triggered')
    );
  }
});

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline investigations
self.addEventListener('sync', (event) => {
  if (event.tag === 'investigation-sync') {
    event.waitUntil(
      // Sync investigations when back online
      syncInvestigations()
    );
  }
});

async function syncInvestigations() {
  // In a real implementation, this would sync pending investigations
  // with Firebase when the connection is restored
  console.log('Syncing investigations...');
}

// Push notifications for investigation updates
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Investigation update available',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open InfoScope',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close notification',
        icon: '/favicon.ico'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('InfoScope OSINT', options)
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received:', event);
  
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'InfoScope OSINT', body: 'New update available' };
  }

  const options = {
    body: data.body || 'OSINT investigation update',
    icon: NOTIFICATION_CONFIG.icon,
    badge: NOTIFICATION_CONFIG.badge,
    tag: data.tag || NOTIFICATION_CONFIG.tag,
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Open InfoScope',
        icon: '/logo192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/favicon.ico'
      }
    ],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    vibrate: [200, 100, 200],
    timestamp: Date.now()
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'InfoScope OSINT', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Open or focus the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if app not open
        if (clients.openWindow) {
          const url = event.notification.data?.url || '/';
          return clients.openWindow(url);
        }
      })
    );
  } else if (event.action === 'dismiss') {
    // Just close notification - no action needed
    console.log('[SW] Notification dismissed');
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'osint-investigation-sync') {
    event.waitUntil(syncInvestigationData());
  } else if (event.tag === 'favorites-sync') {
    event.waitUntil(syncFavoritesData());
  } else if (event.tag === 'user-data-sync') {
    event.waitUntil(syncUserData());
  }
});

// Sync investigation data when back online
async function syncInvestigationData() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const pendingData = await cache.match('/pending-investigations');
    
    if (pendingData) {
      const investigations = await pendingData.json();
      // Sync with server when online
      for (const investigation of investigations) {
        await fetch('/api/investigations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(investigation)
        });
      }
      // Clear pending data after successful sync
      await cache.delete('/pending-investigations');
      console.log('[SW] Investigation data synced successfully');
    }
  } catch (error) {
    console.error('[SW] Investigation sync failed:', error);
  }
}

// Sync favorites data
async function syncFavoritesData() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const pendingData = await cache.match('/pending-favorites');
    
    if (pendingData) {
      const favorites = await pendingData.json();
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(favorites)
      });
      await cache.delete('/pending-favorites');
      console.log('[SW] Favorites data synced successfully');
    }
  } catch (error) {
    console.error('[SW] Favorites sync failed:', error);
  }
}

// Sync user data
async function syncUserData() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const pendingData = await cache.match('/pending-user-data');
    
    if (pendingData) {
      const userData = await pendingData.json();
      await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      await cache.delete('/pending-user-data');
      console.log('[SW] User data synced successfully');
    }
  } catch (error) {
    console.error('[SW] User data sync failed:', error);
  }
}

// Handle messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});