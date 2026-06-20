// Service Worker - caches app shell for offline use
const CACHE = 'sensex-bot-v1';
const SHELL = ['/', '/index.html', '/app.js', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network first for API calls, cache first for shell
  if (e.request.url.includes('kite.trade') || e.request.url.includes('kite.zerodha')) {
    e.respondWith(fetch(e.request).catch(() => new Response('Offline', {status: 503})));
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
