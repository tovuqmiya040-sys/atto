// Service Worker registratsiyasi va boshqaruvi

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[SW] Service Worker registered:', registration.scope);

      // Yangi service worker o'rnatilganda
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Yangi versiya mavjud - foydalanuvchiga xabar berish mumkin
            console.log('[SW] New version available');
          }
        });
      });

      return registration;
    } catch (error) {
      console.error('[SW] Registration failed:', error);
    }
  }
}

// Online/Offline holatini kuzatish
export function setupNetworkListeners(onChange: (online: boolean) => void) {
  const handleOnline = () => {
    console.log('[Network] Back online');
    onChange(true);
  };

  const handleOffline = () => {
    console.log('[Network] Went offline');
    onChange(false);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Hozirgi online holat
export function isOnline(): boolean {
  return navigator.onLine;
}
