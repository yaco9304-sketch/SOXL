'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, List, BarChart3, Filter } from 'lucide-react';
import Link from 'next/link';
import type { TradeEvent } from '@/types';
import { getTradeHistory, updateTradeEvent } from '@/lib/storage';
import { HistoryListView } from '@/components/history/HistoryListView';
import { StatsView } from '@/components/history/StatsView';
import { CalendarView } from '@/components/history/CalendarView';

type ViewMode = 'list' | 'calendar' | 'stats';

export default function HistoryPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [history, setHistory] = useState<TradeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      setLoading(true);
      const data = getTradeHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExecuted = (id: string) => {
    const event = history.find((e) => e.id === id);
    if (event) {
      updateTradeEvent(id, { executed: !event.executed });
      loadHistory(); // 새로고침
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <header className="mb-8 animate-in slide-in-from-top duration-700">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-400 mb-4 transition-all hover:gap-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>대시보드로 돌아가기</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-success via-green-400 to-success bg-clip-text text-transparent">
                📜 거래 히스토리
              </h1>
              <p className="text-text-secondary">
                과거 매수/매도 기록 및 통계를 확인하세요
              </p>
            </div>

            {/* 뷰 모드 전환 */}
            <div className="flex items-center gap-2 bg-bg-card p-1 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-text-secondary hover:bg-bg-secondary'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden md:inline">리스트</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'calendar'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-text-secondary hover:bg-bg-secondary'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden md:inline">달력</span>
              </button>
              <button
                onClick={() => setViewMode('stats')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'stats'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-text-secondary hover:bg-bg-secondary'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden md:inline">통계</span>
              </button>
            </div>
          </div>
        </header>

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-text-secondary">히스토리를 불러오는 중...</p>
            </div>
          </div>
        )}

        {/* 데이터 없음 */}
        {!loading && history.length === 0 && (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <Calendar className="w-24 h-24 text-neutral mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-text-primary mb-2">
                거래 기록이 없습니다
              </h3>
              <p className="text-text-secondary mb-6">
                메인 대시보드에서 매수/매도 신호가 발생하면 자동으로 기록됩니다
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-300 hover:scale-105"
              >
                대시보드로 이동
              </Link>
            </div>
          </div>
        )}

        {/* 컨텐츠 */}
        {!loading && history.length > 0 && (
          <div className="animate-in slide-in-from-bottom duration-700">
            {viewMode === 'list' && (
              <HistoryListView events={history} onToggleExecuted={handleToggleExecuted} />
            )}
            {viewMode === 'calendar' && (
              <CalendarView events={history} />
            )}
            {viewMode === 'stats' && (
              <StatsView events={history} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
