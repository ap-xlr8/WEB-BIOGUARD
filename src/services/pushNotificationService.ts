// src/services/pushNotificationService.ts
/**
 * Web Push Notifications usando Firebase Cloud Messaging (Web SDK).
 * Requiere: VITE_FIREBASE_VAPID_KEY y VITE_FIREBASE_CONFIG en .env
 */

export const pushNotificationService = {
    /**
     * Solicita permiso de notificaciones y registra el token FCM en el backend.
     * Debe llamarse después de que el usuario hace login exitoso.
     */
    async initialize(): Promise<boolean> {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            console.warn('Web Push: navegador no soportado');
            return false;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.info('Web Push: permiso no otorgado');
            return false;
        }

        // TODO: Integrar Firebase Web SDK cuando se configure VAPID key
        // Por ahora registrar el service worker base
        try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.info('Web Push: service worker registrado', registration.scope);
            return true;
        } catch (err) {
            console.warn('Web Push: error al registrar SW', err);
            return false;
        }
    },

    /**
     * Verifica si las notificaciones están habilitadas
     */
    isEnabled(): boolean {
        return 'Notification' in window && Notification.permission === 'granted';
    },

    /**
     * Muestra una notificación local (sin necesidad de FCM)
     */
    showLocal(title: string, body: string, options?: NotificationOptions): void {
        if (!this.isEnabled()) return;
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body,
                icon: '/bioguard-icon-192.png',
                badge: '/bioguard-badge-72.png',
                vibrate: [200, 100, 200],
                ...options,
            });
        }).catch(() => {
            // Fallback: notificación directa sin SW
            new Notification(title, { body, icon: '/bioguard-icon-192.png', ...options });
        });
    },
};
