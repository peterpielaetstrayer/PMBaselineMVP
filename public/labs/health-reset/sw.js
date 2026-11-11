/* Isolated, no user-data caching. Serves only the static experimental shell. */
const CACHE = "pmb-foundation-lab-static-v01";
const ASSETS = ["/labs/health-reset/index.html", "/labs/health-reset/manifest.json"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  if (!new URL(event.request.url).pathname.startsWith("/labs/health-reset/")) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) {
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    }
    return response;
  }).catch(()=>caches.match(event.request)));
});
