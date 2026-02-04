# 📈 SOXL Safety Trading Web

## 개발 계획서 v1.0

> **최종 수정일**: 2026-02-01  
> **프로젝트 상태**: Planning

---

## 1. 프로젝트 개요

### 1.1 프로젝트 목적

SOXL(3배 레버리지 반도체 ETF) 투자에서 **감정 개입을 제거**하고, **사전에 정의된 규칙만 실행하도록 돕는 웹 도구**를 개발한다.

본 서비스는 **예측·추천 서비스가 아니라 실행 보조 도구**이다.

#### 핵심 목표

| 목표 | 우선순위 |
|------|----------|
| ❌ 수익 극대화 | - |
| ⭕ 계좌 생존 | 1순위 |
| ⭕ 규칙 준수 | 2순위 |
| ⭕ 실수 방지 | 3순위 |

### 1.2 문제 정의

레버리지 ETF 투자 실패의 대부분은 **전략 부재**가 아닌 **전략 미준수**에서 발생한다.

```
사용자는 이미 전략을 알고 있으나:
├─ 급락 시 → 공포로 인한 손절
├─ 반등 시 → 탐욕으로 인한 물타기
└─ 횡보 시 → 지루함으로 인한 충동 매수
```

**해결책**: 웹이 **판단을 대신**하고, 사용자는 **체크만** 수행

### 1.3 핵심 원칙

```
🎯 이 웹은 돈을 벌게 해주지 않는다.
   대신, 돈을 잃는 행동을 못 하게 만든다.
```

---

## 2. 타겟 사용자

### 2.1 페르소나

| 항목 | 설명 |
|------|------|
| **대상** | SOXL / TQQQ / UPRO 등 레버리지 ETF 투자자 |
| **투자 경력** | 1년 이상, 레버리지 상품 경험 있음 |
| **지식 수준** | 표준편차, 분할 매수 등 기본 전략 이해 |
| **Pain Point** | 엑셀/노션 관리 귀찮음, 실전에서 규칙 붕괴 |
| **핵심 니즈** | "오늘 뭘 해야 하나"를 **즉시** 알고 싶음 |

### 2.2 사용자 시나리오

```
[시나리오 1: 급락일]
1. 아침에 앱 오픈
2. "🔴 SOXL -8.2% | BUY 신호" 확인
3. 체크리스트 수행 (예산 확인, 연속 하락 확인)
4. "매수 가능: $500 (약 2주)" 가이드 확인
5. 증권사 앱에서 매수 실행

[시나리오 2: 반등일]
1. 앱 오픈
2. "🟢 SOXL +10.5% | SELL 신호" 확인
3. "어제 매수분 30% 매도 권장" 가이드 확인
4. 증권사 앱에서 매도 실행
```

---

## 3. 적용 매매 전략

### 3.1 전략 철학

| 원칙 | 설명 |
|------|------|
| **표준편차 기반** | 극단적 하락은 평균 회귀 가능성 높음 |
| **전일 대비 하락률** | 실전 트리거로 단순화 |
| **중단 규칙 우선** | 매수보다 '언제 멈출지'가 더 중요 |
| **감정 배제** | 모든 판단은 숫자 기반 자동화 |

### 3.2 매수 규칙

#### 3.2.1 정규 진입 (Normal Buy)

| 조건 | 행동 |
|------|------|
| 전일 대비 **-7% ~ -8%** | 총 예산의 **3~4%** 매수 |

#### 3.2.2 과진입 (Overbuy)

| 조건 | 행동 |
|------|------|
| 전일 대비 **-16% 이상** | 총 예산의 **8~10%** 매수 |

#### 3.2.3 제한 규칙

- ⚠️ **하루 최대 1회** 매수 (강제)
- ⚠️ **동일 가격대 중복 매수 금지**

### 3.3 매수 중단 규칙 (최우선)

> 아래 조건 중 **하나라도 충족 시 → 모든 매수 즉시 중단**

