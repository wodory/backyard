'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';

// 실제 콜백 처리를 담당하는 컴포넌트
function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        
        console.log('[Callback] 인증 콜백 처리 시작');
        
        // 디버깅: 로컬 스토리지 상태 확인
        if (typeof window !== 'undefined') {
          const verifier = localStorage.getItem('supabase.auth.code_verifier');
          const backupVerifier = sessionStorage.getItem('auth.code_verifier.backup');
          
          console.log('[Callback] 로컬 스토리지 상태:', {
            code: code ? `${code.substring(0, 10)}...` : '없음',
            code_verifier: verifier ? `${verifier.substring(0, 5)}...${verifier.substring(verifier.length - 5)} (길이: ${verifier.length})` : '없음',
            backup_verifier: backupVerifier ? `${backupVerifier.substring(0, 5)}...${backupVerifier.substring(backupVerifier.length - 5)} (길이: ${backupVerifier.length})` : '없음',
            localStorage_keys: Object.keys(localStorage).filter(key => key.startsWith('supabase')),
            sessionStorage_keys: Object.keys(sessionStorage)
          });
          
          // 백업에서 복원 시도
          if (!verifier && backupVerifier) {
            console.log('[Callback] 백업에서 code_verifier 복원 시도');
            localStorage.setItem('supabase.auth.code_verifier', backupVerifier);
          }
        }
        
        if (!code) {
          console.error('[Callback] 인증 코드가 없습니다.');
          setError('인증 코드가 없습니다.');
          router.push('/login?error=missing_code');
          return;
        }
        
        // Supabase 클라이언트 생성
        const supabase = createBrowserSupabaseClient();
        
        // 코드 교환 시도
        console.log('[Callback] 코드를 세션으로 교환 시도 중...');
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.error('[Callback] 세션 교환 오류:', exchangeError.message);
          setError(exchangeError.message);
          router.push(`/login?error=auth_error&message=${encodeURIComponent(exchangeError.message)}`);
          return;
        }
        
        if (!data.session) {
          console.error('[Callback] 세션이 생성되지 않았습니다.');
          setError('세션이 생성되지 않았습니다.');
          router.push('/login?error=no_session');
          return;
        }
        
        // 쿠키 확인
        const allCookies = document.cookie.split(';').map(cookie => cookie.trim());
        console.log('[Callback] 세션 생성 후 쿠키 확인:', {
          allCookies,
          accessTokenExists: allCookies.some(c => c.startsWith('sb-access-token=')),
          refreshTokenExists: allCookies.some(c => c.startsWith('sb-refresh-token='))
        });
        
        // 세션 스토리지 정리
        sessionStorage.removeItem('auth.code_verifier.backup');
        
        console.log('[Callback] 인증 성공. 유저 정보:', {
          userId: data.session.user.id,
          email: data.session.user.email
        });
        
        // 성공 시 보드 페이지로 리디렉션
        setLoading(false);
        router.push('/board');
      } catch (err: any) {
        console.error('[Callback] 예상치 못한 오류:', err.message);
        setError(err.message || '알 수 없는 오류가 발생했습니다.');
        router.push(`/login?error=unexpected&message=${encodeURIComponent(err.message || '알 수 없는 오류')}`);
      }
    };
    
    handleCallback();
  }, [router, searchParams]);
  
  return (
    <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
      {loading ? (
        <>
          <h2 className="text-2xl font-semibold mb-4">인증 처리 중...</h2>
          <p className="text-gray-600 mb-4">잠시만 기다려주세요.</p>
          <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        </>
      ) : error ? (
        <>
          <h2 className="text-2xl font-semibold mb-4 text-red-500">오류 발생</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            로그인 페이지로 돌아가기
          </button>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-4 text-green-500">인증 성공!</h2>
          <p className="text-gray-700">로그인되었습니다. 리디렉션 중...</p>
        </>
      )}
    </div>
  );
}

// 로딩 표시 컴포넌트
function LoadingFallback() {
  return (
    <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
      <h2 className="text-2xl font-semibold mb-4">로딩 중...</h2>
      <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Suspense fallback={<LoadingFallback />}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
} 