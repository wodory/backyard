/**
 * 파일명: src/hooks/useCards.test.tsx
 * 목적: useCards 훅의 테스트 파일
 * 역할: 카드 목록 조회 훅의 기능 검증
 * 작성일: 2025-04-21
 */

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse, delay } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import { useCards } from '../hooks/useCards';
import { Card } from '../types/card';

// 테스트용 데이터
const mockCards: Card[] = [
    {
        id: '1',
        title: '테스트 카드 1',
        content: '첫 번째 카드 내용',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'user1',
        tags: [{ id: 'tag1', name: '태그1' }],
        user: { id: 'user1', name: '사용자1', email: 'user1@example.com' }
    },
    {
        id: '2',
        title: '테스트 카드 2',
        content: '두 번째 카드 내용',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'user2',
        tags: [{ id: 'tag2', name: '태그2' }],
        user: { id: 'user2', name: '사용자2', email: 'user2@example.com' }
    }
];

// MSW 서버 설정
const server = setupServer(
    // 모든 카드 조회 핸들러
    http.get('/api/cards', async () => {
        await delay(100);
        return HttpResponse.json(mockCards);
    }),

    // 검색어로 필터링된 카드 조회 핸들러
    http.get('/api/cards', async ({ request }) => {
        const url = new URL(request.url);
        const query = url.searchParams.get('q');

        if (query === '테스트 카드 1') {
            await delay(100);
            return HttpResponse.json([mockCards[0]]);
        }

        return HttpResponse.json(mockCards);
    }, { path: '/api/cards?q=:query' }),

    // 태그로 필터링된 카드 조회 핸들러
    http.get('/api/cards', async ({ request }) => {
        const url = new URL(request.url);
        const tag = url.searchParams.get('tag');

        if (tag === '태그1') {
            await delay(100);
            return HttpResponse.json([mockCards[0]]);
        }

        return HttpResponse.json(mockCards);
    }, { path: '/api/cards?tag=:tag' }),

    // 에러 발생 핸들러
    http.get('/api/cards', async ({ request }) => {
        const url = new URL(request.url);
        const shouldError = url.searchParams.get('error');

        if (shouldError === 'true') {
            await delay(100);
            return new HttpResponse(null, {
                status: 500,
                statusText: '서버 오류'
            });
        }

        return HttpResponse.json(mockCards);
    }, { path: '/api/cards?error=:error' })
);

// 테스트 환경 설정
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// QueryClientProvider 래퍼 컴포넌트
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                cacheTime: 0,
                staleTime: 0,
            },
        },
    });

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

describe('useCards', () => {
    it('모든 카드를 성공적으로 가져온다', async () => {
        const { result } = renderHook(() => useCards(), {
            wrapper: createWrapper()
        });

        // 초기 상태는 로딩 중
        expect(result.current.isLoading).toBe(true);

        // 데이터가 로드될 때까지 대기
        await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 3000 });

        // 결과 확인
        expect(result.current.data).toHaveLength(2);
        expect(result.current.data?.[0].title).toBe('테스트 카드 1');
        expect(result.current.data?.[1].title).toBe('테스트 카드 2');
    }, 10000);

    it('검색어로 필터링된 카드를 가져온다', async () => {
        const { result } = renderHook(() => useCards({ q: '테스트 카드 1' }), {
            wrapper: createWrapper()
        });

        // 데이터가 로드될 때까지 대기
        await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 3000 });

        // 결과 확인
        expect(result.current.data).toHaveLength(1);
        expect(result.current.data?.[0].title).toBe('테스트 카드 1');
    }, 10000);

    it('태그로 필터링된 카드를 가져온다', async () => {
        const { result } = renderHook(() => useCards({ tag: '태그1' }), {
            wrapper: createWrapper()
        });

        // 데이터가 로드될 때까지 대기
        await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 3000 });

        // 결과 확인
        expect(result.current.data).toHaveLength(1);
        expect(result.current.data?.[0].tags?.[0].name).toBe('태그1');
    }, 10000);

    it('에러가 발생하면 적절하게 처리한다', async () => {
        const { result } = renderHook(() => useCards({ error: 'true' }), {
            wrapper: createWrapper()
        });

        // 에러가 발생할 때까지 대기
        await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });

        // 에러 확인
        expect(result.current.error).toBeDefined();
    }, 10000);
}); 