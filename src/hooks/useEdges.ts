/**
 * 파일명: src/hooks/useEdges.ts
 * 목적: 아이디어맵 엣지 데이터 조회를 위한 TanStack Query 훅
 * 역할: API에서 가져온 엣지 데이터를 React Flow 형식으로 변환하여 제공
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : ApiEdge 별칭 대신 Edge 타입 직접 사용
 * 수정일: 2025-04-21 : React Flow의 Edge를 기본 Edge로 사용하도록 수정
 * 수정일: 2025-04-21 : useCreateEdge 뮤테이션 훅 추가
 */

/**
 * @rule   three-layer-Standard
 * @layer  tanstack-query-hook
 * @tag    @tanstack-query-msw useEdges
 * 설명    아이디어맵 엣지 데이터 조회를 위한 TanStack Query 훅
 */
import { useQuery, useMutation, UseQueryResult, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { fetchEdges, createEdgeAPI } from '@/services/edgeService';
import { Edge as DBEdge, EdgeInput } from '@/types/edge';
import { Edge, Connection } from '@xyflow/react';
import { toast } from 'sonner';
import createLogger from '@/lib/logger';

const logger = createLogger('useEdges');

/**
 * transformDbEdgeToFlowEdge: DB 엣지를 React Flow 엣지로 변환하는 함수
 * @param {DBEdge} dbEdge - API에서 받아온 엣지 데이터
 * @returns {Edge} React Flow에서 사용할 수 있는 Edge 객체
 */
const transformDbEdgeToFlowEdge = (dbEdge: DBEdge): Edge => ({
    id: dbEdge.id,
    source: dbEdge.source, // Prisma 스키마의 source 필드 사용
    target: dbEdge.target, // Prisma 스키마의 target 필드 사용
    type: dbEdge.type || 'custom', // dbEdge에서 type 가져오거나 'custom' 사용
    animated: dbEdge.animated || false,
    style: dbEdge.style || undefined,
    data: dbEdge.data || undefined,
});

/**
 * 엣지 생성을 위한 입력 데이터 타입 (Connection 필드명과 API 필드명 매핑)
 */
export interface CreateEdgeInput {
  // Connection에서는 source/target이지만 API에서는 sourceCardId/targetCardId로 매핑
  sourceCardId?: string; // 실제 API에서는 source로 변환됨
  targetCardId?: string; // 실제 API에서는 target으로 변환됨
  source?: string;      // 직접 source를 받을 수도 있음
  target?: string;      // 직접 target을 받을 수도 있음
  projectId: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
  data?: Record<string, any>;
}

// CreateEdgeInput을 EdgeInput으로 변환하는 함수
const mapToEdgeInput = (input: CreateEdgeInput): EdgeInput => {
  return {
    source: input.source || input.sourceCardId || '',
    target: input.target || input.targetCardId || '',
    projectId: input.projectId,
    type: input.type,
    animated: input.animated,
    style: input.style,
    data: input.data
  };
};

/**
 * useEdges: 아이디어맵 엣지 데이터를 조회하는 TanStack Query 훅
 * @param {string} userId - 현재 사용자 ID
 * @param {string} projectId - 현재 프로젝트 ID
 * @returns {UseQueryResult<Edge[], Error>} 쿼리 결과 (로딩, 에러, 데이터 상태 포함)
 */
export function useEdges(userId?: string, projectId?: string): UseQueryResult<Edge[], Error> {
  return useQuery({
    queryKey: ['edges', userId, projectId],
    queryFn: async () => {
      logger.debug(`엣지 데이터 조회: userId=${userId}, projectId=${projectId}`);
      if (!projectId) {
        logger.warn('projectId가 없어 엣지 데이터를 조회할 수 없습니다.');
        return [];
      }
      
      const dbEdges = await fetchEdges(projectId);
      const flowEdges = dbEdges.map(transformDbEdgeToFlowEdge);
      logger.debug(`변환된 엣지 ${flowEdges.length}개`);
      return flowEdges;
    },
    enabled: !!projectId,
    staleTime: 1 * 60 * 1000, // 1분 stale time (조정 가능)
    gcTime: 5 * 60 * 1000, // 5분 gc time (조정 가능)
  });
}

/**
 * useCreateEdge: 새로운 엣지를 생성하는 뮤테이션 훅
 * @rule   three-layer-Standard
 * @layer  tanstack-mutation-hook
 * @tag    @tanstack-mutation-msw useCreateEdge
 * @returns {UseMutationResult} 뮤테이션 결과
 */
export function useCreateEdge(): UseMutationResult<DBEdge[], Error, CreateEdgeInput> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (edgeData: CreateEdgeInput) => {
      logger.debug('새 엣지 생성 요청:', edgeData);
      const apiInput = mapToEdgeInput(edgeData);
      return await createEdgeAPI(apiInput);
    },
    onSuccess: (data, variables) => {
      logger.debug('엣지 생성 성공:', data);
      // 성공적으로 생성되면 엣지 데이터 쿼리 무효화
      queryClient.invalidateQueries({ 
        queryKey: ['edges', undefined, variables.projectId] 
      });
      toast.success('엣지가 성공적으로 생성되었습니다.');
    },
    onError: (error) => {
      logger.error('엣지 생성 실패:', error);
      toast.error('엣지 생성 중 오류가 발생했습니다.');
    }
  });
}

// useDeleteEdge는 다음 Task에서 구현 