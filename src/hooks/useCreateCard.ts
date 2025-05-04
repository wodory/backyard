/**
 * 파일명: src/hooks/useCreateCard.ts
 * 목적: 카드 생성을 위한 Mutation 훅
 * 역할: React Query useMutation을 사용하여 카드 생성 기능 제공
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : MSW 테스트를 위해 직접 fetch API 사용으로 변경
 * 수정일: 2025-04-21 : 의존성 주입을 통한 useIdeaMapStore 분리 및 노드 배치 요청 콜백 추가
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { Card, CreateCardInput as CardInput } from '../types/card';

interface CreateCardVariables {
  cardData: CardInput;
}

interface UseCreateCardOptions {
  onSuccess?: (data: Card[] | Card, variables: CreateCardVariables, context: unknown) => void | Promise<unknown>;
  onError?: (error: Error, variables: CreateCardVariables, context: unknown) => void | Promise<unknown>;
  // 노드 배치 요청 콜백 (핵심)
  onPlaceNodeRequest?: (cardId: string, projectId: string) => void;
}

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
 * @param {UseCreateCardOptions} options - 훅 옵션 (성공/에러 콜백, 노드 배치 요청 콜백)
 * @returns {UseMutationResult<Card[], Error, CreateCardVariables>} 카드 생성 mutation 결과
 */
export function useCreateCard(
  options?: UseCreateCardOptions
): UseMutationResult<Card[], Error, CreateCardVariables> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload) => createCardAPI(payload.cardData),
    onSuccess: (newCards, variables, context) => {
      const newCard = Array.isArray(newCards) ? newCards[0] : newCards; // API 응답 따라 조정

      // 1. 카드 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      console.log('[useCreateCard onSuccess] Invalidated cards query.');

      // 2. 주입된 노드 배치 요청 콜백 호출
      if (options?.onPlaceNodeRequest && newCard?.id && newCard.projectId) {
        console.log('[useCreateCard onSuccess] Calling injected onPlaceNodeRequest:', { 
          cardId: newCard.id, 
          projectId: newCard.projectId,
          hasCallback: !!options.onPlaceNodeRequest 
        });
        try {
          options.onPlaceNodeRequest(newCard.id, newCard.projectId);
        } catch (callbackError) {
          console.error('[useCreateCard onSuccess] Error calling onPlaceNodeRequest:', callbackError);
        }
      } else {
        console.log('[useCreateCard onSuccess] No onPlaceNodeRequest callback provided or missing data for node placement.', { 
          hasCallback: !!options?.onPlaceNodeRequest,
          hasCardId: !!newCard?.id,
          hasProjectId: !!newCard?.projectId
        });
      }

      // 3. 원래 onSuccess 콜백 실행 (선택적)
      if (options?.onSuccess) {
        console.log('[useCreateCard onSuccess] Calling original onSuccess callback.');
        options.onSuccess(newCards, variables, context);
      }
    },
    onError: (error, variables, context) => {
      console.error('[useCreateCard onError]', error);
      
      // 주입된 onError 콜백 실행 (선택적)
      if (options?.onError) {
        console.log('[useCreateCard onError] Calling injected onError callback.');
        options.onError(error, variables, context);
      }
    }
  });
} 