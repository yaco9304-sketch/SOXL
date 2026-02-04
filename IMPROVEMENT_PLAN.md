# SOXL 앱 보완 계획

현재 이슈 3가지에 대한 원인 정리와 보완 계획입니다.

---

## 1. 실시간 차트가 정규장만 제공됨 (애프터장·프리장 포함 희망)

### 현재 상태
- **차트**: `TradingViewChart.tsx`, `ChartModal.tsx`에서 TradingView 위젯 사용
- 기본 설정만 있어 **정규장(Regular Session)** 구간만 표시됨
- **시세 API** (`/api/quote`): Yahoo Finance의 `regularMarketPrice` 등 정규장 기준 필드만 사용

### 보완 방향

| 구분 | 내용 |
|------|------|
| **차트** | TradingView 위젯에 **세션 옵션** 추가 → 프리마켓·정규장·애프터마켓 모두 표시 |
| **시세(선택)** | 애프터/프리 구간일 때 `preMarketPrice`, `postMarketPrice` 등 반영해 현재가 표시 |

### 작업 항목

1. **TradingView 위젯 옵션 조사 및 적용**
   - TradingView Advanced Chart / Widget 문서에서 **extended hours** 또는 **session** 옵션 확인
   - 예: `session: "extended"` 또는 `session: "0930-2000"` (미국 동부 기준) 등
   - 적용 위치: `components/common/TradingViewChart.tsx`, `components/common/ChartModal.tsx`

2. **차트 UI 보조 표시**
   - 차트 상단 또는 캡션에 “프리장 / 정규장 / 애프터장” 구간 표시 (선택)
   - 또는 “24시간·확장 세션” 토글로 정규장만 / 확장 세션 전환

3. **시세 API 확장 (선택)**
   - Yahoo Finance 응답에서 `preMarketPrice`, `postMarketPrice`, `regularMarketPrice` 구분
   - 현재 미국 시장 시간대에 따라 사용할 가격 필드 선택 후 `DailyMarketState`에 매핑

### 참고
- TradingView 무료 위젯에서 확장 세션 지원 여부는 공식 문서 확인 필요. 제한이 있으면 “TradingView에서 심볼 검색 후 확장 시간 켜기” 안내를 앱 내에 추가하는 방안도 가능.

---

## 2. 매매내역이 저장되지 않음

### 현재 상태
- **저장 위치**: `lib/storage.ts`의 `addTradeEvent()` → **localStorage** (`soxl_trade_history`)
- **저장 시점**: **대시보드** 로드 시에만 호출됨  
  → “오늘의 신호”(BUY/OVERBUY/SELL 등)를 **제안용 이벤트**로 한 건만 넣고, `executed: false`로 저장
- **매수/매도 페이지**: 실제로 “매수 실행함” / “매도 실행함” 버튼이 없고, **저장 로직이 없음**
- **히스토리 페이지**: `getTradeHistory()`로 localStorage에서만 읽음 → 기기/브라우저를 바꾸거나 데이터를 지우면 소실

### 문제 정리
1. **실행 기록 없음**: 사용자가 실제로 매수/매도를 했다고 표시해도, 그 행동을 `addTradeEvent`로 남기지 않음.
2. **저장 주체가 대시보드뿐**: 대시보드 진입 시에만 “오늘 신호” 1건 추가 → 매수/매도 페이지에서의 행동은 반영 안 됨.
3. **localStorage 한계**: 같은 계정이라도 다른 기기·브라우저에서는 내역이 없고, 삭제 시 복구 불가.

### 보완 방향

| 단계 | 내용 |
|------|------|
| **1단계 (필수)** | 매수/매도 페이지에서 “실행 완료” 시 `addTradeEvent` 호출해 localStorage에 저장 |
| **2단계 (권장)** | 구독 정보와 동일하게 **서버(DB)** 에 매매내역 저장 → 기기/브라우저 공유, 재가입 시에도 유지 |

### 작업 항목

