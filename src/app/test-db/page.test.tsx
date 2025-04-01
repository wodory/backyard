/**
 * 파일명: page.test.tsx
 * 목적: 데이터베이스 연결 테스트 페이지 컴포넌트 테스트
 * 역할: TestDatabasePage 컴포넌트의 다양한 상태 및 동작 검증
 * 작성일: 2024-04-02
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TestDatabasePage from './page';

// Prisma 클라이언트 모킹
vi.mock('@/lib/prisma', () => ({
    default: {
        tag: {
            findMany: vi.fn(),
        },
        $disconnect: vi.fn(),
    },
}));

// console.error 모킹
vi.spyOn(console, 'error').mockImplementation(() => { });

describe('TestDatabasePage 컴포넌트', () => {
    let mockPrisma: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        // 각 테스트 전에 모킹된 Prisma 인스턴스 가져오기
        mockPrisma = (await import('@/lib/prisma')).default;
    });

    it('태그 목록이 있을 때 올바르게 렌더링해야 함', async () => {
        // 태그 데이터 모킹
        const mockTags = [
            { id: 1, name: '리액트', _count: { cardTags: 5 } },
            { id: 2, name: '타입스크립트', _count: { cardTags: 3 } },
            { id: 3, name: '백엔드', _count: { cardTags: 2 } },
        ];

        // Prisma 응답 모킹
        (mockPrisma.tag.findMany as any).mockResolvedValueOnce(mockTags);

        // 컴포넌트 렌더링 (비동기 컴포넌트이므로 임시 변환 사용)
        const Component = await TestDatabasePage();
        render(Component);

        // 페이지 제목 확인
        expect(screen.getByText('데이터베이스 연결 테스트')).toBeInTheDocument();

        // 각 태그가 올바르게 표시되는지 확인
        expect(screen.getByText('리액트')).toBeInTheDocument();
        expect(screen.getByText('타입스크립트')).toBeInTheDocument();
        expect(screen.getByText('백엔드')).toBeInTheDocument();

        // 태그 개수가 올바르게 표시되는지 확인
        expect(screen.getByText('연결된 카드: 5개')).toBeInTheDocument();
        expect(screen.getByText('연결된 카드: 3개')).toBeInTheDocument();
        expect(screen.getByText('연결된 카드: 2개')).toBeInTheDocument();

        // 성공 메시지 확인
        expect(screen.getByText('이 페이지가 정상적으로 로드되었다면 Prisma와 Supabase 연결이 성공적으로 구성된 것입니다!')).toBeInTheDocument();

        // Prisma 호출 확인
        expect(mockPrisma.tag.findMany).toHaveBeenCalledTimes(1);
        expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
            include: {
                _count: {
                    select: {
                        cardTags: true,
                    },
                },
            },
        });
    });

    it('태그가 없을 때 적절한 메시지를 표시해야 함', async () => {
        // 빈 태그 목록 모킹
        (mockPrisma.tag.findMany as any).mockResolvedValueOnce([]);

        // 컴포넌트 렌더링
        const Component = await TestDatabasePage();
        render(Component);

        // "등록된 태그가 없습니다" 메시지 확인
        expect(screen.getByText('등록된 태그가 없습니다.')).toBeInTheDocument();

        // 성공 메시지는 여전히 표시되어야 함
        expect(screen.getByText('이 페이지가 정상적으로 로드되었다면 Prisma와 Supabase 연결이 성공적으로 구성된 것입니다!')).toBeInTheDocument();
    });

    it('데이터베이스 오류가 발생했을 때 에러 메시지를 표시해야 함', async () => {
        // 데이터베이스 오류 모킹
        const dbError = new Error('데이터베이스 연결에 실패했습니다');
        (mockPrisma.tag.findMany as any).mockRejectedValueOnce(dbError);

        // 컴포넌트 렌더링
        const Component = await TestDatabasePage();
        render(Component);

        // 에러 메시지 확인
        expect(screen.getByText('데이터베이스 연결 오류: 데이터베이스 연결에 실패했습니다')).toBeInTheDocument();
        expect(screen.getByText('Vercel 환경 변수가 올바르게 설정되었는지 확인하세요.')).toBeInTheDocument();

        // 안내 메시지 확인
        expect(screen.getByText('로컬 환경에서는 연결 오류가 발생할 수 있습니다. Vercel 배포 환경에서 다시 테스트해보세요.')).toBeInTheDocument();

        // console.error가 호출되었는지 확인
        expect(console.error).toHaveBeenCalledWith('데이터베이스 연결 오류:', dbError);
    });
}); 