# 📈 Safety Trading

레버리지 ETF 투자에서 감정 개입을 제거하고, 사전에 정의된 규칙만 실행하도록 돕는 웹 도구

> 💡 **핵심 원칙**: 이 웹은 돈을 벌게 해주지 않습니다. 대신, 돈을 잃는 행동을 못 하게 만듭니다.

## 🎯 주요 기능

- **구글 로그인**: 안전한 인증으로 개인 데이터 보호
- **실시간 시세 조회**: Yahoo Finance API를 통한 멀티 심볼 지원 (SOXL, TQQQ, UPRO)
- **원화 기반 예산 관리**: 실시간 환율로 KRW 기준 투자 관리
- **매수/매도 분리**: 각각 전용 페이지로 명확한 의사결정
- **자동 행동 판정**: 전일 대비 하락률 기반 매수/매도/중단 신호
- **푸시 알림**: 매수/매도 신호 발생 시 브라우저 알림 (PWA)
- **일일 체크리스트**: 감정 배제, 숫자 기반 의사결정
- **중단 규칙**: 연속 하락, 예산 초과 등 자동 매수 중단

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example` 파일을 참고하여 `.env.local` 파일을 생성하세요:

```bash
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth 설정
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Google OAuth 설정 방법

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. "API 및 서비스" > "사용자 인증 정보" 이동
4. "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 선택
5. 애플리케이션 유형: "웹 애플리케이션"
6. 승인된 리디렉션 URI 추가:
   - `http://localhost:3000/api/auth/callback/google` (개발)
   - `https://your-domain.com/api/auth/callback/google` (운영)
7. 생성된 클라이언트 ID와 시크릿을 `.env.local`에 추가

#### NEXTAUTH_SECRET 생성

```bash
openssl rand -base64 32
```

#### VAPID 키 생성 (푸시 알림용)

```bash
node scripts/generate-vapid-keys.js
```

생성된 키를 `.env.local`에 추가:
```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=생성된_공개키
VAPID_PRIVATE_KEY=생성된_비밀키
VAPID_SUBJECT=mailto:your-email@example.com
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 4. 사용 방법

1. Google 계정으로 로그인
2. 설정 페이지에서 예산, 매수/매도 비율 설정
3. **설정 페이지에서 푸시 알림 활성화** (권장)
4. 대시보드에서 전체 현황 확인
5. 매수 페이지에서 매수 타이밍 체크
6. 매도 페이지에서 매도 타이밍 체크

### 5. 알림 설정

푸시 알림을 활성화하면 매수/매도 신호가 발생했을 때 즉시 알림을 받을 수 있습니다:

1. 설정 페이지 접속
2. "알림 설정" 섹션에서 "푸시 알림" 토글 켜기
3. 브라우저에서 알림 권한 허용
4. "테스트 알림 보내기" 버튼으로 작동 확인

**지원 브라우저:**
- Chrome, Edge, Firefox (데스크톱/모바일)
- Safari (iOS 16.4+ 필요)

## 📁 프로젝트 구조

```
SOXL/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth 인증
│   │   ├── quote/         # 시세 조회
│   │   ├── exchange-rate/ # 환율 조회
│   │   └── action/        # 행동 판정
│   ├── dashboard/         # 대시보드 (통합 현황)
│   ├── buy/              # 매수 전용 페이지
│   ├── sell/             # 매도 전용 페이지
│   ├── settings/         # 설정 페이지
│   ├── history/          # 거래 히스토리
│   └── page.tsx          # 랜딩페이지 (로그인)
├── components/           # React 컴포넌트
│   ├── dashboard/        # 대시보드 컴포넌트
│   ├── layout/           # Navbar 등
│   ├── providers/        # SessionProvider
│   └── common/           # 공통 컴포넌트
├── lib/                  # 유틸리티 & 로직
│   ├── auth.ts           # NextAuth 설정
│   ├── strategy/         # 전략 규칙
│   ├── utils/            # 유틸리티 함수
│   └── storage.ts        # LocalStorage 관리
├── types/                # TypeScript 타입 정의
└── font/                 # 나눔고딕 폰트
```

## 🛡️ 면책 고지

⚠️ **중요**

- 본 서비스는 투자 자문이 아닙니다
- 모든 투자 결정과 책임은 사용자 본인에게 있습니다
- 본 서비스는 투자 수익을 보장하지 않습니다
- 레버리지 ETF는 원금 손실 위험이 높은 상품입니다
- 데이터는 15분 지연될 수 있으며 정확성을 보장하지 않습니다

## 📊 적용 전략

### 매수 규칙

| 조건 | 행동 |
|------|------|
| 전일 대비 -7~-8% | 총 예산의 3~4% 매수 |
| 전일 대비 -16% 이상 | 총 예산의 8~10% 매수 |

### 매수 중단 규칙 (최우선)

- 연속 하락 3회 발생
- 급락 후 5일 내 반등 실패
- 총 예산 50% 이상 사용
- 평균 단가 대비 -30% 손실

### 매도 규칙

- 급락 후 +8~12% 반등 → 30~50% 매도
- 평균 단가 대비 +15~25% → 40~50% 매도

## 🛠️ 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Authentication**: NextAuth.js (Google OAuth)
- **Styling**: Tailwind CSS
- **Font**: NanumGothic (나눔고딕)
- **API**: 
  - Yahoo Finance (시세 조회)
  - exchangerate-api.com (환율 조회)
- **Storage**: LocalStorage (클라이언트 사이드)
- **Hosting**: Vercel (권장)

## 📝 개발 상태

- [x] Phase 1: MVP 완료
- [x] Phase 2: 이벤트 히스토리 완료
- [x] Phase 3: 멀티 심볼 & PWA 완료
- [x] Phase 4: 구글 로그인 & 매수/매도 분리 완료
- [x] Phase 5: 원화 기반 예산 관리 & 실시간 환율 완료
- [x] Phase 6: 푸시 알림 시스템 완료

## 🚀 배포

### Vercel 배포 (권장)

1. **빌드 테스트**
   ```bash
   npm run build
   ```

2. **Vercel CLI 설치 및 배포**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

3. **환경변수 설정**
   - Vercel Dashboard → Settings → Environment Variables
   - 모든 환경변수 추가 (NEXTAUTH_URL, GOOGLE_CLIENT_ID, VAPID 키 등)

4. **프로덕션 배포**
   ```bash
   vercel --prod
   ```

5. **Google OAuth 리디렉션 URI 추가**
   - `https://your-project.vercel.app/api/auth/callback/google`

**자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.**

---

## 📄 라이센스

MIT License
