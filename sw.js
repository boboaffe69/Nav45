/* NAV45 offline support (web/iPhone version).
   App files + station data are cached so the app opens instantly and works with bad reception.
   Map styles/tiles are cached as you use them (limited). Routing and address search always need internet. */
const VERSION = 'nav45-mwl6civ3';
const APP_FILES = [
  './', './index.html', './style.css', './app.js', './manifest.webmanifest',
  './vendor/maplibre-gl.js', './vendor/maplibre-gl.css', './vendor/piper-tts.js', './voice-worker.js',
  './fonts/material-symbols-outlined.woff2', './fonts/roboto-latin-400-normal.woff2', './fonts/roboto-latin-500-normal.woff2', './fonts/roboto-latin-700-normal.woff2',
  './data/charging.js', './data/fuel.js',
  './icon.png', './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png',
];
const MAP_CACHE = 'nav45-map', MAP_LIMIT = 1500, VOICE_CACHE = 'nav45-voice';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(APP_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== MAP_CACHE && k !== VOICE_CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

async function trimMapCache() {
  const c = await caches.open(MAP_CACHE);
  const keys = await c.keys();
  for (let i = 0; i < keys.length - MAP_LIMIT; i++) await c.delete(keys[i]);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // own app files: cache first, refresh in the background
  if (url.origin === self.location.origin) {
    e.respondWith(caches.open(VERSION).then(async (c) => {
      const hit = await c.match(req, { ignoreSearch: true });
      const net = fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  // map styles, fonts, sprites and tiles: network first, fall back to what was seen before
  if (url.hostname.endsWith('openfreemap.org')) {
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(MAP_CACHE).then((c) => c.put(req, copy)).then(trimMapCache); }
      return res;
    }).catch(() => caches.open(MAP_CACHE).then((c) => c.match(req))));
  }
  // natural voice: model (huggingface) and voice engine files — keep forever once downloaded
  if (/(^|\.)huggingface\.co$/.test(url.hostname) || (url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('piper')) || (url.hostname === 'cdnjs.cloudflare.com' && url.pathname.includes('onnxruntime'))) {
    e.respondWith(caches.open(VOICE_CACHE).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) c.put(req, res.clone());
      return res;
    }));
    return;
  }
  // routing / search: always live (not cached)
});
