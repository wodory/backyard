/**
 * 파일명: src/services/edgeService.ts
 * 목적: 엣지 관련 API 통신 서비스
 * 역할: 엣지 데이터의 CRUD 작업을 위한 API 호출 함수 제공
 * 작성일: 2024-07-01
 * @rule   three-layer-standard
 * @layer  service
 * @tag    @service-msw fetchEdges
 */

import createLogger from '@/lib/logger';
import { Edge, EdgeInput, EdgePatch } from '@/types/edge';

const logger = createLogger('edgeService');

/**
 * fetchEdges: 모든 엣지 목록 또는 필터링된 엣지 조회
 * @param {Object} params - 필터링 파라미터
 * @returns {Promise<Edge[]>} 엣지 목록
 */
export async function fetchEdges(
  params?: { source?: string; target?: string; userId?: string }
): Promise<Edge[]> {
  try {
    // 쿼리 파라미터 생성
    const queryParams = new URLSearchParams();
    if (params?.source) queryParams.append('source', params.source);
    if (params?.target) queryParams.append('target', params.target);
    if (params?.userId) queryParams.append('userId', params.userId);
    
    const queryString = queryParams.toString();
    const url = `/api/edges${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(response.statusText || '엣지 목록을 가져오는 중 오류가 발생했습니다.');
    }
    
    return await response.json();
  } catch (error) {
    logger.error('엣지 목록 조회 오류:', error);
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
    const response = await fetch('/api/edges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    
    if (!response.ok) {
      throw new Error(response.statusText || '엣지 생성 중 오류가 발생했습니다.');
    }
    
    return await response.json();
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
    const response = await fetch(`/api/edges/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(response.statusText || '엣지 삭제 중 오류가 발생했습니다.');
    }
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
    const idParam = ids.join(',');
    const response = await fetch(`/api/edges?ids=${idParam}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(response.statusText || '엣지 일괄 삭제 중 오류가 발생했습니다.');
    }
  } catch (error) {
    logger.error(`엣지 일괄 삭제 오류:`, error);
    throw error;
  }
} 