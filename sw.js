const CACHE = 'novi-v1';
const ASSETS = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e){
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);

  if(url.origin === location.origin){
    // File sendiri: cache-first (cepat + offline)
    e.respondWith(caches.match(req).then(function(cached){
      return cached || fetch(req).then(function(res){
        const copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); });
        return res;
      });
    }));
  } else {
    // Font & API jadwal solat: network dulu, fallback ke cache kalau offline
    e.respondWith(fetch(req).then(function(res){
      const copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); });
      return res;
    }).catch(function(){ return caches.match(req); }));
  }
});
