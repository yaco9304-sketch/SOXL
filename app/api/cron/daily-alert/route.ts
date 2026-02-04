import { NextRequest, NextResponse } from 'next/server';
import webpush, { PushSubscription as WebPushSubscription } from 'web-push';
import { getAllSubscriptions } from '@/lib/utils/subscription-store';
import { calculateStdDevBuyPrices } from '@/lib/strategy/rules';

// VAPID 키 설정
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:your-email@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

// Vercel Cron 인증 키
const CRON_SECRET = process.env.CRON_SECRET;

interface QuoteResult {
  success: boolean;
  prevClose?: number;
  currentPrice?: number;
  error?: string;
}

/**
 * Yahoo Finance에서 전일 종가 조회
 */
async function fetchPrevClose(symbol: string): Promise<QuoteResult> {
  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result || !result.meta) {
      throw new Error('Invalid response from Yahoo Finance');
    }

    const meta = result.meta;
    const prevClose = meta.chartPreviousClose || meta.previousClose;
    const currentPrice = meta.regularMarketPrice || prevClose;

    return {
      success: true,
      prevClose,
      currentPrice,
    };
  } catch (error) {
    console.error('Failed to fetch quote:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 미장 휴장 여부 체크 (간단 버전)
 * 실제로는 정확한 휴장일 API를 사용하는 것이 좋음
 */
function isMarketHoliday(): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay();
  // 토요일(6), 일요일(0)은 휴장
  return dayOfWeek === 0 || dayOfWeek === 6;
}

/**
 * GET /api/cron/daily-alert
 * 매일 20:00 KST에 Vercel Cron이 호출
 * 전일 종가 기준 매수가를 계산하고 푸시 알림 발송
 */
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron 인증 확인 (프로덕션 환경)
    if (CRON_SECRET) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const symbol = 'SOXL';

    // 1. 휴장일 체크
    const isHoliday = isMarketHoliday();

    // 2. 전일 종가 조회
    const quoteResult = await fetchPrevClose(symbol);
    if (!quoteResult.success || !quoteResult.prevClose) {
      console.error('Failed to fetch prev close:', quoteResult.error);
      return NextResponse.json(
        { success: false, error: quoteResult.error || 'Failed to fetch quote' },
        { status: 500 }
      );
    }

    // 3. 매수 기준가 계산
    const buyPrices = calculateStdDevBuyPrices(quoteResult.prevClose);

    // 4. 푸시 알림 메시지 생성
    const holidayNote = isHoliday ? '\n(휴장일 - 최근 거래일 기준)' : '';
    const payload = JSON.stringify({
      title: `[${symbol} 기준가 알림] 전일 종가 기준`,
      body: `전일 종가: $${buyPrices.prevClose.toFixed(2)}\n-7% 매수가: $${buyPrices.buy7.toFixed(2)}\n-14% 매수가: $${buyPrices.buy14.toFixed(2)}\n\n규칙: 터치 시 분할 매수, 그 외 관망${holidayNote}`,
      url: '/dashboard',
      data: {
        symbol,
        prevClose: buyPrices.prevClose,
        buy7: buyPrices.buy7,
        buy14: buyPrices.buy14,
        isHoliday,
        sentAt: new Date().toISOString(),
      },
    });

    // 5. 모든 구독자에게 푸시 발송
    const subscriptions = getAllSubscriptions();
    let sentCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const [userId, subscription] of subscriptions.entries()) {
      try {
        await webpush.sendNotification(
          subscription as unknown as WebPushSubscription,
          payload
        );
        sentCount++;
        console.log(`[Daily Alert] Notification sent to user: ${userId}`);
      } catch (error) {
        errorCount++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`User ${userId}: ${errorMsg}`);
        console.error(`[Daily Alert] Failed to send to user ${userId}:`, error);
      }
    }

    // 6. 결과 반환
    const result = {
      success: true,
      message: `Daily alert sent for ${symbol}`,
      symbol,
      prevClose: buyPrices.prevClose,
      buy7: buyPrices.buy7,
      buy14: buyPrices.buy14,
      isHoliday,
      sentAt: new Date().toISOString(),
      stats: {
        totalSubscribers: subscriptions.size,
        sentCount,
        errorCount,
      },
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log('[Daily Alert] Result:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Daily Alert] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
