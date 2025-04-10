/**
 * 파일명: src/features/project/components/UpdateCardsButton.tsx
 * 목적: 카드 업데이트 기능을 호출하는 버튼 컴포넌트
 * 역할: 모든 카드의 소유자 및 프로젝트 정보를 일괄 업데이트
 * 작성일: ${new Date().toISOString().split('T')[0]}
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { updateAllCardsToFirstUserAndProject } from '../utils/updateLocalCardsProject';
import { Loader2, UserCheck } from 'lucide-react';
import createLogger from '@/lib/logger';
import { toast } from 'sonner';

// 로거 생성
const logger = createLogger('UpdateCardsButton');

interface UpdateCardsButtonProps {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
}

/**
 * 카드 업데이트 버튼 컴포넌트
 * @param props - 컴포넌트 속성
 * @returns 카드 업데이트 버튼 컴포넌트
 */
export default function UpdateCardsButton({
    variant = 'default',
    size = 'default',
    className = '',
}: UpdateCardsButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [count, setCount] = useState(0);

    // 업데이트 처리 함수
    const handleUpdate = async () => {
        if (isLoading) return;

        // 확인 메시지 표시
        if (!confirm('모든 카드의 소유자와 프로젝트를 첫 번째 사용자와 프로젝트로 업데이트합니다. 계속하시겠습니까?')) {
            return;
        }

        setIsLoading(true);
        try {
            logger.info('카드 업데이트 시작');
            const updatedCount = await updateAllCardsToFirstUserAndProject();
            setCount(updatedCount);
            logger.info('카드 업데이트 완료', { updatedCount });

            // 로컬 스토리지에서 최근 사용된 카드 목록 초기화
            localStorage.removeItem('recent_cards');
            toast.success('최근 카드 목록이 초기화되었습니다.');
        } catch (error) {
            logger.error('카드 업데이트 오류', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 아이콘 버튼 스타일인 경우
    if (size === 'icon') {
        return (
            <Button
                variant={variant}
                size={size}
                className={className}
                onClick={handleUpdate}
                disabled={isLoading}
                title={count > 0 ? `${count}개 카드 업데이트 완료` : '카드 소유자 업데이트'}
            >
                {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                    <UserCheck className="h-8 w-8" />
                )}
                <span className="sr-only">카드 소유자 업데이트</span>
            </Button>
        );
    }

    // 일반 버튼 스타일
    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleUpdate}
            disabled={isLoading}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    업데이트 중...
                </>
            ) : count > 0 ? (
                <>카드 업데이트 완료 ({count}개)</>
            ) : (
                <>카드 소유자 업데이트</>
            )}
        </Button>
    );
} 