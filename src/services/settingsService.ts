/**
 * 파일명: src/services/settingsService.ts
 * 목적: 설정 관련 API 호출 서비스
 * 역할: 설정을 서버와 통신하는 순수 함수들 제공
 * 작성일: 2025-04-21
 * 수정일: 2025-04-30 : console.log에서 logger로 변경 및 에러 처리 개선
 * 수정일: 2025-05-05 : Three-Layer-Standard 아키텍처와 Error-Handling 지침 준수하도록 리팩토링
 * 수정일: 2025-05-05 : 에러 타입을 SERVER_ERROR로 통일하여 테스트와 일치시킴
 * 수정일: 2025-05-05 : ApiError 타입 사용하도록 개선
 * 수정일: 2025-04-21 : API 응답 구조 처리 로직 수정
 * @rule   three-layer-standard
 * @layer  service
 * @tag    @service-msw fetchSettings
 */

import { SettingsData, ApiError } from '@/types/settings';
import createLogger from '@/lib/logger';

const logger = createLogger('settingsService');

/**
 * getApiUrl: API URL을 가져오는 유틸리티 함수
 * @returns {string} API URL
 */
const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || '';
};

/**
 * API 응답 에러 핸들링
 * @param {Response} response - fetch API 응답 객체
 * @returns {Promise<any>} - 성공 시 JSON 응답, 실패 시 에러 객체 throw
 */
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const status = response.status;
    let error: ApiError = { code: status, type: 'SERVER_ERROR', message: `서버 오류가 발생했습니다.` };
    
    try {
      const errorJson = await response.json();
      if (errorJson.error) {
        error = { ...error, ...errorJson.error };
      }
    } catch (err) {
      logger.error('[settingsService] API 오류 응답 파싱 실패', { status, error: err });
      error = { 
        ...error, 
        originalError: err
      };
    }
    
    logger.error('[settingsService] API 오류 응답', { status, error });
    throw error;
  }
  return response.json();
};

/**
 * fetchSettings: 사용자 설정 가져오기
 * @param {string} userId - 사용자 아이디
 * @returns {Promise<SettingsData>} - 사용자 설정 데이터
 * @throws {ApiError} - 오류 발생 시 구조화된 오류 객체
 */
export const fetchSettings = async (userId?: string): Promise<SettingsData> => {
  if (!userId) {
    logger.warn('[settingsService] 사용자 ID 없음, 설정 로드 스킵');
    throw { code: 400, type: 'VALIDATION_ERROR', message: '사용자 ID는 필수입니다.' } as ApiError;
  }

  logger.debug('[settingsService] 서버에서 설정 로드 시작', { userId });

  try {
    const response = await fetch(`${getApiUrl()}/api/settings?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await handleApiError(response);
    
    // API 응답 구조 검증 - 서버가 { settingsData: ... } 형식으로 반환함
    if (!data || typeof data !== 'object') {
      logger.error('[settingsService] 잘못된 API 응답 형식', { data });
      throw { code: 500, type: 'SERVER_ERROR', message: '서버 응답 형식이 올바르지 않습니다.' } as ApiError;
    }

    // settingsData 필드에서 실제 설정 데이터 추출
    if (data.settingsData && typeof data.settingsData === 'object') {
      logger.debug('[settingsService] 설정 로드 성공', { userId });
      return data.settingsData;
    } else {
      logger.error('[settingsService] 잘못된 API 응답 형식: settingsData 필드 누락', { data });
      throw { code: 500, type: 'SERVER_ERROR', message: '서버 응답 형식이 올바르지 않습니다.' } as ApiError;
    }
  } catch (error) {
    if ((error as Error).message === 'Failed to fetch') {
      throw { code: 503, type: 'SERVER_ERROR', message: '서버에 연결할 수 없습니다.' } as ApiError;
    }
    
    // 이미 구조화된 오류면 그대로 던짐
    if (typeof error === 'object' && error !== null && 'code' in error) {
      throw error as ApiError;
    }
    
    // 기타 예상치 못한 오류
    throw { code: 500, type: 'SERVER_ERROR', message: '설정을 불러오는 중 오류가 발생했습니다.', originalError: error } as ApiError;
  }
};

/**
 * updateSettings: 사용자 설정 부분 업데이트
 * @param {string} userId - 사용자 아이디
 * @param {Partial<SettingsData>} partialUpdate - 업데이트할 설정 데이터 일부
 * @returns {Promise<SettingsData>} - 업데이트된 사용자 설정 데이터
 * @throws {ApiError} - 오류 발생 시 구조화된 오류 객체
 */
export const updateSettings = async (
  userId?: string,
  partialUpdate?: Partial<SettingsData>
): Promise<SettingsData> => {
  if (!userId) {
    logger.warn('[settingsService] 사용자 ID 없음, 설정 업데이트 스킵');
    throw { code: 400, type: 'VALIDATION_ERROR', message: '사용자 ID는 필수입니다.' } as ApiError;
  }

  if (!partialUpdate || Object.keys(partialUpdate).length === 0) {
    logger.warn('[settingsService] 빈 업데이트 요청', { userId });
    throw { code: 400, type: 'VALIDATION_ERROR', message: '업데이트할 설정 데이터가 비어있습니다.' } as ApiError;
  }

  logger.debug('[settingsService] 설정 업데이트 요청:', { userId, partialUpdate });

  try {
    const response = await fetch(`${getApiUrl()}/api/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        partialUpdate,
      }),
    });

    const responseData = await handleApiError(response);
    
    // API 응답 구조 검증 - 서버가 { settingsData: ... } 형식으로 반환함
    if (!responseData || typeof responseData !== 'object') {
      logger.error('[settingsService] 잘못된 API 응답 형식', { responseData });
      throw { code: 500, type: 'SERVER_ERROR', message: '서버 응답 형식이 올바르지 않습니다.' } as ApiError;
    }

    // settingsData 필드에서 실제 설정 데이터 추출
    if (responseData.settingsData && typeof responseData.settingsData === 'object') {
      logger.debug('[settingsService] 설정 업데이트 성공');
      return responseData.settingsData;
    } else {
      logger.error('[settingsService] 잘못된 API 응답 형식: settingsData 필드 누락', { responseData });
      throw { code: 500, type: 'SERVER_ERROR', message: '서버 응답 형식이 올바르지 않습니다.' } as ApiError;
    }
  } catch (error) {
    if ((error as Error).message === 'Failed to fetch') {
      throw { code: 503, type: 'SERVER_ERROR', message: '서버에 연결할 수 없습니다.' } as ApiError;
    }
    
    // 이미 구조화된 오류면 그대로 던짐
    if (typeof error === 'object' && error !== null && 'code' in error) {
      throw error as ApiError;
    }
    
    // 기타 예상치 못한 오류
    throw { code: 500, type: 'SERVER_ERROR', message: '설정을 업데이트하는 중 오류가 발생했습니다.', originalError: error } as ApiError;
  }
};

