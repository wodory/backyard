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
    console.log('[Callback][1] 컴포넌트 마운트됨', {
      searchParams: Object.fromEntries(searchParams.entries()),
      url: typeof window !== 'undefined' ? window.location.href : '알 수 없음',
      timestamp: new Date().toISOString()
    });
    
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        console.log('[Callback][2] 인증 콜백 처리 시작', {
          code: code ? `${code.substring(0, 8)}...${code.substring(code.length - 5)}` : '없음',
          code길이: code?.length || 0,
          state: state || '없음',
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : '알 수 없음'
        });
        
        // 디버깅: 로컬 스토리지 상태 확인
        if (typeof window !== 'undefined') {
          const verifier = localStorage.getItem('supabase.auth.code_verifier');
          const backupVerifier = sessionStorage.getItem('auth.code_verifier.backup');
          const timestamp = sessionStorage.getItem('auth.code_verifier.timestamp');
          const timeElapsed = timestamp ? Math.round((Date.now() - parseInt(timestamp)) / 1000) : null;
          
          console.log('[Callback][3] 로컬 스토리지 상태:', {
            code_verifier: verifier 
              ? `${verifier.substring(0, 5)}...${verifier.substring(verifier.length - 5)} (길이: ${verifier.length})` 
              : '없음',
            backup_verifier: backupVerifier 
              ? `${backupVerifier.substring(0, 5)}...${backupVerifier.substring(backupVerifier.length - 5)} (길이: ${backupVerifier.length})` 
              : '없음',
            백업_타임스탬프: timestamp ? new Date(parseInt(timestamp)).toISOString() : '없음',
            백업_경과시간: timeElapsed !== null ? `${timeElapsed}초` : '알 수 없음',
            localStorage_키목록: Object.keys(localStorage),
            supabase관련_키목록: Object.keys(localStorage).filter(key => key.startsWith('supabase')),
            sessionStorage_키목록: Object.keys(sessionStorage)
          });
          
          // 백업에서 복원 시도 (5분 이내 백업만 신뢰)
          if (!verifier && backupVerifier && timestamp) {
            const timeElapsed = Date.now() - parseInt(timestamp);
            if (timeElapsed < 300000) { // 5분(300,000ms) 이내
              console.log('[Callback][4] 백업에서 code_verifier 복원 시도', {
                백업_시각: new Date(parseInt(timestamp)).toISOString(),
                경과_시간: `${Math.round(timeElapsed / 1000)}초`,
                백업_길이: backupVerifier.length
              });
              localStorage.setItem('supabase.auth.code_verifier', backupVerifier);
              
              // 복원 확인
              const restoredVerifier = localStorage.getItem('supabase.auth.code_verifier');
              console.log('[Callback][4-1] 복원 결과 확인:', {
                성공여부: restoredVerifier === backupVerifier,
                복원된_길이: restoredVerifier?.length || 0
              });
            } else {
              console.warn('[Callback][4] 백업이 너무 오래되어 사용하지 않음', {
                백업_시각: new Date(parseInt(timestamp)).toISOString(),
                경과_시간: `${Math.round(timeElapsed / 1000)}초 (5분 초과)`
              });
            }
          } else if (!verifier && !backupVerifier) {
            console.error('[Callback][4] code_verifier가 없고 백업도 없음 - 인증 실패 가능성 높음');
          } else if (verifier) {
            console.log('[Callback][4] 이미 code_verifier가 존재함, 백업 복원 필요 없음');
          }
        }
        
        if (!code) {
          console.error('[Callback][5] 인증 코드가 없습니다.');
          setError('인증 코드가 없습니다.');
          router.push('/login?error=missing_code');
          return;
        }
        
        // Supabase 클라이언트 생성
        console.log('[Callback][6] Supabase 클라이언트 생성 시작');
        const supabase = createBrowserSupabaseClient();
        console.log('[Callback][6-1] Supabase 클라이언트 생성 완료');
        
        // 코드 교환 전 최종 검증
        const finalVerifier = localStorage.getItem('supabase.auth.code_verifier');
        console.log('[Callback][7] 코드 교환 직전 최종 상태 확인:', {
          code_verifier_존재: !!finalVerifier,
          code_verifier_길이: finalVerifier?.length || 0,
          code길이: code.length
        });
        
        // 코드 교환 시도
        console.log('[Callback][8] 코드를 세션으로 교환 시도 시작...');
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          console.log('[Callback][9] 코드 교환 응답 받음', {
            성공여부: !exchangeError,
            세션존재여부: !!data?.session
          });
          
          if (exchangeError) {
            console.error('[Callback][10] 세션 교환 오류:', {
              에러코드: exchangeError.code,
              에러메시지: exchangeError.message,
              상태코드: exchangeError.status,
              에러객체: exchangeError
            });
            setError(exchangeError.message);
            router.push(`/login?error=auth_error&message=${encodeURIComponent(exchangeError.message)}&code=${exchangeError.code || 'unknown'}`);
            return;
          }
          
          if (!data.session) {
            console.error('[Callback][11] 세션이 생성되지 않았습니다.');
            setError('세션이 생성되지 않았습니다.');
            router.push('/login?error=no_session');
            return;
          }
          
          // 세션 정보 확인
          console.log('[Callback][12] 세션 생성 성공:', {
            액세스토큰_길이: data.session.access_token?.length || 0,
            리프레시토큰_존재: !!data.session.refresh_token,
            만료시간: data.session.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : '알 수 없음'
          });
          
          // 쿠키 확인
          const allCookies = document.cookie.split(';').map(cookie => cookie.trim());
          console.log('[Callback][13] 세션 생성 후 쿠키 확인:', {
            모든쿠키: allCookies,
            액세스토큰_쿠키존재: allCookies.some(c => c.startsWith('sb-access-token=')),
            리프레시토큰_쿠키존재: allCookies.some(c => c.startsWith('sb-refresh-token=')),
            쿠키개수: allCookies.length
          });
          
          // localStorage 최종 상태 확인
          console.log('[Callback][14] 세션 생성 후 localStorage 상태:', {
            supabase관련_키: Object.keys(localStorage).filter(key => key.startsWith('supabase')),
            supabase_session존재: !!localStorage.getItem('supabase.auth.token')
          });
          
          // 세션 스토리지 정리
          sessionStorage.removeItem('auth.code_verifier.backup');
          sessionStorage.removeItem('auth.code_verifier.timestamp');
          console.log('[Callback][15] 임시 백업 데이터 정리 완료');
          
          console.log('[Callback][16] 인증 성공. 유저 정보:', {
            userId: data.session.user.id,
            email: data.session.user.email,
            provider: data.session.user.app_metadata?.provider || '알 수 없음'
          });
          
          // 성공 시 보드 페이지로 리디렉션
          setLoading(false);
          console.log('[Callback][17] 보드 페이지로 리디렉션 시작...');
          router.push('/board');
        } catch (exchangeErr: any) {
          console.error('[Callback][오류-교환] 코드 교환 중 예외 발생:', {
            에러메시지: exchangeErr.message,
            스택: exchangeErr.stack,
            타입: typeof exchangeErr
          });
          setError(`코드 교환 중 오류: ${exchangeErr.message}`);
          router.push(`/login?error=exchange_exception&message=${encodeURIComponent(exchangeErr.message || '알 수 없는 오류')}`);
        }
      } catch (err: any) {
        console.error('[Callback][오류-전체] 예상치 못한 오류:', {
          에러메시지: err.message,
          스택: err.stack,
          타입: typeof err
        });
        setError(err.message || '알 수 없는 오류가 발생했습니다.');
        router.push(`/login?error=unexpected&message=${encodeURIComponent(err.message || '알 수 없는 오류')}`);
      }
    };
    
    handleCallback();
    
    // 컴포넌트 언마운트 시 로그
    return () => {
      console.log('[Callback][언마운트] 콜백 컴포넌트 언마운트됨');
    };
  }, [router, searchParams]);
  
  // 상태 변화 로깅
  useEffect(() => {
    console.log('[Callback][상태] 컴포넌트 상태 변경:', {
      로딩중: loading,
      에러: error
    });
  }, [loading, error]);

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