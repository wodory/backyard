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
 * 수정일: 2025-05-07 : Zod 스키마 기반 데이터 검증 통합
 * 수정일: 2025-05-07 : FullSettings와 SettingsData 간 타입 변환 로직 추가
 * @rule   three-layer-standard
 * @layer  service
 * @tag    @service-msw fetchSettings
 */

import { SettingsData, ApiError } from '@/types/settings';
import createLogger from '@/lib/logger';
import { validateSettings, getDefaultSettings } from '@/lib/settings-utils';
import { FullSettings } from '@/lib/schema/settings-schema';

const logger = createLogger('settingsService');

/**
 * getApiUrl: API URL을 가져오는 유틸리티 함수
 * @returns {string} API URL
 */
const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || '';
};

/**
 * FullSettings에서 SettingsData 형식으로 변환
 * @param {FullSettings} fullSettings - Zod 스키마 기반 FullSettings 객체
 * @returns {SettingsData} - 애플리케이션에서 사용하는 SettingsData 형식 객체
 */
const convertToSettingsData = (fullSettings: FullSettings): SettingsData => {
  // 기본값으로 초기화된 SettingsData 구조 생성
  const defaultSettingsData: SettingsData = {
    theme: fullSettings.theme,
    general: fullSettings.general,
    ideamap: {
      snapToGrid: fullSettings.ideamap.snapToGrid,
      snapGrid: fullSettings.ideamap.snapGrid,
      // edge 속성을 직접 상위 레벨로 복사
      connectionLineType: fullSettings.ideamap.edge.connectionLineType as any,
      markerEnd: fullSettings.ideamap.edge.markerEnd as any,
      strokeWidth: fullSettings.ideamap.edge.strokeWidth,
      markerSize: fullSettings.ideamap.edge.markerSize,
      edgeColor: fullSettings.ideamap.edge.edgeColor,
      animated: fullSettings.ideamap.edge.animated,
      selectedEdgeColor: fullSettings.ideamap.edge.selectedEdgeColor
    },
    // cardNode를 card로 변환
    card: {
      defaultWidth: fullSettings.ideamap.cardNode.defaultWidth,
      backgroundColor: fullSettings.ideamap.cardNode.backgroundColor,
      borderRadius: fullSettings.ideamap.cardNode.borderRadius,
      tagBackgroundColor: fullSettings.ideamap.cardNode.tagBackgroundColor,
      fontSizes: fullSettings.ideamap.cardNode.fontSizes
    },
    // cardNode.handles를 handles로 변환
    handles: fullSettings.ideamap.cardNode.handles,
    // ideamap.layout을 layout으로 변환
    layout: fullSettings.ideamap.layout
  };

  return defaultSettingsData;
};

/**
 * SettingsData에서 FullSettings 형식으로 변환
 * @param {SettingsData} settingsData - 애플리케이션에서 사용하는 SettingsData 형식 객체
 * @returns {FullSettings} - Zod 스키마 기반 FullSettings 객체
 */
