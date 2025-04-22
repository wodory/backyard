/**
 * 파일명: src/hooks/useDeleteTag.ts
 * 목적: 태그 삭제 React Query Mutation 훅
 * 역할: 태그를 삭제하고 태그 목록 캐시를 무효화하는 기능 제공
 * 작성일: 2025-04-21
 * @rule   three-layer-standard
 * @layer  tanstack-query-hook
 * @tag    @tanstack-mutation-msw useDeleteTag
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { deleteTagAPI } from '@/services/tagService';

/**
 * useDeleteTag: 태그를 삭제하는 뮤테이션 훅
 * @returns UseMutationResult 객체 (mutate, status, error 등 포함)
 */
export function useDeleteTag(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['deleteTag'],
    mutationFn: (tagId: string) => deleteTagAPI(tagId),
    onSuccess: () => {
      // 태그 목록 쿼리 무효화 → 목록 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    }
  });
} 