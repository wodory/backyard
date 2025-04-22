/**
 * 파일명: src/hooks/useDeleteTag.test.tsx
 * 목적: useDeleteTag 훅 테스트
 * 역할: 태그 삭제 뮤테이션 훅의 동작 검증
 * 작성일: 2025-04-21
 * @rule   three-layer-standard
 * @layer  tanstack-query-hook
 * @tag    @tanstack-mutation-msw useDeleteTag
 */

import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useDeleteTag } from './useDeleteTag';

// 테스트용 태그 ID
const mockTagId = 'tag-123';

// 테스트를 위한 QueryClient 생성
const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            gcTime: Infinity,
        },
        mutations: {
            retry: false,
        },
    },
});

// 테스트용 QueryClient Provider
const createWrapper = () => {
    const testQueryClient = createTestQueryClient();
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={testQueryClient}>
            {children}
        </QueryClientProvider>
    );
};

// MSW 테스트 서버 설정
const server = setupServer(
    // 태그 삭제 API 핸들러
    http.delete(`/api/tags/${mockTagId}`, () => {
        return new HttpResponse(null, { status: 204 });
    })
);

describe('useDeleteTag 훅', () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    it('태그를 성공적으로 삭제하고 태그 목록 쿼리를 무효화한다', async () => {
        // invalidateQueries 스파이 생성
        const invalidateQueriesSpy = vi.fn();
        const queryClient = createTestQueryClient();
        queryClient.invalidateQueries = invalidateQueriesSpy;

        const { result } = renderHook(() => useDeleteTag(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        });

        // 초기 상태 확인
        expect(result.current.isPending).toBe(false);
        expect(result.current.isSuccess).toBe(false);

        // mutate 함수 호출
        act(() => {
            result.current.mutate(mockTagId);
        });

        // 로딩 상태 확인
        expect(result.current.isPending).toBe(true);

        // 성공 상태 확인 대기
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // 태그 목록 쿼리 무효화 확인
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['tags'] });
    });

    it('API 오류 발생 시 에러 상태를 반환한다', async () => {
        // 에러 응답 모킹
        server.use(
            http.delete(`/api/tags/${mockTagId}`, () => {
                return new HttpResponse(null, {
                    status: 404,
                    statusText: '해당 ID의 태그를 찾을 수 없습니다.'
                });
            })
        );

        const wrapper = createWrapper();
        const { result } = renderHook(() => useDeleteTag(), { wrapper });

        // mutate 함수 호출
        act(() => {
            result.current.mutate(mockTagId);
        });

        // 에러 상태 확인 대기
        await waitFor(() => expect(result.current.isError).toBe(true));

        // 에러 상태 확인
        expect(result.current.error).toBeDefined();
    });
}); 