// Atom Builder Service Worker — Offline support
const CACHE_NAME = 'atom-builder-v2';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './og-image.png',
];

// Install: cache core assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: network-first, fall back to cache
self.addEventListener('fetch', (e) => {
    // Only handle same-origin GET requests
    if (e.request.method !== 'GET') return;

    e.respondWith(
        fetch(e.request)
            .then((response) => {
                // Cache successful responses
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, clone);
                    });
                }
                return response;
            })
            .catch(() => caches.match(e.request))
    );
});
