# 🚀 배포 가이드

## 📋 배포 전 체크리스트

### 1. 필수 환경변수 확인

다음 환경변수들이 `.env.local`에 설정되어 있는지 확인하세요:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000  # 배포 시 실제 도메인으로 변경
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# VAPID (푸시 알림)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:your-email@example.com

# Vercel Cron (선택 - 프로덕션 보안용)
CRON_SECRET=your-cron-secret-key
```

### 2. Google OAuth 리디렉션 URI 추가

[Google Cloud Console](https://console.cloud.google.com/) → "사용자 인증 정보" → OAuth 클라이언트:

- 승인된 리디렉션 URI에 추가:
  - `https://your-domain.vercel.app/api/auth/callback/google`
  - 커스텀 도메인 사용 시: `https://your-domain.com/api/auth/callback/google`

### 3. 빌드 테스트

```bash
npm run build
```

에러 없이 빌드가 완료되는지 확인하세요.

---

## 🌐 Vercel 배포 (권장)

### 방법 1: CLI 배포

#### 1단계: Vercel CLI 설치

```bash
npm install -g vercel
```

#### 2단계: 로그인

```bashv
vercel login
```

#### 3단계: 배포

```bash
vercel
```

처음 실행 시 몇 가지 질문에 답하세요:
- Set up and deploy? **Yes**
- Which scope? **본인 계정 선택**
- Link to existing project? **No**
- What's your project's name? **soxl-safety-tradng** (또는 원하는 이름)
- In which directory? **./** (엔터)
- Override settings? **No**

#### 4단계: 환경변수 설정

Vercel 대시보드에서 프로젝트 설정:

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables**
4. 다음 환경변수 추가:

```
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:your-email@example.com
```

#### 5단계: 프로덕션 배포

```bash
vercel --prod
```

---

### 방법 2: GitHub 연동 (자동 배포)

#### 1단계: GitHub 저장소 생성

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/soxl-safety-trading.git
git push -u origin main
```

#### 2단계: Vercel에서 Import

1. [Vercel Dashboard](https://vercel.com/new) 접속
2. **Import Project** 클릭
3. GitHub 저장소 선택
4. **Import** 클릭

#### 3단계: 환경변수 설정

배포 전 환경변수 설정 화면에서 모든 환경변수 입력

#### 4단계: 배포

**Deploy** 클릭하면 자동 배포 시작

#### 5단계: 자동 배포 설정

이제부터 `main` 브랜치에 push하면 자동으로 배포됩니다!

```bash
git add .
git commit -m "Update feature"
git push
```

---

## ⏰ GitHub Actions Cron 설정 (매일 20:00 KST 푸시 알림)

GitHub Actions를 사용하여 매일 자동으로 푸시 알림을 발송합니다 (무료).

### 설정 방법

#### 1. GitHub Repository Secrets 추가

GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

다음 2개의 Secret을 추가하세요:

| Name | Value | 설명 |
|------|-------|------|
| `APP_URL` | `https://your-app.vercel.app` | 배포된 앱 URL |
| `CRON_SECRET` | `your-random-secret` | API 인증용 비밀키 |

#### 2. Vercel 환경변수에도 CRON_SECRET 추가

Vercel Dashboard → 프로젝트 → **Settings** → **Environment Variables**

```
CRON_SECRET=your-random-secret  # GitHub Secret과 동일한 값
```

#### 3. 자동 실행

GitHub에 push하면 `.github/workflows/daily-alert.yml` 워크플로우가 등록됩니다.

- **실행 시간**: 매일 11:00 UTC = **20:00 KST**
- **수동 실행**: GitHub → Actions → Daily SOXL Alert → Run workflow

### 워크플로우 파일

`.github/workflows/daily-alert.yml`:

```yaml
name: Daily SOXL Alert

on:
  schedule:
    - cron: '0 11 * * *'  # 매일 20:00 KST
  workflow_dispatch:       # 수동 실행 가능

jobs:
  send-alert:
    runs-on: ubuntu-latest
    steps:
      - name: Send Daily Alert
        run: |
          curl -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            "${{ secrets.APP_URL }}/api/cron/daily-alert"
```

### 실행 확인

GitHub → **Actions** 탭에서 실행 로그를 확인할 수 있습니다.

---

## 🔧 배포 후 설정

### 1. NEXTAUTH_URL 업데이트

배포 완료 후 Vercel이 제공하는 URL로 업데이트:

- Vercel Dashboard → Settings → Environment Variables
- `NEXTAUTH_URL`을 `https://your-project.vercel.app`로 변경
- **Redeploy** 클릭

### 2. Google OAuth 리디렉션 URI 확인

Google Cloud Console에서 승인된 리디렉션 URI 확인:
- `https://your-project.vercel.app/api/auth/callback/google`

### 3. PWA 설정 확인

Service Worker가 HTTPS에서만 작동하므로 배포 후에는 자동으로 활성화됩니다.

---

## 🌍 커스텀 도메인 설정 (선택)

### 1. Vercel에서 도메인 추가

1. Vercel Dashboard → 프로젝트 → **Settings** → **Domains**
2. 도메인 입력 (예: `soxl-trading.com`)
3. DNS 설정 안내에 따라 도메인 레지스트라에서 설정

### 2. DNS 설정 예시 (대부분의 레지스트라)

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### 3. SSL 인증서

Vercel이 자동으로 Let's Encrypt SSL 인증서를 발급합니다 (무료).

### 4. 환경변수 업데이트

`NEXTAUTH_URL`을 커스텀 도메인으로 변경:
```
NEXTAUTH_URL=https://your-domain.com
```

---

## 📊 모니터링 & 분석

### Vercel Analytics (무료)

Vercel Dashboard → 프로젝트 → **Analytics**에서 확인 가능:
- 페이지 뷰
- 사용자 수
- 성능 메트릭

### Google Analytics 추가 (선택)

`app/layout.tsx`에 추가:

```typescript
import Script from 'next/script';

// Google Analytics ID
const GA_ID = 'G-XXXXXXXXXX';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 🔒 보안 체크리스트

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 모든 비밀 키가 GitHub에 업로드되지 않았는지 확인
- [ ] Vercel 환경변수에 모든 키가 올바르게 설정되어 있는지 확인
- [ ] Google OAuth 리디렉션 URI가 정확한지 확인
- [ ] HTTPS가 활성화되어 있는지 확인 (Vercel 자동)

---

## 🚨 문제 해결

### 1. "Error: NEXTAUTH_URL is not set"

**해결**: Vercel 환경변수에 `NEXTAUTH_URL` 추가 후 재배포

### 2. Google 로그인 실패

**해결**: 
1. Google Cloud Console에서 리디렉션 URI 확인
2. `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 환경변수 확인
3. Vercel에서 재배포

### 3. 푸시 알림이 작동하지 않음

**해결**:
1. HTTPS 확인 (로컬에서는 localhost, 배포에서는 HTTPS 필수)
2. Service Worker 등록 확인 (개발자 도구 → Application → Service Workers)
3. VAPID 키 확인

### 4. 빌드 에러

**해결**:
```bash
# 로컬에서 빌드 테스트
npm run build

# 에러 확인 후 수정
# package.json의 dependencies 확인
```

---

## 📈 배포 후 최적화

### 1. 이미지 최적화

Next.js의 Image 컴포넌트 사용:

```typescript
import Image from 'next/image';

<Image 
  src="/logo.png" 
  width={200} 
  height={200} 
  alt="Logo"
  priority
/>
```

### 2. 폰트 최적화

이미 나눔고딕을 로컬 폰트로 사용 중이므로 최적화 완료 ✅

### 3. 캐싱 전략

Vercel이 자동으로 정적 파일을 CDN에 캐싱합니다.

---

## 💰 비용

### Vercel 무료 플랜

- **대역폭**: 100GB/월
- **빌드 시간**: 6,000분/월
- **함수 실행**: 10만 번/월
- **커스텀 도메인**: 무제한
- **SSL**: 자동 (무료)

개인 프로젝트나 소규모 서비스에 충분합니다!

### Pro 플랜 ($20/월)

사용자가 증가하면 Pro 플랜으로 업그레이드:
- 대역폭 무제한
- 더 많은 빌드 시간
- 더 빠른 빌드

---

## 📞 지원

- [Vercel 문서](https://vercel.com/docs)
- [Next.js 문서](https://nextjs.org/docs)
- [NextAuth.js 문서](https://next-auth.js.org/)
