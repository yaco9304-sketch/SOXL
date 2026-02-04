'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import {
  getNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from '@/lib/utils/notification';

interface NotificationStatusProps {
  onSubscriptionChange?: (isSubscribed: boolean) => void;
}

export function NotificationStatus({ onSubscriptionChange }: NotificationStatusProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastAlertTime, setLastAlertTime] = useState<string | null>(null);

  useEffect(() => {
    // 권한 상태 확인
    const currentPermission = getNotificationPermission();
    setPermission(currentPermission);
    setIsSubscribed(currentPermission === 'granted');

    // 마지막 알림 시각 로드 (localStorage)
    const storedLastAlert = localStorage.getItem('soxl_last_alert_time');
    if (storedLastAlert) {
      setLastAlertTime(storedLastAlert);
    }
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isSubscribed) {
        // 구독 해제
        await unsubscribeFromPushNotifications();
        await fetch('/api/notifications/subscribe', { method: 'DELETE' });
        setIsSubscribed(false);
        setPermission('default');
        onSubscriptionChange?.(false);
      } else {
        // 구독
        const subscription = await subscribeToPushNotifications();
        if (subscription) {
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription }),
          });
          setIsSubscribed(true);
          setPermission('granted');
          onSubscriptionChange?.(true);
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
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
    if (permission === 'denied') return <AlertCircle className="w-5 h-5 text-danger" />;
    if (isSubscribed) return <CheckCircle className="w-5 h-5 text-success" />;
    return <BellOff className="w-5 h-5 text-text-muted" />;
  };

  const getStatusText = () => {
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