1. **매수 페이지 (`app/buy/page.tsx`)**
   - “매수 실행했어요” / “실행 완료” 버튼 추가
   - 클릭 시: `addTradeEvent({ ...오늘 action 기반, executed: true, date: 오늘, id: 유니크 })` 호출
   - 필요 시 매수 금액(USD/KRW), 수량 등 사용자 입력 또는 현재 제안값 저장

2. **매도 페이지 (`app/sell/page.tsx`)**
   - “매도 실행했어요” / “실행 완료” 버튼 추가
   - 클릭 시: `addTradeEvent({ ...오늘 action 기반, executed: true })` 호출
   - 매도 유형(반등/목표가), 금액·수량 등 기록

3. **대시보드 저장 로직 정리**
   - 기존: “오늘 신호 1건”을 자동 추가
   - 유지하되, “제안만 있고 실행은 안 한 경우”와 “실제 실행한 경우”가 구분되도록 `executed` 활용
   - 같은 날 같은 심볼에 대해 “실행 완료”를 누르면 기존 제안 이벤트를 `updateTradeEvent`로 `executed: true`로 갱신하는 방식도 가능

4. **서버/DB 저장 (2단계)**
   - **API**: `POST /api/history` (이벤트 추가), `GET /api/history` (목록 조회)
   - **인증**: NextAuth `session.user.id`로 본인만 접근
   - **저장소**: Vercel Postgres, Supabase, PlanetScale 등 중 선택
   - **마이그레이션**: 기존 localStorage 내역을 한 번 `GET` 후 `POST /api/history`로 이관하는 스크립트 또는 설정 페이지 버튼

5. **storage 계층**
   - `lib/storage.ts`: 로컬은 그대로 두고, “서버 사용 여부” 플래그 또는 환경에 따라
     - 우선 로컬만 사용 → 이후 `getTradeHistory` / `addTradeEvent`가 API를 호출하도록 확장
   - 또는 `lib/history.ts` 같은 별도 모듈에서 “로컬 + 서버 동기화” 담당

---

## 3. 매수 알림이 핸드폰으로 오면 좋겠음

### 현재 상태
- **알림 방식**: Web Push (VAPID) 사용
- **흐름**: 설정에서 “알림 켜기” → `subscribeToPushNotifications()` → `POST /api/notifications/subscribe`로 구독 정보 전달
- **전송**: `sendSignalNotification()` → `POST /api/notifications/send` → `web-push`로 구독자에게 푸시 전송
- **문제점**:
  1. **구독 저장**: `subscription-store.ts`가 **메모리(Map)** 에만 저장 → 서버 재시작 시 구독 정보 소실 → 재배포/재시작 후 알림 안 옴
  2. **핸드폰 수신**: Web Push는 **같은 브라우저에서 구독한 기기**로만 전달됨. 핸드폰에서 받으려면 **핸드폰 브라우저에서 사이트 접속 후 알림 허용**이 필요함 (PWA 권장).
  3. **매수 신호 발송 시점**: 현재는 대시보드/매수 페이지를 **사용자가 열었을 때** `sendSignalNotification`이 호출되는 구조로 보임. “실시간으로 매수 조건 만족 시 푸시”를 하려면 **주기적 크론/서버 로직**이 필요함.

### 보완 방향

| 목표 | 내용 |
|------|------|
| **핸드폰으로 수신** | Web Push를 핸드폰에서도 받을 수 있게 구독 유지 + (선택) Telegram/이메일 등 보조 채널 |
| **구독 유지** | 구독 정보를 DB에 저장해 재시작/재배포 후에도 푸시 전송 가능하게 |
| **실시간 매수 알림** | 주기적으로 시세·전략 확인 후 조건 충족 시에만 푸시 발송 (크론/스케줄러) |

### 작업 항목

