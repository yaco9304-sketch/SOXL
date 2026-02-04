'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import type {
  DailyMarketState,
  TodayAction,
  ChecklistItem,
  UserConfig,
  ConsecutiveDropTracker,
  CrashTracker,
  SupportedSymbol,
  ExchangeRateInfo,
} from '@/types';
import { PriceCard } from '@/components/dashboard/PriceCard';
import { ActionCard } from '@/components/dashboard/ActionCard';
import {
  getUserConfig,
  getDropTracker,
  getCrashTracker,
  getActiveSymbol,
  setActiveSymbol,
  getTradeHistory,
  addTradeEvent,
  updateTradeEvent,
} from '@/lib/storage';
import { getTodayString } from '@/lib/utils/date';
import { SymbolSelector } from '@/components/common/SymbolSelector';
import { formatUSD, formatShares, formatPercent } from '@/lib/utils/format';

export default function SellPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [market, setMarket] = useState<DailyMarketState | null>(null);
  const [action, setAction] = useState<TodayAction | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [config, setConfig] = useState<UserConfig | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSymbol, setActiveSymbolState] = useState<SupportedSymbol>('SOXL');
  const [executedFeedback, setExecutedFeedback] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      const savedSymbol = getActiveSymbol();
      setActiveSymbolState(savedSymbol);
      loadSellData(savedSymbol);
    }
  }, [status, router]);

  const handleSymbolChange = (symbol: SupportedSymbol) => {
    setActiveSymbolState(symbol);
    setActiveSymbol(symbol);
    loadSellData(symbol);
  };

  const loadSellData = async (symbol?: SupportedSymbol) => {
    try {
      setLoading(true);
      setError(null);

      const targetSymbol = symbol || activeSymbol;

      // 1. 환율 조회
      const exchangeRateResponse = await fetch('/api/exchange-rate');
      if (!exchangeRateResponse.ok) {
        throw new Error('Failed to fetch exchange rate');
      }
      const exchangeRateData = await exchangeRateResponse.json();
      if (!exchangeRateData.success) {
        throw new Error(exchangeRateData.error || 'Failed to fetch exchange rate');
      }
      const currentExchangeRate = exchangeRateData.data.rate;
      setExchangeRate(exchangeRateData.data);

      // 2. 설정 로드
      const userConfig = getUserConfig();
      setConfig(userConfig);

      // 3. 시세 조회
      const quoteResponse = await fetch(`/api/quote?symbol=${targetSymbol}`);
      if (!quoteResponse.ok) {
        throw new Error('Failed to fetch quote');
      }
      const quoteData = await quoteResponse.json();
      if (!quoteData.success) {
        throw new Error(quoteData.error || 'Failed to fetch quote');
      }
      const marketData: DailyMarketState = quoteData.data;
      setMarket(marketData);

      // 4. 추적기 로드
      const dropTracker = getDropTracker();
      const crashTracker = getCrashTracker();

      // 5. 매도 행동 판정
      const actionResponse = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market: marketData,
          config: userConfig,
          dropTracker,
          crashTracker,
          exchangeRate: exchangeRateData.data,
        }),
      });

      if (!actionResponse.ok) {
        throw new Error('Failed to determine action');
      }

      const actionData = await actionResponse.json();
      if (!actionData.success) {
        throw new Error(actionData.error || 'Failed to determine action');
      }

      // 매도 관련 액션만 필터링
      if (['SELL_BOUNCE', 'SELL_TARGET', 'NO_ACTION'].includes(actionData.data.action)) {
        setAction(actionData.data);
      } else {
        setAction({ action: 'NO_ACTION', reason: '매도 조건이 아닙니다.' });
      }
      
      setChecklist(actionData.checklist || []);
    } catch (err) {
      console.error('Error loading sell data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-text-secondary">데이터를 불러오는 중...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-up text-lg mb-4">❌ {error}</p>
            <button
              onClick={() => loadSellData()}
              className="px-6 py-3 bg-accent text-bg-primary rounded-lg hover:bg-accent-hover transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <header className="mb-8 space-y-4">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-text-primary">
                💸 매도 플랜
              </h1>
              <p className="text-text-secondary">
                반등 또는 목표가 달성 시 매도 타이밍을 확인하세요
              </p>
            </div>

            {/* 심볼 선택기 */}
            <div className="flex justify-center">
              <SymbolSelector 
                activeSymbol={activeSymbol} 
                onChange={handleSymbolChange}
              />
            </div>
          </header>

          {/* 콘텐츠 그리드 */}
          {market && action && config && exchangeRate && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 좌측 컬럼 */}
              <div className="lg:col-span-2 space-y-6">
                <PriceCard market={market} />
                <ActionCard action={action} />
                
                {/* 보유 정보 카드 */}
                <div className="bg-bg-card p-6 rounded-lg border border-border">
                  <h2 className="text-xl font-semibold mb-4 text-text-primary">
                    📊 보유 정보
                  </h2>
                  <div className="space-y-4">
                    {config.totalShares && config.averageCost ? (
                      <>
                        <div className="flex justify-between items-center p-3 bg-bg-secondary rounded-lg">
                          <span className="text-text-secondary">보유 주식 수</span>
                          <span className="text-xl font-bold text-text-primary number-font">
                            {formatShares(config.totalShares)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-bg-secondary rounded-lg">
                          <span className="text-text-secondary">평균 단가</span>
                          <span className="text-xl font-bold text-text-primary number-font">
                            {formatUSD(config.averageCost)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-bg-secondary rounded-lg">
                          <span className="text-text-secondary">현재가</span>
                          <span className="text-xl font-bold text-text-primary number-font">
                            {formatUSD(market.currentPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-bg-hover rounded-lg border-2 border-accent">
                          <span className="text-text-secondary font-semibold">수익률</span>
                          <span className={`text-2xl font-bold number-font ${
                            market.currentPrice >= config.averageCost ? 'text-up' : 'text-down'
                          }`}>
                            {formatPercent(((market.currentPrice - config.averageCost) / config.averageCost) * 100)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-text-muted mb-4">
                          보유 정보가 설정되지 않았습니다
                        </p>
                        <button
                          onClick={() => router.push('/settings')}
                          className="px-6 py-3 bg-accent text-bg-primary rounded-lg hover:bg-accent-hover transition-colors"
                        >
                          설정하러 가기
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 우측 컬럼 */}
              <div className="space-y-6">
                {/* 환율 정보 */}
                <div className="bg-bg-card p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-text-secondary">💱 환율</h3>
                    <span className="text-xs text-text-muted">
                      {exchangeRate.isDefault ? '기본값' : '실시간'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-text-primary number-font">
                      {exchangeRate.rate.toFixed(2)}
                    </span>
                    <span className="text-sm text-text-secondary">KRW/USD</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    {new Date(exchangeRate.timestamp).toLocaleString('ko-KR')}
                  </p>
                </div>

                {/* 매도 전략 안내 */}
                <div className="bg-bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    💡 매도 전략
                  </h3>
                  <div className="space-y-3 text-sm text-text-secondary">
                    <div>
                      <p className="font-semibold text-text-primary mb-1">📈 반등 매도</p>
                      <p>급락 후 +8~12% 반등 시<br/>보유 주식의 {(config.sellRatioBounce * 100).toFixed(0)}% 매도</p>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <p className="font-semibold text-text-primary mb-1">🎯 목표가 매도</p>
                      <p>평균 단가 대비 +15~25% 도달 시<br/>보유 주식의 {(config.sellRatioTarget * 100).toFixed(0)}% 매도</p>
                    </div>
                  </div>
                </div>

                {/* 매도 실행 완료 버튼: SELL_BOUNCE/SELL_TARGET일 때만 표시 */}
                {(action.action === 'SELL_BOUNCE' || action.action === 'SELL_TARGET') && (
                  <button
                    onClick={() => {
                      const today = getTodayString();
                      const history = getTradeHistory();
                      const existing = history.find(
                        (e) =>
                          e.date === today &&
                          e.symbol === activeSymbol &&
                          (e.action === 'SELL_BOUNCE' || e.action === 'SELL_TARGET')
                      );
                      if (existing) {
                        updateTradeEvent(existing.id, { executed: true });
                      } else {
                        addTradeEvent({
                          id: `${today}-${activeSymbol}-${action.action}-${Date.now()}`,
                          date: today,
                          symbol: activeSymbol,
                          action: action.action,
                          price: market.currentPrice,
                          changePct: market.changePct,
                          amount: action.sellShares != null ? market.currentPrice * action.sellShares : undefined,
                          shares: action.sellShares,
                          note: action.reason,
                          executed: true,
                        });
                      }
                      setExecutedFeedback(true);
                      setTimeout(() => setExecutedFeedback(false), 2000);
                    }}
                    className="w-full px-6 py-4 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                  >
                    {executedFeedback ? '✓ 기록됨' : '매도 실행했어요'}
                  </button>
                )}

                {/* 새로고침 버튼 */}
                <button
                  onClick={() => loadSellData()}
                  className="w-full px-6 py-4 bg-accent text-bg-primary rounded-lg font-semibold hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
                >
                  🔄 데이터 새로고침
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
