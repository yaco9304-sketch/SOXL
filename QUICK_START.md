# 🚀 빠른 시작 가이드

프로젝트를 5분 안에 로컬에서 실행하고 배포까지 완료하는 가이드입니다.

---

## 📦 1단계: 설치 (1분)

```bash
npm install
```

---

## 🔑 2단계: 환경변수 설정 (3분)

### A. .env.local 파일 생성

```bash
cp .env.example .env.local
```

### B. Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성
3. "API 및 서비스" → "사용자 인증 정보" → "OAuth 클라이언트 ID" 생성
4. 승인된 리디렉션 URI: `http://localhost:3000/api/auth/callback/google`
5. 클라이언트 ID와 시크릿을 `.env.local`에 추가

### C. VAPID 키 생성

```bash
npm run generate-vapid
```

생성된 키를 `.env.local`에 추가

### D. NextAuth Secret 생성

PowerShell:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

또는 온라인: https://generate-secret.vercel.app/32

`.env.local` 예시:
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=생성한_시크릿_키
GOOGLE_CLIENT_ID=구글_클라이언트_ID
GOOGLE_CLIENT_SECRET=구글_클라이언트_시크릿
NEXT_PUBLIC_VAPID_PUBLIC_KEY=VAPID_공개키
VAPID_PRIVATE_KEY=VAPID_비밀키
VAPID_SUBJECT=mailto:your-email@example.com
```

---

## 🏃 3단계: 실행 (30초)

```bash
npm run dev
```

http://localhost:3000 접속!

---

## ✅ 4단계: 배포 준비 체크 (30초)

```bash
npm run check-deploy
npm run build
```

---

## 🚀 5단계: Vercel 배포 (1분)

### 처음 배포하는 경우

```bash
npm install -g vercel
vercel login
vercel
```

### Vercel 환경변수 설정

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 → Settings → Environment Variables
3. `.env.local`의 모든 변수를 추가 (단, `NEXTAUTH_URL`은 Vercel URL로 변경)

### 프로덕션 배포

```bash
vercel --prod
```

---

## 🔧 배포 후 설정 (1분)

### 1. Google OAuth 리디렉션 URI 추가

Google Cloud Console에서:
- `https://your-project.vercel.app/api/auth/callback/google` 추가

### 2. NEXTAUTH_URL 업데이트

Vercel Dashboard에서 환경변수 수정:
- `NEXTAUTH_URL=https://your-project.vercel.app`

### 3. 재배포

Vercel Dashboard → Deployments → Redeploy

---

## 🎉 완료!

이제 앱이 실행 중입니다!

- 로컬: http://localhost:3000
- 프로덕션: https://your-project.vercel.app

---

## 🆘 문제 해결

### "Error: NEXTAUTH_URL is not set"
→ `.env.local`에 `NEXTAUTH_URL` 추가

### Google 로그인 실패
→ 리디렉션 URI 확인

### 푸시 알림 안 됨
→ HTTPS 환경에서만 작동 (로컬은 localhost OK)

### 빌드 에러
→ `npm install` 다시 실행

---

## 📚 더 알아보기

- [상세 배포 가이드](./DEPLOYMENT.md)
- [배포 체크리스트](./CHECKLIST.md)
- [프로젝트 README](./README.md)
