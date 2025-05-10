/**
 * 파일명: src/hooks/useCreateEdge.ts
 * 목적: 엣지 생성을 위한 TanStack Query 뮤테이션 훅
 * 역할: 엣지 생성 API 호출 및 쿼리 캐시 무효화 처리
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : 새 엣지 생성 시 전역 엣지 설정 적용
 * 수정일: 2025-05-21 : Zustand Store 의존성 제거 - RQ 설정 훅 사용
 * 수정일: 2025-05-21 : 설정 객체 구조 접근 방식 수정
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
import { useIdeaMapSettings } from '@/hooks/useIdeaMapSettings';
import { DEFAULT_SETTINGS } from '@/lib/ideamap-utils';
import createLogger from '@/lib/logger';

const logger = createLogger('useCreateEdge');

/**
 * useCreateEdge: 엣지 생성을 위한 TanStack Query 뮤테이션 훅
 * @returns 엣지 생성 뮤테이션 객체
 */
export function useCreateEdge() {
  const queryClient = useQueryClient();
  // React Query 훅을 사용하여 설정 정보 가져오기
  const { ideaMapSettings } = useIdeaMapSettings();

  return useMutation({
    mutationFn: async (edgeData: EdgeInput) => {
      logger.debug('엣지 생성 요청:', edgeData);
      
      // 설정 정보 액세스
      const edgeSettings = ideaMapSettings?.edge || DEFAULT_SETTINGS;
      
      // 전역 엣지 스타일 설정을 새 엣지에 적용
      const enhancedEdgeData: EdgeInput = {
        ...edgeData,
        // 타입 설정
        type: 'custom',
        // 스타일 설정
        style: {
          ...(edgeData.style || {}),
          stroke: edgeSettings.edgeColor,
          strokeWidth: edgeSettings.strokeWidth,
        },
        // 추가 데이터 설정
        data: {
          ...(edgeData.data || {}),
          edgeType: edgeSettings.connectionLineType,
          animated: edgeSettings.animated,
          settings: {
            animated: edgeSettings.animated,
            connectionLineType: edgeSettings.connectionLineType,
            strokeWidth: edgeSettings.strokeWidth,
            edgeColor: edgeSettings.edgeColor,
            selectedEdgeColor: edgeSettings.selectedEdgeColor,
          }
        }
      };
      
      // 마커 설정 (있을 경우에만)
      if (edgeSettings.markerEnd) {
        enhancedEdgeData.data = {
          ...(enhancedEdgeData.data || {}),
          markerEnd: {
            type: edgeSettings.markerEnd,
            width: edgeSettings.markerSize,
            height: edgeSettings.markerSize,
            color: edgeSettings.edgeColor,
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