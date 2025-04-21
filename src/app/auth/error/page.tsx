/**
 * 파일명: src/app/auth/error/page.tsx
 * 목적: 인증 과정에서 발생한 오류 표시
 * 역할: 사용자에게 인증 오류 메시지를 보여주고 후속 조치 안내
 * 작성일: 2025-03-26
 * 수정일: 2025-03-27
 * 수정일: 2024-09-28 : 동적 렌더링 강제를 통한 useSearchParams 오류 해결
 * 수정일: 2024-09-28 : Suspense 경계로 useSearchParams를 감싸 빌드 오류 해결
 * 수정일: 2025-04-21 : 직접 useSearchParams 훅을 사용하도록 수정하고 코드 간소화
 */

'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Unknown error'

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">인증 오류</h1>
          <p className="text-gray-700 mb-6">인증 도중 오류가 발생했습니다: {error}</p>

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