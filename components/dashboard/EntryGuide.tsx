/**
 * 진입 가이드 컴포넌트 (1차/2차 진입 예상 평단가)
 */

'use client';

import { UserConfig, DailyMarketState } from '@/types';
import { calculateStdDevBuyPrices } from '@/lib/strategy/rules';
import { calculateMultiStepAveragePrice } from '@/lib/utils/averagePrice';
import { formatUSD, formatShares } from '@/lib/utils/format';
import { TrendingDown, ChevronRight } from 'lucide-react';

interface EntryGuideProps {
  market: DailyMarketState;
  config: UserConfig;
  exchangeRate: number;
}

export function EntryGuide({ market, config, exchangeRate }: EntryGuideProps) {
  // 전일 종가 기준 매수 단가 계산
  const buyPrices = calculateStdDevBuyPrices(market.prevClose);

  // 현재 평단가 및 보유 주식 수
  const currentAverage = config.averageCost || 0;
  const currentShares = config.totalShares || 0;

  // 1차 진입 (-7%) 매수 가능 금액 및 수량
  const buyAmountKRW_7 = config.totalBudget * config.buyRatioNormal;
  const buyAmount_7 = buyAmountKRW_7 / exchangeRate;
  const buyShares_7 = Math.floor(buyAmount_7 / buyPrices.buy7);

  // 2차 진입 (-14%) 매수 가능 금액 및 수량
  const buyAmountKRW_14 = config.totalBudget * config.buyRatioOver;
  const buyAmount_14 = buyAmountKRW_14 / exchangeRate;
  const buyShares_14 = Math.floor(buyAmount_14 / buyPrices.buy14);

  // 단계별 예상 평단가 계산
  const expectedAverages = calculateMultiStepAveragePrice(
    currentAverage,
    currentShares,
    [
      { price: buyPrices.buy7, shares: buyShares_7 },
      { price: buyPrices.buy14, shares: buyShares_14 },
    ]
  );

  const expectedAverage_7 = expectedAverages[0] || buyPrices.buy7;
  const expectedAverage_14 = expectedAverages[1] || buyPrices.buy14;

  return (
    <div className="bg-gradient-to-br from-purple-500/10 via-bg-card to-bg-card p-6 rounded-xl border-l-4 border-purple-500 shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-3 bg-purple-500/20 rounded-xl">
          <TrendingDown className="w-6 h-6 text-purple-400" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-text-primary">📊 진입 가이드</h3>
          <p className="text-sm text-text-secondary">단계별 예상 평단가</p>
        </div>
      </div>

      {/* 현재 보유 정보 */}
      {currentShares > 0 && currentAverage > 0 ? (
        <div className="mb-5 p-4 bg-bg-secondary/50 rounded-lg border border-border">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm font-medium">현재 보유</span>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-400 number-font">
                {formatShares(currentShares)}
              </div>
              <div className="text-sm text-text-secondary">
                @ {formatUSD(currentAverage)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-5 p-4 bg-bg-secondary/50 rounded-lg border border-border text-center">
          <p className="text-text-secondary text-sm">보유 주식이 없습니다</p>
          <p className="text-xs text-text-muted mt-1">첫 진입 시 매수가가 평단가가 됩니다</p>
        </div>
      )}

      <div className="space-y-4">
        {/* 1차 진입 (-7%) */}
        <div className="p-5 bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 border border-yellow-500/30 rounded-xl hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500/30 rounded-lg flex items-center justify-center">
                <span className="text-yellow-400 font-bold">1</span>
              </div>
              <span className="font-bold text-text-primary">1차 진입</span>
            </div>
            <span className="text-sm text-yellow-400 font-semibold">-7% 하락</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">진입 단가</span>
              <span className="text-lg font-bold text-yellow-400 number-font">
                {formatUSD(buyPrices.buy7)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">매수 수량</span>
              <span className="text-base font-semibold text-yellow-300 number-font">
                {formatShares(buyShares_7)}
              </span>
            </div>
            <div className="pt-2 mt-2 border-t border-yellow-500/20">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm font-medium">→ 예상 평단가</span>
                <span className="text-xl font-bold text-yellow-400 number-font">
                  {formatUSD(expectedAverage_7)}
                </span>
              </div>
              {currentShares > 0 && currentAverage > 0 && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-text-muted text-xs">변화</span>
                  <span className={`text-xs font-semibold number-font ${
                    expectedAverage_7 < currentAverage ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {expectedAverage_7 < currentAverage ? '↓' : '↑'}{' '}
                    {formatUSD(Math.abs(expectedAverage_7 - currentAverage))}
                    {' '}
                    ({((expectedAverage_7 - currentAverage) / currentAverage * 100).toFixed(2)}%)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 화살표 */}
        <div className="flex justify-center">
          <ChevronRight className="w-6 h-6 text-text-muted rotate-90" />
        </div>

        {/* 2차 진입 (-14%) */}
        <div className="p-5 bg-gradient-to-r from-orange-500/20 to-orange-500/10 border border-orange-500/30 rounded-xl hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500/30 rounded-lg flex items-center justify-center">
                <span className="text-orange-400 font-bold">2</span>
              </div>
              <span className="font-bold text-text-primary">2차 진입</span>
            </div>
            <span className="text-sm text-orange-400 font-semibold">-14% 급락</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">진입 단가</span>
              <span className="text-lg font-bold text-orange-400 number-font">
                {formatUSD(buyPrices.buy14)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">매수 수량</span>
              <span className="text-base font-semibold text-orange-300 number-font">
                {formatShares(buyShares_14)}
              </span>
            </div>
            <div className="pt-2 mt-2 border-t border-orange-500/20">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm font-medium">→ 예상 평단가</span>
                <span className="text-xl font-bold text-orange-400 number-font">
                  {formatUSD(expectedAverage_14)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-text-muted text-xs">1차 대비 변화</span>
                <span className={`text-xs font-semibold number-font ${
                  expectedAverage_14 < expectedAverage_7 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {expectedAverage_14 < expectedAverage_7 ? '↓' : '↑'}{' '}
                  {formatUSD(Math.abs(expectedAverage_14 - expectedAverage_7))}
                  {' '}
                  ({((expectedAverage_14 - expectedAverage_7) / expectedAverage_7 * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="mt-5 p-3 bg-bg-secondary/50 rounded-lg border border-border">
        <p className="text-xs text-text-muted text-center leading-relaxed">
          💡 진입 단가는 <span className="font-semibold text-purple-400">전일 종가</span> 기준으로 계산됩니다.<br />
          실제 매수 시 현재가 기준으로 평단가가 재계산됩니다.
        </p>
      </div>
    </div>
  );
}
