/**
 * 파일명: callback/page.tsx
 * 목적: OAuth 콜백 처리 및 인증 완료
 * 역할: Google 로그인 후 리디렉션된 콜백을 처리하고 세션을 설정
 * 작성일: 2024-03-30
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import createLogger from '@/lib/logger';
import { AuthService } from '@/services/auth-service';

// 모듈별 로거 생성
const logger = createLogger('Callback');

/**
 * CallbackHandler: OAuth 콜백을 처리하는 컴포넌트
 * @returns {JSX.Element} 콜백 처리 중임을 나타내는 UI
 */
export default function CallbackHandler() {
  const router = useRouter();
  const [processingState, setProcessingState] = useState<string>('초기화 중');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function handleCallback() {
      try {
        if (!mounted) return;
        logger.info('콜백 처리 시작');
        setProcessingState('인증 코드 처리 중');

        // 현재 URL 가져오기
        const currentUrl = new URL(window.location.href);

        // AuthService를 사용하여 콜백 처리
        const authResult = await AuthService.handleCallback(currentUrl);

        // 결과에 따른 처리
        if (authResult.status === 'error') {
          logger.error('인증 오류 발생', { error: authResult.error, description: authResult.errorDescription });
          setProcessingState('오류 발생');
          setError(`${authResult.error}: ${authResult.errorDescription}`);

          router.push(`/auth/error?error=${encodeURIComponent(authResult.error || 'unknown')}&error_description=${encodeURIComponent(authResult.errorDescription || '')}`);
          return;
        }

        // 인증 성공, 데이터 저장
        setProcessingState('인증 데이터 저장 중');
        const saveSuccess = AuthService.saveAuthData(authResult);

        if (!saveSuccess) {
          logger.warn('인증 데이터 저장 실패');
          setError('인증 데이터를 저장하지 못했습니다');
        }

        setProcessingState('완료, 리디렉션 중');
        // 홈페이지로 리디렉션
        logger.info('인증 완료, 홈페이지로 리디렉션');
        router.push('/');
      } catch (error) {
        logger.error('콜백 처리 실패', error);
        setProcessingState('예외 발생');
        setError('콜백 처리 중 예외 발생');
        router.push('/auth/error?error=callback_error&error_description=인증 콜백 처리 중 오류가 발생했습니다.');
      }
    }

    // 즉시 콜백 처리 실행
    handleCallback();

    return () => {
      mounted = false;
    };
  }, [router]);

  // 로딩 UI 표시
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="mb-4">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
      <h2 className="text-xl font-semibold mb-2">인증 처리 중...</h2>
      <p className="text-gray-500 mb-2">{processingState}</p>
      {error && (
        <p className="text-red-500 text-sm mt-2">오류: {error}</p>
      )}
    </div>
  );
} 