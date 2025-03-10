'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/auth';
import { setCookie, getCookie } from 'cookies-next';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // URL에서 오류 패러미터 확인
        const searchParams = new URLSearchParams(window.location.search);
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          console.error('OAuth 에러:', errorParam, errorDescription);
          setError(`인증 오류: ${errorParam}${errorDescription ? ` - ${errorDescription}` : ''}`);
          setLoading(false);
          return;
        }

        console.log('클라이언트 측 인증 콜백 처리 시작');
        console.log('현재 URL:', window.location.href);
        
        // Supabase 클라이언트 가져오기
        const supabase = getBrowserClient();
        console.log('Supabase 클라이언트 초기화 완료');
        
        // 세션 상태 확인 (Supabase가 자동으로 URL의 코드를 처리)
        console.log('세션 상태 확인 시작');
        const { data, error: sessionError } = await supabase.auth.getSession();
        console.log('세션 데이터:', data);
        
        if (sessionError) {
          console.error('세션 확인 오류:', sessionError);
          setError(`세션 확인 중 오류: ${sessionError.message}`);
          setLoading(false);
          return;
        }

        if (data?.session) {
          console.log('인증 성공, 세션 생성됨');
          
          // 토큰을 쿠키에 저장 (미들웨어에서 이 쿠키로 인증 확인)
          setCookie('sb-access-token', data.session.access_token, {
            maxAge: 60 * 60 * 24 * 7, // 7일
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
          });
          
          if (data.session.refresh_token) {
            setCookie('sb-refresh-token', data.session.refresh_token, {
              maxAge: 60 * 60 * 24 * 30, // 30일
              path: '/',
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
            });
          }
          
          console.log('세션 토큰을 쿠키에 저장함');
          
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
              },
              body: JSON.stringify({
                id: userId,
                email: userEmail,
                name: userName,
              }),
            });
            
            if (!response.ok) {
              console.warn('사용자 정보 저장 실패:', await response.text());
            } else {
              console.log('사용자 정보 저장 성공');
            }
          } catch (dbError) {
            console.error('사용자 정보 처리 오류:', dbError);
            // 사용자 정보 저장 실패해도 인증은 계속 진행
          }
          
          // 보드 페이지로 리디렉션
          console.log('인증 완료, 보드 페이지로 이동');
          router.push('/board');
        } else {
          // 세션이 없으면 에러 표시
          console.error('세션 없음');
          setError('인증은 성공했지만 세션이 생성되지 않았습니다.');
          setLoading(false);
        }
      } catch (error: any) {
        console.error('인증 콜백 처리 오류:', error);
        setError(`인증 처리 중 오류: ${error?.message || '알 수 없는 오류'}`);
        setLoading(false);
      }
    }

    handleAuthCallback();
  }, [router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="p-6 max-w-md bg-white rounded-lg border border-red-200 shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">인증 오류</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      <h2 className="mt-4 text-xl font-semibold">인증 처리 중...</h2>
      <p className="mt-2 text-gray-600">잠시만 기다려 주세요.</p>
    </div>
  );
} 