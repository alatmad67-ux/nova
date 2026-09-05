
// Service Worker لمتجر NOVA لضمان استيفاء معايير تثبيت التطبيقات (PWA)
const CACHE_NAME = 'nova-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap'
];

// تثبيت الـ Service Worker وتخزين الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// تفعيل الـ Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// معالجة الطلبات (ضروري لظهور زر التثبيت في المتصفح)
self.addEventListener('fetch', (event) => {
  // نترك معالجة البيانات لـ Firebase SDK، ونكتفي بمتطلبات المتصفح للـ PWA
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
