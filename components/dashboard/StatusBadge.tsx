/**
 * 상태 배지 컴포넌트
 */

import { ActionType } from '@/types';

interface StatusBadgeProps {
  action: ActionType;
  className?: string;
}

const STATUS_CONFIG: Record<
  ActionType,
  { label: string; color: string; emoji: string }
> = {
  NO_ACTION: {
    label: '대기',
    color: 'bg-neutral text-white',
    emoji: '⚪',
  },
  BUY: {
    label: '매수',
    color: 'bg-warning text-black',
    emoji: '🟡',
  },
  OVERBUY: {
    label: '과매수',
    color: 'bg-orange-600 text-white',
    emoji: '🟠',
  },
  STOP: {
    label: '중단',
    color: 'bg-danger text-white',
    emoji: '🔴',
  },
  SELL_BOUNCE: {
    label: '매도',
    color: 'bg-success text-white',
    emoji: '🟢',
  },
  SELL_TARGET: {
    label: '매도',
    color: 'bg-success text-white',
    emoji: '🟢',
  },
};

export function StatusBadge({ action, className = '' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[action];

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${config.color} ${className}`}
    >
      <span className="text-lg">{config.emoji}</span>
      <span>{config.label}</span>
    </div>
  );
}
