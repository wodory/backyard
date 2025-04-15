/**
 * 파일명: src/app/auth/error/page.tsx
 * 목적: 인증 과정에서 발생한 오류 표시
 * 역할: 사용자에게 인증 오류 메시지를 보여주고 후속 조치 안내
 * 작성일: 2025-03-26
 * 수정일: 2025-03-27
 * 수정일: 2024-09-28 : 동적 렌더링 강제를 통한 useSearchParams 오류 해결
 */

'use client';

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic';

// 오류 메시지 매핑
const ERROR_MESSAGES: Record<string, string> = {
  invalid_callback: '유효하지 않은 인증 콜백입니다.',
  verification_failed: '이메일 인증에 실패했습니다.',
  exchange_error: '인증 토큰 교환 중 오류가 발생했습니다.',
  no_code: '인증 코드가 없습니다.',
  no_session: '세션을 생성할 수 없습니다.',
  default: '인증 과정에서 오류가 발생했습니다.'
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>('default')
  const [description, setDescription] = useState<string>('')

  useEffect(() => {
    // URL 파라미터에서 오류 정보 추출
    const errorParam = searchParams.get('error') || 'default'
    const errorDescription = searchParams.get('error_description') || ''

    setError(errorParam)
    setDescription(errorDescription)

    // 오류 로깅
    console.error('인증 오류:', {
      error: errorParam,
      description: errorDescription
    })
  }, [searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">인증 오류</h1>
          <p className="text-gray-700 mb-4">
            {ERROR_MESSAGES[error] || ERROR_MESSAGES.default}
          </p>

          {description && (
            <p className="text-sm text-gray-500 mb-6 p-3 bg-gray-50 rounded">
              {description}
            </p>
          )}

          <div className="flex flex-col space-y-3">
            <Link
              href="/login"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              로그인 페이지로 돌아가기
            </Link>

            <Link
              href="/"
              className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 