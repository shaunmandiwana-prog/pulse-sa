// Pulse SA - Service Worker
// Caches everything on first load. Works fully offline after that.

const CACHE_NAME = 'pulse-sa-v31';

// Everything we need to cache for full offline use
const STATIC_ASSETS = [
    './',
    './landing.html',
    './index.html',
    './agent.html',
    './exec_sum.html',
    './Pulse_SA_Executive_Summary.pdf',
    './Pulse_SA_Agent_Terms_and_POPIA_Policy.pdf',
    './supabase.js',
    './dqs-engine.js',
    './ai-questions.js',
    './style.css',
    './app.js',
    // Google Fonts - cache them so no data needed after first load
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
    // Font Awesome - icons
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
            const localAssets = ['./', './index.html', './agent.html', './supabase.js', './dqs-engine.js', './ai-questions.js', './style.css', './app.js'];
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

// Fetch strategy:
// - Local app files: NETWORK-FIRST (always get latest code)
// - External CDN assets: CACHE-FIRST (fonts, icons don't change)
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    const isLocalFile = url.origin === self.location.origin;

    if (isLocalFile) {
        // NETWORK-FIRST for our own files - always try to get the latest
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response && response.status === 200) {
                        const toCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request).then(cached => {
                    if (cached) return cached;
                    if (event.request.mode === 'navigate') return caches.match('./index.html');
                    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
                }))
        );
    } else {
        // CACHE-FIRST for external CDN resources (fonts, icons, Leaflet)
        event.respondWith(
            caches.match(event.request).then(cached => {
                if (cached) return cached;
                return fetch(event.request).then(response => {
                    if (response && response.status === 200) {
                        const toCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
                    }
                    return response;
                }).catch(() => new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } }));
            })
        );
    }
});