1. **구독 정보 DB 저장 (필수)**
   - `lib/utils/subscription-store.ts`: 메모리 대신 **DB** 사용
   - 테이블(또는 컬렉션): `user_id`, `subscription` (JSON), `created_at`, `user_agent` 등
   - `saveSubscription` → DB insert/upsert, `getSubscription` / `getAllSubscriptions` → DB 조회
   - 배포 환경에 맞는 DB 선택 (Vercel Postgres, Supabase, MongoDB 등)

2. **핸드폰에서 Web Push 받기**
   - **설정/도움말 문구 추가**: “핸드폰에서도 알림을 받으려면: (1) 핸드폰 브라우저로 이 사이트 접속 (2) 알림 허용 (3) 가능하면 홈 화면에 추가(PWA)” 안내
   - **동일 사용자 다기기**: 로그인한 사용자별로 구독을 여러 개 저장 가능하게 하면, PC + 폰에서 각각 허용 시 둘 다 수신 가능

3. **매수 신호 자동 발송 (실시간에 가깝게)**
   - **방식 A (Vercel Cron)**  
     - `vercel.json`에 `crons: [{ "path": "/api/cron/check-signal", "schedule": "*/15 * * * *" }] }` 등 추가  
     - `app/api/cron/check-signal/route.ts`에서: 환율·시세 조회 → 전략 판정 → BUY/OVERBUY 등이면 해당 사용자(들)에게만 `sendSignalNotification` 호출  
     - 중복 알림 방지를 위해 “오늘 이미 이 신호로 알림 보냄” 플래그를 DB/캐시에 저장
   - **방식 B (외부 크론)**  
     - Upstash QStash, GitHub Actions scheduled workflow 등에서 동일 로직을 주기 호출

4. **보조 채널 (선택)**
   - **Telegram Bot**: 사용자가 봇과 연동 후 Chat ID 저장 → 매수 신호 시 `sendMessage`로 전송. 핸드폰 알림이 확실함.
   - **이메일**: Resend, SendGrid 등으로 “매수 신호” 메일 발송. 스팸/수신 설정 안내 필요.
   - 설정 페이지에 “알림 채널: 브라우저 푸시 / Telegram / 이메일” 선택 UI 추가 가능.

5. **보안**
   - Cron 경로는 `CRON_SECRET` 등으로 검증해 외부에서 임의 호출 불가하게 처리
   - DB에 저장하는 구독 객체는 민감하지 않지만, VAPID private key는 환경변수로만 관리 (이미 적용됨)

---

## 우선순위 제안

| 순서 | 항목 | 이유 |
|------|------|------|
| 1 | 매매내역 저장 (매수/매도 실행 시 addTradeEvent) | 구현 난이도 낮고, 사용자 체감이 큼 |
| 2 | 푸시 구독 DB 저장 | 재시작 후에도 알림이 가도록 하는 필수 조건 |
| 3 | 실시간 매수 알림 (Cron + 신호 체크) | “조건 만족 시 자동으로 푸시”를 위한 핵심 |
| 4 | 차트 확장 세션 (프리/애프터) | TradingView 옵션 조사 후 적용 |
| 5 | 매매내역 서버 저장 (API + DB) | 기기 간 동기화·영구 보관용 |
| 6 | 핸드폰 알림 안내 문구 + (선택) Telegram | 수신률·편의성 개선 |

---

## 체크리스트 요약

- [ ] **차트**: TradingView `session`/extended hours 옵션 적용
- [ ] **매수 페이지**: “실행 완료” 버튼 + `addTradeEvent` 호출
- [ ] **매도 페이지**: “실행 완료” 버튼 + `addTradeEvent` 호출
- [ ] **푸시 구독**: DB 저장 및 조회로 전환
- [ ] **매수 알림 자동화**: Cron API + 시세/전략 판정 + 푸시 발송
- [ ] **설정/도움말**: “핸드폰에서 알림 받는 방법” 안내
- [ ] (선택) 매매내역 API + DB 저장
- [ ] (선택) Telegram 또는 이메일 알림 채널

이 순서대로 적용하면 세 가지 문제를 모두 보완할 수 있습니다.
