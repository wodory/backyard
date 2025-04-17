/**
 * 파일명: src/app/auth/error/page.tsx
 * 목적: 인증 과정에서 발생한 오류 표시
 * 역할: 사용자에게 인증 오류 메시지를 보여주고 후속 조치 안내
 * 작성일: 2025-03-26
 * 수정일: 2025-03-27
 * 수정일: 2024-09-28 : 동적 렌더링 강제를 통한 useSearchParams 오류 해결
 * 수정일: 2024-09-28 : Suspense 경계로 useSearchParams를 감싸 빌드 오류 해결
 */

import { Suspense } from 'react'
import AuthErrorDisplay from '@/components/auth/AuthErrorDisplay'

// LoadingFallback 컴포넌트 정의
function LoadingFallback() {
  return <p className="text-gray-500">오류 정보 로딩 중...</p>
}

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">인증 오류</h1>
          <Suspense fallback={<LoadingFallback />}>
            <AuthErrorDisplay />
          </Suspense>
        </div>
      </div>
    </div>
  )
} 