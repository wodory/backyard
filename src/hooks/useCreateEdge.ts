/**
 * 파일명: src/hooks/useCreateEdge.ts
 * 목적: 엣지 생성 React Query Mutation 훅
 * 역할: 새 엣지를 생성하고 엣지 목록 캐시를 무효화하는 기능 제공
 * 작성일: 2024-07-01
 * @rule   three-layer-standard
 * @layer  tanstack-query-hook
 * @tag    @tanstack-mutation-msw useCreateEdge
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { createEdgeAPI } from '@/services/edgeService';
import { Edge, EdgeInput } from '@/types/edge';

/**
 * useCreateEdge: 새 엣지를 생성하는 뮤테이션 훅
 * @returns UseMutationResult 객체 (mutate, status, error 등 포함)
 */
export function useCreateEdge(): UseMutationResult<Edge[], Error, EdgeInput | EdgeInput[]> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createEdge'],
    mutationFn: (edgeInput: EdgeInput | EdgeInput[]) => createEdgeAPI(edgeInput),
    onSuccess: (newEdges, variables) => {
      // 엣지 목록 쿼리 무효화 → 목록 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ['edges'] });
      
      // 새 엣지의 소스/타겟 관련 쿼리도 무효화
      const inputs = Array.isArray(variables) ? variables : [variables];
      const sources = new Set(inputs.map(input => input.source));
      const targets = new Set(inputs.map(input => input.target));
      
      sources.forEach(source => {
        queryClient.invalidateQueries({ queryKey: ['edges', { source }] });
      });
      
      targets.forEach(target => {
        queryClient.invalidateQueries({ queryKey: ['edges', { target }] });
      });
    }
  });
} 