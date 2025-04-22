/**
 * 파일명: src/hooks/useTags.test.tsx
 * 목적: useTags 훅 테스트
 * 역할: 태그 목록 조회 훅의 동작 검증
 * 작성일: 2025-04-21
 * @rule   three-layer-standard
 * @layer  tanstack-query-hook
 * @tag    @tanstack-query-msw fetchTags
 */

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useTags } from './useTags';
import { Tag } from '@/services/tagService';
import { mockTags } from '@/tests/msw/handlers/tagHandlers';

// 테스트를 위한 QueryClient 생성
const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,        // 실패 시 재시도 안함
            gcTime: Infinity,    // 가비지 컬렉션 시간 (이전의 cacheTime)
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
    // 태그 목록 API 핸들러
    http.get('/api/tags', () => {
        return HttpResponse.json(mockTags);
    })
);

describe('useTags 훅', () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    it('태그 목록을 성공적으로 가져온다', async () => {
        const wrapper = createWrapper();
        const { result } = renderHook(() => useTags(), { wrapper });

        // 초기 상태: 로딩 중
        expect(result.current.isLoading).toBe(true);
        expect(result.current.data).toBeUndefined();

        // 데이터 로딩 완료 대기
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // 성공 시 태그 데이터가 있어야 함
        expect(result.current.data).toEqual(mockTags);
        expect(result.current.data?.length).toEqual(mockTags.length);
    });

    it('API 오류 발생 시 에러 상태를 반환한다', async () => {
        // 에러 응답 모킹
        server.use(
            http.get('/api/tags', () => {
                return new HttpResponse(null, {
                    status: 500,
                    statusText: '서버 오류'
                });
            })
        );

        const wrapper = createWrapper();
        const { result } = renderHook(() => useTags(), { wrapper });

        // 에러 결과 대기
        await waitFor(() => expect(result.current.isError).toBe(true));

        // 에러 상태 확인
        expect(result.current.error).toBeDefined();
        expect(result.current.data).toBeUndefined();
    });
}); 