// src/hooks/useCreateCard.test.tsx
import React from 'react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateCard } from './useCreateCard';
import { vi, expect, beforeAll, afterAll, afterEach, describe, it } from 'vitest';
import { CreateCardInput, Card } from '../types/card';

// MSW 서버를 테스트 파일 내에서 직접 설정
const server = setupServer();

describe('@tanstack-mutation-msw useCreateCard', () => {
    // 테스트 전후 서버 라이프사이클
    beforeAll(() => server.listen());
    afterEach(() => {
        server.resetHandlers();
        vi.clearAllMocks();
    });
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
            projectId: 'project-1'
        };
        // 응답을 배열 형태로 준비
        const mockResponse = [mockCard];

        server.use(
            http.post('/api/cards', () => {
                return HttpResponse.json(mockResponse, { status: 201 });
            })
        );

        // 실제 QueryClient + spy
        const qc = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false }
            }
        });
        const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
        const wrapper = createWrapper(qc);

        // 모의 콜백 함수 생성
        const mockOnSuccess = vi.fn();
        const mockOnError = vi.fn();
        const mockOnPlaceNodeRequest = vi.fn();

        // 훅 실행 및 mutateAsync 호출
        const { result } = renderHook(() => useCreateCard({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            onPlaceNodeRequest: mockOnPlaceNodeRequest
        }), { wrapper });

        const input: CreateCardInput = { title: 'Title', content: 'Content', userId: 'user-1', projectId: 'project-1' };

        // mutateAsync 호출 및 결과 기다리기
        const mutateResult = await result.current.mutateAsync({ cardData: input });

        // 데이터 반환 확인 (배열로 반환됨)
        expect(mutateResult).toEqual(mockResponse);

        // 캐시 무효화 호출 검증
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['cards'] });

        // 콜백 함수 호출 검증
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        expect(mockOnPlaceNodeRequest).toHaveBeenCalledWith(mockCard.id, mockCard.projectId);
        expect(mockOnError).not.toHaveBeenCalled();
    }, 10000); // 10초 타임아웃 설정

    it('실패 시 isError 플래그 활성화 및 onError 콜백 호출', async () => {
        server.use(
            http.post('/api/cards', () => {
                return new HttpResponse(JSON.stringify({ error: '카드 생성 중 오류가 발생했습니다.' }), {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
            })
        );

        const qc = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false }
            }
        });
        const wrapper = createWrapper(qc);

        // 모의 콜백 함수 생성
        const mockOnError = vi.fn();
        const mockOnSuccess = vi.fn();
        const mockOnPlaceNodeRequest = vi.fn();

        const { result } = renderHook(() => useCreateCard({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            onPlaceNodeRequest: mockOnPlaceNodeRequest
        }), { wrapper });

        // 실패 처리 실행
        await expect(
            result.current.mutateAsync({
                cardData: { title: 'Fail', content: 'Fail', userId: 'user-2', projectId: 'project-1' }
            })
        ).rejects.toThrow('카드 생성 중 오류가 발생했습니다.');

        // 에러 콜백 호출 검증
        expect(mockOnError).toHaveBeenCalledTimes(1);
        expect(mockOnSuccess).not.toHaveBeenCalled();
        expect(mockOnPlaceNodeRequest).not.toHaveBeenCalled();
    }, 10000); // 10초 타임아웃 설정

    it('onPlaceNodeRequest가 정의되지 않은 경우에도 정상 작동', async () => {
        const mockCard: Card = {
            id: 'test-1',
            title: 'Title',
            content: 'Content',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 'user-1',
            projectId: 'project-1'
        };
        // 응답을 배열 형태로 준비
        const mockResponse = [mockCard];

        server.use(
            http.post('/api/cards', () => {
                return HttpResponse.json(mockResponse, { status: 201 });
            })
        );

        const qc = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false }
            }
        });
        const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
        const wrapper = createWrapper(qc);

        // onPlaceNodeRequest 콜백을 제공하지 않음
        const { result } = renderHook(() => useCreateCard(), { wrapper });

        const input: CreateCardInput = { title: 'Title', content: 'Content', userId: 'user-1', projectId: 'project-1' };

        // mutateAsync 호출 및 결과 기다리기
        const mutateResult = await result.current.mutateAsync({ cardData: input });

        // 데이터 반환 확인 (배열로 반환됨)
        expect(mutateResult).toEqual(mockResponse);

        // 캐시 무효화 호출 검증
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['cards'] });
    }, 10000); // 10초 타임아웃 설정
});
