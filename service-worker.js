const CACHE_NAME = 'stopwords-tool-cache-v3';
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
  // Removed service-worker.js from the cache list.
  '/StopWord-Tool---Lite/libs/special_character_delete.js',
  '/StopWord-Tool---Lite/libs/sw_list.js',
  '/StopWord-Tool---Lite/libs/text_search.js',
  '/StopWord-Tool---Lite/libs/undo_redo.js',
  '/StopWord-Tool---Lite/libs/zg_to_unicode.js'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching assets...');
      return Promise.all(
        urlsToCache.map((url) =>
          fetch(url, { cache: 'no-cache' })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Failed to fetch ${url}`);
              }
              return cache.put(url, response.clone());
            })
            .catch((error) => console.warn(`Service Worker: Failed to cache ${url}:`, error))
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('Service Worker: Returning cached response', event.request.url);
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // For navigation requests, serve index.html as a fallback
        if (event.request.mode === 'navigate') {
          return caches.match('/StopWord-Tool---Lite/index.html');
        }
      });
    })
  );
});
