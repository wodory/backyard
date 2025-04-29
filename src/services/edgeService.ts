/**
 * 파일명: src/services/edgeService.ts
 * 목적: 엣지 관련 API 통신 서비스
 * 역할: 엣지 데이터의 CRUD 작업을 위한 API 호출 함수 제공
 * 작성일: 2024-07-01
 * 수정일: 2025-04-21 : Task 1.4 요구사항 반영 - fetchEdges 함수 수정 및 타입 정의
 * 수정일: 2025-04-21 : 타입 정의를 src/types/edge.ts로 이동
 * 수정일: 2025-04-21 : ApiEdge 타입 이름을 Edge로 변경
 * 수정일: 2025-04-21 : deleteEdgeAPI 함수 URL 경로 수정 - Task 2.6 요구사항 반영
 * 수정일: 2025-04-21 : createEdgeAPI 함수 로깅 및 에러 처리 개선 - Task 2.6 요구사항 반영
 * @rule   three-layer-standard
 * @layer  service
 * @tag    @service-msw fetchEdges
 * @tag    @service-msw createEdge
 * @tag    @service-msw deleteEdge
 */

import createLogger from '@/lib/logger';
import { Edge, EdgeInput, EdgePatch } from '@/types/edge';

const logger = createLogger('edgeService');

/**
 * fetchEdges: 특정 프로젝트의 엣지 목록을 조회합니다.
 *             (API는 내부적으로 세션을 통해 사용자 ID를 확인합니다)
 * @param {string} projectId - 조회할 프로젝트 ID
 * @returns {Promise<Edge[]>} 엣지 목록 (API 응답 형식)
 */
export async function fetchEdges(projectId: string): Promise<Edge[]> {
  // projectId 유효성 검사
  if (!projectId) {
    logger.warn('fetchEdges: projectId가 제공되지 않았습니다.');
    return []; // 빈 배열 반환
  }
  
  try {
    // API 엔드포인트 및 쿼리 파라미터 수정
    const url = `/api/edges?projectId=${encodeURIComponent(projectId)}`;
    logger.debug(`[edgeService] Fetching edges from: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.text(); // 에러 내용 확인 위해 text() 사용
      logger.error(`엣지 조회 실패: ${response.status} ${response.statusText}`, { url, errorData });
      throw new Error(`엣지 목록을 가져오는 중 오류가 발생했습니다: ${response.statusText} (${response.status})`);
    }

    const data: Edge[] = await response.json();
    logger.debug(`[edgeService] Fetched ${data.length} edges for project ${projectId}`);
    return data;
  } catch (error) {
    logger.error(`fetchEdges 오류 (projectId: ${projectId}):`, error);
    throw error;
  }
}

/**
 * fetchEdgeById: 특정 ID의 엣지 조회
 * @param {string} id - 엣지 ID
 * @returns {Promise<Edge>} 엣지 데이터
 */
export async function fetchEdgeById(id: string): Promise<Edge> {
  try {
    const response = await fetch(`/api/edges/${id}`);
    
    if (!response.ok) {
      throw new Error(response.statusText || '엣지를 가져오는 중 오류가 발생했습니다.');
    }
    
    return await response.json();
  } catch (error) {
    logger.error(`엣지 조회 오류 (ID=${id}):`, error);
    throw error;
  }
}

/**
 * createEdgeAPI: 새 엣지 생성
 * @param {EdgeInput | EdgeInput[]} input - 생성할 엣지 데이터(단일 또는 배열)
 * @returns {Promise<Edge[]>} 생성된 엣지 정보
 */
export async function createEdgeAPI(input: EdgeInput | EdgeInput[]): Promise<Edge[]> {
  try {
    logger.debug('[edgeService] Creating edge(s)', { input });
    
    const response = await fetch('/api/edges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      logger.error(`엣지 생성 실패: ${response.status} ${response.statusText}`, { input, errorData });
      throw new Error(response.statusText || '엣지 생성 중 오류가 발생했습니다.');
    }
    
    const createdEdges = await response.json();
    logger.debug(`[edgeService] Successfully created ${Array.isArray(createdEdges) ? createdEdges.length : 1} edges`);
    return createdEdges;
  } catch (error) {
    logger.error('엣지 생성 오류:', error);
    throw error;
  }
}

/**
 * updateEdgeAPI: 엣지 업데이트
 * @param {string} id - 업데이트할 엣지 ID
 * @param {EdgePatch} patch - 업데이트할 속성
 * @returns {Promise<Edge>} 업데이트된 엣지 정보
 */
export async function updateEdgeAPI(id: string, patch: Partial<EdgePatch>): Promise<Edge> {
  try {
    const response = await fetch(`/api/edges/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patch),
    });
    
    if (!response.ok) {
      throw new Error(response.statusText || '엣지 업데이트 중 오류가 발생했습니다.');
    }
    
    return await response.json();
  } catch (error) {
    logger.error(`엣지 업데이트 오류 (ID=${id}):`, error);
    throw error;
  }
}

/**
 * deleteEdgeAPI: 엣지 삭제
 * @param {string} id - 삭제할 엣지 ID
 * @returns {Promise<void>}
 */
export async function deleteEdgeAPI(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/edges?ids=${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      logger.error(`엣지 삭제 실패: ${response.status} ${response.statusText}`, { id, errorData });
      throw new Error(response.statusText || '엣지 삭제 중 오류가 발생했습니다.');
    }
    
    logger.debug(`[edgeService] Edge ${id} successfully deleted`);
  } catch (error) {
    logger.error(`엣지 삭제 오류 (ID=${id}):`, error);
    throw error;
  }
}

/**
 * deleteEdgesAPI: 다중 엣지 삭제
 * @param {string[]} ids - 삭제할 엣지 ID 배열
 * @returns {Promise<void>}
 */
export async function deleteEdgesAPI(ids: string[]): Promise<void> {
  try {
    if (!ids.length) {
      logger.warn('[edgeService] deleteEdgesAPI called with empty ids array');
      return; // 빈 배열이면 API 호출 스킵
    }
    
    const idParam = ids.join(',');
    logger.debug(`[edgeService] Deleting multiple edges: ${idParam}`);
    
    const response = await fetch(`/api/edges?ids=${idParam}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      logger.error(`다중 엣지 삭제 실패: ${response.status} ${response.statusText}`, { ids, errorData });
      throw new Error(response.statusText || '엣지 일괄 삭제 중 오류가 발생했습니다.');
    }
    
    const result = await response.json();
    logger.debug(`[edgeService] Successfully deleted ${result.deletedCount} edges`);
  } catch (error) {
    logger.error(`엣지 일괄 삭제 오류 (IDs=${ids.join(',')}):`, error);
    throw error;
  }
} 