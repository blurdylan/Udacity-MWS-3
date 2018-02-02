const STATIC_CACHE_NAME = "restaurants-reviews-static-v2";

const FILES_TO_CACHE = [
  // Pages
  "/",
  "/index.html",
  "/restaurant.html",

  // Stylesheets
  "/css/lit.min.css",
  "/css/pretty-checkbox.min.css",
  "/css/styles.min.css",
  "https://cdn.materialdesignicons.com/2.1.19/css/materialdesignicons.min.css",

  // Scripts
  "/js/axios.min.js",
  "/js/dbhelper.min.js",
  "/js/idb.min.js",
  "/js/restaurant_info.min.js",
  "/js/main.min.js",
  "https://cdn.jsdelivr.net/npm/lozad/dist/lozad.min.js",

  // Static Assets
  "/img/1-thumb.jpg",
  "/img/2-thumb.jpg",
  "/img/3-thumb.jpg",
  "/img/4-thumb.jpg",
  "/img/5-thumb.jpg",
  "/img/6-thumb.jpg",
  "/img/7-thumb.jpg",
  "/img/8-thumb.jpg",
  "/img/9-thumb.jpg",
  "/img/10-thumb.jpg",

  // Server
  "http://localhost:1337/restaurants/",
  "http://localhost:1337/reviews/?restaurant_id=1",
  "http://localhost:1337/reviews/?restaurant_id=2",
  "http://localhost:1337/reviews/?restaurant_id=3",
  "http://localhost:1337/reviews/?restaurant_id=4",
  "http://localhost:1337/reviews/?restaurant_id=5",
  "http://localhost:1337/reviews/?restaurant_id=6",
  "http://localhost:1337/reviews/?restaurant_id=7",
  "http://localhost:1337/reviews/?restaurant_id=8",
  "http://localhost:1337/reviews/?restaurant_id=9",
  "http://localhost:1337/reviews/?restaurant_id=10"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", event => {
  //console.log("Fetch event for ", event.request.url);
  event.respondWith(
    caches
      .match(event.request)
      .then(function(response) {
        if (response) {
          //console.log("Found ", event.request.url, " in cache");
          return response;
        }
        // console.log("Network request for ", event.request.url);
        return fetch(event.request);

        // TODO 4 - Add fetched files to the cache
      })
      .catch(function(error) {
        // TODO 6 - Respond with custom offline page
      })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            return (
              cacheName.startsWith("restaurants-reviews-") &&
              cacheName != STATIC_CACHE_NAME
            );
          })
          .map(cacheName => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});
