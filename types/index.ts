// ========================================
// Core Domain Types
// ========================================

/**
 * 지원하는 심볼 타입
 */
export type SupportedSymbol = 'SOXL' | 'TQQQ' | 'UPRO';

/**
 * 심볼 정보
 */
export interface SymbolInfo {
  symbol: SupportedSymbol;
  name: string;
  fullName: string;
  description: string;
  leverage: string;
  sector: string;
  color: string;
}

/**
 * 사용자 설정 (심볼별)
 */
export interface UserConfig {
  totalBudget: number; // 총 예산 (KRW) - 원화 기준으로 변경
  usedBudget: number; // 사용한 예산 (KRW) - 원화 기준으로 변경
  buyRatioNormal: number; // 정규 매수 비율 (0.03~0.04)
  buyRatioOver: number; // 과매수 비율 (0.08~0.10)
  sellRatioBounce: number; // 반등 매도 비율 (0.30~0.50)
  sellRatioTarget: number; // 목표가 매도 비율 (0.40~0.50)
  averageCost?: number; // 평균 단가 (USD) - optional
  totalShares?: number; // 보유 주식 수 - optional
}

/**
 * 환율 정보
 */
export interface ExchangeRateInfo {
  rate: number; // 환율 (KRW/USD)
  timestamp: string; // 조회 시각
  source: string; // 데이터 출처
  isDefault?: boolean; // 기본값 사용 여부
}

/**
 * 전역 설정 (모든 심볼 공통)
 */
export interface GlobalConfig {
  activeSymbol: SupportedSymbol; // 현재 선택된 심볼
  exchangeRate: ExchangeRateInfo; // 환율 정보
  symbols: Record<SupportedSymbol, UserConfig>; // 심볼별 설정
}

/**
 * 일일 시장 상태
 */
export interface DailyMarketState {
  date: string; // YYYY-MM-DD
  symbol: SupportedSymbol; // 'SOXL', 'TQQQ', etc.
  prevClose: number; // 전일 종가
  currentPrice: number; // 현재가
  open: number; // 시가
  high: number; // 고가
  low: number; // 저가
  volume: number; // 거래량
  changePct: number; // 등락률 (%)
  changeAmt: number; // 등락금액 ($)
}

/**
 * 행동 타입
 */
export type ActionType =
  | 'NO_ACTION' // 아무것도 안 함
  | 'BUY' // 정규 매수 (-7~-8%)
  | 'OVERBUY' // 과매수 (-16% 이상)
  | 'SELL_BOUNCE' // 반등 매도
  | 'SELL_TARGET' // 목표가 매도
  | 'STOP'; // 매수 중단

/**
 * 중단 사유
 */
export type StopReason =
  | 'CONSECUTIVE_DROPS' // 연속 하락 3회
  | 'BOUNCE_FAILURE' // 반등 실패
  | 'BUDGET_EXCEEDED' // 예산 50% 초과
  | 'LOSS_LIMIT'; // 손실 한도 도달

/**
 * 오늘의 판정 결과
 */
export interface TodayAction {
  action: ActionType;
  reason: string;
  stopReason?: StopReason;
  buyAmount?: number; // 매수 금액 (USD)
  buyAmountKRW?: number; // 매수 금액 (KRW) - 주 표시 금액
  buyShares?: number; // 매수 주 수
  sellRatio?: number; // 매도 비율
  sellShares?: number; // 매도 주 수
  exchangeRate?: number; // 적용된 환율
}

/**
 * 이벤트 기록
 */
export interface TradeEvent {
  id: string;
  date: string; // YYYY-MM-DD
  symbol: string; // 심볼 (SOXL, TQQQ, UPRO)
  action: ActionType;
  price: number;
  changePct: number;
  amount?: number; // 거래 금액 (USD)
  shares?: number; // 거래 주 수
  note?: string; // 메모
  executed?: boolean; // 실행 여부
}

/**
 * 연속 하락 추적
 */
export interface ConsecutiveDropTracker {
  count: number; // 연속 하락 횟수
  dates: string[]; // 하락 발생일 (YYYY-MM-DD)
  lastDropDate: string; // 마지막 하락일
}

/**
 * 급락 추적 (반등 실패 감지용)
 */
export interface CrashTracker {
  date: string; // 급락 발생일
  price: number; // 급락 시 가격
  changePct: number; // 하락률
  recovered: boolean; // 반등 성공 여부
  daysElapsed: number; // 경과 일수
}

// ========================================
// API Types
// ========================================

/**
 * Yahoo Finance API 응답 (간소화)
 */
export interface YahooQuoteResponse {
  symbol: string;
  regularMarketPrice: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: number; // Unix timestamp
}

/**
 * 내부 API - 시장 데이터 응답
 */
export interface MarketDataResponse {
  success: boolean;
  data?: DailyMarketState;
  error?: string;
  timestamp: string;
}

/**
 * 내부 API - 행동 판정 응답
 */
export interface ActionResponse {
  success: boolean;
  data?: TodayAction;
  checklist: ChecklistItem[];
  error?: string;
  timestamp: string;
}

/**
 * 체크리스트 아이템
 */
export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  type: 'auto' | 'manual';
  severity?: 'info' | 'warning' | 'danger';
}

// ========================================
// Storage Types
// ========================================

/**
 * LocalStorage 키 정의
 */
export const STORAGE_KEYS = {
  USER_CONFIG: 'soxl_user_config',
  TRADE_HISTORY: 'soxl_trade_history',
  DROP_TRACKER: 'soxl_drop_tracker',
  CRASH_TRACKER: 'soxl_crash_tracker',
  EXCHANGE_RATE: 'soxl_exchange_rate',
  LAST_SYNC: 'soxl_last_sync',
} as const;

/**
 * 저장 데이터 구조
 */
export interface StoredData {
  userConfig: UserConfig;
  tradeHistory: TradeEvent[];
  dropTracker: ConsecutiveDropTracker;
  crashTracker: CrashTracker | null;
  lastSync: string; // ISO timestamp
}

// ========================================
// Utility Types
// ========================================

/**
 * API 에러
 */
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * 로딩 상태
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
