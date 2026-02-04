/**
 * 히스토리 리스트 뷰 컴포넌트
 */

'use client';

import { useState } from 'react';
import { TradeEvent, ActionType } from '@/types';
import { formatUSD, formatPercent } from '@/lib/utils/format';
import { formatDateKorean, formatDateShort } from '@/lib/utils/date';
import { 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  Circle,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface HistoryListViewProps {
  events: TradeEvent[];
  onToggleExecuted?: (id: string) => void;
}

export function HistoryListView({ events, onToggleExecuted }: HistoryListViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ActionType | 'ALL'>('ALL');
  const [symbolFilter, setSymbolFilter] = useState<string | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 고유 심볼 목록 추출
  const uniqueSymbols = Array.from(new Set(events.map((e) => e.symbol)));

  // 필터링
  const filteredEvents = events.filter((event) => {
    if (filter !== 'ALL' && event.action !== filter) return false;
    if (symbolFilter !== 'ALL' && event.symbol !== symbolFilter) return false;
    return true;
  });

  // 정렬
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc'
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime();
    } else {
      const amountA = a.amount || 0;
      const amountB = b.amount || 0;
      return sortOrder === 'desc' ? amountB - amountA : amountA - amountB;
    }
  });

  const getActionIcon = (action: ActionType) => {
    switch (action) {
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

  const getActionColor = (action: ActionType) => {
    switch (action) {
      case 'BUY':
        return 'text-warning bg-warning/10 border-warning/30';
      case 'OVERBUY':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'SELL_BOUNCE':
      case 'SELL_TARGET':
        return 'text-success bg-success/10 border-success/30';
      case 'STOP':
        return 'text-danger bg-danger/10 border-danger/30';
      default:
        return 'text-neutral bg-neutral/10 border-neutral/30';
    }
  };

  const getActionLabel = (action: ActionType) => {
    switch (action) {
      case 'BUY':
        return '정규 매수';
      case 'OVERBUY':
        return '과매수';
      case 'SELL_BOUNCE':
        return '반등 매도';
      case 'SELL_TARGET':
        return '목표가 매도';
      case 'STOP':
        return '중단';
      default:
        return '대기';
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleSort = (newSortBy: 'date' | 'amount') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* 필터 및 정렬 */}
      <div className="bg-bg-card p-4 rounded-xl flex flex-wrap items-center gap-4">
        {/* 행동 필터 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">행동:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                filter === 'ALL'
                  ? 'bg-primary-500 text-white'
                  : 'bg-bg-secondary text-text-secondary hover:bg-bg-primary'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('BUY')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                filter === 'BUY'
                  ? 'bg-warning text-white'
                  : 'bg-bg-secondary text-text-secondary hover:bg-bg-primary'
              }`}
            >
              매수
            </button>
            <button
              onClick={() => setFilter('SELL_BOUNCE')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                filter === 'SELL_BOUNCE'
                  ? 'bg-success text-white'
                  : 'bg-bg-secondary text-text-secondary hover:bg-bg-primary'
              }`}
            >
              매도
            </button>
          </div>
        </div>

        {/* 심볼 필터 */}
        {uniqueSymbols.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">심볼:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSymbolFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  symbolFilter === 'ALL'
                    ? 'bg-primary-500 text-white'
                    : 'bg-bg-secondary text-text-secondary hover:bg-bg-primary'
                }`}
              >
                전체
              </button>
              {uniqueSymbols.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => setSymbolFilter(symbol)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    symbolFilter === symbol
                      ? 'bg-primary-500 text-white'
                      : 'bg-bg-secondary text-text-secondary hover:bg-bg-primary'
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 정렬 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">정렬:</span>
          <button
            onClick={() => toggleSort('date')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
              sortBy === 'date'
                ? 'bg-primary-500 text-white'
                : 'bg-bg-secondary text-text-secondary hover:bg-bg-primary'
            }`}
          >
            날짜
            {sortBy === 'date' && (
              sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={() => toggleSort('amount')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
              sortBy === 'amount'
                ? 'bg-primary-500 text-white'
                : 'bg-bg-secondary text-text-secondary hover:bg-bg-primary'
            }`}
          >
            금액
            {sortBy === 'amount' && (
              sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* 결과 카운트 */}
        <div className="ml-auto text-sm text-text-secondary">
          총 <span className="font-bold text-primary-500">{sortedEvents.length}</span>개
        </div>
      </div>

      {/* 이벤트 리스트 */}
      <div className="space-y-3">
        {sortedEvents.map((event, index) => {
          const Icon = getActionIcon(event.action);
          const isExpanded = expandedId === event.id;
          const colorClasses = getActionColor(event.action);

          return (
            <div
              key={event.id}
              className={`bg-bg-card border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl ${colorClasses}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* 메인 정보 */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => toggleExpand(event.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* 아이콘 */}
                    <div className={`p-3 rounded-xl ${colorClasses}`}>
                      <Icon className="w-6 h-6" strokeWidth={2.5} />
                    </div>

                    {/* 정보 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-lg">
                          {getActionLabel(event.action)}
                        </span>
                        <span className="px-2 py-0.5 bg-primary-500/20 text-primary-500 text-xs font-bold rounded">
                          {event.symbol}
                        </span>
                        <span className="text-sm text-text-muted">
                          {formatDateKorean(event.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="number-font">
                          가격: <span className="font-bold">{formatUSD(event.price)}</span>
                        </span>
                        <span className={`number-font font-bold ${
                          event.changePct > 0 ? 'text-success' : 'text-danger'
                        }`}>
                          {formatPercent(event.changePct)}
                        </span>
                        {event.amount && (
                          <span className="number-font font-bold">
                            {formatUSD(event.amount)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 실행 여부 체크 */}
                    {onToggleExecuted && event.action !== 'NO_ACTION' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleExecuted(event.id);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-bg-secondary rounded-lg hover:bg-bg-primary transition-all"
                      >
                        {event.executed ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-success" />
                            <span className="text-sm text-success font-semibold">실행됨</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-5 h-5 text-text-muted" />
                            <span className="text-sm text-text-muted">미실행</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* 확장 아이콘 */}
                    <div className="text-text-secondary">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 확장 정보 */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-bg-secondary animate-in slide-in-from-top duration-300">
                  <div className="space-y-2 text-sm">
                    {event.note && (
                      <div>
                        <span className="text-text-muted">사유:</span>{' '}
                        <span className="text-text-primary">{event.note}</span>
                      </div>
                    )}
                    {event.shares && (
                      <div>
                        <span className="text-text-muted">주 수:</span>{' '}
                        <span className="text-text-primary number-font font-bold">
                          {event.shares} 주
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-text-muted">이벤트 ID:</span>{' '}
                      <span className="text-text-muted text-xs font-mono">{event.id}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedEvents.length === 0 && (
        <div className="text-center py-20">
          <Clock className="w-16 h-16 text-neutral mx-auto mb-4 opacity-50" />
          <p className="text-text-secondary">해당 필터에 맞는 이벤트가 없습니다</p>
        </div>
      )}
    </div>
  );
}
