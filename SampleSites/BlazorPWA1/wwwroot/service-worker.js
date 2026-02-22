// In development, always fetch from the network and do not enable offline support.
// This is because caching would make development more difficult (changes would not
// be reflected on the first load after each change).
self.addEventListener('fetch', () => { });
self.addEventListener('message', async (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        await new Promise(resolve => setTimeout(resolve, 3000));
        self.skipWaiting()
    }
});
