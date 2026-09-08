// 정시응시 ONTIME-HIGH — 껍데기 전용 서비스워커
// 캐시 이름은 다른 앱과 절대 겹치면 안 된다.
var CACHE = "ontime-high-shell-v1";
var SHELL = [
  "/ontime-high/",
  "/ontime-high/index.html",
  "/ontime-high/manifest.json",
  "/ontime-high/icon-192.png",
  "/ontime-high/icon-512.png"
];

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(SHELL).catch(function () {});
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (k) { if (k !== CACHE) return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

// 껍데기 파일만 캐시한다. script.google.com 요청은 절대 가로채지 않는다.
self.addEventListener("fetch", function (e) {
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  if (e.request.method !== "GET") return;

  e.respondWith(
    fetch(e.request)
      .then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      })
      .catch(function () { return caches.match(e.request); })
  );
});
