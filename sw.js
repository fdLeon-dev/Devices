// Service Worker para Devices F2
// Proporciona funcionalidades PWA básicas

const CACHE_NAME = 'devices-f2-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js'
];

// Instalación del Service Worker
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('%c📦 Cache del Service Worker abierto', 'color: #6f42c1; font-weight: bold;');
        // Cachear solo recursos locales que sabemos que existen
        return Promise.allSettled(
          urlsToCache.map(url => cache.add(url))
        ).then(() => Promise.resolve()); // Ignorar errores de cache
      })
      .catch(err => {
        console.warn('Service Worker install error:', err);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requests - SOLO recursos locales
self.addEventListener('fetch', function (event) {
  // Nunca cachear metodos no idempotentes (POST/PUT/PATCH/DELETE).
  if (event.request.method !== 'GET') {
    return;
  }

  // No interceptar requests a dominios externos (dejar que el navegador las maneje libremente)
  try {
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) {
      return; // Dejar pasar requests externas sin interceptar
    }

    // Evitar cache de endpoints dinamicos (funciones/API).
    if (url.pathname.startsWith('/.netlify/functions/')) {
      return;
    }
  } catch (e) {
    return; // Si hay problemas parseando URL, dejar pasar
  }

  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(function (response) {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Cachear solo respuestas locales exitosas
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(function (cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(function (error) {
          // Si falla el fetch y es una imagen, devolver placeholder
          if (event.request.destination === 'image') {
            const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" text-anchor="middle" fill="#999" font-size="14">No disponible</text></svg>';
            return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
          }
          throw error;
        });
      })
      .catch(err => {
        console.warn('Service Worker error:', err);
      })
  );
});

// Manejo de notificaciones push (opcional)
self.addEventListener('push', function (event) {
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de Devices F2',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver sitio',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Devices F2', options)
  );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
