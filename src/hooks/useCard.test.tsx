/**
 * 파일명: src/hooks/useCard.test.tsx
 * 목적: useCard 훅의 기능 테스트
 * 역할: 특정 카드 조회 기능 검증 및 에러 핸들링 테스트
 * 작성일: 2025-04-21
 */

import { expect, describe, it, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { useCard } from './useCard';

// 테스트용 래퍼 컴포넌트
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

// 테스트용 모의 데이터
const mockCard = {
    id: '1',
    title: '테스트 카드',
    content: '이것은 테스트 카드 내용입니다.',
    userId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [{ id: 'tag-1', name: '테스트' }],
    user: {
        id: 'user-1',
        name: '테스트 사용자',
        email: 'test@example.com',
        image: 'https://example.com/avatar.png',
    },
};

// MSW 서버 설정
const server = setupServer(
    // 성공 응답 핸들러
    http.get('/api/cards/:id', ({ params }) => {
        const { id } = params;

        if (id === '1') {
            return HttpResponse.json(mockCard);
        }

        if (id === 'not-found') {
            return new HttpResponse(null, { status: 404 });
        }

        return HttpResponse.json(null);
    }),

    // 서버 오류 핸들러
    http.get('/api/cards/error', () => {
        return new HttpResponse(null, { status: 500 });
    })
);

// 테스트 시작 전 서버 시작
beforeAll(() => server.listen());

// 각 테스트 후 핸들러 초기화
afterEach(() => server.resetHandlers());

// 모든 테스트 종료 후 서버 종료
afterAll(() => server.close());

describe('useCard', () => {
    it('카드 데이터를 성공적으로 가져와야 함', async () => {
        const { result } = renderHook(() => useCard('1'), {
            wrapper: createWrapper(),
        });

        // 초기에는 로딩 상태여야 함
        expect(result.current.isLoading).toBe(true);

        // 데이터 로딩이 완료될 때까지 대기
        await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 1000 });

        // 결과 데이터 확인
        expect(result.current.data).toEqual(mockCard);
    });

    it('카드 ID가 없으면 쿼리가 실행되지 않아야 함', async () => {
        const { result } = renderHook(() => useCard(undefined), {
            wrapper: createWrapper(),
        });

        // 쿼리가 비활성화 상태여야 함
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isFetching).toBe(false);
        expect(result.current.data).toBeUndefined();
    });

    it('존재하지 않는 카드 ID로 요청하면 404 에러를 반환해야 함', async () => {
        const { result } = renderHook(() => useCard('not-found'), {
            wrapper: createWrapper(),
        });

        // 에러 발생까지 대기
        await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 1000 });

        // 에러 메시지 확인
        expect(result.current.error?.message).toContain('404');
    });

    it('서버 오류 발생 시 에러를 반환해야 함', async () => {
        const { result } = renderHook(() => useCard('error'), {
            wrapper: createWrapper(),
        });

        // 에러 발생까지 대기
        await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 1000 });

        // 에러 메시지 확인
        expect(result.current.error?.message).toContain('500');
    });
}); 