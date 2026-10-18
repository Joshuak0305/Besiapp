// Hält die App offline verfügbar: alle Dateien werden beim ersten Start
// zwischengespeichert. Nach Änderungen an der App CACHE hochzählen.
const CACHE = 'besichtigung-v1';
const FILES = [
  './', 'index.html', 'styles.css', 'manifest.webmanifest',
  'js/app.js', 'js/db.js', 'js/schema.js', 'js/export.js', 'js/markup.js',
  'icons/icon.svg', 'icons/apple-touch-icon.png', 'icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
