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
 * 수정일: 2025-05-01 : 오류 처리 및 로깅 개선 - 인증 오류 구분 및 상세 오류 정보 로깅
 * 수정일: 2025-04-21 : source/target 필드명을 sourceCardNodeId/targetCardNodeId로 변경하여 Prisma 스키마와 일치시킴
 * 수정일: 2025-05-08 : animated 속성을 엣지 테이블에서 제거하고 설정에서 가져오도록 수정
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
      let errorData;
      try {
        // JSON 형식으로 오류 응답이 올 경우
        errorData = await response.json();
      } catch (e) {
        // JSON으로 파싱이 안 될 경우 텍스트로 읽음
        errorData = await response.text();
      }
      
      logger.error(`엣지 조회 실패: ${response.status} ${response.statusText}`, { 
        url, 
        errorData,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // 응답 상태 코드에 따른 구체적인 오류 메시지
      if (response.status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (response.status === 400) {
        throw new Error(`잘못된 요청입니다: ${typeof errorData === 'object' ? errorData?.error || errorData?.message : '매개변수를 확인하세요'}`);
      } else if (response.status === 500) {
        logger.error('서버 내부 오류 상세 정보:', errorData);
        throw new Error(`서버 내부 오류가 발생했습니다: ${typeof errorData === 'object' ? errorData?.details || errorData?.error : '서버 로그를 확인하세요'}`);
      } else {
        throw new Error(`엣지 목록을 가져오는 중 오류가 발생했습니다: ${response.statusText} (${response.status})`);
      }
    }

    const data: Edge[] = await response.json();
    logger.debug(`[edgeService] Fetched ${data.length} edges for project ${projectId}`);
    
    // Edge 객체 검증 및 안전하게 변환 (animated 속성 관련 문제 방지)
    const safeEdges = data.map(edge => {
      // 엣지 데이터 검증 (최소한의 필수 필드만 확인)
      if (!edge.id || !edge.sourceCardNodeId || !edge.targetCardNodeId) {
        logger.warn('불완전한 엣지 데이터:', { edge });
      }
      
      // 안전하게 복제하여 반환
      const safeEdge = { ...edge };
      
      // 이제는 animated 속성이 DB에 없으므로, 이 필드를 명시적으로 제거
      if ('animated' in safeEdge) {
        delete safeEdge.animated;
      }
      
      return safeEdge;
    });
    
    return safeEdges;
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
    // 입력값 로깅 (민감한 정보는 제외)
    const logSafeInput = Array.isArray(input) 
      ? input.map(edge => ({ ...edge, projectId: edge.projectId }))
      : { ...input, projectId: input.projectId };
      
    logger.debug('[edgeService] Creating edge(s)', { input: logSafeInput });
    
    // 유효성 검사
    if (Array.isArray(input)) {
      // 배열의 각 항목 검사
      input.forEach((edge, index) => {
        if (!edge.sourceCardNodeId || !edge.targetCardNodeId || !edge.projectId) {
          logger.error(`[edgeService] 엣지 데이터 #${index}에 필수 필드가 누락됨:`, { 
            sourceCardNodeId: !!edge.sourceCardNodeId, 
            targetCardNodeId: !!edge.targetCardNodeId, 
            projectId: !!edge.projectId 
          });
        }
      });
    } else {
      // 단일 항목 검사
      if (!input.sourceCardNodeId || !input.targetCardNodeId || !input.projectId) {
        logger.error('[edgeService] 엣지 데이터에 필수 필드가 누락됨:', { 
          sourceCardNodeId: !!input.sourceCardNodeId, 
          targetCardNodeId: !!input.targetCardNodeId, 
          projectId: !!input.projectId 
        });
      }
    }
    
    // API 호출 시작 시간 기록 (성능 측정용)
    const startTime = Date.now();
    
    // 요청 URL 디버깅을 위해 로깅
    const requestUrl = '/api/edges';
    logger.debug(`[edgeService] API 요청 URL: ${requestUrl}`);
    
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키 포함 (인증 정보)
      body: JSON.stringify(input),
    });
    
    // API 호출 종료 시간 기록
    const endTime = Date.now();
    const requestDuration = endTime - startTime;
    
    // 응답 상태 로깅
    logger.debug(`[edgeService] API 응답 상태: ${response.status} ${response.statusText}`);
    
    // 응답 분석
    if (!response.ok) {
      let errorData = '';
      try {
        // 응답 본문 로깅 (디버깅용)
        const responseText = await response.text();
        logger.debug(`[edgeService] 에러 응답 본문: ${responseText}`);
        
        try {
          // JSON 형식이면 파싱
          errorData = JSON.stringify(JSON.parse(responseText));
        } catch {
          // JSON이 아니면 그대로 사용
          errorData = responseText;
        }
      } catch (readError) {
        logger.error(`[edgeService] 응답 본문 읽기 오류:`, readError);
        errorData = '응답 본문을 읽을 수 없습니다.';
      }
      
      // HTTP 상태 코드에 따른 오류 처리
      if (response.status === 401) {
        logger.error('엣지 생성 실패: 인증 오류 (401 Unauthorized)', { 
          input: logSafeInput, 
          errorData,
          requestDuration
        });
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (response.status === 400) {
        logger.error('엣지 생성 실패: 잘못된 요청 (400 Bad Request)', { 
          input: logSafeInput, 
          errorData,
          requestDuration
        });
        throw new Error(errorData || '엣지 생성을 위한 요청 데이터가 올바르지 않습니다.');
      } else if (response.status === 403) {
        logger.error('엣지 생성 실패: 권한 없음 (403 Forbidden)', { 
          input: logSafeInput, 
          errorData,
          requestDuration
        });
        throw new Error('해당 프로젝트에 엣지를 생성할 권한이 없습니다.');
      } else if (response.status === 500) {
        logger.error(`엣지 생성 실패: 서버 오류 (500 Internal Server Error)`, { 
          input: logSafeInput, 
          errorData,
          requestDuration
        });
        // 서버 오류에 대한 더 자세한 정보 로깅 (디버깅용)
        if (errorData.includes('unique constraint') || errorData.includes('duplicate key')) {
          logger.warn('서버 오류 원인 추정: 중복된 엣지 데이터');
          throw new Error('이미 동일한 엣지가 존재합니다.');
        } else if (errorData.includes('foreign key constraint')) {
          logger.warn('서버 오류 원인 추정: 존재하지 않는 카드 ID 참조');
          throw new Error('해당 카드가 존재하지 않습니다.');
        } else {
          throw new Error('서버에서 엣지 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      } else {
        logger.error(`엣지 생성 실패: ${response.status} ${response.statusText}`, { 
          input: logSafeInput, 
          errorData,
          requestDuration
        });
        throw new Error(response.statusText || '엣지 생성 중 오류가 발생했습니다.');
      }
    }
    
    const createdEdges = await response.json();
    logger.debug(`[edgeService] Successfully created ${Array.isArray(createdEdges) ? createdEdges.length : 1} edges`, {
      edgeCount: Array.isArray(createdEdges) ? createdEdges.length : 1,
      edgeIds: Array.isArray(createdEdges) ? createdEdges.map(e => e.id) : [createdEdges.id],
      requestDuration
    });
    return createdEdges;
  } catch (error: any) {
    // 에러 종류에 따른 로깅 및 처리
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      // 네트워크 오류
      logger.error('엣지 생성 중 네트워크 오류:', error);
      throw new Error('네트워크 연결을 확인해주세요.');
    } else if (error.name === 'SyntaxError') {
      // JSON 파싱 오류
      logger.error('엣지 생성 응답 파싱 오류:', error);
      throw new Error('서버 응답을 처리하는 중 오류가 발생했습니다.');
    } else {
      // 이미 처리한 HTTP 오류는 그대로 전달
      logger.error('엣지 생성 오류:', error);
      throw error;
    }
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