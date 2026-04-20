/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'bbrains-pwa-v1'
const PRECACHE_URLS = ['/offline', '/icon-192.png', '/icon-512.png', '/manifest.webmanifest']

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
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          // Optionally, cache new static assets here (dynamic caching)
          return response;
        })
        .catch(() => undefined); // Could fallback to a generic offline asset if desired
    })
  );
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  const payload = event.data.json()
  const title = payload?.title || 'Bbrains'
  const body = payload?.body || ''
  const icon = payload?.icon || '/icon-192.png'
  const badge = payload?.badge || '/icon-192.png'
  const url = payload?.data?.url || payload?.url || '/chat'
  const tag = payload?.tag

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag,
      data: { url },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification?.data?.url || '/chat'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const matchingClient = clients.find((client) => 'focus' in client)

      if (matchingClient) {
        matchingClient.focus()
        if ('navigate' in matchingClient) {
          return matchingClient.navigate(targetUrl)
        }
        return undefined
      }

      return self.clients.openWindow(targetUrl)
    })
  )
})
