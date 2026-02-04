import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/quote?symbol=SOXL
 * 실시간 시세 조회 API (Yahoo Finance)
 *
 * 장 시작 전에는 previousClose가 전전일 종가를 반환하는 문제가 있어서
 * historical 데이터에서 정확한 전일 종가를 가져옵니다.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol') || 'SOXL';

    // Yahoo Finance API 호출 - 5일치 데이터 요청 (정확한 전일 종가를 위해)
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=5d&interval=1d`;
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'no-store',
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
    const indicators = result.indicators?.quote?.[0];

    // 현재가 (실시간)
    const currentPrice = meta.regularMarketPrice;

    // Historical 데이터에서 전일 종가 추출
    // closes 배열의 마지막이 가장 최근 거래일 종가 = 전일 종가
    let previousClose = meta.previousClose || currentPrice;

    if (indicators?.close) {
      const closes = indicators.close.filter((c: number | null) => c !== null);
      if (closes.length >= 1) {
        // 마지막 값이 전일 종가 (가장 최근 완료된 거래일)
        previousClose = closes[closes.length - 1];
      }
    }

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