| # | 중단 조건 | 설명 |
|---|-----------|------|
| 1 | **연속 하락 3회** | -7% 이벤트가 3거래일 연속 발생 |
| 2 | **급락 후 반등 실패** | -16% 급락 후 5거래일 내 +10% 회복 실패 |
| 3 | **예산 소진** | 총 예산의 **50% 이상** 사용 |
| 4 | **손실 한도 도달** | 평가 손실률 **-30%** 초과 |

### 3.4 매도 규칙

#### 3.4.1 급락 후 반등 매도

| 조건 | 행동 |
|------|------|
| 급락 다음 날 **+8~12%** 반등 | 해당 물량 **30~50%** 매도 |

#### 3.4.2 목표가 도달 매도

| 조건 | 행동 |
|------|------|
| 평균단가 대비 **+15~25%** | 전체 물량 **40~50%** 분할 매도 |

#### 3.4.3 잔량 처리

- **트레일링 스탑**: 고점 대비 -10% 하락 시 매도
- **일봉 기준**: 일봉 고점 하락 추세 확정 시 정리

### 3.5 전략 플로우차트

```
[매일 장 시작 전]
     │
     ▼
┌─────────────────┐
│ 전일 대비 하락률 │
│    계산         │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
 < -7%?    >= 0%?
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│STOP   │ │SELL   │
│체크   │ │체크   │
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
 STOP 조건?  반등 조건?
    │         │
   YES       YES
    │         │
    ▼         ▼
 🔴 STOP   🟢 SELL
    │         │
   NO        NO
    │         │
    ▼         ▼
 🟡 BUY    ⚪ HOLD
```

---

## 4. 핵심 기능 정의 (MVP)

### 4.1 메인 대시보드

#### 4.1.1 Today Status Card

| 요소 | 설명 |
|------|------|
| 현재 상태 배지 | `NO_ACTION` / `BUY` / `OVERBUY` / `SELL` / `STOP` |
| 상태 색상 | 🟢 안전 / 🟡 주의 / 🔴 위험 |
| 간단 메시지 | "오늘은 아무것도 하지 마세요" 등 |

#### 4.1.2 Price & Change Card

| 요소 | 설명 |
|------|------|
| 현재가 | 실시간 (15분 지연 명시) |
| 전일 종가 | 기준가 |
| 등락률 | % 및 색상 표시 |
| 등락금액 | $ 단위 |

#### 4.1.3 Action Recommendation

| 상태 | 표시 내용 |
|------|-----------|
| BUY | "💰 매수 권장: $XXX (약 N주)" |
| SELL | "💸 매도 권장: 보유량의 30%" |
| STOP | "🛑 매수 중단: [사유]" |
| HOLD | "⏸️ 대기: 조건 미충족" |

#### 4.1.4 Budget Usage Bar

```
[████████░░░░░░░░░░░░] 42% 사용
$12,600 / $30,000

⚠️ 50% 도달 시 매수 중단
```

### 4.2 일일 체크리스트

> 사용자는 **판단 ❌**, **체크 ⭕**만 수행

```
┌─────────────────────────────────────────────┐
│ 📋 오늘의 체크리스트                          │
├─────────────────────────────────────────────┤
│ [✓] 전일 대비 -7% 이상인가?                   │
│ [ ] 전일 대비 -16% 이상인가?                  │
│ [ ] 연속 하락 3회째인가?                      │
│ [✓] 예산 50% 미만 사용 중인가?                │
│ [ ] 어제 급락 후 오늘 +8% 반등인가?            │
├─────────────────────────────────────────────┤
│ 📌 결과: 🟡 BUY (-7%) 신호                    │
│         매수 가능 금액: $900 (약 3주)          │
└─────────────────────────────────────────────┘
```

### 4.3 매수 가이드 자동 계산

#### 4.3.1 사용자 입력

| 항목 | 예시 |
|------|------|
| 총 예산 | $30,000 |
| 이미 사용한 금액 | $12,600 |
| 환율 | 1,450원 |

#### 4.3.2 자동 출력

