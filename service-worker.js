const CACHE_NAME = 'dynamic-cache'; // Keeps a single dynamic cache
const BASE_URL = '/StopWord-Tool---Lite'; // Base path for GitHub Pages

const CACHE_FILES = [
  `${BASE_URL}/index.html`,
  `${BASE_URL}/database_management.html`,
  `${BASE_URL}/css/materialize.css`,
  `${BASE_URL}/css/icon.css`,
  `${BASE_URL}/images/favicon.png`,
  `${BASE_URL}/libs/mammoth.browser.min.js`,
  `${BASE_URL}/libs/materialize.js`,
  `${BASE_URL}/libs/notify_box.js`,
  `${BASE_URL}/libs/ini_database.js`,
  `${BASE_URL}/libs/special_character_delete.js`,
  `${BASE_URL}/libs/fix_segment.js`,
  `${BASE_URL}/libs/add_segment.js`,
  `${BASE_URL}/libs/add_hide_list.js`,
  `${BASE_URL}/libs/hide_words.js`,
  `${BASE_URL}/libs/text_search.js`,
  `${BASE_URL}/libs/sw_list.js`,
  `${BASE_URL}/libs/undo_redo.js`,
  `${BASE_URL}/libs/add_csw_list.js`,
  `${BASE_URL}/libs/fetch_csw_list.js`,
  `${BASE_URL}/libs/zg_to_unicode.js`,
  `${BASE_URL}/libs/db_table.js`,
  `${BASE_URL}/scripts.js`
];

// Install event - Cache the core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_FILES);
    })
  );
  self.skipWaiting();
});

// Activate event - Cleanup old caches if necessary
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Activate new worker immediately
});

// Fetch event - Try online first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clonedResponse);
        });
        return response;
      })
      .catch(() => caches.match(event.request)) // Serve from cache if offline
  );
});
