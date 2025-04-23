/**
 * 파일명: src/hooks/useEdges.ts
 * 목적: 엣지 목록 조회 React Query 훅
 * 역할: 엣지 목록을 가져오고 캐싱하는 훅 제공
 * 작성일: 2024-07-01
 * @rule   three-layer-standard
 * @layer  tanstack-query-hook
 * @tag    @tanstack-query-msw fetchEdges
 */

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { fetchEdges } from '@/services/edgeService';
import { Edge } from '@/types/edge';

/**
 * useEdges: 엣지 목록을 조회하는 훅
 * @param params - 필터링 파라미터 (source, target, userId)
 * @param options - useQuery 추가 옵션 (선택사항)
 * @returns 엣지 목록 쿼리 결과 (data, isLoading, error 등)
 */
export function useEdges(
  params?: { source?: string; target?: string; userId?: string },
  options?: Omit<UseQueryOptions<Edge[], Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<Edge[], Error> {
  return useQuery({
    queryKey: ['edges', params],
    queryFn: () => fetchEdges(params),
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 "신선"하게 유지 (불필요한 재요청 방지)
    ...options,
  });
}