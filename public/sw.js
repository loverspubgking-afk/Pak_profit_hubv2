const CACHE_NAME = 'pak-profit-hub-v1';
const URLS = ['/', '/login', '/signup', '/verify-email', '/dashboard', '/plans', '/deposit', '/withdraw', '/referral', '/transactions', '/profile', '/support', '/admin'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS)));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
});
