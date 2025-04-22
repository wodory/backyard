/**
 * 파일명: src/hooks/useCreateTag.test.tsx
 * 목적: useCreateTag 훅 테스트
 * 역할: 태그 생성 뮤테이션 훅의 동작 검증
 * 작성일: 2025-04-21
 * @rule   three-layer-standard
 * @layer  tanstack-query-hook
 * @tag    @tanstack-mutation-msw useCreateTag
 */

import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useCreateTag } from './useCreateTag';
import { Tag, TagInput } from '@/services/tagService';

// 테스트용 태그 데이터
const mockTagInput: TagInput = { name: '새 태그' };
const mockCreatedTag: Tag = {
    id: 'new-tag-123',
    name: '새 태그',
    count: 0,
    createdAt: '2025-04-21T00:00:00Z'
};

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
    // 태그 생성 API 핸들러
    http.post('/api/tags', async () => {
        return HttpResponse.json(mockCreatedTag, { status: 201 });
    })
);

describe('useCreateTag 훅', () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    it('태그를 성공적으로 생성하고 태그 목록 쿼리를 무효화한다', async () => {
        const wrapper = createWrapper();

        // invalidateQueries 스파이 생성
        const invalidateQueriesSpy = vi.fn();
        const queryClient = createTestQueryClient();
        queryClient.invalidateQueries = invalidateQueriesSpy;

        const { result } = renderHook(() => useCreateTag(), {
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
            result.current.mutate(mockTagInput);
        });

        // 로딩 상태 확인
        expect(result.current.isPending).toBe(true);

        // 성공 상태 확인 대기
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // 데이터 확인
        expect(result.current.data).toEqual(mockCreatedTag);

        // 태그 목록 쿼리 무효화 확인
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['tags'] });
    });

    it('API 오류 발생 시 에러 상태를 반환한다', async () => {
        // 에러 응답 모킹
        server.use(
            http.post('/api/tags', () => {
                return new HttpResponse(JSON.stringify({ error: '이미 존재하는 태그입니다.' }), {
                    status: 409,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            })
        );

        const wrapper = createWrapper();
        const { result } = renderHook(() => useCreateTag(), { wrapper });

        // mutate 함수 호출
        act(() => {
            result.current.mutate(mockTagInput);
        });

        // 에러 상태 확인 대기
        await waitFor(() => expect(result.current.isError).toBe(true));

        // 에러 상태 확인
        expect(result.current.error).toBeDefined();
    });
}); 