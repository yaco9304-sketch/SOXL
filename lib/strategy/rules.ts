/**
 * SOXL Safety Trading 전략 규칙
 * 
 * 이 파일은 모든 매매 판단 로직을 포함합니다.
 * 감정을 배제하고 오직 숫자와 규칙만으로 판단합니다.
 */

import type {
  ActionType,
  StopReason,
  TodayAction,
  DailyMarketState,
  UserConfig,
  ConsecutiveDropTracker,
  CrashTracker,
  ChecklistItem,
} from '@/types';
import { getTodayString, getDaysDifference } from '@/lib/utils/date';
import { calculateExpectedAveragePrice } from '@/lib/utils/averagePrice';

// ========================================
// Constants
// ========================================

const THRESHOLDS = {
  NORMAL_BUY: -7, // 정규 매수 트리거
  OVERBUY: -16, // 과매수 트리거
  BOUNCE: 8, // 반등 감지
  TARGET_PROFIT_MIN: 15, // 목표 수익률 최소
  TARGET_PROFIT_MAX: 25, // 목표 수익률 최대
  CONSECUTIVE_LIMIT: 3, // 연속 하락 한계
  BUDGET_LIMIT: 0.5, // 예산 사용 한계 (50%)
  BOUNCE_DAYS: 5, // 반등 대기 일수
  BOUNCE_RECOVERY: 10, // 반등 회복률 (%)
} as const;

// 표준편차 매매법 매수가 계수
const STDDEV_MULTIPLIERS = {
  BUY_7: 0.93, // -7% 매수가 = 전일 종가 × 0.93
  BUY_14: 0.86, // -14% 매수가 = 전일 종가 × 0.86
} as const;

// ========================================
// 표준편차 매매법 - 전일 종가 기준 매수가 계산
// ========================================

export interface StdDevBuyPrices {
  prevClose: number; // 전일 종가 (기준가)
  buy7: number; // -7% 매수가
  buy14: number; // -14% 매수가
  calculatedAt: string; // 계산 시각 (ISO)
}

/**
 * 전일 종가 기준 매수 단가 계산
 * - buy_7 = prev_close × 0.93 (-7%)
 * - buy_14 = prev_close × 0.86 (-14%)
 */
