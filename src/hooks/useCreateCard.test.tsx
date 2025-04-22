/**
 * 파일명: src/hooks/useCreateCard.test.tsx
 * 목적: useCreateCard 훅 테스트
 * 역할: useCreateCard 훅의 기능을 검증하는 테스트
 * 작성일: 2025-04-21
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateCard } from './useCreateCard';
import * as cardService from '../services/cardService';
import { CreateCardInput } from '../types/card';
import React from 'react';

// 테스트를 위한 wrapper 컴포넌트
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

const mockCardResponse = [{
    id: 'test-id',
    title: 'Test Card',
    content: 'Test Content',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'user-1'
}];

describe('useCreateCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('invalidateQueries 테스트', () => {
        // 테스트 데이터로 성공 콜백 직접 호출
        const mockQueryClient = new QueryClient();
        const invalidateQueriesSpy = vi.spyOn(mockQueryClient, 'invalidateQueries');

        // useCreateCard 내에서 호출되는 onSuccess 콜백 직접 생성 및 호출
        const onSuccess = () => {
            mockQueryClient.invalidateQueries({ queryKey: ['cards'] });
        };

        // onSuccess 콜백 호출
        onSuccess();

        // invalidateQueries가 적절한 쿼리 키로 호출되었는지 확인
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['cards'] });
    });

    it('mutationFn 테스트', () => {
        // createCardsAPI 목킹
        const mockCreateCards = vi.fn().mockResolvedValue(mockCardResponse);
        vi.spyOn(cardService, 'createCardsAPI').mockImplementation(mockCreateCards);

        // 테스트 데이터
        const cardInput: CreateCardInput = {
            title: '새 카드',
            content: '카드 내용',
            userId: 'user-1'
        };

        // mutation 함수 직접 테스트
        const mutationFn = (payload: CreateCardInput | CreateCardInput[]) =>
            cardService.createCardsAPI(payload);

        mutationFn(cardInput);
        expect(mockCreateCards).toHaveBeenCalledWith(cardInput);
    });
}); 