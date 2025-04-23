/**
 * 파일명: src/hooks/useEdge.ts
 * 목적: 단일 엣지 조회 React Query 훅
 * 역할: 특정 ID의 엣지를 가져오고 캐싱하는 훅 제공
 * 작성일: 2024-07-01
 * @rule   three-layer-standard
 * @layer  tanstack-query-hook
 * @tag    @tanstack-query-msw fetchEdgeById
 */

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { fetchEdgeById } from '@/services/edgeService';
import { Edge } from '@/types/edge';

/**
 * useEdge: 특정 ID의 엣지를 조회하는 훅
 * @param edgeId - 조회할 엣지 ID (없으면 비활성화)
 * @param options - useQuery 추가 옵션 (선택사항)
 * @returns 특정 엣지 쿼리 결과 (data, isLoading, error 등)
 */
export function useEdge(
  edgeId?: string,
  options?: Omit<UseQueryOptions<Edge, Error>, 'queryKey' | 'queryFn' | 'enabled'>
): UseQueryResult<Edge, Error> {
  return useQuery({
    queryKey: ['edge', edgeId],
    queryFn: () => fetchEdgeById(edgeId!),
    enabled: !!edgeId, // edgeId가 있을 때만 활성화
    ...options,
  });
} 