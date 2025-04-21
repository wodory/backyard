/**
 * 파일명: src/app/auth/error/AuthErrorClient.tsx
 * 목적: 인증 오류 정보를 클라이언트 사이드에서 처리
 * 역할: useSearchParams 훅을 사용하여 URL 쿼리 파라미터에서 오류 정보를 추출하여 표시
 * 작성일: 2025-05-21
 */

'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthErrorClient() {
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