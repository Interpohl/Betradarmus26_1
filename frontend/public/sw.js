/* eslint-disable no-restricted-globals */

/**
 * BETRADARMUS Service Worker
 * Handles push notifications and caching
 */

// Cache name for offline support
const CACHE_NAME = 'betradarmus-v1';

// Install event - cache basic assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = {
    title: 'BETRADARMUS',
    body: 'Neue Benachrichtigung',
    icon: '/logo192.png',
    badge: '/badge.png',
    tag: 'default',
    data: { url: '/' }
  };
  
  // Parse push data if available
  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/logo192.png',
    badge: data.badge || '/badge.png',
    tag: data.tag || 'betradarmus-notification',
    data: data.data || { url: '/' },
    vibrate: [100, 50, 100],
    requireInteraction: data.type === 'signal', // Signals require user action
    actions: data.actions || []
  };
  
  // Add actions for signal notifications
  if (data.type === 'signal') {
    options.actions = [
      { action: 'view', title: '📊 Anzeigen' },
      { action: 'dismiss', title: '❌ Später' }
    ];
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  
  notification.close();
  
  if (action === 'dismiss') {
    // User dismissed, do nothing
    return;
  }
  
  // Default or 'view' action - open the app
  const targetUrl = data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if a window is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Navigate existing window
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              url: targetUrl,
              data: data
            });
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Notification close event - track dismissals
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event);
});

// Message event - handle messages from main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event - basic caching strategy (network first)
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip caching for API requests
  if (event.request.url.includes('/api/')) return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response for caching
        const responseClone = response.clone();
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Return cached response if network fails
        return caches.match(event.request);
      })
  );
});
