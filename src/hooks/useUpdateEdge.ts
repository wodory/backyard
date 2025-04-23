/**
 * 파일명: src/hooks/useUpdateEdge.ts
 * 목적: 엣지 수정 React Query Mutation 훅
 * 역할: 엣지를 수정하고 관련 캐시를 업데이트하는 기능 제공
 * 작성일: 2024-07-01
 * @rule   three-layer-standard
 * @layer  tanstack-query-hook
 * @tag    @tanstack-mutation-msw useUpdateEdge
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { updateEdgeAPI } from '@/services/edgeService';
import { Edge, EdgePatch } from '@/types/edge';

interface UpdateEdgeVariables {
  id: string;
  patch: Partial<Omit<EdgePatch, 'id'>>;
}

/**
 * useUpdateEdge: 엣지를 수정하는 뮤테이션 훅
 * @returns UseMutationResult 객체 (mutate, status, error 등 포함)
 */
export function useUpdateEdge(): UseMutationResult<Edge, Error, UpdateEdgeVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['updateEdge'],
    mutationFn: ({ id, patch }: UpdateEdgeVariables) => updateEdgeAPI(id, patch),
    onSuccess: (updatedEdge) => {
      // 특정 엣지 캐시 업데이트
      queryClient.setQueryData(['edge', updatedEdge.id], updatedEdge);
      
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['edges'] });
      
      // 소스/타겟이 변경된 경우 관련 필터 쿼리도 무효화
      if ('source' in updatedEdge || 'target' in updatedEdge) {
        if ('source' in updatedEdge) {
          queryClient.invalidateQueries({ 
            queryKey: ['edges', { source: updatedEdge.source }] 
          });
        }
        
        if ('target' in updatedEdge) {
          queryClient.invalidateQueries({ 
            queryKey: ['edges', { target: updatedEdge.target }] 
          });
        }
      }
    }
  });
} 