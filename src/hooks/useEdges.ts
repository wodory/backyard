/**
 * 파일명: src/hooks/useEdges.ts
 * 목적: 아이디어맵 엣지 데이터 조회를 위한 TanStack Query 훅
 * 역할: API에서 가져온 엣지 데이터를 React Flow 형식으로 변환하여 제공
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : ApiEdge 별칭 대신 Edge 타입 직접 사용
 * 수정일: 2025-04-21 : React Flow의 Edge를 기본 Edge로 사용하도록 수정
 */

/**
 * @rule   three-layer-Standard
 * @layer  tanstack-query-hook
 * @tag    @tanstack-query-msw useEdges
 * 설명    아이디어맵 엣지 데이터 조회를 위한 TanStack Query 훅
 */
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchEdges } from '@/services/edgeService';
import { Edge as DBEdge } from '@/types/edge';
import { Edge } from '@xyflow/react';
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

// useCreateEdge, useDeleteEdge는 다음 Task에서 구현 