| 항목 | 계산 로직 | 예시 결과 |
|------|-----------|-----------|
| 매수 가능 여부 | STOP 조건 체크 | ✅ 가능 |
| 매수 금액 (USD) | 총예산 × 비율 | $900 |
| 매수 금액 (KRW) | USD × 환율 | 1,305,000원 |
| 권장 주 수 | 금액 ÷ 현재가 | 약 3주 |

### 4.4 매도 가이드

| 조건 | 가이드 메시지 |
|------|---------------|
| 급락 후 반등 | "💸 SELL 30%: 어제 매수분 일부 익절" |
| 목표가 도달 | "💸 SELL 40%: 평단 +20% 달성" |
| 트레일링 적용 | "🔔 TRAIL: 고점 대비 -8%, -10%에서 정리" |
| 조건 미충족 | "⏸️ HOLD: 매도 조건 미충족" |

### 4.5 이벤트 히스토리

```
┌─────────────────────────────────────────────┐
│ 📜 최근 이벤트                               │
├─────────────────────────────────────────────┤
│ 2026-02-01  ⚪ NO_ACTION  +1.2%             │
│ 2026-01-31  🟡 BUY        -7.8%  $900 매수   │
│ 2026-01-30  ⚪ NO_ACTION  -2.1%             │
│ 2026-01-29  🟢 SELL       +11.2% 30% 매도   │
│ 2026-01-28  🟡 OVERBUY    -18.3% $2,400 매수 │
└─────────────────────────────────────────────┘
```

---

## 5. 화면 구조 (Information Architecture)

### 5.1 페이지 구조

```
/                          # 메인 대시보드
├── Today Status Card      # 오늘의 상태
├── Price & Change Card    # 가격 정보
├── Action Recommendation  # 행동 가이드
├── Budget Usage Bar       # 예산 사용률
├── Daily Checklist        # 일일 체크리스트
└── Event History Log      # 이벤트 기록

/settings                  # 설정
├── Budget Settings        # 예산 설정
│   ├── 총 예산
│   └── 현재 사용 금액
├── Exchange Rate          # 환율 설정
├── Strategy Settings      # 전략 설정
│   ├── 정규 매수 비율 (3~4%)
│   ├── 과매수 비율 (8~10%)
│   └── 매도 비율
└── Notification Settings  # 알림 설정 (Phase 3)

/history                   # 상세 히스토리 (Phase 2)
├── Calendar View          # 달력 뷰
├── List View              # 리스트 뷰
└── Statistics             # 통계
```

### 5.2 반응형 레이아웃

| 화면 크기 | 레이아웃 |
|-----------|----------|
| Desktop (1200px+) | 2컬럼: 좌측 메인, 우측 사이드바 |
| Tablet (768px~1199px) | 1컬럼: 카드 스택 |
| Mobile (~767px) | 1컬럼: 압축된 카드 뷰 |

---

## 6. 기술 스택

### 6.1 Frontend

| 영역 | 기술 | 선택 이유 |
|------|------|-----------|
| **Framework** | Next.js 15 (App Router) | SSR/SSG, 최적화된 빌드 |
| **Language** | TypeScript | 타입 안정성 |
| **Styling** | Tailwind CSS | 빠른 UI 개발, 일관된 디자인 |
| **State** | Zustand | 간결한 전역 상태 관리 |
| **Data Fetching** | TanStack Query | 서버 상태 캐싱, 리페칭 |
| **Charts** | Recharts | 가격 차트 (Phase 2) |
| **Icons** | Lucide React | 일관된 아이콘 세트 |

### 6.2 Backend / Data

| 영역 | 기술 | 선택 이유 |
|------|------|-----------|
| **Price API** | Yahoo Finance API | 무료, 안정적 |
| **Serverless** | Next.js API Routes | 프론트와 통합, Vercel 최적화 |
| **Storage (MVP)** | LocalStorage | 빠른 MVP, 서버 불필요 |
| **Storage (확장)** | Supabase | PostgreSQL + Auth + Realtime |
| **Hosting** | Vercel | Next.js 최적화, 무료 티어 |

### 6.3 개발 도구

| 영역 | 기술 |
|------|------|
| **Linting** | ESLint + Prettier |
| **Testing** | Vitest + Testing Library |
| **E2E** | Playwright (Phase 2) |
| **CI/CD** | GitHub Actions + Vercel |

