/**
 * Push Notification Service - Frontend
 */

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Check if push notifications are supported
export const isPushSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Request notification permission
export const requestPermission = async () => {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Get current permission status
export const getPermissionStatus = () => {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission; // 'granted', 'denied', or 'default'
};

// Subscribe to push notifications
export const subscribeToPush = async (token) => {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported');
  }
  
  // Get service worker registration
  const registration = await navigator.serviceWorker.ready;
  
  // Get VAPID public key from backend
  const keyResponse = await fetch(`${API}/push/vapid-key`);
  const { publicKey } = await keyResponse.json();
  
  if (!publicKey) {
    throw new Error('VAPID public key not available');
  }
  
  // Subscribe to push
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  });
  
  // Send subscription to backend
  const response = await fetch(`${API}/push/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(subscription.toJSON())
  });
  
  if (!response.ok) {
    throw new Error('Failed to save subscription on server');
  }
  
  return subscription;
};

// Unsubscribe from push notifications
export const unsubscribeFromPush = async (token) => {
  if (!isPushSupported()) return true;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      // Notify backend
      await fetch(`${API}/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });
      
      // Unsubscribe locally
      await subscription.unsubscribe();
    }
    
    return true;
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return false;
  }
};

// Check if currently subscribed
export const isSubscribed = async () => {
  if (!isPushSupported()) return false;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
};

// Helper: Convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default {
  isPushSupported,
  requestPermission,
  getPermissionStatus,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribed
};
