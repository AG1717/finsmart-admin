// Service Worker pour FinSmart Admin PWA
// Version 2 - Fix: Network First pour app.js pour éviter le cache de l'ancienne API URL
const CACHE_NAME = 'finsmart-admin-v2';
const API_CACHE_NAME = 'finsmart-admin-api-v2';

// Fichiers à mettre en cache lors de l'installation
const STATIC_ASSETS = [
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des ressources statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation terminée');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Erreur lors de l\'installation:', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Supprimer les anciens caches
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('[Service Worker] Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation terminée');
        return self.clients.claim();
      })
  );
});

// Stratégie de mise en cache pour les requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Stratégie pour les requêtes API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
  }
  // Network First pour app.js (fichier JavaScript critique qui contient l'URL de l'API)
  // Ceci garantit que nous chargeons toujours la dernière version
  else if (url.pathname.endsWith('/app.js')) {
    event.respondWith(networkFirstStrategy(request));
  }
  // Stratégie Cache First pour les autres ressources statiques (CSS, images, etc.)
  else {
    event.respondWith(cacheFirstStrategy(request));
  }
});

// Stratégie Cache First (pour les ressources statiques)
async function cacheFirstStrategy(request) {
  try {
    // Chercher dans le cache d'abord
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Si pas en cache, faire la requête réseau
    const networkResponse = await fetch(request);

    // Mettre en cache la réponse pour les prochaines fois
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Erreur cache-first:', error);

    // Retourner une page offline si disponible
    const cachedResponse = await caches.match('/index.html');
    if (cachedResponse) {
      return cachedResponse;
    }

    // Sinon, retourner une réponse d'erreur
    return new Response('Offline - Veuillez vérifier votre connexion Internet', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// Stratégie Network First (pour les requêtes API)
async function networkFirstStrategy(request) {
  try {
    // Essayer la requête réseau d'abord
    const networkResponse = await fetch(request);

    // Mettre en cache si la réponse est OK
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Réseau indisponible, utilisation du cache');

    // Si le réseau échoue, utiliser le cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Pas de cache disponible
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Impossible d\'accéder aux données. Veuillez vérifier votre connexion.'
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }
}

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Gestion des notifications push (optionnel)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('FinSmart Admin', options)
  );
});

// Gestion des clics sur notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('[Service Worker] Chargé et prêt');
