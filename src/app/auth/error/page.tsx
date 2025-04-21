/**
 * 파일명: src/app/auth/error/page.tsx
 * 목적: 인증 과정에서 발생한 오류 표시
 * 역할: 사용자에게 인증 오류 메시지를 보여주고 후속 조치 안내
 * 작성일: 2025-03-26
 * 수정일: 2025-03-27
 * 수정일: 2024-09-28 : 동적 렌더링 강제를 통한 useSearchParams 오류 해결
 * 수정일: 2024-09-28 : Suspense 경계로 useSearchParams를 감싸 빌드 오류 해결
 * 수정일: 2025-04-21 : 직접 useSearchParams 훅을 사용하도록 수정하고 코드 간소화
 * 수정일: 2025-05-21 : 서버 컴포넌트와 클라이언트 컴포넌트 분리 및 Suspense 경계 추가
 */

import { Suspense } from 'react'
import AuthErrorClient from './AuthErrorClient'

function AuthErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">로딩 중...</h1>
          <p className="text-gray-700 mb-6">인증 정보를 확인하고 있습니다.</p>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<AuthErrorFallback />}>
      <AuthErrorClient />
    </Suspense>
  )
} 