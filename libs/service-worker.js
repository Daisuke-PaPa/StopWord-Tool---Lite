const CACHE_NAME = 'stopwords-tool-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/materialize.css',
  '/css/icon.css',
  '/images/favicon.png',
  '/images/logo_mini.png',
  '/fonts/Zawgyi-One.ttf',
  '/fonts/Pyidaungsu-2.5.3_Bold.ttf',
  '/fonts/Pyidaungsu-2.5.3_Regular.ttf',
  '/libs/add_csw_list.js',
  '/libs/add_hide_list.js',
  '/libs/add_segment.js',
  '/libs/bootstrap.bundle.min.js',
  '/libs/fetch_csw_list.js',
  '/libs/fix_segment.js',
  '/libs/hide_words.js',
  '/libs/ini_database.js',
  '/libs/jquery-3.7.1.js',
  '/libs/mammoth.browser.min.js',
  '/libs/materialize.js',
  '/libs/notify_box.js',
  '/libs/service-worker.js',
  '/libs/special_character_delete.js',
  '/libs/sw_list.js',
  '/libs/text_search.js',
  '/libs/undo_redo.js',
  '/ibs/zg_to_unicode.js'
];

// Install event: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
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
