/**
 * 파일명: src/hooks/useDeleteEdge.ts
 * 목적: 엣지 삭제 React Query Mutation 훅
 * 역할: 엣지를 삭제하고 관련 캐시를 업데이트하는 기능 제공
 * 작성일: 2024-07-01
 * @rule   three-layer-standard
 * @layer  tanstack-query-hook
 * @tag    @tanstack-mutation-msw useDeleteEdge
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { deleteEdgeAPI } from '@/services/edgeService';
import { Edge } from '@/types/edge';

/**
 * useDeleteEdge: 엣지를 삭제하는 뮤테이션 훅
 * @param options - useMutation 추가 옵션 (선택사항)
 * @returns UseMutationResult 객체 (mutate, status, error 등 포함)
 */
export function useDeleteEdge(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['deleteEdge'],
    mutationFn: (edgeId: string) => deleteEdgeAPI(edgeId),
    onSuccess: (_, deletedEdgeId) => {
      // 삭제된 엣지의 캐시 제거
      queryClient.removeQueries({ queryKey: ['edge', deletedEdgeId] });
      
      // 엣지 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['edges'] });
      
      // 기존 엣지 데이터가 캐시에 있으면 소스/타겟 관련 쿼리도 무효화
      const existingEdge = queryClient.getQueryData<Edge>(['edge', deletedEdgeId]);
      if (existingEdge) {
        if (existingEdge.source) {
          queryClient.invalidateQueries({ 
            queryKey: ['edges', { source: existingEdge.source }] 
          });
        }
        
        if (existingEdge.target) {
          queryClient.invalidateQueries({ 
            queryKey: ['edges', { target: existingEdge.target }] 
          });
        }
      }
    }
  });
} 