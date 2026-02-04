import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/quote?symbol=SOXL
 * 실시간 시세 조회 API (Yahoo Finance)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol') || 'SOXL';

    // Yahoo Finance API 호출
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 60 }, // 1분 캐시
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
    const currentPrice = meta.regularMarketPrice || meta.previousClose;
    // regularMarketPreviousClose가 가장 정확한 전일 종가
    const previousClose = meta.regularMarketPreviousClose || meta.previousClose;
    const changePercent = ((currentPrice - previousClose) / previousClose) * 100;

    // DailyMarketState 형식으로 반환
    return NextResponse.json({
      success: true,
      data: {
        date: new Date().toISOString().split('T')[0],
        symbol,
        prevClose: previousClose,
        currentPrice,
        open: meta.regularMarketOpen || currentPrice,
        high: meta.regularMarketDayHigh || currentPrice,
        low: meta.regularMarketDayLow || currentPrice,
        volume: meta.regularMarketVolume || 0,
        changePct: changePercent,
        changeAmt: currentPrice - previousClose,
      },
    });
  } catch (error) {
    console.error('Quote API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch quote',
      },
      { status: 500 }
    );
  }
}
