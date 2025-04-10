/**
 * 파일명: callback/page.tsx
 * 목적: OAuth 콜백 처리 및 인증 완료
 * 역할: Google 로그인 후 리디렉션된 콜백을 처리하고 세션을 설정
 * 작성일: 2025-04-09
 * 수정일: 2025-03-30
 * 수정일: 2023-04-10 : useAuthCallback 훅으로 로직 분리
 * 수정일: 2023-04-10 : 리다이렉션 처리 로직 추가
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import createLogger from '@/lib/logger';
import { useAuthCallback } from '@/hooks/useAuthCallback';

// 모듈별 로거 생성
const logger = createLogger('Callback');

/**
 * CallbackHandler: OAuth 콜백을 처리하는 컴포넌트
 * @returns {JSX.Element} 콜백 처리 중임을 나타내는 UI
 */
export default function CallbackHandler() {
  const router = useRouter();
  const { processingState, error, redirectUrl } = useAuthCallback();

  // redirectUrl이 변경되면 리다이렉션 실행
  useEffect(() => {
    if (redirectUrl) {
      logger.info(`리다이렉션 실행: ${redirectUrl}`);
      router.push(redirectUrl);
    }
  }, [redirectUrl, router, logger]);

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