---

## 7. 데이터 모델

### 7.1 Core Types

```typescript
// 사용자 설정
interface UserConfig {
  totalBudget: number;           // 총 예산 (USD)
  usedBudget: number;            // 사용한 예산 (USD)
  exchangeRate: number;          // 환율 (KRW/USD)
  buyRatioNormal: number;        // 정규 매수 비율 (0.03~0.04)
  buyRatioOver: number;          // 과매수 비율 (0.08~0.10)
  sellRatioBounce: number;       // 반등 매도 비율 (0.30~0.50)
  sellRatioTarget: number;       // 목표가 매도 비율 (0.40~0.50)
}

// 일일 시장 상태
interface DailyMarketState {
  date: string;                  // YYYY-MM-DD
  symbol: string;                // 'SOXL'
  prevClose: number;             // 전일 종가
  currentPrice: number;          // 현재가
  open: number;                  // 시가
  high: number;                  // 고가
  low: number;                   // 저가
  volume: number;                // 거래량
  changePct: number;             // 등락률 (%)
  changeAmt: number;             // 등락금액 ($)
}

// 행동 타입
type ActionType = 
  | 'NO_ACTION'    // 아무것도 안 함
  | 'BUY'          // 정규 매수 (-7~-8%)
  | 'OVERBUY'      // 과매수 (-16% 이상)
  | 'SELL_BOUNCE'  // 반등 매도
  | 'SELL_TARGET'  // 목표가 매도
  | 'STOP';        // 매수 중단

// 중단 사유
type StopReason = 
  | 'CONSECUTIVE_DROPS'    // 연속 하락 3회
  | 'BOUNCE_FAILURE'       // 반등 실패
  | 'BUDGET_EXCEEDED'      // 예산 50% 초과
  | 'LOSS_LIMIT';          // 손실 한도 도달

// 오늘의 판정 결과
interface TodayAction {
  action: ActionType;
  reason: string;
  stopReason?: StopReason;
  buyAmount?: number;            // 매수 금액 (USD)
  buyShares?: number;            // 매수 주 수
  sellRatio?: number;            // 매도 비율
}

// 이벤트 기록
interface TradeEvent {
  id: string;
  date: string;
  action: ActionType;
  price: number;
  changePct: number;
  amount?: number;               // 거래 금액
  shares?: number;               // 거래 주 수
  note?: string;                 // 메모
}

// 연속 하락 추적
interface ConsecutiveDropTracker {
  count: number;                 // 연속 하락 횟수
  dates: string[];               // 하락 발생일
  lastDropDate: string;          // 마지막 하락일
}
```

### 7.2 API Response Types

```typescript
// Yahoo Finance API 응답 (간소화)
interface YahooQuoteResponse {
  symbol: string;
  regularMarketPrice: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
}

// 내부 API 응답
interface MarketDataResponse {
  success: boolean;
  data?: DailyMarketState;
  error?: string;
  timestamp: string;
}

interface ActionResponse {
  success: boolean;
  data?: TodayAction;
  checklist: ChecklistItem[];
  error?: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  type: 'auto' | 'manual';
}
```

### 7.3 LocalStorage Schema

```typescript
// localStorage 키 구조
const STORAGE_KEYS = {
  USER_CONFIG: 'soxl_user_config',
  TRADE_HISTORY: 'soxl_trade_history',
  DROP_TRACKER: 'soxl_drop_tracker',
  LAST_SYNC: 'soxl_last_sync',
} as const;

// 저장 데이터 구조
interface StoredData {
  userConfig: UserConfig;
  tradeHistory: TradeEvent[];
  dropTracker: ConsecutiveDropTracker;
  lastSync: string;              // ISO timestamp
}
```

---

## 8. API 설계

### 8.1 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/quote` | 현재 시세 조회 |
| GET | `/api/action` | 오늘의 행동 판정 |
| POST | `/api/event` | 이벤트 기록 (Phase 2) |

### 8.2 상세 스펙

