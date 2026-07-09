const CACHE_NAME = 'gastehaus-v2';
const ASSETS = [
  './',
  './index.html',
  './404.html',
  './offline.html',
  './manifest.json',
  './browserconfig.xml',
  './assets/css/styles.css',
  './assets/js/main.js',
  './assets/js/404.js',
  './assets/images/logo-gaestehaus22-210x210.webp',
  './assets/images/logo-gaestehaus22-288x288.webp',
  './assets/images/logo-gaestehaus22.webp',
  './assets/images/bedrooms.webp',
  './assets/images/livingroom.webp',
  './assets/images/kitchen.webp',
  './assets/images/bathroom.webp',
  './assets/images/bedrooms553x737.webp',
  './assets/images/livingroom-553x425.webp',
  './assets/images/kitchen-553x736.webp',
  './assets/images/bathroom-553x415.webp',
  './assets/icons/favicon.ico',
  './assets/icons/favicon-16x16.png',
  './assets/icons/favicon-32x32.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png',
  './assets/icons/android-chrome-512x512.png',
  './assets/icons/ms-icon-144x144.png'
];

const MARKDOWN_CONTENT = `# Gästehaus 22 Asten | Monteurzimmer & Arbeiterunterkunft Linz

**Praktisch. Sauber. Günstig.**
Preiswerte Unterkunft in 4481 Asten nahe Linz. Einzelbetten, Highspeed-WLAN & Parkplätze direkt vorm Haus.

### 💰 Angebot
* **35 € / Nacht pro Person**
* **Starlink** - Highspeed-Internet
* **Voll ausgestattete Küche**
* **Wohnzimmer** mit TV & YouTube Premium
* **Parkplätze** direkt vorm Haus

### 📍 Lage & Kontakt
**Gästehaus 22**
Eichenstraße 22, 4481 Asten, Österreich

* **WhatsApp:** [Jetzt anfragen](https://wa.me/436801610618)
* **Telefon:** [+43 680 1610618](tel:+436801610618)
* **Web:** [gaestehaus22.at](https://gaestehaus22.at/)`;

// Install: Standard caching
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
});

// Fetch: Intercept for Markdown + Network-First logic
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const acceptHeader = e.request.headers.get('Accept') || '';

  // 1. Check if the agent specifically requests Markdown for the main page
  if (acceptHeader.includes('text/markdown') && (url.pathname === '/' || url.pathname.endsWith('index.html'))) {
    return e.respondWith(
      new Response(MARKDOWN_CONTENT, {
        headers: {
          'Content-Type': 'text/markdown; charset=UTF-8',
          'x-markdown-tokens': 'true'
        }
      })
    );
  }

  // 2. Standard Network-First logic for everything else
  e.respondWith(
    fetch(e.request)
      .then((response) => response)
      .catch(() => {
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (e.request.mode === 'navigate') {
            return caches.match('./offline.html');
          }
          return null;
        });
      })
  );
});