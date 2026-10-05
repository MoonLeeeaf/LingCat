self.addEventListener('install', () => {
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => { })

self.addEventListener('notificationclick', (event) => {
    const data = event.notification.data || {}
    const chatId = typeof data.chatId === 'string' ? data.chatId : undefined
    event.notification.close()
    event.waitUntil((async () => {
        const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        const inScope = clientsList.filter((c) => c.url.startsWith(self.registration.scope))
        const target = inScope.find((c) => !c.url.includes('meeting=1')) || inScope[0] || clientsList[0]
        if (target) {
            try { await target.focus() } catch (e) { }
            if (chatId) target.postMessage({ type: 'lingcat-open-chat', chatId })
            return
        }
        try { await self.clients.openWindow(self.registration.scope) } catch (e) { }
    })())
})
