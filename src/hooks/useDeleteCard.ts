/**
 * 파일명: useDeleteCard.ts
 * 목적: 카드 삭제를 위한 React Query Mutation 훅 구현
 * 역할: 단일 카드 삭제 API 호출과 관련 쿼리 캐시 무효화 처리
 * 작성일: 2023-05-11
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { deleteCardAPI } from '@/services/cardService';

/**
 * useDeleteCard: 단일 카드 삭제를 위한 mutation 훅
 * @param {string} cardId - 삭제할 카드의 ID
 * @returns {UseMutationResult<void, Error, void>} - mutation 결과 객체
 */
export function useDeleteCard(cardId: string): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['deleteCard', cardId],
    mutationFn: () => deleteCardAPI(cardId),
    onSuccess: () => {
      // 카드 목록 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      
      // 해당 카드의 상세 정보 쿼리 캐시 제거
      queryClient.removeQueries({ queryKey: ['card', cardId] });
    },
  });
} 