/**
 * createInitialSettings: 사용자 초기 설정 생성
 * @param {string} userId - 사용자 아이디
 * @param {SettingsData} settingsData - 생성할 초기 설정 데이터
 * @returns {Promise<SettingsData>} - 생성된 사용자 설정 데이터
 * @throws {ApiError} - 오류 발생 시 구조화된 오류 객체
 */
export const createInitialSettings = async (
  userId?: string,
  settingsData?: SettingsData
): Promise<SettingsData> => {
  if (!userId) {
    logger.warn('[settingsService] 사용자 ID 없음, 설정 생성 스킵');
    throw { code: 400, type: 'VALIDATION_ERROR', message: '사용자 ID는 필수입니다.' } as ApiError;
  }

  if (!settingsData) {
    logger.warn('[settingsService] 초기 설정 데이터 없음', { userId });
    throw { code: 400, type: 'VALIDATION_ERROR', message: '초기 설정 데이터가 필요합니다.' } as ApiError;
  }

  logger.debug('[settingsService] 새 설정 생성 요청:', { userId });

  try {
    const response = await fetch(`${getApiUrl()}/api/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        settingsData,
      }),
    });

    const data = await handleApiError(response);
    
    // API 응답 구조 검증 - 서버가 { settingsData: ... } 형식으로 반환함
    if (!data || typeof data !== 'object') {
      logger.error('[settingsService] 잘못된 API 응답 형식', { data });
      throw { code: 500, type: 'SERVER_ERROR', message: '서버 응답 형식이 올바르지 않습니다.' } as ApiError;
    }

    // settingsData 필드에서 실제 설정 데이터 추출
    if (data.settingsData && typeof data.settingsData === 'object') {
      logger.debug('[settingsService] 설정 생성 성공');
      return data.settingsData;
    } else {
      logger.error('[settingsService] 잘못된 API 응답 형식: settingsData 필드 누락', { data });
      throw { code: 500, type: 'SERVER_ERROR', message: '서버 응답 형식이 올바르지 않습니다.' } as ApiError;
    }
  } catch (error) {
    if ((error as Error).message === 'Failed to fetch') {
      throw { code: 503, type: 'SERVER_ERROR', message: '서버에 연결할 수 없습니다.' } as ApiError;
    }
    
    // 이미 구조화된 오류면 그대로 던짐
    if (typeof error === 'object' && error !== null && 'code' in error) {
      throw error as ApiError;
    }
    
    // 기타 예상치 못한 오류
    throw { code: 500, type: 'SERVER_ERROR', message: '설정을 생성하는 중 오류가 발생했습니다.', originalError: error } as ApiError;
  }
};

/**
 * mermaid 다이어그램:
 * ```mermaid
 * sequenceDiagram
 *     participant TQ_Hook as TanStack Query 훅
 *     participant Service as settingsService
 *     participant API as API (/api/settings)
 *     participant DB as 데이터베이스
 *     
 *     TQ_Hook->>Service: fetchSettings(userId)
 *     Service->>API: GET /api/settings?userId={userId}
 *     API->>DB: 사용자 설정 조회
 *     DB-->>API: 설정 데이터 반환
 *     API-->>Service: 설정 데이터 JSON 반환
 *     Service-->>TQ_Hook: 처리된 설정 데이터 반환
 *     
 *     TQ_Hook->>Service: updateSettings(userId, partialUpdate)
 *     Service->>API: PATCH /api/settings
 *     API->>DB: 기존 설정 조회
 *     DB-->>API: 기존 설정 반환
 *     API->>API: 설정 병합
 *     API->>DB: 업데이트된 설정 저장
 *     DB-->>API: 성공 응답
 *     API-->>Service: 업데이트된 전체 설정 반환
 *     Service-->>TQ_Hook: 업데이트된 설정 데이터 반환
 * ```
 */ 