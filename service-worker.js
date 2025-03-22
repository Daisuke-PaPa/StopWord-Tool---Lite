const CACHE_NAME = 'dynamic-cache-v2'; // Use a versioned cache name
const BASE_URL = '/StopWord-Tool---Lite';

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

// A simple fetch with timeout helper.
function fetchWithTimeout(url, timeout = 30000, options = {}) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Network timeout')), timeout);
    fetch(url, options)
      .then(response => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_FILES))
      .catch(err => console.error('Install error:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

// Use a network-first strategy for normal fetches.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetchWithTimeout(event.request, 60000)
      .then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match(`${BASE_URL}/index.html`);
          }
        });
      })
  );
});

// When the page asks, do a simple check: try to fetch index.html without using cache.
// If that fails, assume the SW loaded from cache.
self.addEventListener('message', (event) => {
  if (event.data === 'CHECK_ONLINE_STATUS') {
    // Force a network request (no cache) to determine if network is really available.
    fetchWithTimeout(`${BASE_URL}/index.html`, 30000, { cache: 'no-store' })
      .then(() => {
        // Network fetch worked → we're online.
        event.source.postMessage({ status: 'ONLINE' });
      })
      .catch(() => {
        // Network fetch failed → we're using cache → offline.
        event.source.postMessage({ status: 'OFFLINE' });
      });
  }
});
//testtest
