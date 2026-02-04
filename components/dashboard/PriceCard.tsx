/**
 * 가격 정보 카드 (표준편차 매매법 기준가 포함)
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { DailyMarketState } from '@/types';
import { formatUSD, formatPercent, getChangeColor } from '@/lib/utils/format';
import { TrendingUp, TrendingDown, Minus, Activity, Target, AlertTriangle } from 'lucide-react';
import { ChartModal } from '@/components/common/ChartModal';
import { calculateStdDevBuyPrices, checkBuyConditionByPrice } from '@/lib/strategy/rules';

interface PriceCardProps {
  market: DailyMarketState;
}

export function PriceCard({ market }: PriceCardProps) {
  const { symbol, currentPrice, prevClose, changePct, changeAmt, high, low, volume } = market;
  const isPositive = changePct > 0;
  const isNegative = changePct < 0;
  const changeColor = getChangeColor(changePct);

  const [flash, setFlash] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showChart, setShowChart] = useState(false);

  // 표준편차 매매법 기준가 계산
  const buyPrices = useMemo(() => calculateStdDevBuyPrices(prevClose), [prevClose]);
  const buyCondition = useMemo(() => checkBuyConditionByPrice(currentPrice, buyPrices), [currentPrice, buyPrices]);

  // 가격 변동 시 플래시 효과
  useEffect(() => {
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 500);
    return () => clearTimeout(timer);
  }, [currentPrice]);

  const TrendIcon = isPositive
    ? TrendingUp
    : isNegative
    ? TrendingDown
    : Minus;

  // 변동폭 계산 (전일 대비)
  const changePercent = Math.abs(changePct);
  const progressWidth = Math.min(changePercent * 5, 100); // 최대 100%

  return (
    <>
      <ChartModal 
        symbol={symbol}
        isOpen={showChart}
        onClose={() => setShowChart(false)}
      />
      <div 
        className="relative bg-bg-card p-6 rounded-lg border border-border transition-all duration-200 hover:border-border-subtle overflow-hidden"
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
      {/* 실시간 표시 */}
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <Activity className="w-4 h-4 text-accent animate-pulse" />
        <span className="text-xs text-accent font-semibold">LIVE</span>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-text-primary">{symbol}</h2>
            <div className="flex items-center gap-1">
              <TrendIcon
                className={`w-6 h-6 ${changeColor} transition-all duration-300 ${
                  flash ? 'scale-125' : 'scale-100'
                }`}
                strokeWidth={2.5}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* 현재가 with 플래시 효과 */}
          <div>
            <p className="text-sm text-text-muted mb-2 flex items-center gap-2">
              현재가
              <span className="text-xs text-accent">
                (클릭하여 차트 보기 📊)
              </span>
            </p>
            <div className="relative">
              <button
                onClick={() => setShowChart(true)}
                className={`text-5xl font-bold number-font transition-all duration-200 ${
                  flash ? 'scale-105' : 'scale-100'
                } text-text-primary hover:text-accent cursor-pointer group`}
              >
                {formatUSD(currentPrice)}
                <span className="ml-2 text-2xl text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  📈
                </span>
              </button>
            </div>
          </div>

          {/* 등락 정보 with 진행바 */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-text-muted mb-1">등락률</p>
                <p className={`text-3xl font-bold number-font ${changeColor} transition-colors duration-300`}>
                  {formatPercent(changePct)}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-text-muted mb-1">등락금액</p>
                <p className={`text-3xl font-bold number-font ${changeColor} transition-colors duration-300`}>
                  {formatUSD(changeAmt)}
                </p>
              </div>
            </div>
            
            {/* 변동폭 시각화 바 */}
            <div className="relative h-2 bg-bg-secondary rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${
                  isPositive ? 'bg-gradient-to-r from-up/50 to-up' :
                  isNegative ? 'bg-gradient-to-r from-down/50 to-down' :
                  'bg-gradient-to-r from-neutral/50 to-neutral'
                }`}
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>

          {/* 전일 종가 */}
          <div className="pt-4 border-t border-bg-secondary">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">전일 종가</span>
              <span className="text-lg font-bold number-font text-text-secondary">{formatUSD(prevClose)}</span>
            </div>
          </div>

          {/* 표준편차 매매법 기준가 */}
          <div className="pt-4 border-t border-bg-secondary">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-text-primary">매수 기준가</span>
              <span className="text-xs text-text-muted">(전일 종가 기준)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* -7% 매수가 */}
              <div className={`p-3 rounded-lg border transition-all ${
                buyCondition.level === 'buy7' || buyCondition.level === 'buy14'
                  ? 'bg-warning/10 border-warning'
                  : 'bg-bg-secondary border-bg-hover'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-muted">-7% 매수가</span>
                  {(buyCondition.level === 'buy7' || buyCondition.level === 'buy14') && (
                    <AlertTriangle className="w-3 h-3 text-warning" />
                  )}
                </div>
                <p className={`text-xl font-bold number-font ${
                  buyCondition.level === 'buy7' || buyCondition.level === 'buy14'
                    ? 'text-warning'
                    : 'text-text-primary'
                }`}>
                  {formatUSD(buyPrices.buy7)}
                </p>
                <p className="text-xs text-text-muted mt-1">× 0.93</p>
              </div>

              {/* -14% 매수가 */}
              <div className={`p-3 rounded-lg border transition-all ${
                buyCondition.level === 'buy14'
                  ? 'bg-danger/10 border-danger'
                  : 'bg-bg-secondary border-bg-hover'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-muted">-14% 매수가</span>
                  {buyCondition.level === 'buy14' && (
                    <AlertTriangle className="w-3 h-3 text-danger" />
                  )}
                </div>
                <p className={`text-xl font-bold number-font ${
                  buyCondition.level === 'buy14'
                    ? 'text-danger'
                    : 'text-text-primary'
                }`}>
                  {formatUSD(buyPrices.buy14)}
                </p>
                <p className="text-xs text-text-muted mt-1">× 0.86</p>
              </div>
            </div>

            {/* 매수 조건 알림 */}
            {buyCondition.shouldBuy && (
              <div className={`mt-3 p-3 rounded-lg ${
                buyCondition.level === 'buy14'
                  ? 'bg-danger/20 border border-danger'
                  : 'bg-warning/20 border border-warning'
              }`}>
                <p className={`text-sm font-semibold ${
                  buyCondition.level === 'buy14' ? 'text-danger' : 'text-warning'
                }`}>
                  🚨 {buyCondition.message}
                </p>
              </div>
            )}
          </div>

          {/* 추가 정보 (호버 시 표시) */}
          <div 
            className={`transition-all duration-300 overflow-hidden ${
              showDetails ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="pt-4 border-t border-bg-secondary space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">고가</span>
                <span className="font-bold number-font text-success">{formatUSD(high)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">저가</span>
                <span className="font-bold number-font text-danger">{formatUSD(low)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">거래량</span>
                <span className="font-bold number-font text-primary-500">
                  {(volume / 1000000).toFixed(2)}M
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
