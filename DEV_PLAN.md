# SOXL 앱 개발 계획 (IMPROVEMENT_PLAN 기반)

보완 계획 3대 이슈(차트 확장 세션, 매매내역 저장, 매수 알림)를 단계별로 구현하는 개발 계획입니다.

---

## Phase 1 — 매매내역 저장 (즉시 적용)

**목표:** 사용자가 매수/매도 페이지에서 "실행 완료"를 누르면 히스토리에 기록되도록 함.

| # | 작업 | 파일 | 내용 |
|---|------|------|------|
| 1.1 | 매수 실행 완료 버튼 | `app/buy/page.tsx` | BUY/OVERBUY일 때 "매수 실행했어요" 버튼 노출, 클릭 시 `addTradeEvent` 호출 (executed: true) |
| 1.2 | 매도 실행 완료 버튼 | `app/sell/page.tsx` | SELL_BOUNCE/SELL_TARGET일 때 "매도 실행했어요" 버튼 노출, 클릭 시 `addTradeEvent` 호출 (executed: true) |
| 1.3 | (선택) 기존 제안 이벤트와 병합 | `lib/storage.ts` | 같은 날짜·심볼·액션의 기존 이벤트가 있으면 `updateTradeEvent`로 executed만 true 처리 |

**완료 조건:** 매수/매도 페이지에서 실행 완료 클릭 → /history에서 해당 건이 실행됨으로 표시.

**구현 완료:** 매수 페이지·매도 페이지에 "매수 실행했어요" / "매도 실행했어요" 버튼 추가, `addTradeEvent` / `updateTradeEvent` 연동 완료.

---

## Phase 2 — 차트 보완

**목표:** 차트 "잘못된 심볼" 해결 + 정규장 외 시간대 표시 시도.

| # | 작업 | 파일 | 내용 |
|---|------|------|------|
| 2.1 | 차트 심볼 교정 | `ChartModal.tsx`, `TradingViewChart.tsx` | SOXL/TQQQ/UPRO 거래소: NASDAQ 또는 NYSEARCA 시도 (현재 AMEX 사용 시 오류 가능성) |
| 2.2 | 확장 세션 옵션 | 위 동일 | TradingView 위젯에 extended hours 관련 옵션 조사·적용 (일봉에서는 미지원일 수 있음 → 캡션/안내 문구로 보완) |

**참고:** TradingView 무료 위젯은 일봉 기준일 수 있어 확장 세션 미지원. 가능하면 interval을 60 등으로 두고 session 확장 시도.

**구현 완료:** ChartModal·TradingViewChart에서 SOXL/UPRO → NYSEARCA, TQQQ → NASDAQ 심볼로 변경 (잘못된 심볼 오류 완화).

---

## Phase 3 — 푸시 알림 안정화

**목표:** 서버 재시작 후에도 구독 유지, 매수 신호 시 자동 푸시.

| # | 작업 | 파일 | 내용 |
|---|------|------|------|
| 3.1 | 구독 정보 영구 저장 | `lib/utils/subscription-store.ts` | 메모리 Map → DB 또는 JSON 파일 등 영구 저장소로 전환 (Vercel 환경에 맞게 선택) |
| 3.2 | Cron으로 매수 신호 체크 | `app/api/cron/check-signal/route.ts` | 주기 실행: 시세·전략 판정 → BUY/OVERBUY 시 푸시 발송, 중복 방지 플래그 |
| 3.3 | 설정 안내 문구 | `app/settings/page.tsx` | "핸드폰에서 알림 받는 방법" (사이트 접속 → 알림 허용 → PWA) 안내 |

---

## Phase 4 — (선택) 서버 저장·추가 채널

| # | 작업 | 내용 |
|---|------|------|
| 4.1 | 매매내역 API | GET/POST /api/history, DB 저장, 기기 간 동기화 |
| 4.2 | Telegram/이메일 | 매수 신호 보조 채널 |

---

## 진행 순서

1. **Phase 1** 실행 (매수/매도 실행 완료 → addTradeEvent)
2. **Phase 2** 실행 (차트 심볼 수정, 확장 세션 시도)
3. **Phase 3** 실행 (구독 저장, Cron 알림, 안내 문구)

이 문서는 구현 진행에 따라 체크리스트를 갱신합니다.
