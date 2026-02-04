# 🚀 배포 가이드 (한글 사용자 이름 에러 해결)

## ❌ 문제
`vercel login` 실행 시 한글 사용자 이름으로 인한 HTTP 헤더 에러 발생

## ✅ 해결 방법: GitHub 연동 배포

### 1단계: Git 사용자 설정

PowerShell에서 실행:

```powershell
git config --global user.email "your-email@example.com"
git config --global user.name "YourName"
```

**예시:**
```powershell
git config --global user.email "myemail@gmail.com"
git config --global user.name "Kim"
```

### 2단계: Git 커밋

```powershell
cd C:\Users\yaco9\OneDrive\Desktop\vibecoding\2026\SOXL
git add .
git commit -m "Initial commit"
```

### 3단계: GitHub 저장소 생성

1. [GitHub](https://github.com) 접속 및 로그인
2. 우측 상단 **+** → **New repository** 클릭
3. Repository name: `soxl-trading` (또는 원하는 이름)
4. **Public** 선택
5. **Create repository** 클릭

### 4단계: GitHub에 푸시

GitHub에서 제공하는 명령어 복사 후 실행:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/soxl-trading.git
git branch -M main
git push -u origin main
```

**GitHub 인증:**
- Username: GitHub 아이디
- Password: **Personal Access Token** (비밀번호 아님!)

**Personal Access Token 생성:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. **Generate new token (classic)** 클릭
3. Note: "SOXL Deploy"
4. Expiration: 90 days (또는 원하는 기간)
5. **repo** 체크박스 선택
6. **Generate token** 클릭
7. 생성된 토큰 복사 (다시 볼 수 없으니 저장!)

### 5단계: Vercel에서 Import

1. [Vercel Dashboard](https://vercel.com/new) 접속
2. **Import Git Repository** 선택
3. GitHub 연동 허용
4. 방금 생성한 `soxl-trading` 저장소 선택
5. **Import** 클릭

### 6단계: 환경변수 설정

배포 전 환경변수 설정 화면:

```
NEXTAUTH_URL = https://your-project.vercel.app (자동 생성됨)
NEXTAUTH_SECRET = your-secret-key
GOOGLE_CLIENT_ID = your-google-client-id
GOOGLE_CLIENT_SECRET = your-google-client-secret
NEXT_PUBLIC_VAPID_PUBLIC_KEY = your-vapid-public-key
VAPID_PRIVATE_KEY = your-vapid-private-key
VAPID_SUBJECT = mailto:your-email@example.com
```

### 7단계: 배포

**Deploy** 클릭!

---

## 🔄 이후 배포 (자동)

GitHub에 push하면 자동으로 배포됩니다:

```powershell
git add .
git commit -m "Update feature"
git push
```

---

## 🆘 문제 해결

### Git Push 실패 (인증 에러)
→ Personal Access Token을 비밀번호로 사용하세요 (GitHub 비밀번호 아님)

### Vercel 배포 실패
→ Vercel Dashboard → Deployments → 로그 확인

### 환경변수 에러
→ Vercel Dashboard → Settings → Environment Variables 재확인

---

## 💡 대안: Vercel CLI 업데이트 시도

CLI 문제가 해결될 수도 있습니다:

```powershell
npm uninstall -g vercel
npm install -g vercel@latest
vercel login
```

여전히 에러 발생 시 GitHub 방법 사용!

---

## 📞 참고 링크

- [GitHub 가이드](https://docs.github.com/ko/get-started/quickstart/create-a-repo)
- [Vercel Git Integration](https://vercel.com/docs/concepts/git)
- [Personal Access Token 생성](https://docs.github.com/ko/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
