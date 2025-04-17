/**
 * 파일명: src/components/auth/AuthErrorDisplay.tsx
 * 목적: 인증 오류 정보 표시 클라이언트 컴포넌트
 * 역할: URL 파라미터에서 오류 정보를 가져와 해당 오류 메시지를 표시
 * 작성일: 2024-09-28
 */

'use client';

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// 오류 메시지 매핑
const ERROR_MESSAGES: Record<string, string> = {
    invalid_callback: '유효하지 않은 인증 콜백입니다.',
    verification_failed: '이메일 인증에 실패했습니다.',
    exchange_error: '인증 토큰 교환 중 오류가 발생했습니다.',
    no_code: '인증 코드가 없습니다.',
    no_session: '세션을 생성할 수 없습니다.',
    default: '인증 과정에서 오류가 발생했습니다.'
}

export default function AuthErrorDisplay() {
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
        <>
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
        </>
    )
} 