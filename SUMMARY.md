# 📊 프로젝트 요약

## 🎯 프로젝트 개요

**레버리지 투자 도우미 v1**은 감정을 제거하고 규칙 기반으로 레버리지 ETF(SOXL, TQQQ, UPRO) 투자를 돕는 웹 애플리케이션입니다.

---

## ✨ 주요 기능

### 1. 인증 & 보안
- ✅ Google OAuth 로그인
- ✅ NextAuth.js 세션 관리
- ✅ 보호된 라우트

### 2. 투자 분석
- ✅ 실시간 시세 조회 (Yahoo Finance API)
- ✅ 원화(KRW) 기반 예산 관리
- ✅ 실시간 환율 연동
- ✅ 자동 매수/매도 신호 판정
- ✅ 체계적 위험 관리 (중단 규칙)

### 3. 사용자 경험
- ✅ 직관적인 대시보드
- ✅ 매수/매도 전용 페이지 분리
- ✅ investing.com 스타일 다크 테마
- ✅ 나눔고딕 폰트 적용
- ✅ 반응형 디자인 (모바일/태블릿/데스크톱)

### 4. 알림 시스템
- ✅ 웹 푸시 알림 (PWA)
- ✅ 매수/매도 신호 자동 알림
- ✅ Service Worker 기반
- ✅ 알림 On/Off 설정

### 5. 데이터 관리
- ✅ LocalStorage 기반 설정 저장
- ✅ 거래 히스토리 추적
- ✅ 멀티 심볼 지원 (SOXL, TQQQ, UPRO)

---

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Font**: NanumGothic

### Backend
- **Authentication**: NextAuth.js (Google OAuth)
- **API**: Next.js API Routes
- **Push Notifications**: Web Push API + Service Worker

### External APIs
- **Stock Quotes**: Yahoo Finance (무료)
- **Exchange Rate**: exchangerate-api.com

### Deployment
- **Platform**: Vercel (권장)
- **Region**: Seoul (icn1)
- **SSL**: 자동 (Let's Encrypt)

---

## 📁 프로젝트 구조

```
SOXL/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # NextAuth 인증
│   │   ├── quote/           # 시세 조회
│   │   ├── exchange-rate/   # 환율 조회
│   │   ├── action/          # 행동 판정
│   │   └── notifications/   # 푸시 알림
│   ├── dashboard/           # 대시보드
│   ├── buy/                 # 매수 페이지
│   ├── sell/                # 매도 페이지
│   ├── settings/            # 설정 페이지
│   ├── history/             # 거래 히스토리
│   ├── page.tsx             # 랜딩페이지
│   └── globals.css          # 글로벌 스타일
├── components/              # React 컴포넌트
│   ├── dashboard/          # 대시보드 컴포넌트
│   ├── layout/             # Navbar 등
│   ├── providers/          # SessionProvider
│   └── common/             # 공통 컴포넌트
├── lib/                     # 유틸리티 & 로직
│   ├── auth.ts             # NextAuth 설정
│   ├── storage.ts          # LocalStorage 관리
│   ├── strategy/           # 투자 전략 규칙
│   └── utils/              # 유틸리티 함수
├── types/                   # TypeScript 타입
├── public/                  # 정적 파일
│   ├── sw.js               # Service Worker
│   ├── manifest.json       # PWA 매니페스트
│   └── fonts/              # 나눔고딕 폰트
├── scripts/                 # 유틸리티 스크립트
│   ├── generate-vapid-keys.js
│   └── check-deployment.js
├── docs/                    # 문서
├── font/                    # 원본 폰트 파일
├── vercel.json             # Vercel 설정
├── DEPLOYMENT.md           # 상세 배포 가이드
├── CHECKLIST.md            # 배포 체크리스트
├── QUICK_START.md          # 빠른 시작 가이드
└── README.md               # 프로젝트 개요
```

---

## 📊 투자 전략 규칙

### 매수 규칙
| 조건 | 행동 | 비율 |
|------|------|------|
| 전일 대비 -7~-8% | 정규 매수 | 총 예산의 3~4% |
| 전일 대비 -16% 이상 | 과매수 | 총 예산의 8~10% |

### 매수 중단 규칙 (최우선)
- 연속 하락 3회 발생
- 급락 후 5일 내 반등 실패
- 총 예산 50% 이상 사용
- 평균 단가 대비 -30% 손실

### 매도 규칙
- 급락 후 +8~12% 반등 → 보유량의 30~50% 매도
- 평균 단가 대비 +15~25% → 보유량의 40~50% 매도

---

## 🚀 배포 현황

### 개발 환경
- **URL**: http://localhost:3000
- **상태**: 개발 중

### 프로덕션 환경
- **플랫폼**: Vercel (예정)
- **URL**: TBD
- **상태**: 배포 준비 완료

---

## 📈 개발 단계

- [x] **Phase 1**: MVP 기능 (시세 조회, 행동 판정, 체크리스트)
- [x] **Phase 2**: 거래 히스토리 & 이벤트 추적
- [x] **Phase 3**: 멀티 심볼 지원 & PWA
- [x] **Phase 4**: Google 로그인 & 매수/매도 페이지 분리
- [x] **Phase 5**: 원화 기반 예산 관리 & 실시간 환율
- [x] **Phase 6**: 푸시 알림 시스템
- [x] **Phase 7**: 배포 준비 & 문서화

---

## 🎯 향후 계획

### 단기 (1-2주)
- [ ] 프로덕션 배포
- [ ] 사용자 피드백 수집
- [ ] 버그 수정 & 성능 최적화

### 중기 (1-2개월)
- [ ] 데이터베이스 연동 (Supabase or Prisma)
- [ ] 사용자별 데이터 저장
- [ ] 이메일 알림 추가
- [ ] 백테스팅 기능

### 장기 (3개월+)
- [ ] AI 기반 추천 시스템
- [ ] 포트폴리오 분석 도구
- [ ] 소셜 기능 (커뮤니티)
- [ ] 모바일 앱 (React Native)

---

## 📞 문서 링크

- [README.md](./README.md) - 프로젝트 개요
- [QUICK_START.md](./QUICK_START.md) - 5분 시작 가이드
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 상세 배포 가이드
- [CHECKLIST.md](./CHECKLIST.md) - 배포 체크리스트
- [plan.md](./plan.md) - 개발 계획서

---

## 💰 비용 (무료!)

- **Next.js**: 무료 (오픈소스)
- **Vercel**: 무료 플랜 (개인 프로젝트)
- **Yahoo Finance API**: 무료
- **Exchange Rate API**: 무료
- **Google OAuth**: 무료
- **Let's Encrypt SSL**: 무료

**총 비용: $0/월** 🎉

---

## 📄 라이센스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

---

## 🙏 감사의 말

- Next.js 팀
- Vercel
- Tailwind CSS
- 나눔고딕 폰트
- 오픈소스 커뮤니티
