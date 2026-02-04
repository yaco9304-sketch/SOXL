/**
 * 일일 체크리스트 컴포넌트 (진행률 & 애니메이션 개선)
 */

'use client';

import { ChecklistItem } from '@/types';
import { CheckCircle2, Circle, AlertCircle, ListChecks, Sparkles } from 'lucide-react';

interface ChecklistProps {
  items: ChecklistItem[];
}

export function Checklist({ items }: ChecklistProps) {
  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const progressPercent = (checkedCount / totalCount) * 100;
  const isAllChecked = checkedCount === totalCount;

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'danger':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-success';
    }
  };

  const getSeverityBg = (severity?: string) => {
    switch (severity) {
      case 'danger':
        return 'bg-danger/10 border-danger/30';
      case 'warning':
        return 'bg-warning/10 border-warning/30';
      default:
        return 'bg-success/10 border-success/30';
    }
  };

  return (
    <div className="bg-bg-card p-6 rounded-xl border-l-4 border-primary-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ListChecks className="w-6 h-6 text-primary-500" />
          <h2 className="text-xl font-bold">일일 체크리스트</h2>
        </div>
        
        {/* 진행률 원형 표시 */}
        <div className="relative w-16 h-16">
          {/* 배경 원 */}
          <svg className="transform -rotate-90 w-16 h-16">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-bg-secondary"
            />
            {/* 진행률 원 */}
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercent / 100)}`}
              className={`transition-all duration-500 ${
                isAllChecked ? 'text-success' : 'text-primary-500'
              }`}
              strokeLinecap="round"
            />
          </svg>
          {/* 중앙 텍스트 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-bold ${
              isAllChecked ? 'text-success' : 'text-primary-500'
            }`}>
              {checkedCount}/{totalCount}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 p-4 rounded-lg transition-all duration-300 border ${
              item.checked
                ? `${getSeverityBg(item.severity)} border`
                : 'bg-bg-primary/50 border-transparent hover:bg-bg-secondary'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex-shrink-0 mt-0.5">
              {item.checked ? (
                <CheckCircle2
                  className={`w-6 h-6 ${getSeverityColor(item.severity)} transition-all duration-300 animate-in zoom-in`}
                  strokeWidth={2.5}
                />
              ) : (
                <Circle
                  className="w-6 h-6 text-text-muted transition-all duration-300"
                  strokeWidth={2}
                />
              )}
            </div>
            <div className="flex-1">
              <p
                className={`text-sm font-medium transition-colors ${
                  item.checked
                    ? getSeverityColor(item.severity)
                    : 'text-text-muted'
                }`}
              >
                {item.label}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {item.type === 'auto' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-900/50 text-primary-500 text-xs rounded-full">
                    <Sparkles className="w-3 h-3" />
                    자동 체크
                  </span>
                )}
                {item.severity && item.checked && (
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                    item.severity === 'danger' 
                      ? 'bg-danger/20 text-danger' 
                      : item.severity === 'warning' 
                        ? 'bg-warning/20 text-warning' 
                        : 'bg-success/20 text-success'
                  }`}>
                    {item.severity === 'danger' ? '🚨 위험' : item.severity === 'warning' ? '⚠️ 주의' : '✅ 정상'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 진행률 바 */}
      <div className="mt-6 space-y-3">
        <div className="relative h-2 bg-bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isAllChecked 
                ? 'bg-gradient-to-r from-success to-green-400' 
                : 'bg-gradient-to-r from-primary-500 to-primary-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        {/* 완료 상태 메시지 */}
        {isAllChecked ? (
          <div className="p-4 bg-gradient-to-r from-success/20 to-success/10 border border-success rounded-lg animate-in fade-in">
            <p className="text-sm text-success font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              모든 항목 체크 완료!
            </p>
          </div>
        ) : (
          <p className="text-sm text-text-muted text-center">
            ✅ 진행률: <span className="font-bold text-primary-500">{progressPercent.toFixed(0)}%</span>
          </p>
        )}
      </div>
    </div>
  );
}
