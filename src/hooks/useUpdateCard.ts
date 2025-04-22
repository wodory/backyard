/**
 * 파일명: src/hooks/useUpdateCard.ts
 * 목적: 카드 수정을 위한 Mutation 훅
 * 역할: React Query useMutation을 사용하여 카드 수정 기능 제공
 * 작성일: 2025-04-21
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { Card, UpdateCardInput } from '../types/card';
import { updateCardAPI } from '../services/cardService';

/**
 * useUpdateCard: 카드 수정을 위한 Mutation 훅
 * @returns {UseMutationResult<Card, Error, {id: string, patch: UpdateCardInput}>} 카드 수정 mutation 결과
 */
export function useUpdateCard(): UseMutationResult<Card, Error, {id: string, patch: UpdateCardInput}> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, patch }) => updateCardAPI(id, patch),
    onSuccess: (updatedCard) => {
      // 카드 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      
      // 해당 카드 상세 정보 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ['card', updatedCard.id] });
    }
  });
} 

// sequenceDiagram
//     participant React컴포넌트
//     participant useUpdateCard훅
//     participant ReactQueryCache
//     participant updateCardAPI
//     participant 서버API
//     participant 데이터베이스

//     React컴포넌트->>useUpdateCard훅: mutate({id: "card-123", patch: {title: "수정된 제목"}})
//     useUpdateCard훅->>updateCardAPI: updateCardAPI("card-123", {title: "수정된 제목"})
//     updateCardAPI->>서버API: PATCH /api/cards/card-123
//     서버API->>데이터베이스: 카드 데이터 업데이트
//     데이터베이스-->>서버API: 업데이트 결과
//     서버API-->>updateCardAPI: 응답 (업데이트된 카드 객체)
//     updateCardAPI-->>useUpdateCard훅: 업데이트된 카드 객체 반환
//     useUpdateCard훅->>ReactQueryCache: invalidateQueries(['cards'])
//     useUpdateCard훅->>ReactQueryCache: invalidateQueries(['card', "card-123"])
//     ReactQueryCache-->>React컴포넌트: UI 업데이트 (최신 데이터로)