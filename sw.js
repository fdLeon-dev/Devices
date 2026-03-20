// Service Worker para Devices F2
// Proporciona funcionalidades PWA básicas

const CACHE_NAME = 'devices-f2-v1';
// SOLO cachear recursos locales
// NO incluir URLs externas que puedan ser bloqueadas por CSP
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/public/vendor/fontawesome/css/all.min.css'
];

// Instalación del Service Worker
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('%c📦 Cache del Service Worker abierto', 'color: #6f42c1; font-weight: bold;');
        return cache.addAll(urlsToCache);
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

// Interceptar requests
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        // Devolver desde cache si está disponible
        if (response) {
          return response;
        }

        // Clonar el request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(function (response) {
          // Si la respuesta es 404 y es una imagen, devolver un SVG placeholder
          try {
            const isImage = event.request.destination === 'image' || (event.request.headers && event.request.headers.get && event.request.headers.get('accept') && event.request.headers.get('accept').includes('image'));
            if (response && response.status === 404 && isImage) {
              const placeholderSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140" viewBox="0 0 200 140" role="img" aria-label="placeholder"><rect width="100%" height="100%" fill="#eee"/><g fill="#bbb"><rect x="24" y="36" width="152" height="68" rx="6"/></g><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-family="sans-serif" font-size="14">Imagen no disponible</text></svg>';
              return new Response(placeholderSvg, { headers: { 'Content-Type': 'image/svg+xml' } });
            }

            // Verificar si recibimos una respuesta válida para cache
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
          } catch (e) {
            // En caso de error inspeccionar la respuesta normal
            if (!response) return response;
          }

          // Clonar la respuesta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function (cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
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
