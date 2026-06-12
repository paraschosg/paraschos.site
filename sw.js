// Bump this version on every deploy so visitors get fresh files.
const CACHE = 'paraschos-v2';
const PRECACHE = [
    '/',
    '/index.html',
    '/privacy.html',
    '/css/styles.css',
    '/js/script.js',
    '/assets/starr.webp',
    '/blog/posts.json'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
    );
});

// Delete old cache versions on activate.
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);

    // Only handle same-origin GET requests; let analytics/API calls pass through.
    if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;

    const isAppShell = e.request.mode === 'navigate' ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.json');

    if (isAppShell) {
        // Network-first: visitors always get the latest version, cache is the offline fallback.
        e.respondWith(
            fetch(e.request)
                .then(res => {
                    const copy = res.clone();
                    caches.open(CACHE).then(cache => cache.put(e.request, copy));
                    return res;
                })
                .catch(() => caches.match(e.request))
        );
    } else {
        // Cache-first for static assets (images, fonts hosted locally).
        e.respondWith(
            caches.match(e.request).then(cached =>
                    cached || fetch(e.request).then(res => {
                        const copy = res.clone();
                        caches.open(CACHE).then(cache => cache.put(e.request, copy));
                        return res;
                    })
            )
        );
    }
});
