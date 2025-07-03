// Service Worker for AIIMS Jammu Website - DISABLED
// This service worker is currently disabled to prevent conflicts with Next.js development server

console.log('Service Worker is disabled');

// Immediately skip waiting and claim clients to deactivate any existing service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing (disabled)');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating (disabled)');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Clear all caches
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});

// Don't intercept any fetch requests
self.addEventListener('fetch', (event) => {
  // Let the browser handle all requests normally
  return;
});
