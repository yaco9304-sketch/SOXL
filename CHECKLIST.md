# ✅ 배포 전 체크리스트

배포하기 전에 다음 항목들을 확인하세요.

## 🔐 환경변수

- [ ] `.env.local` 파일이 생성되어 있음
- [ ] `NEXTAUTH_URL` 설정됨
- [ ] `NEXTAUTH_SECRET` 설정됨 (32자 이상 랜덤 문자열)
- [ ] `GOOGLE_CLIENT_ID` 설정됨
- [ ] `GOOGLE_CLIENT_SECRET` 설정됨
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` 설정됨
- [ ] `VAPID_PRIVATE_KEY` 설정됨
- [ ] `VAPID_SUBJECT` 설정됨 (실제 이메일)

## 🔑 Google OAuth

- [ ] Google Cloud Console에서 OAuth 클라이언트 생성
- [ ] 승인된 리디렉션 URI에 로컬 URL 추가:
  - `http://localhost:3000/api/auth/callback/google`
- [ ] 배포 후 프로덕션 URL도 추가 예정

## 🔔 푸시 알림

- [ ] VAPID 키 생성 완료 (`node scripts/generate-vapid-keys.js`)
- [ ] Service Worker 파일 존재 (`public/sw.js`)
- [ ] 로컬에서 푸시 알림 테스트 완료

## 🧪 빌드 테스트

- [ ] `npm install` 실행 완료
- [ ] `npm run build` 에러 없이 완료
- [ ] `npm run start`로 프로덕션 빌드 테스트
- [ ] 브라우저에서 http://localhost:3000 접속 확인

## 🧩 기능 테스트

- [ ] Google 로그인 작동
- [ ] 대시보드 데이터 로드
- [ ] 매수 페이지 정상 작동
- [ ] 매도 페이지 정상 작동
- [ ] 설정 페이지에서 값 저장/불러오기
- [ ] 푸시 알림 On/Off 작동
- [ ] 테스트 알림 전송 작동

## 📁 파일 확인

- [ ] `.gitignore`에 `.env*.local` 포함됨
- [ ] 불필요한 파일이 git에 포함되지 않음
- [ ] `README.md` 업데이트
- [ ] `DEPLOYMENT.md` 작성

## 🚀 Vercel 배포

- [ ] Vercel 계정 생성/로그인
- [ ] GitHub 저장소 생성 (선택)
- [ ] Vercel에서 프로젝트 import
- [ ] 환경변수 Vercel에 추가
- [ ] 배포 성공

## 🔧 배포 후 설정

- [ ] `NEXTAUTH_URL`을 프로덕션 URL로 변경
- [ ] Google OAuth에 프로덕션 리디렉션 URI 추가:
  - `https://your-project.vercel.app/api/auth/callback/google`
- [ ] Vercel에서 재배포
- [ ] 프로덕션 환경에서 로그인 테스트
- [ ] 푸시 알림 테스트 (HTTPS 필수)

## 📊 모니터링

- [ ] Vercel Analytics 활성화 (선택)
- [ ] 에러 로깅 설정 (선택)
- [ ] 성능 모니터링 설정 (선택)

---

## 🆘 문제가 생겼을 때

1. **Vercel 로그 확인**: Vercel Dashboard → Deployments → 로그 확인
2. **브라우저 콘솔 확인**: F12 → Console 탭
3. **환경변수 재확인**: Vercel Dashboard → Settings → Environment Variables
4. **재배포**: Vercel Dashboard → Deployments → Redeploy

---

## 📞 도움말

- [DEPLOYMENT.md](./DEPLOYMENT.md) - 상세 배포 가이드
- [README.md](./README.md) - 프로젝트 개요
- [Vercel 문서](https://vercel.com/docs)
