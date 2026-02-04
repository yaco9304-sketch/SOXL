/**
 * 예산 사용률 바 (세그먼트 색상 개선)
 */

'use client';

import { UserConfig } from '@/types';
import { formatKRW } from '@/lib/utils/format';
import { Shield, AlertTriangle, Ban } from 'lucide-react';

interface BudgetBarProps {
  config: UserConfig;
  exchangeRate: number;
}

export function BudgetBar({ config, exchangeRate }: BudgetBarProps) {
  const { totalBudget, usedBudget } = config;
  const usageRatio = usedBudget / totalBudget;
  const usagePercent = (usageRatio * 100).toFixed(0);
  const remainingBudget = totalBudget - usedBudget;

  const getTextColor = () => {
    if (usageRatio >= 0.5) return 'text-danger';
    if (usageRatio >= 0.3) return 'text-warning';
    return 'text-success';
  };

  const getStatusIcon = () => {
    if (usageRatio >= 0.5) return <Ban className="w-5 h-5 text-danger animate-pulse" />;
    if (usageRatio >= 0.3) return <AlertTriangle className="w-5 h-5 text-warning" />;
    return <Shield className="w-5 h-5 text-success" />;
  };

  const getStatusMessage = () => {
    if (usageRatio >= 0.5) return { text: '위험 구간', color: 'text-danger' };
    if (usageRatio >= 0.3) return { text: '주의 구간', color: 'text-warning' };
    return { text: '안전 구간', color: 'text-success' };
  };

  const status = getStatusMessage();

  return (
    <div className="bg-bg-card p-6 rounded-xl border-l-4 border-primary-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">예산 사용률</h2>
          {getStatusIcon()}
        </div>
        <div className="text-right">
          <span className={`text-3xl font-bold number-font ${getTextColor()} block`}>
            {usagePercent}%
          </span>
          <span className={`text-xs font-semibold ${status.color}`}>
            {status.text}
          </span>
        </div>
      </div>

      {/* 세그먼트 프로그레스 바 */}
      <div className="mb-4 relative">
        {/* 배경 세그먼트 */}
        <div className="w-full h-6 bg-bg-secondary rounded-full overflow-hidden relative">
          {/* 안전 구간 (0-30%) */}
          <div 
            className="absolute h-full bg-success/20"
            style={{ width: '30%', left: '0' }}
          />
          {/* 주의 구간 (30-50%) */}
          <div 
            className="absolute h-full bg-warning/20"
            style={{ width: '20%', left: '30%' }}
          />
          {/* 위험 구간 (50-100%) */}
          <div 
            className="absolute h-full bg-danger/20"
            style={{ width: '50%', left: '50%' }}
          />
          
          {/* 실제 사용률 바 */}
          <div
            className={`absolute h-full transition-all duration-500 ease-out ${
              usageRatio >= 0.5 
                ? 'bg-gradient-to-r from-danger to-red-600' 
                : usageRatio >= 0.3 
                  ? 'bg-gradient-to-r from-success to-warning' 
                  : 'bg-gradient-to-r from-success/80 to-success'
            }`}
            style={{ width: `${usagePercent}%` }}
          >
            {/* 진행 중 글로우 효과 */}
            <div className="absolute right-0 top-0 h-full w-2 bg-white/50 blur-sm" />
          </div>
        </div>

        {/* 마일스톤 마커 */}
        <div className="absolute top-0 left-[30%] w-0.5 h-6 bg-bg-primary">
          <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-warning border-2 border-bg-card" />
          <span className="absolute -bottom-5 -left-3 text-xs text-warning font-semibold">30%</span>
        </div>
        <div className="absolute top-0 left-[50%] w-0.5 h-6 bg-bg-primary">
          <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-danger border-2 border-bg-card animate-pulse" />
          <span className="absolute -bottom-5 -left-3 text-xs text-danger font-semibold">50%</span>
        </div>
      </div>

      {/* 금액 정보 with 개선된 스타일 (원화 기준) */}
      <div className="space-y-3 mt-6">
        <div className="flex justify-between items-center p-3 bg-bg-secondary rounded-lg transition-all hover:bg-bg-primary">
          <span className="text-sm text-text-secondary font-medium">💰 사용한 예산</span>
          <span className="text-lg font-bold number-font text-text-primary">{formatKRW(usedBudget)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-bg-secondary rounded-lg transition-all hover:bg-bg-primary">
          <span className="text-sm text-text-secondary font-medium">💵 총 예산</span>
          <span className="text-lg font-bold number-font text-text-primary">{formatKRW(totalBudget)}</span>
        </div>
        <div className={`flex justify-between items-center p-4 rounded-lg border-2 transition-all ${
          usageRatio >= 0.5 
            ? 'bg-danger/10 border-danger' 
            : usageRatio >= 0.3 
              ? 'bg-warning/10 border-warning' 
              : 'bg-success/10 border-success'
        }`}>
          <span className="text-sm text-text-secondary font-medium">🎯 남은 예산</span>
          <span className={`text-2xl font-bold number-font ${getTextColor()}`}>
            {formatKRW(remainingBudget)}
          </span>
        </div>
      </div>

      {/* 상태별 경고 메시지 */}
      {usageRatio >= 0.5 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-danger/20 to-danger/10 border-2 border-danger rounded-lg animate-pulse">
          <div className="flex items-center gap-2 mb-1">
            <Ban className="w-5 h-5 text-danger" />
            <p className="text-sm text-danger font-bold">매수 중단 구간</p>
          </div>
          <p className="text-xs text-danger/80">
            예산 50% 초과 - 추가 매수가 금지됩니다
          </p>
        </div>
      )}
      {usageRatio >= 0.3 && usageRatio < 0.5 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-warning/20 to-warning/10 border border-warning rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <p className="text-sm text-warning font-bold">주의 구간</p>
          </div>
          <p className="text-xs text-warning/80">
            예산 30% 초과 - 신중한 매수 필요
          </p>
        </div>
      )}
      {usageRatio < 0.3 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-success/20 to-success/10 border border-success/30 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-success" />
            <p className="text-sm text-success font-bold">안전 구간</p>
          </div>
          <p className="text-xs text-success/80">
            충분한 예산 여유 - 정상 매수 가능
          </p>
        </div>
      )}
    </div>
  );
}
