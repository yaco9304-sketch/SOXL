/**
 * 히스토리 통계 뷰 컴포넌트
 */

'use client';

import { TradeEvent } from '@/types';
import { formatUSD, formatPercent } from '@/lib/utils/format';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Target } from 'lucide-react';

interface StatsViewProps {
  events: TradeEvent[];
}

export function StatsView({ events }: StatsViewProps) {
  // 통계 계산
  const buyEvents = events.filter((e) => e.action === 'BUY' || e.action === 'OVERBUY');
  const sellEvents = events.filter((e) => e.action === 'SELL_BOUNCE' || e.action === 'SELL_TARGET');
  const stopEvents = events.filter((e) => e.action === 'STOP');

  const totalBuyAmount = buyEvents.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalSellAmount = sellEvents.reduce((sum, e) => sum + (e.amount || 0), 0);
  
  const executedEvents = events.filter((e) => e.executed);
  const executionRate = events.length > 0 ? (executedEvents.length / events.length) * 100 : 0;

  const avgBuyAmount = buyEvents.length > 0 ? totalBuyAmount / buyEvents.length : 0;
  
  // 수익률 계산 (간단 버전 - 실제로는 더 복잡)
  const netProfit = totalSellAmount - totalBuyAmount;
  const profitRate = totalBuyAmount > 0 ? (netProfit / totalBuyAmount) * 100 : 0;

  const stats = [
    {
      title: '총 매수 횟수',
      value: buyEvents.length,
      icon: TrendingDown,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
    },
    {
      title: '총 매도 횟수',
      value: sellEvents.length,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
    },
    {
      title: '중단 횟수',
      value: stopEvents.length,
      icon: Activity,
      color: 'text-danger',
      bgColor: 'bg-danger/10',
      borderColor: 'border-danger/30',
    },
    {
      title: '실행률',
      value: `${executionRate.toFixed(0)}%`,
      icon: Target,
      color: 'text-primary-500',
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-500/30',
    },
  ];

  const financialStats = [
    {
      title: '총 매수 금액',
      value: formatUSD(totalBuyAmount),
      description: `평균 ${formatUSD(avgBuyAmount)} / 회`,
      color: 'text-warning',
    },
    {
      title: '총 매도 금액',
      value: formatUSD(totalSellAmount),
      description: sellEvents.length > 0 ? `${sellEvents.length}회 매도` : '-',
      color: 'text-success',
    },
    {
      title: '순손익 (추정)',
      value: formatUSD(netProfit),
      description: formatPercent(profitRate),
      color: netProfit >= 0 ? 'text-success' : 'text-danger',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className={`bg-bg-card p-6 rounded-xl border ${stat.borderColor} ${stat.bgColor} transition-all duration-300 hover:scale-105 hover:shadow-xl animate-in slide-in-from-bottom`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-8 h-8 ${stat.color}`} strokeWidth={2} />
                <span className={`text-3xl font-bold number-font ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
              <h3 className="text-sm text-text-secondary font-medium">{stat.title}</h3>
            </div>
          );
        })}
      </div>

      {/* 금액 통계 */}
      <div className="bg-bg-card p-6 rounded-xl border-l-4 border-primary-500">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary-500" />
          금액 통계
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {financialStats.map((stat, index) => (
            <div
              key={stat.title}
              className="p-4 bg-bg-secondary rounded-lg animate-in fade-in"
              style={{ animationDelay: `${(index + 4) * 100}ms` }}
            >
              <h3 className="text-sm text-text-muted mb-2">{stat.title}</h3>
              <p className={`text-2xl font-bold number-font ${stat.color} mb-1`}>
                {stat.value}
              </p>
              <p className="text-xs text-text-secondary">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 행동별 분석 */}
      <div className="bg-bg-card p-6 rounded-xl border-l-4 border-success">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-success" />
          행동별 분석
        </h2>
        <div className="space-y-4">
          {/* 정규 매수 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">정규 매수 (BUY)</span>
              <span className="text-lg font-bold number-font text-warning">
                {events.filter((e) => e.action === 'BUY').length}회
              </span>
            </div>
            <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-warning/50 to-warning transition-all duration-500"
                style={{
                  width: `${events.length > 0 ? (events.filter((e) => e.action === 'BUY').length / events.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* 과매수 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">과매수 (OVERBUY)</span>
              <span className="text-lg font-bold number-font text-orange-500">
                {events.filter((e) => e.action === 'OVERBUY').length}회
              </span>
            </div>
            <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500/50 to-orange-500 transition-all duration-500"
                style={{
                  width: `${events.length > 0 ? (events.filter((e) => e.action === 'OVERBUY').length / events.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* 매도 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">매도 (SELL)</span>
              <span className="text-lg font-bold number-font text-success">
                {sellEvents.length}회
              </span>
            </div>
            <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-success/50 to-success transition-all duration-500"
                style={{
                  width: `${events.length > 0 ? (sellEvents.length / events.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* 중단 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">중단 (STOP)</span>
              <span className="text-lg font-bold number-font text-danger">
                {stopEvents.length}회
              </span>
            </div>
            <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-danger/50 to-danger transition-all duration-500"
                style={{
                  width: `${events.length > 0 ? (stopEvents.length / events.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 추가 인사이트 */}
      <div className="bg-gradient-to-br from-primary-500/10 to-bg-card p-6 rounded-xl border border-primary-500/30">
        <h3 className="text-lg font-bold mb-4">💡 인사이트</h3>
        <div className="space-y-3 text-sm">
          {executionRate < 50 && (
            <p className="text-warning">
              ⚠️ 실행률이 {executionRate.toFixed(0)}%로 낮습니다. 신호가 발생하면 즉시 실행하세요.
            </p>
          )}
          {stopEvents.length > 0 && (
            <p className="text-danger">
              🛑 총 {stopEvents.length}회 매수 중단이 발생했습니다. 전략 수정이 필요할 수 있습니다.
            </p>
          )}
          {profitRate > 0 && (
            <p className="text-success">
              ✅ 현재까지 약 {profitRate.toFixed(1)}%의 수익을 기록 중입니다.
            </p>
          )}
          {events.length < 10 && (
            <p className="text-text-secondary">
              📊 데이터가 충분하지 않습니다. 더 많은 거래 기록이 쌓이면 정확한 통계를 제공할 수 있습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