export function calculateStdDevBuyPrices(prevClose: number): StdDevBuyPrices {
  return {
    prevClose,
    buy7: Math.round(prevClose * STDDEV_MULTIPLIERS.BUY_7 * 100) / 100,
    buy14: Math.round(prevClose * STDDEV_MULTIPLIERS.BUY_14 * 100) / 100,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * 현재가가 매수 조건에 해당하는지 체크
 */
export function checkBuyConditionByPrice(
  currentPrice: number,
  buyPrices: StdDevBuyPrices
): { shouldBuy: boolean; level: 'none' | 'buy7' | 'buy14'; message: string } {
  if (currentPrice <= buyPrices.buy14) {
    return {
      shouldBuy: true,
      level: 'buy14',
      message: `현재가 $${currentPrice.toFixed(2)}가 -14% 매수가 $${buyPrices.buy14.toFixed(2)} 이하입니다`,
    };
  }
  if (currentPrice <= buyPrices.buy7) {
    return {
      shouldBuy: true,
      level: 'buy7',
      message: `현재가 $${currentPrice.toFixed(2)}가 -7% 매수가 $${buyPrices.buy7.toFixed(2)} 이하입니다`,
    };
  }
  return {
    shouldBuy: false,
    level: 'none',
    message: `현재가 $${currentPrice.toFixed(2)}는 매수 조건 미충족`,
  };
}

// ========================================
// Core Logic
// ========================================

/**
 * 오늘의 행동 결정 (메인 함수)
 */
export function determineTodayAction(
  market: DailyMarketState,
  config: UserConfig,
  dropTracker: ConsecutiveDropTracker,
  crashTracker: CrashTracker | null,
  exchangeRate: number
): TodayAction {
  const { changePct } = market;

  // 1. 중단 조건 체크 (최우선)
  const stopCheck = checkStopConditions(
    market,
    config,
    dropTracker,
    crashTracker
  );
  if (stopCheck.shouldStop) {
    return {
      action: 'STOP',
      reason: stopCheck.reason,
      stopReason: stopCheck.stopReason,
    };
  }

  // 2. 매도 조건 체크
  if (changePct > 0) {
    const sellAction = checkSellConditions(market, config, crashTracker);
    if (sellAction) return sellAction;
  }

  // 3. 매수 조건 체크
  if (changePct <= THRESHOLDS.NORMAL_BUY) {
    return checkBuyConditions(market, config, exchangeRate);
  }

  // 4. 조건 미충족
  return {
    action: 'NO_ACTION',
    reason: '매수/매도 조건 미충족',
  };
}

/**
 * 중단 조건 체크
 */
export function checkStopConditions(
  market: DailyMarketState,
  config: UserConfig,
  dropTracker: ConsecutiveDropTracker,
  crashTracker: CrashTracker | null
): {
  shouldStop: boolean;
  reason: string;
  stopReason?: StopReason;
} {
  // 1. 예산 50% 초과 체크
  const budgetUsageRatio = config.usedBudget / config.totalBudget;
  if (budgetUsageRatio >= THRESHOLDS.BUDGET_LIMIT) {
    return {
      shouldStop: true,
      reason: `예산 ${(budgetUsageRatio * 100).toFixed(0)}% 사용 - 매수 중단`,
      stopReason: 'BUDGET_EXCEEDED',
    };
  }

  // 2. 연속 하락 3회 체크
  if (dropTracker.count >= THRESHOLDS.CONSECUTIVE_LIMIT) {
    return {
      shouldStop: true,
      reason: `연속 하락 ${dropTracker.count}회 - 매수 중단`,
      stopReason: 'CONSECUTIVE_DROPS',
    };
  }

  // 3. 급락 후 반등 실패 체크
  if (crashTracker && !crashTracker.recovered) {
    const daysSinceCrash = getDaysDifference(
      crashTracker.date,
      market.date
    );
    if (daysSinceCrash >= THRESHOLDS.BOUNCE_DAYS) {
      return {
        shouldStop: true,
        reason: `급락 후 ${daysSinceCrash}일 경과, 반등 실패 - 매수 중단`,
        stopReason: 'BOUNCE_FAILURE',
      };
    }
  }

  // 4. 손실 한도 체크 (평균 단가 대비 -30%)
  if (config.averageCost && config.averageCost > 0) {
    const lossRatio =
      ((market.currentPrice - config.averageCost) / config.averageCost) * 100;
    if (lossRatio <= -30) {
      return {
        shouldStop: true,
        reason: `평균 단가 대비 ${lossRatio.toFixed(1)}% 손실 - 매수 중단`,
        stopReason: 'LOSS_LIMIT',
      };
    }
  }

  return { shouldStop: false, reason: '' };
}

/**
 * 매수 조건 체크
 *
 * 예산은 원화(KRW) 기준으로 계산하고, 환율을 적용하여 USD로 변환합니다.
 */
export function checkBuyConditions(
  market: DailyMarketState,
  config: UserConfig,
  exchangeRate: number
): TodayAction {
  const { changePct, currentPrice } = market;

  // 현재 평단가 및 보유 주식 수
  const currentAveragePrice = config.averageCost || 0;
  const currentShares = config.totalShares || 0;

  // 과매수 조건
  if (changePct <= THRESHOLDS.OVERBUY) {
    const buyAmountKRW = config.totalBudget * config.buyRatioOver; // 원화 기준
    const buyAmount = buyAmountKRW / exchangeRate; // USD로 변환
    const buyShares = Math.floor(buyAmount / currentPrice);

    // 예상 평단가 계산
    const expectedAveragePrice =
      buyShares > 0
        ? calculateExpectedAveragePrice(
            currentAveragePrice,
            currentShares,
            currentPrice,
            buyShares
          )
        : currentAveragePrice;

    return {
      action: 'OVERBUY',
      reason: `전일 대비 ${changePct.toFixed(1)}% 급락 - 과매수 신호`,
      buyAmount,
      buyAmountKRW,
      buyShares,
      buyPrice: currentPrice,
      expectedAveragePrice,
      currentAveragePrice,
      exchangeRate,
    };
  }

  // 정규 매수 조건
  if (changePct <= THRESHOLDS.NORMAL_BUY) {
    const buyAmountKRW = config.totalBudget * config.buyRatioNormal; // 원화 기준
    const buyAmount = buyAmountKRW / exchangeRate; // USD로 변환
    const buyShares = Math.floor(buyAmount / currentPrice);

    // 예상 평단가 계산
    const expectedAveragePrice =
      buyShares > 0
        ? calculateExpectedAveragePrice(
            currentAveragePrice,
            currentShares,
            currentPrice,
            buyShares
          )
        : currentAveragePrice;

    return {
      action: 'BUY',
      reason: `전일 대비 ${changePct.toFixed(1)}% 하락 - 정규 매수 신호`,
      buyAmount,
      buyAmountKRW,
      buyShares,
      buyPrice: currentPrice,
      expectedAveragePrice,
      currentAveragePrice,
      exchangeRate,
    };
  }

  return {
    action: 'NO_ACTION',
    reason: '매수 조건 미충족',
  };
}

/**
 * 매도 조건 체크
 */
export function checkSellConditions(
  market: DailyMarketState,
  config: UserConfig,
  crashTracker: CrashTracker | null
): TodayAction | null {
  const { changePct, currentPrice } = market;

  // 1. 급락 후 반등 매도
  if (
    crashTracker &&
    !crashTracker.recovered &&
    changePct >= THRESHOLDS.BOUNCE
  ) {
    const sellRatio = config.sellRatioBounce;
    const sellShares = config.totalShares
      ? Math.floor(config.totalShares * sellRatio)
      : undefined;

    return {
      action: 'SELL_BOUNCE',
      reason: `급락 후 ${changePct.toFixed(1)}% 반등 - 일부 매도`,
      sellRatio,
      sellShares,
    };
  }

  // 2. 목표가 도달 매도
  if (config.averageCost && config.averageCost > 0) {
    const profitRatio =
      ((currentPrice - config.averageCost) / config.averageCost) * 100;

    if (
      profitRatio >= THRESHOLDS.TARGET_PROFIT_MIN &&
      profitRatio <= THRESHOLDS.TARGET_PROFIT_MAX
    ) {
      const sellRatio = config.sellRatioTarget;
      const sellShares = config.totalShares
        ? Math.floor(config.totalShares * sellRatio)
        : undefined;

      return {
        action: 'SELL_TARGET',
        reason: `평균 단가 대비 +${profitRatio.toFixed(1)}% - 목표가 도달`,
        sellRatio,
        sellShares,
      };
    }
  }

  return null;
}

// ========================================
// Tracker Updates
// ========================================

/**
 * 연속 하락 추적기 업데이트
 */
export function updateDropTracker(
  market: DailyMarketState,
  currentTracker: ConsecutiveDropTracker
): ConsecutiveDropTracker {
  const { changePct, date } = market;

  // 하락 조건 충족
  if (changePct <= THRESHOLDS.NORMAL_BUY) {
    // 같은 날짜인지 먼저 체크 (중복 카운트 방지)
    if (currentTracker.dates.includes(date)) {
      // 이미 오늘 날짜가 카운트되어 있음 - 그대로 반환
      return currentTracker;
    }

    // 연속인지 체크 (전일과 1일 이내 차이)
    const isConsecutive =
      currentTracker.lastDropDate === '' ||
      getDaysDifference(currentTracker.lastDropDate, date) <= 1;

    if (isConsecutive) {
      return {
        count: currentTracker.count + 1,
        dates: [...currentTracker.dates, date],
        lastDropDate: date,
      };
    } else {
      // 연속 끊김 - 리셋
      return {
        count: 1,
        dates: [date],
        lastDropDate: date,
      };
    }
  }

  // 상승 - 연속 리셋
  if (changePct > 0) {
    return {
      count: 0,
      dates: [],
      lastDropDate: '',
    };
  }

  // 변동 없음 - 유지
  return currentTracker;
}

/**
 * 급락 추적기 업데이트
 */
export function updateCrashTracker(
  market: DailyMarketState,
  currentTracker: CrashTracker | null
): CrashTracker | null {
  const { changePct, date, currentPrice } = market;

  // 새로운 급락 발생
  if (changePct <= THRESHOLDS.OVERBUY) {
    // 같은 날짜의 급락이 이미 기록되어 있으면 그대로 반환 (중복 방지)
    if (currentTracker && currentTracker.date === date) {
      return currentTracker;
    }
    
    return {
      date,
      price: currentPrice,
      changePct,
      recovered: false,
      daysElapsed: 0,
    };
  }

  // 기존 급락 추적 중
  if (currentTracker && !currentTracker.recovered) {
    const daysElapsed = getDaysDifference(currentTracker.date, date);

    // 반등 성공
    if (changePct >= THRESHOLDS.BOUNCE_RECOVERY) {
      return {
        ...currentTracker,
        recovered: true,
        daysElapsed,
      };
    }

    // 반등 대기 중
    return {
      ...currentTracker,
      daysElapsed,
    };
  }

  // 추적 중인 급락 없음
  return currentTracker;
}

// ========================================
// Checklist Generator
// ========================================

/**
 * 체크리스트 생성
 */
export function generateChecklist(
  market: DailyMarketState,
  config: UserConfig,
  dropTracker: ConsecutiveDropTracker,
  action: TodayAction
): ChecklistItem[] {
  const { changePct } = market;
  const budgetUsageRatio = config.usedBudget / config.totalBudget;

  return [
    {
      id: 'drop_7',
      label: `전일 대비 -7% 이상인가? (현재: ${changePct.toFixed(1)}%)`,
      checked: changePct <= THRESHOLDS.NORMAL_BUY,
      type: 'auto',
      severity: changePct <= THRESHOLDS.NORMAL_BUY ? 'warning' : 'info',
    },
    {
      id: 'drop_16',
      label: `전일 대비 -16% 이상인가? (현재: ${changePct.toFixed(1)}%)`,
      checked: changePct <= THRESHOLDS.OVERBUY,
      type: 'auto',
      severity: changePct <= THRESHOLDS.OVERBUY ? 'danger' : 'info',
    },
    {
      id: 'consecutive',
      label: `연속 하락 3회째인가? (현재: ${dropTracker.count}회)`,
      checked: dropTracker.count >= THRESHOLDS.CONSECUTIVE_LIMIT,
      type: 'auto',
      severity:
        dropTracker.count >= THRESHOLDS.CONSECUTIVE_LIMIT ? 'danger' : 'info',
    },
    {
      id: 'budget',
      label: `예산 50% 미만 사용 중인가? (현재: ${(budgetUsageRatio * 100).toFixed(0)}%)`,
      checked: budgetUsageRatio < THRESHOLDS.BUDGET_LIMIT,
      type: 'auto',
      severity:
        budgetUsageRatio >= THRESHOLDS.BUDGET_LIMIT ? 'danger' : 'info',
    },
    {
      id: 'bounce',
      label: `반등 중인가? (현재: ${changePct > 0 ? '+' : ''}${changePct.toFixed(1)}%)`,
      checked: changePct >= THRESHOLDS.BOUNCE,
      type: 'auto',
      severity: changePct >= THRESHOLDS.BOUNCE ? 'warning' : 'info',
    },
  ];
}
