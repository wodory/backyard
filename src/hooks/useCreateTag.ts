/**
 * 파일명: src/hooks/useCreateTag.ts
 * 목적: 태그 생성 React Query Mutation 훅
 * 역할: 새 태그를 생성하고 태그 목록 캐시를 무효화하는 기능 제공
 * 작성일: 2025-04-21
 * @rule   three-layer-standard
 * @layer  tanstack-query-hook
 * @tag    @tanstack-mutation-msw useCreateTag
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { createTagAPI, Tag, TagInput } from '@/services/tagService';

/**
 * useCreateTag: 새 태그를 생성하는 뮤테이션 훅
 * @returns UseMutationResult 객체 (mutate, status, error 등 포함)
 */
export function useCreateTag(): UseMutationResult<Tag, Error, TagInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createTag'],
    mutationFn: (tagInput: TagInput) => createTagAPI(tagInput),
    onSuccess: () => {
      // 태그 목록 쿼리 무효화 → 목록 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    }
  });
} 