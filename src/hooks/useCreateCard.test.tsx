// src/hooks/useCreateCard.test.tsx
import React from 'react';
import { http } from 'msw';
import { setupServer } from 'msw/node';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateCard } from './useCreateCard';
import { vi } from 'vitest';
import { CreateCardInput, Card } from '../types/card';

// MSW 서버를 테스트 파일 내에서 직접 설정
const server = setupServer();

describe('@tanstack-mutation-msw useCreateCard', () => {
    // 테스트 전후 서버 라이프사이클
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    // QueryClient Provider wrapper 생성 헬퍼
    const createWrapper = (qc: QueryClient) => ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    it('성공 시 invalidateQueries 호출 및 데이터 반환', async () => {
        // MSW v2: http.post 사용
        const mockCard: Card = {
            id: 'test-1',
            title: 'Title',
            content: 'Content',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 'user-1',
        };
        server.use(
            http.post('/api/cards', (req, res, ctx) => res(ctx.status(201), ctx.json(mockCard)))
        );

        // 실제 QueryClient + spy
        const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
        const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
        const wrapper = createWrapper(qc);

        // 훅 실행 및 mutateAsync 호출
        const { result } = renderHook(() => useCreateCard(), { wrapper });
        const input: CreateCardInput = { title: 'Title', content: 'Content', userId: 'user-1' };
        await result.current.mutateAsync(input);

        // onSuccess 처리 기다리기
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // 데이터 반환 및 invalidate 호출 검증
        expect(result.current.data).toEqual(mockCard);
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['cards'] });
    });

    it('실패 시 isError 플래그 활성화', async () => {
        server.use(
            http.post('/api/cards', (req, res, ctx) => res(ctx.status(500)))
        );

        const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
        const wrapper = createWrapper(qc);

        const { result } = renderHook(() => useCreateCard(), { wrapper });

        // 실패 처리 실행 및 에러 상태 대기
        await result.current.mutateAsync({ title: 'Fail', content: 'Fail', userId: 'user-2' }).catch(() => { });
        await waitFor(() => expect(result.current.isError).toBe(true));
    });
});
