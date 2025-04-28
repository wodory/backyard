/**
 * 파일명: src/hooks/useCreateEdge.ts
 * 목적: 엣지 생성을 위한 TanStack Query 뮤테이션 훅
 * 역할: 엣지 생성 API 호출 및 쿼리 캐시 무효화 처리
 * 작성일: 2025-04-21
 */

/**
 * @rule   three-layer-Standard
 * @layer  tanstack-query-hook
 * @tag    @tanstack-mutation-msw useCreateEdge
 * 설명    엣지 생성을 위한 TanStack Query 뮤테이션 훅
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { EdgeInput } from '@/types/edge';
import { createEdgeAPI } from '@/services/edgeService';
import createLogger from '@/lib/logger';

const logger = createLogger('useCreateEdge');

/**
 * useCreateEdge: 엣지 생성을 위한 TanStack Query 뮤테이션 훅
 * @returns 엣지 생성 뮤테이션 객체
 */
export function useCreateEdge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (edgeData: EdgeInput) => {
      logger.debug('엣지 생성 요청:', edgeData);
      return createEdgeAPI(edgeData);
    },
    onSuccess: (data, variables) => {
      // 성공 시 캐시된 엣지 쿼리 무효화
      logger.debug('엣지 생성 성공:', { 
        edgeId: data[0]?.id, 
        projectId: variables.projectId 
      });
      
      // 엣지 쿼리 무효화 - projectId를 포함한 모든 엣지 쿼리를 무효화
      queryClient.invalidateQueries({ 
        queryKey: ['edges', undefined, variables.projectId] 
      });
      
      toast.success('엣지가 생성되었습니다');
    },
    onError: (error) => {
      logger.error('엣지 생성 실패:', error);
      toast.error(`엣지 생성 중 오류가 발생했습니다: ${error.message}`);
    }
  });
} 