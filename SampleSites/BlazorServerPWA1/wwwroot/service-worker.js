// ver.1.0.0
self.addEventListener('fetch', () => { });
self.addEventListener('install', event => event.waitUntil(onInstall(event)));
self.addEventListener('activate', event => event.waitUntil(onActivate(event)));

self.addEventListener('message', event => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting() });

async function onInstall(event) {
    console.info('Service worker: Install');
}

async function onActivate(event) {
    console.info('Service worker: Activate');
}
