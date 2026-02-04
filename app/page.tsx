'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { TrendingUp } from 'lucide-react';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-text-secondary">로딩 중...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="max-w-md w-full space-y-8">
        {/* 로고 */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
            <TrendingUp className="w-8 h-8 text-accent" />
          </div>
        </div>

        {/* 타이틀 */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-white">
            레버리지 투자 도우미 v1
          </h1>
          <p className="text-lg text-gray-400">
            규칙 기반 투자로 감정을 제거하고
            <br />
            현명한 투자 결정을 내리세요.
          </p>
        </div>

        {/* 구글 로그인 버튼 */}
        <div className="space-y-4 pt-4">
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-100 text-black rounded-lg font-semibold transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            구글로 시작하기
          </button>
        </div>

        {/* 하단 설명 */}
        <div className="text-center pt-6">
          <p className="text-sm text-gray-500">
            SOXL, TQQQ, UPRO 자동 매수/매도 타이밍 제공
          </p>
        </div>

        {/* 면책 고지 */}
        <div className="text-center pt-8">
          <p className="text-xs text-gray-600">
            본 서비스는 투자 자문이 아니며,
            <br />
            모든 투자 결정과 책임은 사용자 본인에게 있습니다.
          </p>
        </div>
      </div>
    </main>
  );
}
