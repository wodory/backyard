/**
 * 파일명: src/hooks/useCreateCard.ts
 * 목적: 카드 생성을 위한 Mutation 훅
 * 역할: React Query useMutation을 사용하여 카드 생성 기능 제공
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : MSW 테스트를 위해 직접 fetch API 사용으로 변경
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { Card, CreateCardInput as CardInput } from '../types/card';

/**
 * createCardAPI: 직접 API 호출을 구현한 함수
 * @param {CardInput | CardInput[]} input - 생성할 카드 데이터(단일 또는 배열)
 * @returns {Promise<Card[]>} 생성된 카드 정보 배열
 */
async function createCardAPI(input: CardInput | CardInput[]): Promise<Card[]> {
  const response = await fetch('/api/cards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '카드 생성 중 오류가 발생했습니다.');
  }
  
  return await response.json();
}

/**
 * useCreateCard: 카드 생성을 위한 Mutation 훅
 * @returns {UseMutationResult<Card[], Error, CardInput | CardInput[]>} 카드 생성 mutation 결과
 */
export function useCreateCard(): UseMutationResult<Card[], Error, CardInput | CardInput[]> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload) => createCardAPI(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    }
  });
} 