const convertToFullSettings = (settingsData: SettingsData): FullSettings => {
  const fullSettings: FullSettings = {
    theme: settingsData.theme,
    general: settingsData.general,
    ideamap: {
      snapToGrid: settingsData.ideamap?.snapToGrid ?? true,
      snapGrid: settingsData.ideamap?.snapGrid ?? [15, 15],
      edge: {
        connectionLineType: settingsData.ideamap?.connectionLineType ?? 'bezier',
        markerEnd: settingsData.ideamap?.markerEnd ?? 'arrowclosed',
        strokeWidth: settingsData.ideamap?.strokeWidth ?? 3,
        markerSize: settingsData.ideamap?.markerSize ?? 20,
        edgeColor: settingsData.ideamap?.edgeColor ?? '#C1C1C1',
        animated: settingsData.ideamap?.animated ?? false,
        selectedEdgeColor: settingsData.ideamap?.selectedEdgeColor ?? '#000000'
      },
      layout: settingsData.layout ?? getDefaultSettings('ideamap').layout,
      cardNode: {
        defaultWidth: settingsData.card?.defaultWidth ?? 130,
        backgroundColor: settingsData.card?.backgroundColor ?? '#FFFFFF',
        borderRadius: settingsData.card?.borderRadius ?? 8,
        tagBackgroundColor: settingsData.card?.tagBackgroundColor ?? '#F2F2F2',
        fontSizes: settingsData.card?.fontSizes ?? { default: 16, title: 16, content: 14, tags: 12 },
        handles: settingsData.handles ?? { size: 10, backgroundColor: '#FFFFFF', borderColor: '#555555', borderWidth: 1 },
        nodeSize: settingsData.layout?.nodeSize ?? { width: 500, height: 48, maxHeight: 180 }
      }
    }
  };

  return fullSettings;
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
      try {
        // 먼저 SettingsData 형식을 FullSettings 형식으로 변환
        const fullSettingsData = convertToFullSettings(data.settingsData);
        
        // Zod 스키마로 설정 데이터 검증 및 복구 (safe 모드)
        const validatedFullSettings = validateSettings('full', fullSettingsData, 'safe');
        
        // 검증된 FullSettings를 다시 SettingsData 형식으로 변환
        const validatedSettingsData = convertToSettingsData(validatedFullSettings as FullSettings);
        
        logger.debug('[settingsService] 설정 로드 및 검증 성공', { userId });
        return validatedSettingsData;
      } catch (validationError) {
        logger.error('[settingsService] 설정 데이터 검증 실패', { error: validationError, data: data.settingsData });
        throw { 
          code: 500, 
          type: 'VALIDATION_ERROR', 
          message: '서버에서 반환된 설정 데이터가 올바르지 않습니다.',
          originalError: validationError 
        } as ApiError;
      }
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

  // 빈 업데이트인 경우 Zod 스키마의 기본값으로 초기화하여 사용
  if (!partialUpdate || Object.keys(partialUpdate).length === 0) {
    logger.info('[settingsService] 빈 업데이트 요청, 스키마 기본값으로 설정', { userId });
    // 기본값으로 초기화된 전체 설정 가져오기
    partialUpdate = convertToSettingsData(getDefaultSettings('full'));
  }

  // 업데이트 데이터의 구조적 유효성 확인 (선택적)
  // 부분 업데이트는 strict 검증을 적용하지 않고, API에서 주로 검증함
  try {
    // 각 섹션별 partial update 검증
    if (partialUpdate.theme) {
      validateSettings('theme', partialUpdate.theme, 'strict');
    }
    if (partialUpdate.general) {
      validateSettings('general', partialUpdate.general, 'strict');
    }
    if (partialUpdate.ideamap) {
      // ideamap은 구조가 다르므로, FullSettings 형식으로 변환 후 검증
      const ideaMapUpdate = {
        snapToGrid: partialUpdate.ideamap.snapToGrid,
        snapGrid: partialUpdate.ideamap.snapGrid,
        edge: {
          connectionLineType: partialUpdate.ideamap.connectionLineType,
          markerEnd: partialUpdate.ideamap.markerEnd,
          strokeWidth: partialUpdate.ideamap.strokeWidth,
          markerSize: partialUpdate.ideamap.markerSize,
          edgeColor: partialUpdate.ideamap.edgeColor,
          animated: partialUpdate.ideamap.animated,
          selectedEdgeColor: partialUpdate.ideamap.selectedEdgeColor
        }
      };
      
      // ideamap 부분 업데이트 검증 (가능한 필드만)
      validateSettings('ideamap', ideaMapUpdate, 'safe');
    }
  } catch (validationError) {
    logger.warn('[settingsService] 부분 업데이트 검증 오류, 계속 진행', { error: validationError });
    // 검증 실패 시에도 계속 진행 (API에서 검증 수행)
  }

  logger.debug('[settingsService] 설정 업데이트 요청:', { userId , partialUpdate } );

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
      try {
        // 먼저 SettingsData 형식을 FullSettings 형식으로 변환
        const fullSettingsData = convertToFullSettings(responseData.settingsData);
        
        // Zod 스키마로 설정 데이터 검증 및 복구 (safe 모드)
        const validatedFullSettings = validateSettings('full', fullSettingsData, 'safe');
        
        // 검증된 FullSettings를 다시 SettingsData 형식으로 변환
        const validatedSettingsData = convertToSettingsData(validatedFullSettings as FullSettings);
        
        logger.debug('[settingsService] 설정 업데이트 및 검증 성공');
        return validatedSettingsData;
      } catch (validationError) {
        logger.error('[settingsService] 업데이트된 설정 데이터 검증 실패', { error: validationError });
        throw { 
          code: 500, 
          type: 'VALIDATION_ERROR', 
          message: '서버에서 반환된 설정 데이터가 올바르지 않습니다.',
          originalError: validationError 
        } as ApiError;
      }
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
 * @param {SettingsData} [settingsData] - 초기 설정 데이터 (옵션)
 * @returns {Promise<SettingsData>} - 생성된 사용자 설정 데이터
 * @throws {ApiError} - 오류 발생 시 구조화된 오류 객체
 */
export const createInitialSettings = async (
  userId?: string,
  settingsData?: SettingsData
): Promise<SettingsData> => {
  if (!userId) {
    logger.warn('[settingsService] 사용자 ID 없음, 초기 설정 생성 스킵');
    throw { code: 400, type: 'VALIDATION_ERROR', message: '사용자 ID는 필수입니다.' } as ApiError;
  }

  logger.debug('[settingsService] 초기 설정 생성 시작', { userId });

  // 설정 데이터가 없거나 빈 객체인 경우 Zod 스키마의 기본값 사용
  if (!settingsData || Object.keys(settingsData).length === 0) {
    logger.info('[settingsService] 빈 초기 설정, 스키마 기본값으로 생성', { userId });
    settingsData = convertToSettingsData(getDefaultSettings('full'));
  }

  // 설정 데이터 검증 
  try {
    // 완전한 검증 위해 FullSettings 형식으로 변환 후 확인
    const fullSettingsData = convertToFullSettings(settingsData);
    const validatedFullSettings = validateSettings('full', fullSettingsData, 'safe');
    
    // 검증 후 다시 SettingsData 형식으로 변환
    settingsData = convertToSettingsData(validatedFullSettings as FullSettings);
  } catch (validationError) {
    logger.warn('[settingsService] 초기 설정 검증 오류, 기본값으로 복구하여 진행', { error: validationError });
    // 검증 실패 시 전체 기본값 사용
    settingsData = convertToSettingsData(getDefaultSettings('full'));
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
      try {
        // 먼저 SettingsData 형식을 FullSettings 형식으로 변환
        const fullSettingsData = convertToFullSettings(data.settingsData);
        
        // Zod 스키마로 설정 데이터 검증 및 복구 (safe 모드)
        const validatedFullSettings = validateSettings('full', fullSettingsData, 'safe');
        
        // 검증된 FullSettings를 다시 SettingsData 형식으로 변환
        const validatedSettingsData = convertToSettingsData(validatedFullSettings as FullSettings);
        
        logger.debug('[settingsService] 설정 생성 및 검증 성공');
        return validatedSettingsData;
      } catch (validationError) {
        logger.error('[settingsService] 생성된 설정 데이터 검증 실패', { error: validationError });
        throw { 
          code: 500, 
          type: 'VALIDATION_ERROR', 
          message: '서버에서 반환된 설정 데이터가 올바르지 않습니다.',
          originalError: validationError 
        } as ApiError;
      }
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
 *     API->>DB: SELECT settings WHERE userId={userId}
 *     DB-->>API: settings data
 *     API-->>Service: { settingsData: {...} }
 *     Service->>Service: convertToFullSettings(data)
 *     Service->>Service: validateSettings('full', data, 'safe')
 *     Service->>Service: convertToSettingsData(validatedData)
 *     Service-->>TQ_Hook: validated SettingsData
 *     
 *     TQ_Hook->>Service: updateSettings(userId, partialUpdate)
 *     Service->>Service: validateSettings (각 섹션별)
 *     Service->>API: PATCH /api/settings { userId, partialUpdate }
 *     API->>DB: UPDATE settings WHERE userId={userId}
 *     DB-->>API: updated settings data
 *     API-->>Service: { settingsData: {...} }
 *     Service->>Service: convertToFullSettings(data)
 *     Service->>Service: validateSettings('full', data, 'safe')
 *     Service->>Service: convertToSettingsData(validatedData)
 *     Service-->>TQ_Hook: validated SettingsData
 *     
 *     TQ_Hook->>Service: createInitialSettings(userId, settingsData)
 *     Service->>Service: convertToFullSettings(data)
 *     Service->>Service: validateSettings('full', data, 'strict')
 *     Service->>Service: convertToSettingsData(validatedData)
 *     Service->>API: POST /api/settings { userId, settingsData }
 *     API->>DB: INSERT INTO settings VALUES(...)
 *     DB-->>API: created settings data
 *     API-->>Service: { settingsData: {...} }
 *     Service->>Service: convertToFullSettings(data)
 *     Service->>Service: validateSettings('full', data, 'safe')
 *     Service->>Service: convertToSettingsData(validatedData)
 *     Service-->>TQ_Hook: validated SettingsData
 * ```
 */ 