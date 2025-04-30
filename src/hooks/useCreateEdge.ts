/**
 * 파일명: src/hooks/useCreateEdge.ts
 * 목적: 엣지 생성을 위한 TanStack Query 뮤테이션 훅
 * 역할: 엣지 생성 API 호출 및 쿼리 캐시 무효화 처리
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : 새 엣지 생성 시 전역 엣지 설정 적용
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
import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import createLogger from '@/lib/logger';

const logger = createLogger('useCreateEdge');

/**
 * useCreateEdge: 엣지 생성을 위한 TanStack Query 뮤테이션 훅
 * @returns 엣지 생성 뮤테이션 객체
 */
export function useCreateEdge() {
  const queryClient = useQueryClient();
  // useIdeaMapStore에서 현재 전역 엣지 설정 가져오기
  const ideaMapSettings = useIdeaMapStore(state => state.ideaMapSettings);

  return useMutation({
    mutationFn: async (edgeData: EdgeInput) => {
      logger.debug('엣지 생성 요청:', edgeData);
      
      // 전역 엣지 스타일 설정을 새 엣지에 적용
      const enhancedEdgeData: EdgeInput = {
        ...edgeData,
        // 타입 설정
        type: 'custom',
        // 애니메이션 설정
        animated: ideaMapSettings.animated,
        // 스타일 설정
        style: {
          ...(edgeData.style || {}),
          stroke: ideaMapSettings.edgeColor,
          strokeWidth: ideaMapSettings.strokeWidth,
        },
        // 추가 데이터 설정
        data: {
          ...(edgeData.data || {}),
          edgeType: ideaMapSettings.connectionLineType,
          settings: {
            animated: ideaMapSettings.animated,
            connectionLineType: ideaMapSettings.connectionLineType,
            strokeWidth: ideaMapSettings.strokeWidth,
            edgeColor: ideaMapSettings.edgeColor,
            selectedEdgeColor: ideaMapSettings.selectedEdgeColor,
          }
        }
      };
      
      // 마커 설정 (있을 경우에만)
      if (ideaMapSettings.markerEnd) {
        enhancedEdgeData.data = {
          ...(enhancedEdgeData.data || {}),
          markerEnd: {
            type: ideaMapSettings.markerEnd,
            width: ideaMapSettings.markerSize,
            height: ideaMapSettings.markerSize,
            color: ideaMapSettings.edgeColor,
          }
        };
      }
      
      logger.debug('전역 설정이 적용된 엣지 생성 요청:', enhancedEdgeData);
      return createEdgeAPI(enhancedEdgeData);
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