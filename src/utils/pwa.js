/**
 * PWA Utility Functions
 * Handle service worker registration, install prompts, and PWA features
 */

let deferredPrompt = null;

/**
 * Register service worker
 */
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            
            // Notify user about update
            if (window.confirm('Update tersedia! Refresh untuk mendapatkan versi terbaru?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      });

      return registration;
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      return null;
    }
  } else {
    return null;
  }
}

/**
 * Unregister service worker (for development/testing)
 */
export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  }
}

/**
 * Setup install prompt listener
 */
export function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Show custom install button/banner
    const event = new CustomEvent('pwa-install-available');
    window.dispatchEvent(event);
  });

  // Track installation
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;

    // Track analytics
    if (window.gtag) {
      window.gtag('event', 'pwa_install', {
        event_category: 'engagement',
        event_label: 'PWA installed'
      });
    }
  });
}

/**
 * Trigger install prompt
 */
export async function promptInstall() {
  if (!deferredPrompt) {
    return false;
  }

  deferredPrompt.prompt();
  const result = await deferredPrompt.choiceResult;
  
  deferredPrompt = null;
  return result.outcome === 'accepted';
}

/**
 * Check if app is installed
 */
export function isInstalled() {
  // Check if running in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // iOS Safari
  if (window.navigator.standalone === true) {
    return true;
  }

  return false;
}

/**
 * Check if install prompt is available
 */
export function canInstall() {
  return deferredPrompt !== null;
}

/**
 * Get install instructions based on platform
 */
export function getInstallInstructions() {
  const ua = navigator.userAgent.toLowerCase();
  
  if (isInstalled()) {
    return { installed: true };
  }

  // iOS Safari
  if (/iphone|ipad|ipod/.test(ua) && /safari/.test(ua) && !/chrome/.test(ua)) {
    return {
      platform: 'ios',
      instructions: [
        'Tap tombol Share (kotak dengan panah ke atas)',
        'Scroll dan pilih "Add to Home Screen"',
        'Tap "Add" untuk install'
      ]
    };
  }

  // Android Chrome
  if (/android/.test(ua) && /chrome/.test(ua)) {
    return {
      platform: 'android',
      instructions: [
        'Tap menu (3 titik) di pojok kanan atas',
        'Pilih "Add to Home screen" atau "Install app"',
        'Tap "Install" untuk konfirmasi'
      ]
    };
  }

  // Desktop Chrome
  if (/chrome/.test(ua) && !/mobile/.test(ua)) {
    return {
      platform: 'desktop',
      instructions: [
        'Klik icon install di address bar (pojok kanan)',
        'Atau klik menu (3 titik) → "Install Jimpitan App"',
        'Klik "Install" untuk konfirmasi'
      ]
    };
  }

  return {
    platform: 'unknown',
    instructions: [
      'Aplikasi ini dapat diinstall sebagai PWA',
      'Gunakan browser Chrome, Edge, atau Safari terbaru',
      'Cari opsi "Add to Home Screen" atau "Install" di menu browser'
    ]
  };
}

/**
 * Clear all caches (for troubleshooting)
 */
export async function clearCaches() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map((cacheName) => caches.delete(cacheName))
    );
  }

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
  }
}

/**
 * Check for updates manually
 */
export async function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
    }
  }
}

/**
 * Get network status
 */
export function getNetworkStatus() {
  return {
    online: navigator.onLine,
    effectiveType: navigator.connection?.effectiveType || 'unknown',
    downlink: navigator.connection?.downlink || 'unknown',
    rtt: navigator.connection?.rtt || 'unknown'
  };
}

/**
 * Setup network status listeners
 */
export function setupNetworkListeners(onOnline, onOffline) {
  window.addEventListener('online', () => {
    if (onOnline) onOnline();
  });

  window.addEventListener('offline', () => {
    if (onOffline) onOffline();
  });

  // Connection change listener
  if (navigator.connection) {
    navigator.connection.addEventListener('change', () => {
      // Connection changed
    });
  }
}
