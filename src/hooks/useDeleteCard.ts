/**
 * 파일명: useDeleteCard.ts
 * 목적: 카드 삭제를 위한 React Query Mutation 훅 구현
 * 역할: 단일 카드 삭제 API 호출과 관련 쿼리 캐시 무효화 처리
 * 작성일: 2023-05-11
 * 수정일: 2025-04-21 : 카드 삭제 시 cardNodes 쿼리 무효화 추가
 * @rule   three-layer-standard
 * @layer  TanStack Query 훅
 * @tag    @tanstack-mutation-msw useDeleteCard
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { deleteCardAPI } from '@/services/cardService';

/**
 * useDeleteCard: 단일 카드 삭제를 위한 mutation 훅
 * @param {string} cardId - 삭제할 카드의 ID
 * @param {string} [projectId] - 카드가 속한 프로젝트 ID (옵션)
 * @returns {UseMutationResult<void, Error, void>} - mutation 결과 객체
 */
export function useDeleteCard(cardId: string, projectId?: string): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['deleteCard', cardId],
    mutationFn: () => deleteCardAPI(cardId),
    onSuccess: () => {
      // 카드 목록 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      
      // 해당 카드의 상세 정보 쿼리 캐시 제거
      queryClient.removeQueries({ queryKey: ['card', cardId] });
      
      // CardNode 쿼리 캐시 무효화 (Task 3.5)
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['cardNodes', projectId] });
      } else {
        // 프로젝트 ID를 모르는 경우 cardNodes로 시작하는 모든 쿼리 무효화
        queryClient.invalidateQueries({ queryKey: ['cardNodes'] });
      }
    },
  });
}

/**
 * @mermaid
 * graph TD
 *   UI[Sidebar/Card Component] -->|calls| MH[useDeleteCard 훅]
 *   MH -->|delete| SVC[cardService.deleteCardAPI]
 *   SVC -->|HTTP DELETE| API[/api/cards/[id]]
 *   API -->|cascade delete| DB[(CardNode 테이블)]
 *   MH -->|invalidate| QC1[cards 쿼리]
 *   MH -->|remove| QC2[card 쿼리]
 *   MH -->|invalidate| QC3[cardNodes 쿼리]
 *   
 *   classDef hook fill:#f6d365,stroke:#555;
 *   classDef svc fill:#cdeffd,stroke:#555;
 *   class MH hook;
 *   class SVC svc;
 */ 