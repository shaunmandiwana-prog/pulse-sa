// Pulse SA — Service Worker
// Caches everything on first load. Works fully offline after that.

const CACHE_NAME = 'pulse-sa-v1';

// Everything we need to cache for full offline use
const STATIC_ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    // Google Fonts — cache them so no data needed after first load
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
    // Font Awesome — icons
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
    // Leaflet (ward map)
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
];

// Install: cache all static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Caching static assets...');
            // Cache local files first (must succeed), then try external
            const localAssets = ['./', './index.html', './style.css', './app.js'];
            const externalAssets = STATIC_ASSETS.filter(a => !localAssets.includes(a));
            return cache.addAll(localAssets).then(() => {
                // External assets: try each individually, don't fail if one is unavailable
                return Promise.allSettled(
                    externalAssets.map(url =>
                        cache.add(url).catch(e => console.warn('[SW] Could not cache:', url, e))
                    )
                );
            });
        }).then(() => self.skipWaiting())
    );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch: cache-first strategy for everything
// Falls back to network if not in cache, then caches the response
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip the MDB ArcGIS tile requests — these need live data
    // But serve from cache if we have them (so ward map works offline with last loaded metro)
    const url = event.request.url;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;

            // Not in cache — try network, then cache the response
            return fetch(event.request).then(response => {
                // Only cache successful responses
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }
                // Cache a clone (response body can only be read once)
                const toCache = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
                return response;
            }).catch(() => {
                // Network failed and nothing in cache
                // For navigation requests, return the cached index.html
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                // For everything else, return a minimal offline response
                return new Response('Offline — no cached version available', {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain' }
                });
            });
        })
    );
});
