/**
 * 평단가 계산 유틸리티
 */

import type { TradeEvent } from '@/types';

/**
 * 평단가 계산 결과
 */
export interface AveragePriceResult {
  averagePrice: number; // 평단가
  totalShares: number; // 총 보유 주식 수
  totalInvested: number; // 총 투자 금액 (USD)
}

/**
 * 거래 이력을 기반으로 현재 평단가 계산
 *
 * 계산 공식:
 * - 매수: 평단가 = Σ(매수가 × 수량) / Σ(수량)
 * - 매도: 남은 주식 기준으로 재계산
 *
 * @param tradeHistory 거래 이력 배열
 * @param symbol 심볼 (SOXL, TQQQ, UPRO)
 * @returns 평단가 계산 결과
 */
export function calculateAveragePrice(
  tradeHistory: TradeEvent[],
  symbol: string
): AveragePriceResult {
  // 해당 심볼의 거래만 필터링하고 날짜 순으로 정렬
  const symbolTrades = tradeHistory
    .filter((trade) => trade.symbol === symbol)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let totalShares = 0;
  let totalInvested = 0;

  for (const trade of symbolTrades) {
    if (!trade.shares || !trade.price) continue;

    if (trade.action === 'BUY' || trade.action === 'OVERBUY') {
      // 매수: 주식 수와 투자 금액 증가
      totalShares += trade.shares;
      totalInvested += trade.price * trade.shares;
    } else if (
      trade.action === 'SELL_BOUNCE' ||
      trade.action === 'SELL_TARGET'
    ) {
      // 매도: 주식 수 감소, 투자 금액은 비례하여 감소
      if (totalShares > 0) {
        const sellRatio = trade.shares / totalShares;
        totalInvested -= totalInvested * sellRatio;
        totalShares -= trade.shares;
      }
    }
  }

  const averagePrice =
    totalShares > 0 ? totalInvested / totalShares : 0;

  return {
    averagePrice: Math.round(averagePrice * 100) / 100,
    totalShares: Math.round(totalShares),
    totalInvested: Math.round(totalInvested * 100) / 100,
  };
}

/**
 * 예상 평단가 계산 (매수 실행 시)
 *
 * @param currentAverage 현재 평단가
 * @param currentShares 현재 보유 주식 수
 * @param buyPrice 매수 예정 가격
 * @param buyShares 매수 예정 주식 수
 * @returns 예상 평단가
 */
export function calculateExpectedAveragePrice(
  currentAverage: number,
  currentShares: number,
  buyPrice: number,
  buyShares: number
): number {
  const currentInvested = currentAverage * currentShares;
  const newInvested = buyPrice * buyShares;
  const totalShares = currentShares + buyShares;

  const expectedAverage =
    totalShares > 0 ? (currentInvested + newInvested) / totalShares : buyPrice;

  return Math.round(expectedAverage * 100) / 100;
}

/**
 * 여러 차례 진입 시 단계별 예상 평단가 계산
 *
 * @param currentAverage 현재 평단가
 * @param currentShares 현재 보유 주식 수
 * @param entries 진입 정보 배열 [{price, shares}, ...]
 * @returns 단계별 예상 평단가 배열
 */
export function calculateMultiStepAveragePrice(
  currentAverage: number,
  currentShares: number,
  entries: Array<{ price: number; shares: number }>
): number[] {
  const results: number[] = [];
  let avgPrice = currentAverage;
  let shares = currentShares;

  for (const entry of entries) {
    avgPrice = calculateExpectedAveragePrice(
      avgPrice,
      shares,
      entry.price,
      entry.shares
    );
    shares += entry.shares;
    results.push(avgPrice);
  }

  return results;
}
