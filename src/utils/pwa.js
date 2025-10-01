// Progressive Web App utilities for InfoScope OSINT
import { toast } from 'react-hot-toast';

class PWAManager {
  constructor() {
    this.registration = null;
    this.subscription = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    this.deferredPrompt = null;
    
    this.init();
  }

  async init() {
    if (!this.isSupported) {
      console.warn('[PWA] Service Worker or Push Manager not supported');
      return;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('[PWA] Service Worker registered successfully');

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.showUpdateAvailable();
          }
        });
      });

      // Check for updates
      await this.registration.update();

      // Setup install prompt
      this.setupInstallPrompt();

      // Setup push notifications
      await this.setupPushNotifications();

    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  }

  setupInstallPrompt() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('[PWA] Install prompt event triggered');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      toast.success('InfoScope OSINT installed successfully!', {
        duration: 5000,
        icon: '🚀'
      });
      this.deferredPrompt = null;
    });
  }

  showInstallPrompt() {
    if (!this.isInstalled && this.deferredPrompt) {
      toast((t) => (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <span>📱</span>
            <span className="font-medium">Install InfoScope OSINT</span>
          </div>
          <p className="text-sm text-gray-600">
            Install our app for faster access and offline functionality
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => this.installApp(t.id)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Install
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            >
              Later
            </button>
          </div>
        </div>
      ), {
        duration: 15000,
        position: 'bottom-center'
      });
    }
  }

  async installApp(toastId) {
    if (this.deferredPrompt) {
      try {
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('[PWA] User accepted install prompt');
        } else {
          console.log('[PWA] User dismissed install prompt');
        }
        
        this.deferredPrompt = null;
        toast.dismiss(toastId);
      } catch (error) {
        console.error('[PWA] Install prompt failed:', error);
        toast.error('Installation failed. Please try again.');
      }
    }
  }

  showUpdateAvailable() {
    toast((t) => (
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <span>🔄</span>
          <span className="font-medium">Update Available</span>
        </div>
        <p className="text-sm text-gray-600">
          A new version of InfoScope OSINT is available
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => this.updateApp(t.id)}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Update Now
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
          >
            Later
          </button>
        </div>
      </div>
    ), {
      duration: 0, // Don't auto-dismiss
      position: 'top-center'
    });
  }

  async updateApp(toastId) {
    try {
      if (this.registration && this.registration.waiting) {
        // Tell the waiting service worker to skip waiting
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Reload the page to use the new service worker
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        toast.dismiss(toastId);
        toast.loading('Updating app...', { duration: 2000 });
      }
    } catch (error) {
      console.error('[PWA] Update failed:', error);
      toast.error('Update failed. Please refresh manually.');
    }
  }

  async setupPushNotifications() {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.warn('[PWA] Notifications not supported');
        return;
      }

      // Check current permission
      let permission = Notification.permission;
      
      if (permission === 'default') {
        // Don't request permission immediately - wait for user action
        console.log('[PWA] Notification permission not granted yet');
        return;
      }

      if (permission === 'granted' && this.registration) {
        // Get existing subscription
        this.subscription = await this.registration.pushManager.getSubscription();
        
        if (!this.subscription) {
          console.log('[PWA] No push subscription found');
        } else {
          console.log('[PWA] Push subscription active');
        }
      }
    } catch (error) {
      console.error('[PWA] Push notification setup failed:', error);
    }
  }

  async requestNotificationPermission() {
    try {
      if (!('Notification' in window)) {
        throw new Error('Notifications not supported');
      }

      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        toast.success('Notifications enabled!', {
          icon: '🔔',
          duration: 3000
        });
        
        // Subscribe to push notifications
        await this.subscribeToPush();
        return true;
      } else {
        toast.error('Notifications permission denied');
        return false;
      }
    } catch (error) {
      console.error('[PWA] Notification permission request failed:', error);
      toast.error('Failed to enable notifications');
      return false;
    }
  }

  async subscribeToPush() {
    try {
      if (!this.registration) {
        throw new Error('Service worker not registered');
      }

      // Generate VAPID keys for your app
      const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || 
        'BEl62iUYgUivxIkv69yViEuiBIa40HI80YHqnTyBa8nMLBSS78kO7qRFwJjvvs9ysyuXMGqLjqPn3m8t3gxSHgk';

      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      console.log('[PWA] Push subscription created:', this.subscription);

      // Send subscription to server (you'll need to implement this endpoint)
      // await this.sendSubscriptionToServer(this.subscription);
      
      return this.subscription;
    } catch (error) {
      console.error('[PWA] Push subscription failed:', error);
      throw error;
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Send data to service worker for background sync
  async scheduleBackgroundSync(tag, data) {
    try {
      if (!this.registration || !this.registration.sync) {
        console.warn('[PWA] Background sync not supported');
        return false;
      }

      // Store data in cache for background sync
      const cache = await caches.open('infoscope-dynamic-v2.1.0');
      await cache.put(`/pending-${tag}`, new Response(JSON.stringify(data)));

      // Register background sync
      await this.registration.sync.register(tag);
      console.log(`[PWA] Background sync scheduled: ${tag}`);
      return true;
    } catch (error) {
      console.error('[PWA] Background sync failed:', error);
      return false;
    }
  }

  // Check if app is running in standalone mode
  isRunningStandalone() {
    return this.isInstalled || 
           window.navigator.standalone === true || 
           window.matchMedia('(display-mode: standalone)').matches;
  }

  // Check network status
  isOnline() {
    return navigator.onLine;
  }

  // Get app info
  getAppInfo() {
    return {
      isSupported: this.isSupported,
      isInstalled: this.isInstalled,
      isStandalone: this.isRunningStandalone(),
      isOnline: this.isOnline(),
      hasNotificationPermission: Notification.permission === 'granted',
      hasPushSubscription: !!this.subscription
    };
  }
}

// Create singleton instance
const pwaManager = new PWAManager();

export default pwaManager;

// Export individual functions for convenience
export const {
  requestNotificationPermission,
  scheduleBackgroundSync,
  isRunningStandalone,
  isOnline,
  getAppInfo
} = pwaManager;