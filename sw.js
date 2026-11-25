// Çevrimdışı çalışma için basit servis çalışanı.
// index.html'i her güncellediğinde aşağıdaki VERSION'ı artır (v1 -> v2 ...) ki cihazlar yeni sürümü alsın.
const VERSION = 'v1';
const CACHE = 'islem-takip-' + VERSION;
const FILES = ['./', './index.html', './manifest.json', './apple-touch-icon.png',
  './icons/favicon-32.png', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Önce ağ, olmazsa önbellek: güncelleme yaptığında hemen yeni sürüm gelir, internet yoksa da açılır.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
