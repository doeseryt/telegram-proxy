var CACHE = 'proxy-site-v4';
var CORE = [
  './',
  './index.html',
  './icon-180.png',
  './icon-192.png',
  './icon-64.png',
  './manifest.json'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  // СЃС‚СЂР°РЅРёС†Сѓ Рё РёРєРѕРЅРєРё РѕС‚РґР°С‘Рј РёР· РєСЌС€Р° (СЃ РѕР±РЅРѕРІР»РµРЅРёРµРј РІ С„РѕРЅРµ), РїСЂРѕРєСЃРё-СЃРїРёСЃРѕРє вЂ” РІСЃРµРіРґР° РёР· СЃРµС‚Рё
  if (url.pathname.indexOf('proxies.txt') !== -1) { return; }
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (cached) {
      var fresh = fetch(e.request).then(function (r) {
        if (r && r.ok && url.origin === location.origin) {
          var copy = r.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return r;
      }).catch(function () { return cached; });
      return cached || fresh;
    })
  );
});
