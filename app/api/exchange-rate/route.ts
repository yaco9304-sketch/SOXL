import { NextResponse } from 'next/server';

/**
 * GET /api/exchange-rate
 * 원/달러 환율 조회 API (한국수출입은행 API)
 */
export async function GET() {
  try {
    // 한국수출입은행 환율 API
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    
    // API 키가 필요하므로, 대체 방법으로 환율 정보 가져오기
    // 실제로는 한국수출입은행 API 키를 발급받아 사용해야 합니다
    // 여기서는 fallback으로 고정 환율을 사용하거나 다른 소스를 사용합니다
    
    try {
      // Fallback: exchangerate-api.com (무료)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
        next: { revalidate: 3600 }, // 1시간 캐시
      });

      if (!response.ok) {
        throw new Error('Exchange rate API error');
      }

      const data = await response.json();
      const usdToKrw = data.rates?.KRW;

      if (!usdToKrw) {
        throw new Error('KRW rate not found');
      }

      return NextResponse.json({
        success: true,
        data: {
          rate: usdToKrw,
          currency: 'KRW',
          base: 'USD',
          timestamp: new Date().toISOString(),
          source: 'exchangerate-api.com',
        },
      });
    } catch (apiError) {
      // API 실패 시 기본 환율 사용 (약 1,350원)
      console.warn('Exchange rate API failed, using default rate:', apiError);
      return NextResponse.json({
        success: true,
        data: {
          rate: 1350, // 기본 환율
          currency: 'KRW',
          base: 'USD',
          timestamp: new Date().toISOString(),
          source: 'default',
          isDefault: true,
        },
      });
    }
  } catch (error) {
    console.error('Exchange rate error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch exchange rate',
      },
      { status: 500 }
    );
  }
}
