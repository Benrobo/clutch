// self.addEventListener('fetch', function () {
// 	return;
// });

const CACHE_NAME = 'clutch-v1';

// Pre-cache critical assets
const ASSETS_TO_CACHE = [
  '/',
  '/favicon.png',

  // fonts
  '/fonts/bruceforever/regular.ttf',
  '/fonts/cyber/regular.ttf',
  '/fonts/facon/regular.ttf',
  '/fonts/mouzambik/regular.ttf',
  '/fonts/shiny/default.ttf',

  // images
];


self.addEventListener('install', (event) => {
    // @ts-ignore
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
    // @ts-ignore
  const url = new URL(event.request.url);

  // Check if the request is for a font in the /fonts directory
  if (url.pathname.startsWith('/fonts/')) {
    // @ts-ignore
    event.respondWith(
        // @ts-ignore
      caches.match(event.request).then((response) => {
        // Return cached font if it exists
        if (response) {
          return response;
        }

        // Fetch the font from the network
        // @ts-ignore
        return fetch(event.request).then((response) => {
          // Clone the response because it can only be consumed once
          const responseToCache = response.clone();

          // Cache the font for future requests
          caches.open(CACHE_NAME).then((cache) => {
            // @ts-ignore
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
    );
  } else {
    // Handle other requests normally
    // @ts-ignore
    event.respondWith(
        // @ts-ignore
      caches.match(event.request).then((response) => {
        // @ts-ignore
        return response || fetch(event.request);
      })
    );
  }
});