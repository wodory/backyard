/**
 * 파일명: src/hooks/useCreateCard.ts
 * 목적: 카드 생성을 위한 Mutation 훅
 * 역할: React Query useMutation을 사용하여 카드 생성 기능 제공
 * 작성일: 2025-04-21
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { Card, CreateCardInput as CardInput } from '../types/card';
import { createCardsAPI } from '../services/cardService';

/**
 * useCreateCard: 카드 생성을 위한 Mutation 훅
 * @returns {UseMutationResult<Card[], Error, CardInput | CardInput[]>} 카드 생성 mutation 결과
 */
export function useCreateCard(): UseMutationResult<Card[], Error, CardInput | CardInput[]> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload) => createCardsAPI(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    }
  });
} 