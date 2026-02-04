import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { saveSubscription, removeSubscription } from '@/lib/utils/subscription-store';

interface SubscriptionData {
  subscription: PushSubscription;
  userId: string;
}

/**
 * POST /api/notifications/subscribe
 * 푸시 알림 구독
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

    const body = await request.json();
    const { subscription } = body;

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription data required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // 구독 정보 저장
    saveSubscription(userId, subscription);

    console.log(`Subscription saved for user: ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to notifications',
    });
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/subscribe
 * 푸시 알림 구독 해제
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 구독 정보 삭제
    const deleted = removeSubscription(userId);

    if (deleted) {
      console.log(`Subscription removed for user: ${userId}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from notifications',
    });
  } catch (error) {
    console.error('Error unsubscribing from notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
