'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface NotificationStatusProps {
  onSubscriptionChange?: (isSubscribed: boolean) => void;
}

export function NotificationStatus({ onSubscriptionChange }: NotificationStatusProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastAlertTime, setLastAlertTime] = useState<string | null>(null);

  // 실제 구독 상태 확인
  const checkSubscription = useCallback(async () => {
    setLoading(true);
    try {
      // 브라우저 지원 확인
      if (typeof window === 'undefined' || !('Notification' in window)) {
        setPermission('denied');
        setIsSubscribed(false);
        return;
      }

      const currentPermission = Notification.permission;
      setPermission(currentPermission);

      if (currentPermission !== 'granted') {
        setIsSubscribed(false);
        return;
      }

      // Service Worker 및 푸시 구독 확인
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } else {
          setIsSubscribed(false);
        }
      } else {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSubscription();

    // 마지막 알림 시각 로드
    const storedLastAlert = localStorage.getItem('soxl_last_alert_time');
    if (storedLastAlert) {
      setLastAlertTime(storedLastAlert);
    }
  }, [checkSubscription]);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isSubscribed) {
        // 구독 해제
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            await subscription.unsubscribe();
          }
        }
        await fetch('/api/notifications/subscribe', { method: 'DELETE' });
        setIsSubscribed(false);
        setPermission('default');
        onSubscriptionChange?.(false);
      } else {
        // 알림 권한 요청
        const permissionResult = await Notification.requestPermission();
        setPermission(permissionResult);

        if (permissionResult !== 'granted') {
          alert('알림 권한이 거부되었습니다. 브라우저 설정에서 알림을 허용해주세요.');
          return;
        }

        // Service Worker 등록
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        // VAPID 공개키
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          throw new Error('VAPID public key not configured');
        }

        // Base64 -> Uint8Array 변환
        const urlBase64ToUint8Array = (base64String: string) => {
          const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
          const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
          const rawData = window.atob(base64);
          const outputArray = new Uint8Array(rawData.length);
          for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
          }
          return outputArray;
        };

        // 푸시 구독 생성
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        // 서버에 구독 정보 전송
        const response = await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: subscription.toJSON() }),
        });

        if (!response.ok) {
          throw new Error('Failed to save subscription');
        }

        setIsSubscribed(true);
        onSubscriptionChange?.(true);
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      alert('알림 설정 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (permission === 'denied') return 'text-danger';
    if (isSubscribed) return 'text-success';
    return 'text-text-muted';
  };

  const getStatusIcon = () => {
    if (loading) return <Loader2 className="w-5 h-5 text-text-muted animate-spin" />;
    if (permission === 'denied') return <AlertCircle className="w-5 h-5 text-danger" />;
    if (isSubscribed) return <CheckCircle className="w-5 h-5 text-success" />;
    return <BellOff className="w-5 h-5 text-text-muted" />;
  };

  const getStatusText = () => {
    if (loading) return '확인 중...';
    if (permission === 'denied') return '알림 차단됨';
    if (isSubscribed) return '알림 활성화';
    return '알림 비활성화';
  };

  const formatLastAlertTime = () => {
    if (!lastAlertTime) return '기록 없음';
    try {
      const date = new Date(lastAlertTime);
      return date.toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '기록 없음';
    }
  };

  return (
    <div className="bg-bg-card p-4 rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-semibold text-text-primary">알림 상태</h3>
      </div>

      {/* 구독 상태 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {permission !== 'denied' && (
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              isSubscribed
                ? 'bg-bg-secondary text-text-secondary hover:bg-bg-hover'
                : 'bg-accent text-bg-primary hover:bg-accent-hover'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? '처리 중...' : isSubscribed ? '끄기' : '켜기'}
          </button>
        )}
      </div>

      {/* 권한 차단 안내 */}
      {permission === 'denied' && (
        <div className="p-2 bg-danger/10 rounded text-xs text-danger">
          브라우저 설정에서 알림 권한을 허용해 주세요
        </div>
      )}

      {/* 마지막 발송 시각 */}
      {isSubscribed && (
        <div className="pt-3 border-t border-bg-secondary">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Clock className="w-3 h-3" />
            <span>마지막 알림: {formatLastAlertTime()}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            매일 20:00 (KST)에 기준가 알림이 발송됩니다
          </p>
        </div>
      )}
    </div>
  );
}
