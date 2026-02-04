import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import webpush, { PushSubscription as WebPushSubscription } from 'web-push';
import { getAllSubscriptions, getSubscription } from '@/lib/utils/subscription-store';

// VAPID 키 설정
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:your-email@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  userId?: string;
}

/**
 * POST /api/notifications/send
 * 푸시 알림 전송
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: NotificationPayload = await request.json();
    const { title, body: notificationBody, url, userId } = body;

    if (!title || !notificationBody) {
      return NextResponse.json(
        { success: false, error: 'Title and body required' },
        { status: 400 }
      );
    }

    const payload = JSON.stringify({
      title,
      body: notificationBody,
      url: url || '/dashboard',
    });

    let sentCount = 0;
    let errorCount = 0;

    // 특정 사용자에게만 전송
    if (userId) {
      const subscription = getSubscription(userId);
      if (subscription) {
        try {
          await webpush.sendNotification(subscription as unknown as WebPushSubscription, payload);
          sentCount++;
          console.log(`Notification sent to user: ${userId}`);
        } catch (error) {
          errorCount++;
          console.error(`Failed to send notification to user ${userId}:`, error);
        }
      }
    } else {
      // 모든 구독자에게 전송
      const subscriptions = getAllSubscriptions();
      for (const [uid, subscription] of subscriptions.entries()) {
        try {
          await webpush.sendNotification(subscription as unknown as WebPushSubscription, payload);
          sentCount++;
          console.log(`Notification sent to user: ${uid}`);
        } catch (error) {
          errorCount++;
          console.error(`Failed to send notification to user ${uid}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      sentCount,
      errorCount,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
