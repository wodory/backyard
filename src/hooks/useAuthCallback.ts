/**
 * 파일명: src/hooks/useAuthCallback.ts
 * 목적: 인증 콜백 로직 분리
 * 역할: OAuth 콜백 처리 로직을 분리하여 재사용 가능한 훅으로 제공
 * 작성일: 2023-04-10
 * 수정일: 2023-04-10 : 리다이렉션 처리 로직 추가
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import createLogger from '@/lib/logger';
import { AuthService } from '@/services/auth-service';
import type { AuthResult } from '@/services/auth-service';

const logger = createLogger('useAuthCallback');

type ProcessingState = '초기화 중' | '인증 코드 처리 중' | '오류 발생' | '인증 데이터 저장 중' | '완료, 리디렉션 중' | '예외 발생';

interface UseAuthCallbackReturn {
  processingState: ProcessingState;
  error: string | null;
  redirectUrl: string | null;
}

export function useAuthCallback(): UseAuthCallbackReturn {
  const router = useRouter(); // router는 훅 내부에서 계속 사용
  const [processingState, setProcessingState] = useState<ProcessingState>('초기화 중');
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const processCallback = async () => {
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

          setRedirectUrl(`/auth/error?error=${encodeURIComponent(authResult.error || 'unknown')}&error_description=${encodeURIComponent(authResult.errorDescription || '')}`);
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
        setRedirectUrl('/');
      } catch (error) {
        logger.error('콜백 처리 실패', error);
        setProcessingState('예외 발생');
        setError('콜백 처리 중 예외 발생');
        setRedirectUrl('/auth/error?error=callback_error&error_description=인증 콜백 처리 중 오류가 발생했습니다.');
      }
    };

    processCallback();

    return () => {
      mounted = false;
    };
  }, [router]); // router 의존성 유지

  return { processingState, error, redirectUrl };
} 