#### GET /api/quote

```typescript
// Request
GET /api/quote?symbol=SOXL

// Response 200
{
  "success": true,
  "data": {
    "date": "2026-02-01",
    "symbol": "SOXL",
    "prevClose": 25.50,
    "currentPrice": 23.46,
    "open": 24.80,
    "high": 25.00,
    "low": 23.10,
    "volume": 45000000,
    "changePct": -8.0,
    "changeAmt": -2.04
  },
  "timestamp": "2026-02-01T14:30:00Z"
}

// Response 500
{
  "success": false,
  "error": "Failed to fetch market data",
  "timestamp": "2026-02-01T14:30:00Z"
}
```

#### GET /api/action

```typescript
// Request
GET /api/action?symbol=SOXL&config={encoded_user_config}

// Response 200
{
  "success": true,
  "data": {
    "action": "BUY",
    "reason": "전일 대비 -8.0% 하락, 정규 매수 조건 충족",
    "buyAmount": 900,
    "buyShares": 38
  },
  "checklist": [
    { "id": "drop_7", "label": "전일 대비 -7% 이상인가?", "checked": true, "type": "auto" },
    { "id": "drop_16", "label": "전일 대비 -16% 이상인가?", "checked": false, "type": "auto" },
    { "id": "consecutive", "label": "연속 하락 3회째인가?", "checked": false, "type": "auto" },
    { "id": "budget", "label": "예산 50% 미만 사용 중인가?", "checked": true, "type": "auto" }
  ],
  "timestamp": "2026-02-01T14:30:00Z"
}
```

---

## 9. UI/UX 디자인 가이드

### 9.1 컬러 시스템

```css
:root {
  /* Primary - 안정감 있는 네이비 */
  --primary-50: #e6f0ff;
  --primary-500: #2563eb;
  --primary-900: #1e3a5f;

  /* Semantic Colors */
  --success: #10b981;    /* 매도, 이익 */
  --warning: #f59e0b;    /* 매수, 주의 */
  --danger: #ef4444;     /* 중단, 손실 */
  --neutral: #6b7280;    /* 대기, 정보 */

  /* Background */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-card: #334155;

  /* Text */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
}
```

### 9.2 타이포그래피

| 요소 | 폰트 | 크기 | 용도 |
|------|------|------|------|
| Heading | Pretendard | 24-32px | 페이지 제목 |
| Subheading | Pretendard | 18-20px | 섹션 제목 |
| Body | Pretendard | 14-16px | 본문 |
| Number | JetBrains Mono | 16-24px | 가격, 수치 |
| Label | Pretendard | 12-14px | 레이블, 캡션 |

### 9.3 컴포넌트 스타일

#### Status Badge

```
🟢 NO_ACTION  - 초록 배경, 흰색 텍스트
🟡 BUY        - 노란 배경, 검정 텍스트  
🟠 OVERBUY    - 주황 배경, 흰색 텍스트
🔴 STOP       - 빨간 배경, 흰색 텍스트
💰 SELL       - 청록 배경, 흰색 텍스트
```

#### Card Design

- 배경: `bg-card` + 미세한 그라데이션
- 테두리: 상태에 따른 좌측 4px 컬러 바
- 그림자: `shadow-lg` + 글로우 효과
- 라운딩: `rounded-xl` (12px)

---

## 10. 개발 로드맵

### Phase 1: MVP (2주)

| 주차 | 작업 | 산출물 |
|------|------|--------|
| 1주차 | 프로젝트 셋업 | Next.js 보일러플레이트 |
| | Yahoo Finance API 연동 | `/api/quote` 엔드포인트 |
| | 하락률 계산 로직 | 유틸 함수 |
| | 메인 대시보드 UI | Today Status, Price Card |
| 2주차 | 매수/중단 판정 로직 | `/api/action` 엔드포인트 |
| | 체크리스트 UI | Daily Checklist 컴포넌트 |
| | 설정 페이지 | `/settings` 페이지 |
| | LocalStorage 연동 | 설정 저장/불러오기 |
| | 배포 | Vercel 배포 |

