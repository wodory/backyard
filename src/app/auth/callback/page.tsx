'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/auth';
import { setCookie, getCookie } from 'cookies-next';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(10); // 카운트다운 추가

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // URL에서 오류 패러미터 확인
        const searchParams = new URLSearchParams(window.location.search);
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const code = searchParams.get('code');
        
        // 현재 URL과 사용자 환경 정보 기록
        const debugStartInfo = `
현재 URL: ${window.location.href}
호스트: ${window.location.host}
환경: ${process.env.NODE_ENV}
리디렉션 URL 환경변수: ${process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL || '설정되지 않음'}
        `;
        setDebugInfo(debugStartInfo + `\n\n체크 1: URL 파라미터 - code: ${code ? '있음' : '없음'}, error: ${errorParam || '없음'}`);
        
        if (errorParam) {
          console.error('OAuth 에러:', errorParam, errorDescription);
          setError(`인증 오류: ${errorParam}${errorDescription ? ` - ${errorDescription}` : ''}`);
          setLoading(false);
          return;
        }

        console.log('클라이언트 측 인증 콜백 처리 시작');
        console.log('현재 URL:', window.location.href);
        setDebugInfo(prev => prev + `\n체크 2: 콜백 처리 시작, URL: ${window.location.href}`);
        
        // Supabase 클라이언트 가져오기
        const supabase = getBrowserClient();
        console.log('Supabase 클라이언트 초기화 완료');
        setDebugInfo(prev => prev + '\n체크 3: Supabase 클라이언트 초기화');
        
        // 세션 상태 확인 (Supabase가 자동으로 URL의 코드를 처리)
        console.log('세션 상태 확인 시작');
        setDebugInfo(prev => prev + '\n체크 4: 세션 확인 시작');
        
        // 쿠키 확인
        const existingCookies = document.cookie;
        console.log('현재 쿠키:', existingCookies);
        setDebugInfo(prev => prev + `\n체크 5: 현재 쿠키 - ${existingCookies ? existingCookies.length + '바이트' : '없음'}`);
        
        // 직접 세션 가져오기 시도
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        // 세션 디버그 정보 추가
        const sessionDebugInfo = data?.session 
          ? `세션 있음, 사용자 ID: ${data.session.user?.id || '없음'}, 이메일: ${data.session.user?.email || '없음'}`
          : '세션 없음';
        setDebugInfo(prev => prev + `\n체크 6: 세션 데이터 - ${sessionDebugInfo}`);
        console.log('세션 데이터:', sessionDebugInfo);
        
        if (sessionError) {
          console.error('세션 확인 오류:', sessionError);
          setError(`세션 확인 중 오류: ${sessionError.message}`);
          setDebugInfo(prev => prev + `\n체크 7: 세션 오류 - ${sessionError.message}`);
          setLoading(false);
          return;
        }

        if (data?.session) {
          console.log('인증 성공, 세션 생성됨');
          setDebugInfo(prev => prev + '\n체크 8: 인증 성공, 세션 생성됨');
          
          // 현재 호스트 이름에서 도메인 추출
          const hostname = window.location.hostname;
          const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
          
          // 도메인 설정 (로컬호스트가 아닌 경우에만)
          let domain = undefined;
          if (!isLocalhost) {
            // 서브도메인 포함하기 위해 최상위 도메인만 설정
            const hostParts = hostname.split('.');
            if (hostParts.length > 1) {
              // vercel.app 또는 yoursite.com 형태일 경우
              domain = '.' + hostParts.slice(-2).join('.');
            } else {
              domain = hostname;
            }
          }
          
          // 보안 설정 확인
          const isSecure = window.location.protocol === 'https:';
          
          setCookie('sb-access-token', data.session.access_token, {
            maxAge: 60 * 60 * 24 * 7, // 7일
            path: '/',
            domain: domain,
            secure: isSecure,
            sameSite: 'lax'
          });
          
          if (data.session.refresh_token) {
            setCookie('sb-refresh-token', data.session.refresh_token, {
              maxAge: 60 * 60 * 24 * 30, // 30일
              path: '/',
              domain: domain,
              secure: isSecure,
              sameSite: 'lax'
            });
          }
          
          // localStorage에도 백업 저장
          try {
            localStorage.setItem('supabase.auth.token', JSON.stringify({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at
            }));
            setDebugInfo(prev => prev + '\n추가 조치: 로컬 스토리지에 토큰 백업 저장');
          } catch (storageError) {
            console.error('로컬 스토리지 저장 오류:', storageError);
            setDebugInfo(prev => prev + `\n로컬 스토리지 오류: ${storageError}`);
          }
          
          console.log('세션 토큰을 쿠키에 저장함', {
            환경: process.env.NODE_ENV,
            호스트: hostname,
            도메인: domain || '없음',
            보안: isSecure ? 'HTTPS' : 'HTTP'
          });
          
          // 설정된 쿠키 확인
          const accessCookie = getCookie('sb-access-token');
          const refreshCookie = getCookie('sb-refresh-token');
          console.log('쿠키 확인 - 액세스 토큰:', accessCookie ? '존재함' : '없음');
          console.log('쿠키 확인 - 리프레시 토큰:', refreshCookie ? '존재함' : '없음');
          setDebugInfo(prev => prev + `\n체크 11: 쿠키 설정 확인 - 액세스: ${accessCookie ? '있음' : '없음'}, 리프레시: ${refreshCookie ? '있음' : '없음'}`);
          
          // 사용자 정보를 데이터베이스에 저장 또는 업데이트
          try {
            const userId = data.session.user.id;
            const userEmail = data.session.user.email;
            const userName = data.session.user.user_metadata?.full_name || 
                            (userEmail ? userEmail.split('@')[0] : '사용자');
            
            // 사용자 정보 저장 API 호출
            const response = await fetch('/api/user/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.session.access_token}`,
              },
              body: JSON.stringify({
                id: userId,
                email: userEmail,
                name: userName,
              }),
            });
            
            if (!response.ok) {
              console.warn('사용자 정보 저장 실패:', await response.text());
              setDebugInfo(prev => prev + '\n체크 12: 사용자 정보 저장 실패');
            } else {
              console.log('사용자 정보 저장 성공');
              setDebugInfo(prev => prev + '\n체크 12: 사용자 정보 저장 성공');
            }
          } catch (dbError) {
            console.error('사용자 정보 처리 오류:', dbError);
            setDebugInfo(prev => prev + `\n체크 12-오류: 사용자 정보 처리 오류 - ${dbError}`);
            // 사용자 정보 저장 실패해도 인증은 계속 진행
          }
          
          // 페이지 이동 전 Supabase 세션 다시 한 번 확인
          console.log('인증 완료, 보드 페이지로 이동 준비');
          setDebugInfo(prev => prev + '\n체크 13: 보드 페이지로 이동 준비');
          
          // 카운트다운 시작
          setLoading(false);
          const countdownInterval = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                
                // 카운트다운 완료 후 페이지 이동
                console.log('보드 페이지로 최종 이동');
                setDebugInfo(prev => prev + '\n체크 14: 보드 페이지로 최종 이동');
                
                // 리디렉션 방법 1: window.location.href (페이지 새로고침)
                window.location.href = '/board';
                
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
        } else {
          // 세션이 없으면 에러 표시
          console.error('세션 없음');
          setError('인증은 성공했지만 세션이 생성되지 않았습니다.');
          setDebugInfo(prev => prev + '\n체크 15: 세션 없음');
          setLoading(false);
        }
      } catch (error: any) {
        console.error('인증 콜백 처리 오류:', error);
        setError(`인증 처리 중 오류: ${error?.message || '알 수 없는 오류'}`);
        setDebugInfo(prev => prev + `\n체크 16: 인증 콜백 처리 오류 - ${error?.message || '알 수 없는 오류'}`);
        setLoading(false);
      }
    }

    handleAuthCallback();
  }, [router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="p-6 max-w-md bg-white rounded-lg border border-red-200 shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">인증 오류</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <details className="mb-4">
            <summary className="text-sm text-blue-500 cursor-pointer">디버그 정보 보기</summary>
            <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto max-h-60 whitespace-pre-wrap">
              {debugInfo || '디버그 정보 없음'}
            </pre>
          </details>
          <div className="flex gap-2">
            <button 
              onClick={() => window.location.href = '/login'}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              로그인으로 돌아가기
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">인증 처리 중...</h2>
          <p className="text-gray-600 mb-4">잠시만 기다려 주세요.</p>
        </>
      ) : (
        <>
          <div className="text-2xl text-green-500 mb-4">✓</div>
          <h2 className="text-xl font-semibold mb-2">인증 성공!</h2>
          <p className="text-gray-600 mb-4">{countdown}초 후 자동으로 이동합니다...</p>
          <button 
            onClick={() => {window.location.href = '/board'}}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-4"
          >
            지금 이동하기
          </button>
        </>
      )}
      <details className="w-full max-w-md mt-4">
        <summary className="text-sm text-blue-500 cursor-pointer">디버그 정보 보기</summary>
        <pre className="text-xs bg-gray-100 p-3 mt-2 rounded overflow-auto max-h-60 whitespace-pre-wrap">
          {debugInfo || '디버그 정보 없음'}
        </pre>
      </details>
    </div>
  );
} 