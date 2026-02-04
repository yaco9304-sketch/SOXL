/**
 * 푸시 알림 유틸리티
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

/**
 * Service Worker 등록
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * 푸시 알림 권한 요청
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications not supported');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * 푸시 알림 구독
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    const registration = await registerServiceWorker();
    if (!registration) {
      throw new Error('Service Worker not registered');
    }

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // 기존 구독 확인
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // 새로운 구독 생성
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    console.log('Push subscription:', subscription);
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

/**
 * 푸시 알림 구독 해제
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('Push subscription removed');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

/**
 * 현재 알림 권한 상태 확인
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * 테스트 알림 전송 (기준가 알림 형식으로)
 */
export async function sendTestNotification(): Promise<void> {
  const permission = getNotificationPermission();
  if (permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    console.warn('Service Worker not registered');
    return;
  }

  // 테스트용 예시 데이터
  const testPrevClose = 50.00;
  const testBuy7 = (testPrevClose * 0.93).toFixed(2);
  const testBuy14 = (testPrevClose * 0.86).toFixed(2);

  await registration.showNotification('[SOXL 기준가 알림] 테스트', {
    body: `전일 종가: $${testPrevClose.toFixed(2)}\n-7% 매수가: $${testBuy7}\n-14% 매수가: $${testBuy14}\n\n규칙: 터치 시 분할 매수, 그 외 관망`,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'soxl-test-alert',
  });
}

/**
 * 기준가 알림 전송 (서버 API 호출)
 */
export async function requestDailyAlert(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const response = await fetch('/api/cron/daily-alert');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error requesting daily alert:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Base64 문자열을 Uint8Array로 변환
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray as Uint8Array<ArrayBuffer>;
}
