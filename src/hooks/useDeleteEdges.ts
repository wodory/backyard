/**
 * 파일명: src/hooks/useDeleteEdges.ts
 * 목적: 다중 엣지 삭제 React Query Mutation 훅
 * 역할: 여러 엣지를 삭제하고 관련 캐시를 업데이트하는 기능 제공
 * 작성일: 2024-07-01
 * @rule   three-layer-standard
 * @layer  tanstack-query-hook
 * @tag    @tanstack-mutation-msw useDeleteEdges
 */

import { useMutation, useQueryClient, UseMutationResult, QueryKey } from '@tanstack/react-query';
import { deleteEdgesAPI } from '@/services/edgeService';

/**
 * useDeleteEdges: 여러 엣지를 삭제하는 뮤테이션 훅
 * @returns UseMutationResult 객체 (mutate, status, error 등 포함)
 */
export function useDeleteEdges(): UseMutationResult<void, Error, string[]> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['deleteEdges'],
    mutationFn: (edgeIds: string[]) => deleteEdgesAPI(edgeIds),
    onSuccess: (_, deletedEdgeIds) => {
      // 삭제된 각 엣지의 캐시 제거
      deletedEdgeIds.forEach(edgeId => {
        queryClient.removeQueries({ queryKey: ['edge', edgeId] });
      });
      
      // 모든 엣지 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['edges'] });
      
      // 여러 엣지가 한 번에 삭제되므로 소스/타겟 기반 필터링된 목록도 모두 무효화
      queryClient.invalidateQueries({
        queryKey: ['edges'],
        predicate: (query) => {
          const queryKey = query.queryKey as (string | Record<string, unknown>)[];
          return queryKey.length > 1 && 
                 typeof queryKey[1] === 'object' && 
                 ('source' in queryKey[1] || 'target' in queryKey[1]);
        }
      });
    }
  });
} 