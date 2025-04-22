/**
 * 파일명: src/hooks/useUpdateCard.test.tsx
 * 목적: useUpdateCard 훅의 기능 테스트
 * 역할: TanStack Query 뮤테이션 훅의 수정 기능 검증
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : MSW 서버 설정 수정
 */

import React from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateCard } from './useUpdateCard';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateCardInput } from '../types/card';
import { http, HttpResponse } from 'msw';
import { setupMSW } from './mocks/node';
import { mockUpdatedCard } from './mocks/handlers';

// MSW 서버 설정
const msw = setupMSW();

describe('@tanstack-mutation-msw useUpdateCard', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    it('카드 수정 성공 시 해당 캐시를 무효화한다', async () => {
        // QueryClient 설정
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false }
            }
        });

        // 캐시 무효화 모니터링
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

        // 테스트 래퍼
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );

        // 훅 렌더링
        const { result } = renderHook(() => useUpdateCard(), { wrapper });

        // 테스트 데이터
        const cardId = 'test-card-123';
        const patch: UpdateCardInput = {
            title: '수정된 카드',
            content: '수정된 내용'
        };

        // 뮤테이션 실행
        const response = await result.current.mutateAsync({ id: cardId, patch });

        // 응답 데이터 검증
        expect(response).toEqual(mockUpdatedCard);

        // 캐시 무효화 검증 - 카드 목록 캐시
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['cards'] });

        // 캐시 무효화 검증 - 특정 카드 캐시
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['card', cardId] });
    });

    it('서버 오류 발생 시 예외를 전파한다', async () => {
        // 오류 응답 핸들러 추가
        msw.use(
            http.patch('/api/cards/:id', () => {
                return new HttpResponse(JSON.stringify({ error: '서버 오류' }), {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            })
        );

        // QueryClient 설정
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false }
            }
        });

        // 테스트 래퍼
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );

        // 훅 렌더링
        const { result } = renderHook(() => useUpdateCard(), { wrapper });

        // 테스트 데이터
        const cardId = 'test-card-123';
        const patch: UpdateCardInput = {
            title: '실패할 업데이트',
        };

        // 뮤테이션 실행 및 오류 검증
        await expect(result.current.mutateAsync({ id: cardId, patch })).rejects.toThrow();
    });
});

/**
 * @rule three-layer-standard
 * @layer hooks
 * @tag @tanstack-mutation-msw useUpdateCard
 */

/**
 * 다이어그램:
 * 
 * sequenceDiagram
 *   participant UI
 *   participant UpdateCard as useUpdateCard
 *   participant Service as updateCardAPI
 *   participant MSW as MSW (STUB)
 *   
 *   UI->>UpdateCard: mutateAsync({id, patch})
 *   UpdateCard->>Service: updateCardAPI(id, patch)
 *   Service->>MSW: PATCH /api/cards/:id
 *   MSW-->>Service: 200 mockUpdatedCard
 *   Service-->>UpdateCard: resolve(mockUpdatedCard)
 *   UpdateCard->>QueryCache: invalidateQueries(['cards'])
 *   UpdateCard->>QueryCache: invalidateQueries(['card', id])
 *   UpdateCard-->>UI: 업데이트된 카드 반환
 */
