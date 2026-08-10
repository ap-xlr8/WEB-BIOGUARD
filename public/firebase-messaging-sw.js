// public/firebase-messaging-sw.js
// Firebase Cloud Messaging Service Worker
// Este archivo será completado cuando se configure FIREBASE_VAPID_KEY

self.addEventListener('push', function(event) {
    if (!event.data) return;
    
    let data = {};
    try { data = event.data.json(); } catch { data = { title: 'BioGuard', body: event.data.text() }; }
    
    const options = {
        body: data.body || data.notification?.body || 'Nueva notificación de BioGuard',
        icon: '/bioguard-icon-192.png',
        badge: '/bioguard-badge-72.png',
        vibrate: [200, 100, 200],
        data: data.data || {},
        actions: data.notification?.actions || [],
    };
    
    event.waitUntil(
        self.registration.showNotification(
            data.title || data.notification?.title || 'BioGuard',
            options
        )
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (const client of clientList) {
                if (client.url.includes('bioguard') && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});
