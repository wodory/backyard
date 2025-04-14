/**
 * 파일명: src/components/layout/PublicOnlyLayout.tsx
 * 목적: 로그인, 회원가입 등 공개 페이지 전용 레이아웃 제공
 * 역할: 이미 인증된 사용자를 홈으로 리디렉션
 * 작성일: 2024-05-08
 * 수정일: 2024-05-08 : 하이드레이션 오류 해결을 위한 수정
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import createLogger from '@/lib/logger';

// 로거 생성
const logger = createLogger('PublicOnlyLayout');

/**
 * PublicOnlyLayout: 인증되지 않은 사용자만 접근할 수 있는 레이아웃 컴포넌트
 * @param children - 자식 컴포넌트
 * @returns 공개 전용 레이아웃 컴포넌트
 */
export function PublicOnlyLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    // 클라이언트 측 상태를 추가하여 하이드레이션 이후에만 UI 변경
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // 클라이언트 측에서 마운트된 후에만 상태 변경
        setIsMounted(true);

        logger.info('공개 전용 레이아웃 상태', { isLoading, isAuthenticated: !!user });

        // 인증 상태 로딩이 완료되고, 사용자가 있으면 홈으로 리디렉션
        if (!isLoading && user) {
            logger.info('이미 인증된 사용자, 홈으로 리디렉션');
            router.push('/');
        }
    }, [user, isLoading, router]);

    // 처음 서버 렌더링 시에는 항상 children을 렌더링하여 하이드레이션 오류 방지
    if (!isMounted) {
        return <>{children}</>;
    }

    // 클라이언트에서 마운트된 후에만 로딩 UI 또는 리디렉션 UI 표시
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col items-center">
                    <div className="mb-4">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                    <p className="text-gray-600">인증 상태 확인 중...</p>
                </div>
            </div>
        );
    }

    // 사용자가 인증되지 않았을 때만 자식 컴포넌트 렌더링
    if (!user) {
        return <>{children}</>;
    }

    // 리디렉션이 발생하기 전 빈 UI 표시 (깜빡임 방지)
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="flex flex-col items-center">
                <div className="mb-4">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
                <p className="text-gray-600">리디렉션 중...</p>
            </div>
        </div>
    );
} 