/**
 * 행동 가이드 카드 (상태별 그라데이션 개선)
 */

'use client';

import { TodayAction } from '@/types';
import { StatusBadge } from './StatusBadge';
import { formatUSD, formatKRW, formatShares } from '@/lib/utils/format';
import { ShoppingCart, TrendingUp, AlertTriangle, Clock, Zap, Target } from 'lucide-react';

interface ActionCardProps {
  action: TodayAction;
}

export function ActionCard({ action }: ActionCardProps) {
  const getActionIcon = () => {
    switch (action.action) {
      case 'BUY':
        return ShoppingCart;
      case 'OVERBUY':
        return Zap;
      case 'SELL_BOUNCE':
      case 'SELL_TARGET':
        return TrendingUp;
      case 'STOP':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getCardStyle = () => {
    switch (action.action) {
      case 'BUY':
        return {
          bg: 'bg-gradient-to-br from-yellow-500/10 via-bg-card to-bg-card',
          border: 'border-l-4 border-warning',
          iconBg: 'bg-warning/20',
          iconColor: 'text-warning',
          glow: 'shadow-xl shadow-warning/10',
        };
      case 'OVERBUY':
        return {
          bg: 'bg-gradient-to-br from-orange-500/10 via-bg-card to-bg-card',
          border: 'border-l-4 border-orange-600',
          iconBg: 'bg-orange-500/20',
          iconColor: 'text-orange-500',
          glow: 'shadow-xl shadow-orange-500/20',
        };
      case 'SELL_BOUNCE':
      case 'SELL_TARGET':
        return {
          bg: 'bg-gradient-to-br from-success/10 via-bg-card to-bg-card',
          border: 'border-l-4 border-success',
          iconBg: 'bg-success/20',
          iconColor: 'text-success',
          glow: 'shadow-xl shadow-success/10',
        };
      case 'STOP':
        return {
          bg: 'bg-gradient-to-br from-danger/10 via-bg-card to-bg-card',
          border: 'border-l-4 border-danger',
          iconBg: 'bg-danger/20',
          iconColor: 'text-danger',
          glow: 'shadow-xl shadow-danger/20',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-neutral/10 via-bg-card to-bg-card',
          border: 'border-l-4 border-neutral',
          iconBg: 'bg-neutral/20',
          iconColor: 'text-neutral',
          glow: 'shadow-lg',
        };
    }
  };

  const Icon = getActionIcon();
  const cardStyle = getCardStyle();

  return (
    <div 
      className={`relative p-6 rounded-xl ${cardStyle.bg} ${cardStyle.border} ${cardStyle.glow} transition-all duration-300 hover:scale-[1.01] overflow-hidden`}
    >
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">오늘의 행동</h2>
            {action.action === 'STOP' && (
              <Target className="w-5 h-5 text-danger animate-ping" />
            )}
          </div>
          <StatusBadge action={action.action} />
        </div>

        {/* 아이콘 + 메시지 with 개선된 디자인 */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`flex-shrink-0 p-4 ${cardStyle.iconBg} rounded-xl transition-all duration-300 hover:scale-110`}>
            <Icon className={`w-8 h-8 ${cardStyle.iconColor}`} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <p className="text-xl text-text-primary leading-relaxed font-medium">
              {action.reason}
            </p>
          </div>
        </div>

        {/* 매수 정보 with 그라데이션 */}
        {(action.action === 'BUY' || action.action === 'OVERBUY') &&
          action.buyAmount && (
            <div className={`space-y-3 p-5 rounded-xl ${
              action.action === 'OVERBUY'
                ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/10 border border-orange-500/30'
                : 'bg-gradient-to-r from-warning/20 to-warning/10 border border-warning/30'
            }`}>
              <div className="flex justify-between items-center group">
                <span className="text-text-secondary font-medium">💵 매수 금액 (USD)</span>
                <span className={`text-2xl font-bold number-font ${
                  action.action === 'OVERBUY' ? 'text-orange-500' : 'text-warning'
                } transition-transform group-hover:scale-110`}>
                  {formatUSD(action.buyAmount)}
                </span>
              </div>
              {action.buyAmountKRW && (
                <div className="flex justify-between items-center group">
                  <span className="text-text-secondary font-medium">💴 매수 금액 (KRW)</span>
                  <span className={`text-xl font-bold number-font ${
                    action.action === 'OVERBUY' ? 'text-orange-400' : 'text-yellow-400'
                  } transition-transform group-hover:scale-110`}>
                    {formatKRW(action.buyAmountKRW)}
                  </span>
                </div>
              )}
              {action.buyShares && (
                <div className="flex justify-between items-center group">
                  <span className="text-text-secondary font-medium">📊 권장 주 수</span>
                  <span className={`text-xl font-bold number-font ${
                    action.action === 'OVERBUY' ? 'text-orange-400' : 'text-yellow-400'
                  } transition-transform group-hover:scale-110`}>
                    {formatShares(action.buyShares)}
                  </span>
                </div>
              )}

              {/* 평단가 정보 */}
              {action.expectedAveragePrice && action.expectedAveragePrice > 0 && (
                <>
                  <div className="mt-3 pt-3 border-t border-neutral/20" />
                  {action.currentAveragePrice && action.currentAveragePrice > 0 ? (
                    <>
                      <div className="flex justify-between items-center group">
                        <span className="text-text-secondary font-medium">📌 현재 평단가</span>
                        <span className="text-lg font-bold number-font text-blue-400 transition-transform group-hover:scale-110">
                          {formatUSD(action.currentAveragePrice)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center group">
                        <span className="text-text-secondary font-medium">🎯 예상 평단가</span>
                        <span className={`text-lg font-bold number-font ${
                          action.action === 'OVERBUY' ? 'text-orange-300' : 'text-yellow-300'
                        } transition-transform group-hover:scale-110`}>
                          {formatUSD(action.expectedAveragePrice)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary text-sm">평단가 변화</span>
                        <span className={`text-sm font-semibold number-font ${
                          action.expectedAveragePrice < action.currentAveragePrice
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}>
                          {action.expectedAveragePrice < action.currentAveragePrice ? '↓' : '↑'}{' '}
                          {formatUSD(Math.abs(action.expectedAveragePrice - action.currentAveragePrice))}
                          {' '}
                          ({((action.expectedAveragePrice - action.currentAveragePrice) / action.currentAveragePrice * 100).toFixed(2)}%)
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center group">
                      <span className="text-text-secondary font-medium">🎯 매수 후 평단가</span>
                      <span className={`text-lg font-bold number-font ${
                        action.action === 'OVERBUY' ? 'text-orange-300' : 'text-yellow-300'
                      } transition-transform group-hover:scale-110`}>
                        {formatUSD(action.expectedAveragePrice)}
                      </span>
                    </div>
                  )}
                </>
              )}

              {action.action === 'OVERBUY' && (
                <div className="mt-3 pt-3 border-t border-orange-500/30">
                  <p className="text-sm text-orange-400 font-semibold text-center animate-pulse">
                    ⚡ 급락 기회 - 비중 확대 매수
                  </p>
                </div>
              )}
            </div>
          )}

        {/* 매도 정보 with 그라데이션 */}
        {(action.action === 'SELL_BOUNCE' || action.action === 'SELL_TARGET') &&
          action.sellRatio && (
            <div className="space-y-3 p-5 rounded-xl bg-gradient-to-r from-success/20 to-success/10 border border-success/30">
              <div className="flex justify-between items-center group">
                <span className="text-text-secondary font-medium">💰 매도 비율</span>
                <span className="text-2xl font-bold number-font text-success transition-transform group-hover:scale-110">
                  {(action.sellRatio * 100).toFixed(0)}%
                </span>
              </div>
              {action.sellShares && (
                <div className="flex justify-between items-center group">
                  <span className="text-text-secondary font-medium">📊 매도 주 수</span>
                  <span className="text-xl font-bold number-font text-green-400 transition-transform group-hover:scale-110">
                    {formatShares(action.sellShares)}
                  </span>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-success/30">
                <p className="text-sm text-success font-semibold text-center">
                  ✅ {action.action === 'SELL_BOUNCE' ? '반등 매도 기회' : '목표가 달성'}
                </p>
              </div>
            </div>
          )}

        {/* 중단 사유 with 강조 효과 */}
        {action.action === 'STOP' && action.stopReason && (
          <div className="relative p-5 bg-gradient-to-r from-danger/20 to-danger/10 border-2 border-danger rounded-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-danger/10 rounded-full blur-2xl animate-pulse" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-danger animate-bounce" />
                <p className="text-lg text-danger font-bold">매수 중단</p>
              </div>
              <p className="text-sm text-danger/80 font-semibold">
                사유: {action.stopReason}
              </p>
              <div className="mt-3 pt-3 border-t border-danger/30">
                <p className="text-xs text-danger/70">
                  ⛔ 규칙에 따라 매수가 중단되었습니다. 조건 해제 시까지 대기하세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 대기 상태 */}
        {action.action === 'NO_ACTION' && (
          <div className="p-5 bg-gradient-to-r from-neutral/10 to-bg-secondary rounded-xl border border-neutral/20 text-center">
            <Clock className="w-12 h-12 text-neutral mx-auto mb-3 animate-pulse" />
            <p className="text-text-primary font-medium mb-2">
              조건 대기 중
            </p>
            <p className="text-sm text-text-secondary">
              오늘은 매수/매도 조건이 충족되지 않았습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
