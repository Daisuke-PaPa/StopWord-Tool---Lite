const CACHE_NAME = 'stopwords-tool-cache-v3.7'; // Update version to force new cache
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
  '/StopWord-Tool---Lite/libs/special_character_delete.js',
  '/StopWord-Tool---Lite/libs/sw_list.js',
  '/StopWord-Tool---Lite/libs/text_search.js',
  '/StopWord-Tool---Lite/libs/undo_redo.js',
  '/StopWord-Tool---Lite/libs/zg_to_unicode.js',
  '/StopWord-Tool---Lite/libs/db_manage.js',
  '/StopWord-Tool---Lite/cursor.png',
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting(); // Forces the new SW to activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching assets...');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event
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
    ).then(() => {
      console.log('Service Worker: Claiming clients...');
      self.clients.claim();
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ action: "reload" }));
      });
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        if (event.request.mode === 'navigate') {
          return caches.match('/StopWord-Tool---Lite/index.html');
        }
      }))
  );
});

// Listen for messages from the SW and reload if needed
self.addEventListener('message', (event) => {
  if (event.data.action === "reload") {
    console.log('New version available, reloading page...');
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.navigate(client.url));
    });
  }
});
