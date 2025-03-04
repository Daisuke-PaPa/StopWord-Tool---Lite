const CACHE_NAME = 'stopwords-tool-cache-v2'; // Increment the version to update the cache
const urlsToCache = [
  '/',
  '/StopWord-Tool---Lite/index.html',
  '/StopWord-Tool---Lite/css/materialize.css',
  '/StopWord-Tool---Lite/css/icon.css',
  '/StopWord-Tool---Lite/images/favicon.png',
  '/StopWord-Tool---Lite/images/logo_mini.png',
  '/StopWord-Tool---Lite/fonts/Zawgyi-One.ttf',
  '/StopWord-Tool---Lite/fonts/Pyidaungsu-2.5.3_Bold.ttf',
  '/StopWord-Tool---Lite/fonts/Pyidaungsu-2.5.3_Regular.ttf',
  '/StopWord-Tool---Lite/libs/add_csw_list.js',
  '/StopWord-Tool---Lite/libs/add_hide_list.js',
  '/StopWord-Tool---Lite/libs/add_segment.js',
  '/StopWord-Tool---Lite/libs/bootstrap.bundle.min.js',
  '/StopWord-Tool---Lite/libs/fetch_csw_list.js',
  '/StopWord-Tool---Lite/libs/fix_segment.js',
  '/StopWord-Tool---Lite/libs/hide_words.js',
  '/StopWord-Tool---Lite/libs/ini_database.js',
  '/StopWord-Tool---Lite/libs/jquery-3.7.1.js',
  '/StopWord-Tool---Lite/libs/mammoth.browser.min.js',
  '/StopWord-Tool---Lite/libs/materialize.js',
  '/StopWord-Tool---Lite/libs/notify_box.js',
  '/StopWord-Tool---Lite/libs/service-worker.js',
  '/StopWord-Tool---Lite/libs/special_character_delete.js',
  '/StopWord-Tool---Lite/libs/sw_list.js',
  '/StopWord-Tool---Lite/libs/text_search.js',
  '/StopWord-Tool---Lite/libs/undo_redo.js',
  '/StopWord-Tool---Lite/ibs/zg_to_unicode.js'
];

// Install event: Cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching assets...');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: Serve cached content or fetch from network if not cached
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('Service Worker: Returning cached response');
        return cachedResponse;
      }
      // If not cached, fetch from network
      return fetch(event.request).catch(() => {
        // Fallback to a custom offline page if network fetch fails
        if (event.request.url.includes('.html')) {
          return caches.match('/offline.html');
        }
        return null; // For non-HTML files, return nothing (or can add a fallback like a 404 page)
      });
    })
  );
});
