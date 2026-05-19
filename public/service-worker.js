// Service worker for offline caching and queued reports
const CACHE_NAME = "voiceit-cache-v1";
const OFFLINE_URL = "/offline.html";
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(["/", "/index.html", "/offline.html"]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Queue handling setup
const reportQueue = [];
self.addEventListener("message", (event) => {
  if (event.data.type === "add-report") {
    reportQueue.push(event.data.payload);
    saveReportsToQueue();
  }
});

function saveReportsToQueue() {
  // Serialize queue and save to IndexedDB or local storage
}