**MVP 완료 기준**:
- [x] 실시간 가격 표시
- [x] 오늘의 행동 자동 판정
- [x] 체크리스트 표시
- [x] 예산 설정 및 저장

### Phase 2: 전략 고도화 (2주)

| 작업 | 설명 |
|------|------|
| 이벤트 히스토리 저장 | TradeEvent 저장/조회 |
| 연속 하락 감지 | ConsecutiveDropTracker 구현 |
| 반등 실패 판정 | 급락 후 5일 내 반등 체크 |
| 히스토리 페이지 | `/history` 페이지 |
| 통계 대시보드 | 승률, 평균 수익률 등 |

### Phase 3: 확장 (2주+)

| 작업 | 설명 |
|------|------|
| 멀티 심볼 지원 | TQQQ, UPRO 추가 |
| Supabase 연동 | 클라우드 저장소 전환 |
| 알림 시스템 | Telegram / Email 알림 |
| 모바일 최적화 | PWA 지원 |
| 다크/라이트 테마 | 테마 전환 기능 |

---

## 11. 테스트 전략

### 11.1 단위 테스트

| 대상 | 테스트 내용 |
|------|-------------|
| `calculateChangePct()` | 등락률 계산 정확성 |
| `determineAction()` | 행동 판정 로직 |
| `checkStopConditions()` | 중단 조건 체크 |
| `calculateBuyAmount()` | 매수 금액 계산 |

### 11.2 통합 테스트

| 시나리오 | 검증 내용 |
|----------|-----------|
| 정상 매수 플로우 | -7% 하락 → BUY 판정 → 금액 계산 |
| 중단 플로우 | 연속 3회 하락 → STOP 판정 |
| 반등 매도 플로우 | 급락 후 +10% → SELL 판정 |

### 11.3 E2E 테스트 (Phase 2)

- 전체 사용자 플로우
- 설정 저장/불러오기
- 히스토리 기록/조회

---

## 12. 리스크 및 주의사항

### 12.1 법적 면책

```
⚠️ 면책 고지 (필수 표시)

본 서비스는 투자 자문이 아닙니다.
- 모든 투자 결정과 책임은 사용자 본인에게 있습니다.
- 본 서비스는 투자 수익을 보장하지 않습니다.
- 레버리지 ETF는 원금 손실 위험이 높은 상품입니다.
- 본 서비스의 데이터는 지연될 수 있으며 정확성을 보장하지 않습니다.
```

### 12.2 기술적 리스크

| 리스크 | 대응 방안 |
|--------|-----------|
| API 장애 | 캐시 데이터 표시 + 오류 메시지 |
| 데이터 지연 | "15분 지연" 명시 표시 |
| 잘못된 판정 | 수동 오버라이드 기능 |

### 12.3 제한 사항

- ❌ 자동 매매 기능 없음 (가이던스 전용)
- ❌ 실시간 데이터 아님 (15분 지연)
- ❌ 과거 데이터 분석 없음 (MVP)

---

## 13. 부록

### 13.1 참고 자료

- [Yahoo Finance API 문서](https://www.yahoofinanceapi.com/)
- [SOXL ETF 정보](https://www.direxion.com/product/daily-semiconductor-bull-3x-etf)
- [표준편차 기반 매매 전략](https://www.investopedia.com/terms/s/standarddeviation.asp)

### 13.2 용어 정의

| 용어 | 정의 |
|------|------|
| SOXL | Direxion Daily Semiconductor Bull 3X Shares |
| 전일 대비 | 전일 종가 대비 현재가의 변동률 |
| 정규 진입 | -7~-8% 하락 시 정해진 비율로 매수 |
| 과진입 | -16% 이상 급락 시 확대된 비율로 매수 |
| 트레일링 스탑 | 고점 대비 일정 비율 하락 시 자동 매도 |

---

## 📌 문서 버전 관리

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-02-01 | 초안 작성 |

---

```
🎯 핵심 원칙 (항상 기억)

이 웹은 돈을 벌게 해주지 않는다.
대신, 돈을 잃는 행동을 못 하게 만든다.
```
