/**
 * 파일명: src/hooks/useTags.ts
 * 목적: 태그 목록 조회 React Query 훅
 * 역할: 태그 목록을 가져오고 캐싱하는 훅 제공
 * 작성일: 2025-04-21
 * @rule   three-layer-standard
 * @layer  tanstack-query-hook
 * @tag    @tanstack-query-msw fetchTags
 */

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { fetchTags, Tag } from '@/services/tagService';

/**
 * useTags: 태그 목록을 조회하는 훅
 * @param options - useQuery 추가 옵션 (선택사항)
 * @returns 태그 목록 쿼리 결과 (data, isLoading, error 등)
 */
export function useTags(
  options?: Omit<UseQueryOptions<Tag[], Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<Tag[], Error> {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => fetchTags(),
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 "신선"하게 유지 (불필요한 재요청 방지)
    ...options,
  });
} 