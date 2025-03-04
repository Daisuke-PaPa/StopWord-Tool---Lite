const CACHE_NAME = 'stopwords-tool-cache-v1';
const urlsToCache = [
  '/',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/index.html',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/css/materialize.css',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/css/icon.css',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/images/favicon.png',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/images/logo_mini.png',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/fonts/Zawgyi-One.ttf',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/fonts/Pyidaungsu-2.5.3_Bold.ttf',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/fonts/Pyidaungsu-2.5.3_Regular.ttf',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/libs/add_csw_list.js',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/libs/add_hide_list.js',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/libs/add_segment.js',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/libs/bootstrap.bundle.min.js',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/libs/fetch_csw_list.js',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/libs/fix_segment.js',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/libs/hide_words.js',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/libs/ini_database.js',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/libs/jquery-3.7.1.js',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/libs/mammoth.browser.min.js',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/libs/materialize.js',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/libs/notify_box.js',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/libs/service-worker.js',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/libs/special_character_delete.js',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/libs/sw_list.js',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/libs/text_search.js',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/libs/undo_redo.js',
  'https://daisuke-papa.github.io/StopWord-Tool---Lite/ibs/zg_to_unicode.js'
];

// Install event: Cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching essential files...');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.log('Error during install:', err);
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
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
      // Return cached response if available
      if (cachedResponse) {
        console.log('Returning cached response for:', event.request.url);
        return cachedResponse;
      }

      // If not cached, fetch from network
      return fetch(event.request).catch((err) => {
        // Fallback to cached assets if network fetch fails
        console.log('Network request failed, returning from cache if possible:', event.request.url);
        return caches.match(event.request);
      });
    })
  );
});
