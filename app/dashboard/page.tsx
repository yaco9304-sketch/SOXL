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
import { BudgetBar } from '@/components/dashboard/BudgetBar';
import { Checklist } from '@/components/dashboard/Checklist';
import { NotificationStatus } from '@/components/dashboard/NotificationStatus';
import {
  getUserConfig,
  getDropTracker,
  getCrashTracker,
  setDropTracker,
  setCrashTracker,
  addTradeEvent,
  getTradeHistory,
  getActiveSymbol,
  setActiveSymbol,
} from '@/lib/storage';
import { getTodayString } from '@/lib/utils/date';
import { sendBuyConditionAlert, getNotificationPermission } from '@/lib/utils/notification';
import { calculateStdDevBuyPrices, checkBuyConditionByPrice } from '@/lib/strategy/rules';
import { SymbolSelector } from '@/components/common/SymbolSelector';

export default function Dashboard() {
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      const savedSymbol = getActiveSymbol();
      setActiveSymbolState(savedSymbol);
      loadDashboard(savedSymbol);
    }
  }, [status, router]);

  const handleSymbolChange = (symbol: SupportedSymbol) => {
    setActiveSymbolState(symbol);
    setActiveSymbol(symbol);
    loadDashboard(symbol);
  };

  const loadDashboard = async (symbol?: SupportedSymbol) => {
    try {
      setLoading(true);
      setError(null);

      const targetSymbol = symbol || activeSymbol;

      // 1. 환율 조회 (최우선)
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

      // 5. 행동 판정 (환율 포함)
      const actionResponse = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market: marketData,
          config: userConfig,
          dropTracker,
          crashTracker,
          exchangeRate: currentExchangeRate,
        }),
      });

      if (!actionResponse.ok) {
        throw new Error('Failed to determine action');
      }

      const actionData = await actionResponse.json();
      if (!actionData.success) {
        throw new Error(actionData.error || 'Failed to determine action');
      }

      setAction(actionData.data);
      setChecklist(actionData.checklist);

      // 5. 추적기 업데이트
      if (actionData.updatedDropTracker) {
        setDropTracker(actionData.updatedDropTracker);
      }
      if (actionData.updatedCrashTracker !== undefined) {
        setCrashTracker(actionData.updatedCrashTracker);
      }

      // 6. 오늘의 이벤트 자동 저장
      const today = getTodayString();
      const history = getTradeHistory();
      const todayEvent = history.find((e) => e.date === today);

      // 오늘 날짜 이벤트가 없거나, 행동이 NO_ACTION이 아닐 경우 저장/업데이트
      if (!todayEvent && actionData.data.action !== 'NO_ACTION') {
        const newEvent = {
          id: `${today}-${targetSymbol}-${Date.now()}`,
          date: today,
          symbol: targetSymbol,
          action: actionData.data.action,
          price: marketData.currentPrice,
          changePct: marketData.changePct,
          amount: actionData.data.buyAmount || undefined,
          shares: actionData.data.buyShares || actionData.data.sellShares || undefined,
          note: actionData.data.reason,
          executed: false, // 사용자가 직접 실행 여부 표시
        };
        addTradeEvent(newEvent);
      }

      // 7. 장중 매수 조건 알림 (알림 권한이 있을 경우)
      if (getNotificationPermission() === 'granted') {
        const buyPrices = calculateStdDevBuyPrices(marketData.prevClose);
        const buyCondition = checkBuyConditionByPrice(marketData.currentPrice, buyPrices);

        if (buyCondition.shouldBuy && (buyCondition.level === 'buy7' || buyCondition.level === 'buy14')) {
          await sendBuyConditionAlert(
            targetSymbol,
            marketData.currentPrice,
            marketData.prevClose,
            buyCondition.level
          );
        }
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-text-secondary">데이터를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <p className="text-danger text-lg mb-4">❌ {error}</p>
              <button
                onClick={() => loadDashboard()}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">로딩 중...</div>
      </div>
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
                📈 대시보드
              </h1>
              <p className="text-text-secondary">
                현재 시장 상황과 추천 행동을 확인하세요
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

        {/* 대시보드 그리드 with 스태거 애니메이션 */}
        {market && action && config && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 좌측 컬럼 */}
            <div className="lg:col-span-2 space-y-6">
              <div className="animate-in slide-in-from-left duration-700" style={{ animationDelay: '100ms' }}>
                <PriceCard market={market} />
              </div>
              <div className="animate-in slide-in-from-left duration-700" style={{ animationDelay: '200ms' }}>
                <ActionCard action={action} />
              </div>
              <div className="animate-in slide-in-from-left duration-700" style={{ animationDelay: '300ms' }}>
                <Checklist items={checklist} />
              </div>
            </div>

            {/* 우측 컬럼 */}
            <div className="space-y-6">
              {/* 환율 정보 */}
              {exchangeRate && (
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
              )}

              {/* 알림 상태 */}
              <div className="animate-in slide-in-from-right duration-700" style={{ animationDelay: '50ms' }}>
                <NotificationStatus />
              </div>
              
              <div className="animate-in slide-in-from-right duration-700" style={{ animationDelay: '100ms' }}>
                <BudgetBar config={config} exchangeRate={exchangeRate?.rate || 1350} />
              </div>
              
              {/* 면책 고지 with 애니메이션 */}
              <div className="animate-in slide-in-from-right duration-700" style={{ animationDelay: '200ms' }}>
                <div className="bg-bg-card p-6 rounded-xl border-l-4 border-danger hover:shadow-xl hover:shadow-danger/10 transition-all duration-300">
                  <h3 className="text-lg font-bold text-danger mb-3 flex items-center gap-2">
                    ⚠️ 면책 고지
                  </h3>
                  <div className="text-sm text-text-secondary space-y-2">
                    <p>• 본 서비스는 투자 자문이 아닙니다</p>
                    <p>• 모든 투자 결정과 책임은 사용자 본인에게 있습니다</p>
                    <p>• 데이터는 15분 지연될 수 있습니다</p>
                    <p>• 레버리지 ETF는 원금 손실 위험이 높습니다</p>
                  </div>
                </div>
              </div>

              {/* 새로고침 버튼 with 애니메이션 */}
              <div className="animate-in slide-in-from-right duration-700" style={{ animationDelay: '300ms' }}>
                <button
                  onClick={() => loadDashboard()}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-300 font-semibold hover:scale-105 hover:shadow-lg hover:shadow-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>로딩 중...</span>
                    </>
                  ) : (
                    <>
                      🔄 데이터 새로고침
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 푸터 with 애니메이션 */}
        <footer className="mt-12 text-center text-text-muted text-sm animate-in fade-in duration-700" style={{ animationDelay: '400ms' }}>
          <div className="inline-block p-4 bg-bg-card rounded-lg border border-bg-secondary hover:border-primary-500/30 transition-all duration-300">
            <p className="text-base font-medium bg-gradient-to-r from-text-secondary via-text-primary to-text-secondary bg-clip-text text-transparent">
              💡 이 웹은 돈을 벌게 해주지 않습니다.<br className="md:hidden" /> 대신, 돈을 잃는 행동을 못 하게 만듭니다.
            </p>
          </div>
        </footer>
      </div>
    </main>
    </>
  );
}
