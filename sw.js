const CACHE = 'paraschos-v1';
const FILES = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/script.js',
    '/assets/starr.webp',
    '/blog/posts.json'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(FILES))
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});