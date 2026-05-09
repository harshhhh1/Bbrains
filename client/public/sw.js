/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'bbrains-pwa-v1'
const PRECACHE_URLS = ['/offline', '/manifest-icon-192.maskable.png', '/manifest-icon-512.maskable.png', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return
  
  const url = new URL(request.url)

  // Skip API requests and cross-origin requests
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api')) {
    return
  }

  // Offline fallback for navigation requests.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Optionally, cache the page here if you want dynamic caching
          return response;
        })
        .catch(() => caches.match('/offline'))
    );
    return;
  }

  // Cache-first for static assets (images, CSS, JS, etc.)
  const isStaticAsset = 
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff2?|ico|json|webmanifest)$/) ||
    PRECACHE_URLS.includes(url.pathname)

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request)
          .then((response) => {
            // Optionally, cache new static assets here (dynamic caching)
            return response
          })
          .catch(() => undefined)
      })
    )
  }
})
