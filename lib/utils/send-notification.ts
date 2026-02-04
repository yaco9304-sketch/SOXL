/**
 * 알림 전송 유틸리티
 */

import type { TodayAction } from '@/types';

interface NotificationOptions {
  action: TodayAction;
  symbol: string;
}

/**
 * 매수/매도 신호 알림 전송
 */
export async function sendSignalNotification(
  options: NotificationOptions
): Promise<void> {
  const { action, symbol } = options;

  // NO_ACTION이면 알림을 보내지 않음
  if (action.action === 'NO_ACTION') {
    return;
  }

  // 알림 제목과 내용 생성
  const { title, body, url } = generateNotificationContent(action, symbol);

  try {
    // 서버에 알림 전송 요청
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        body,
        url,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send notification');
      return;
    }

    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * 알림 내용 생성
 */
function generateNotificationContent(
  action: TodayAction,
  symbol: string
): { title: string; body: string; url: string } {
  let title = '';
  let body = '';
  let url = '/dashboard';

  switch (action.action) {
    case 'BUY':
      title = `🟡 ${symbol} 매수 신호!`;
      body = action.reason || '정규 매수 조건이 충족되었습니다.';
      url = '/buy';
      break;

    case 'OVERBUY':
      title = `🟠 ${symbol} 과매수 신호!`;
      body = action.reason || '급락 후 과매수 조건이 충족되었습니다.';
      url = '/buy';
      break;

    case 'SELL_BOUNCE':
      title = `🟢 ${symbol} 반등 매도 신호!`;
      body = action.reason || '반등 매도 조건이 충족되었습니다.';
      url = '/sell';
      break;

    case 'SELL_TARGET':
      title = `💚 ${symbol} 목표가 매도 신호!`;
      body = action.reason || '목표가 매도 조건이 충족되었습니다.';
      url = '/sell';
      break;

    case 'STOP':
      title = `🔴 ${symbol} 매수 중단!`;
      body = action.reason || '매수 중단 조건이 발생했습니다.';
      url = '/dashboard';
      break;

    default:
      title = `${symbol} 알림`;
      body = action.reason || '새로운 신호가 발생했습니다.';
      break;
  }

  return { title, body, url };
}
