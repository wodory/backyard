'use client';

import { useState } from 'react';

import { setCookie } from 'cookies-next';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn, signUp, signInWithGoogle } from '@/lib/auth';
import createLogger from '@/lib/logger';

// 로거 생성
const logger = createLogger('AuthForm');

type AuthMode = 'login' | 'register';

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    // 폼 초기화
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { session } = await signIn(email, password);

        // 추가: 쿠키를 여기서도 직접 설정 (보완책)
        if (session) {
          // 현재 호스트 가져오기
          const host = window.location.hostname;
          const isLocalhost = host === 'localhost' || host === '127.0.0.1';

          // 도메인 설정 (로컬호스트가 아닌 경우에만)
          let domain = undefined;
          if (!isLocalhost) {
            // 서브도메인 포함하기 위해 최상위 도메인만 설정
            const hostParts = host.split('.');
            if (hostParts.length > 1) {
              // vercel.app 또는 yoursite.com 형태일 경우
              domain = '.' + hostParts.slice(-2).join('.');
            } else {
              domain = host;
            }
          }

          // cookies-next 라이브러리 사용
          setCookie('sb-access-token', session.access_token, {
            maxAge: 60 * 60 * 24 * 7, // 7일
            path: '/',
            domain: domain,
            secure: window.location.protocol === 'https:',
            sameSite: 'lax'
          });

          if (session.refresh_token) {
            setCookie('sb-refresh-token', session.refresh_token, {
              maxAge: 60 * 60 * 24 * 30, // 30일
              path: '/',
              domain: domain,
              secure: window.location.protocol === 'https:',
              sameSite: 'lax'
            });
          }

          console.log('AuthForm: 쿠키에 인증 정보 저장됨', {
            호스트: host,
            도메인설정: domain || '없음'
          });
        }

        toast.success('로그인 성공!');
      } else {
        await signUp(email, password, name);
        toast.success('회원가입 성공! 이메일을 확인해주세요.');
      }

      // 성공 후 리디렉션 또는 상태 업데이트
      window.location.href = '/';
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '인증 중 오류가 발생했습니다.';
      logger.error('인증 오류:', {
        에러메시지: errorMessage,
        스택: error instanceof Error ? error.stack : ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    console.log('[AuthForm][1] Google 로그인 버튼 클릭됨', {
      환경: process.env.NODE_ENV,
      타임스탬프: new Date().toISOString(),
      window_location: typeof window !== 'undefined' ? window.location.href : '알 수 없음'
    });

    try {
      console.log('[AuthForm][2] signInWithGoogle 함수 호출 시작');
      await signInWithGoogle();
      console.log('[AuthForm][3] signInWithGoogle 함수 호출 성공 - 리디렉션 대기 중...');
      // 리디렉션은 Google OAuth 콜백 처리에서 이루어집니다.
    } catch (error: unknown) {
      console.error('[AuthForm][오류] Google 로그인 오류:', {
        에러메시지: error instanceof Error ? error.message : '알 수 없는 오류',
        스택: error instanceof Error ? error.stack : '',
        타입: typeof error,
        객체: error
      });
      const errorMessage = error instanceof Error ? error.message : 'Google 로그인 중 오류가 발생했습니다.';
      toast.error(errorMessage);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {mode === 'login' ? '로그인' : '회원가입'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {mode === 'login'
            ? '백야드에 오신 것을 환영합니다!'
            : '새 계정을 만들어 시작하세요.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading
            ? '처리 중...'
            : mode === 'login'
              ? '로그인'
              : '회원가입'}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {isGoogleLoading ? "처리 중..." : "Google로 계속하기"}
        </Button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-blue-600 hover:underline"
          >
            {mode === 'login'
              ? '계정이 없으신가요? 회원가입'
              : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </form>
    </div>
  );
} 