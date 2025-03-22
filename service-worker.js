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

// Utility function to fetch with a timeout (30 seconds)
function fetchWithTimeout(request, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Network timeout')), timeout);
    fetch(request)
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

// Install event - Cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_FILES))
      .catch(error => console.error('Error during installation:', error))
  );
  self.skipWaiting();
});

// Activate event - Delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Use a network-first strategy with a 60-second timeout
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetchWithTimeout(event.request, 60000)
      .then(response => {
        // Only cache valid responses (status 200 and a basic type)
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails or times out
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Optionally, for navigation requests fallback to index.html
          if (event.request.mode === 'navigate') {
            return caches.match(`${BASE_URL}/index.html`);
          }
        });
      })
  );
});

// Listen for messages from the page (e.g., after DOM is fully loaded)
// The client can send { data: "DOM_LOADED" } if online to force cache refresh.
self.addEventListener('message', (event) => {
  if (event.data === 'DOM_LOADED') {
    // Optionally check if online here if you prefer,
    // or let the fetchWithTimeout fail naturally.
    caches.open(CACHE_NAME).then(cache => {
      CACHE_FILES.forEach(url => {
        fetchWithTimeout(url, 60000)
          .then(response => {
            if (response && response.status === 200 && response.type === 'basic') {
              cache.put(url, response);
            }
          })
          .catch(err => {
            console.error(`Failed to refresh ${url}:`, err);
          });
      });
    });
  }
});
