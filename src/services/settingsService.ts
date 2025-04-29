/**
 * 파일명: src/services/settingsService.ts
 * 목적: 설정 관련 API 호출 서비스
 * 역할: 설정을 서버와 통신하는 순수 함수들 제공
 * 작성일: 2025-04-21
 * 수정일: 2025-04-30 : console.log에서 logger로 변경 및 에러 처리 개선
 * @rule   three-layer-standard
 * @layer  service
 * @tag    @service-msw fetchSettings
 */

import { Settings } from '@/lib/ideamap-utils';
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
 * fetchSettings: 사용자의 설정을 조회
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Settings | null>} 설정 객체 또는 null
 */
export const fetchSettings = async (userId: string): Promise<Settings | null> => {
  try {
    if (!userId) {
      logger.warn('[settingsService] 사용자 ID 없음, 설정 로드 스킵');
      return null;
    }

    logger.debug('[settingsService] 서버에서 설정 로드 시작', { userId });
    
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/settings?userId=${encodeURIComponent(userId)}`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '응답 내용을 확인할 수 없음');
      logger.error(`[settingsService] 설정 조회 실패 (${response.status}): ${errorText}`);
      throw new Error(`서버에서 설정을 불러오는데 실패했습니다. 상태: ${response.status}`);
    }

    const data = await response.json();
    logger.debug('[settingsService] 설정 로드 성공', { userId });
    return data.settings;
  } catch (error) {
    logger.error('[settingsService] 설정 조회 중 오류 발생:', error);
    // API 오류는 null을 반환하여 기본값을 사용하도록 함
    return null;
  }
};

/**
 * updateSettings: 설정을 부분 업데이트
 * @param {string} userId - 사용자 ID
 * @param {Partial<Settings>} settings - 업데이트할 설정 일부
 * @returns {Promise<Settings | null>} 업데이트된 설정 또는 null
 */
export const updateSettings = async (
  userId: string, 
  settings: Partial<Settings>
): Promise<Settings | null> => {
  try {
    if (!userId) {
      logger.warn('[settingsService] 사용자 ID 없음, 설정 업데이트 스킵');
      return null;
    }

    // 요청 데이터 깊은 복사 및 문자열 변환 확인
    const safeSettings = JSON.parse(JSON.stringify(settings));
    
    logger.debug('[settingsService] 설정 업데이트 요청:', {
      userId,
      settings: safeSettings
    });
    
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        settings: safeSettings,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '응답 파싱 실패' }));
      logger.error('[settingsService] 설정 업데이트 실패:', errorData);
      throw new Error(
        errorData.details || errorData.error || '설정을 업데이트하는 데 실패했습니다.'
      );
    }

    const responseData = await response.json();
    logger.debug('[settingsService] 설정 업데이트 성공');
    return responseData.settings || null;
  } catch (error) {
    logger.error('[settingsService] 설정 업데이트 중 오류:', error);
    return null;
  }
};

/**
 * createSettings: 새 설정 생성
 * @param {string} userId - 사용자 ID
 * @param {Settings} settings - 생성할 전체 설정
 * @returns {Promise<Settings | null>} 생성된 설정 또는 null
 */
export const createSettings = async (
  userId: string,
  settings: Settings
): Promise<Settings | null> => {
  try {
    if (!userId) {
      logger.warn('[settingsService] 사용자 ID 없음, 설정 생성 스킵');
      return null;
    }
    
    logger.debug('[settingsService] 새 설정 생성 요청:', { userId });
    
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        settings,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '응답 파싱 실패' }));
      logger.error('[settingsService] 설정 생성 실패:', errorData);
      throw new Error(errorData.details || errorData.error || '설정 생성에 실패했습니다.');
    }

    const data = await response.json();
    logger.debug('[settingsService] 설정 생성 성공');
    return data.settings || settings;
  } catch (error) {
    logger.error('[settingsService] 설정 생성 중 오류:', error);
    return null;
  }
}; 