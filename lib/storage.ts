/**
 * LocalStorage 관리 유틸리티
 */

import type {
  UserConfig,
  GlobalConfig,
  SupportedSymbol,
  TradeEvent,
  ConsecutiveDropTracker,
  CrashTracker,
  ExchangeRateInfo,
} from '@/types';
import { STORAGE_KEYS } from '@/types';
import { DEFAULT_SYMBOL } from '@/lib/constants/symbols';

// ========================================
// Default Values
// ========================================

export const DEFAULT_EXCHANGE_RATE: ExchangeRateInfo = {
  rate: 1350, // 기본 환율 1,350원
  timestamp: new Date().toISOString(),
  source: 'default',
  isDefault: true,
};

export const DEFAULT_USER_CONFIG: UserConfig = {
  totalBudget: 40000000, // 4천만원 (KRW)
  usedBudget: 0,
  buyRatioNormal: 0.04, // 4%
  buyRatioOver: 0.10, // 10%
  sellRatioBounce: 0.30, // 30%
  sellRatioTarget: 0.40, // 40%
  averageCost: undefined,
  totalShares: undefined,
};

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  activeSymbol: DEFAULT_SYMBOL,
  exchangeRate: DEFAULT_EXCHANGE_RATE,
  symbols: {
    SOXL: { ...DEFAULT_USER_CONFIG },
    TQQQ: { ...DEFAULT_USER_CONFIG },
    UPRO: { ...DEFAULT_USER_CONFIG },
  },
};

const DEFAULT_DROP_TRACKER: ConsecutiveDropTracker = {
  count: 0,
  dates: [],
  lastDropDate: '',
};

// ========================================
// Storage Helpers
// ========================================

/**
 * LocalStorage에서 데이터 읽기 (타입 안전)
 */
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * LocalStorage에 데이터 쓰기
 */
function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
  }
}

/**
 * LocalStorage에서 데이터 삭제
 */
function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
}

// ========================================
// Global Config (멀티 심볼 지원)
// ========================================

const GLOBAL_CONFIG_KEY = 'soxl_global_config';

export function getGlobalConfig(): GlobalConfig {
  return getStorageItem(GLOBAL_CONFIG_KEY, DEFAULT_GLOBAL_CONFIG);
}

export function setGlobalConfig(config: GlobalConfig): void {
  setStorageItem(GLOBAL_CONFIG_KEY, config);
}

export function getActiveSymbol(): SupportedSymbol {
  const globalConfig = getGlobalConfig();
  return globalConfig.activeSymbol;
}

export function setActiveSymbol(symbol: SupportedSymbol): void {
  const globalConfig = getGlobalConfig();
  globalConfig.activeSymbol = symbol;
  setGlobalConfig(globalConfig);
}

export function getSymbolConfig(symbol: SupportedSymbol): UserConfig {
  const globalConfig = getGlobalConfig();
  return globalConfig.symbols[symbol];
}

export function setSymbolConfig(symbol: SupportedSymbol, config: UserConfig): void {
  const globalConfig = getGlobalConfig();
  globalConfig.symbols[symbol] = config;
  setGlobalConfig(globalConfig);
}

export function updateSymbolConfig(symbol: SupportedSymbol, partial: Partial<UserConfig>): void {
  const current = getSymbolConfig(symbol);
  setSymbolConfig(symbol, { ...current, ...partial });
}

// ========================================
// User Config (레거시 호환성 - 현재 active 심볼 반환)
// ========================================

export function getUserConfig(): UserConfig {
  const globalConfig = getGlobalConfig();
  return globalConfig.symbols[globalConfig.activeSymbol];
}

export function setUserConfig(config: UserConfig): void {
  const globalConfig = getGlobalConfig();
  setSymbolConfig(globalConfig.activeSymbol, config);
}

export function updateUserConfig(partial: Partial<UserConfig>): void {
  const current = getUserConfig();
  setUserConfig({ ...current, ...partial });
}

// ========================================
// Trade History
// ========================================

export function getTradeHistory(): TradeEvent[] {
  return getStorageItem<TradeEvent[]>(STORAGE_KEYS.TRADE_HISTORY, []);
}

export function setTradeHistory(history: TradeEvent[]): void {
  setStorageItem(STORAGE_KEYS.TRADE_HISTORY, history);
}

export function addTradeEvent(event: TradeEvent): void {
  const history = getTradeHistory();
  setTradeHistory([event, ...history]); // 최신순 정렬
}

export function updateTradeEvent(id: string, updates: Partial<TradeEvent>): void {
  const history = getTradeHistory();
  const updated = history.map((event) =>
    event.id === id ? { ...event, ...updates } : event
  );
  setTradeHistory(updated);
}

export function deleteTradeEvent(id: string): void {
  const history = getTradeHistory();
  const filtered = history.filter((event) => event.id !== id);
  setTradeHistory(filtered);
}

// ========================================
// Drop Tracker
// ========================================

export function getDropTracker(): ConsecutiveDropTracker {
  return getStorageItem(STORAGE_KEYS.DROP_TRACKER, DEFAULT_DROP_TRACKER);
}

export function setDropTracker(tracker: ConsecutiveDropTracker): void {
  setStorageItem(STORAGE_KEYS.DROP_TRACKER, tracker);
}

export function resetDropTracker(): void {
  setDropTracker(DEFAULT_DROP_TRACKER);
}

// ========================================
// Crash Tracker
// ========================================

export function getCrashTracker(): CrashTracker | null {
  return getStorageItem<CrashTracker | null>(STORAGE_KEYS.CRASH_TRACKER, null);
}

export function setCrashTracker(tracker: CrashTracker | null): void {
  setStorageItem(STORAGE_KEYS.CRASH_TRACKER, tracker);
}

// ========================================
// Exchange Rate
// ========================================

export function getExchangeRate(): ExchangeRateInfo {
  const globalConfig = getGlobalConfig();
  return globalConfig.exchangeRate;
}

export function setExchangeRate(exchangeRate: ExchangeRateInfo): void {
  const globalConfig = getGlobalConfig();
  globalConfig.exchangeRate = exchangeRate;
  setGlobalConfig(globalConfig);
}

export async function fetchAndUpdateExchangeRate(): Promise<ExchangeRateInfo> {
  try {
    const response = await fetch('/api/exchange-rate');
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }
    const data = await response.json();
    if (data.success && data.data) {
      setExchangeRate(data.data);
      return data.data;
    }
    throw new Error('Invalid exchange rate response');
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    // 실패 시 저장된 환율 반환
    return getExchangeRate();
  }
}

// ========================================
// Last Sync
// ========================================

export function getLastSync(): string {
  return getStorageItem(STORAGE_KEYS.LAST_SYNC, '');
}

export function setLastSync(timestamp: string): void {
  setStorageItem(STORAGE_KEYS.LAST_SYNC, timestamp);
}

// ========================================
// Clear All
// ========================================

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeStorageItem(key);
  });
}
