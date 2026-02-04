/**
 * POST /api/action
 * 
 * 시장 데이터와 사용자 설정을 기반으로 오늘의 행동 판정
 */

import { NextRequest, NextResponse } from 'next/server';
import type {
  ActionResponse,
  DailyMarketState,
  UserConfig,
  ConsecutiveDropTracker,
  CrashTracker,
} from '@/types';
import {
  determineTodayAction,
  generateChecklist,
  updateDropTracker,
  updateCrashTracker,
} from '@/lib/strategy/rules';

interface ActionRequestBody {
  market: DailyMarketState;
  config: UserConfig;
  dropTracker: ConsecutiveDropTracker;
  crashTracker: CrashTracker | null;
  exchangeRate: number;
}

/**
 * POST 핸들러
 */
export async function POST(request: NextRequest) {
  try {
    const body: ActionRequestBody = await request.json();
    const { market, config, dropTracker, crashTracker, exchangeRate } = body;

    // Validation
    if (!market || !config || !exchangeRate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: market, config, or exchangeRate',
          checklist: [],
          timestamp: new Date().toISOString(),
        } as ActionResponse,
        { status: 400 }
      );
    }

    // 오늘의 행동 결정
    const todayAction = determineTodayAction(
      market,
      config,
      dropTracker,
      crashTracker,
      exchangeRate
    );

    // 체크리스트 생성
    const checklist = generateChecklist(
      market,
      config,
      dropTracker,
      todayAction
    );

    // 추적기 업데이트 (클라이언트에서 저장할 수 있도록 반환)
    const updatedDropTracker = updateDropTracker(market, dropTracker);
    const updatedCrashTracker = updateCrashTracker(market, crashTracker);

    return NextResponse.json(
      {
        success: true,
        data: todayAction,
        checklist,
        updatedDropTracker,
        updatedCrashTracker,
        timestamp: new Date().toISOString(),
      } as ActionResponse & {
        updatedDropTracker: ConsecutiveDropTracker;
        updatedCrashTracker: CrashTracker | null;
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error determining action:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to determine action',
        checklist: [],
        timestamp: new Date().toISOString(),
      } as ActionResponse,
      { status: 500 }
    );
  }
}
