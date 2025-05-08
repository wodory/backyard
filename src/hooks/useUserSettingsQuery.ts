/**
 * 파일명: src/hooks/useUserSettingsQuery.ts
 * 목적: 사용자 설정 관련 Core React Query 훅 제공
 * 역할: 사용자 설정을 서버에서 가져오는 기본 쿼리 훅
 * 작성일: 2025-05-05
 * 수정일: 2025-05-05 : 로깅 메시지 형식 통일
 * 수정일: 2025-05-12 : Zod 스키마 통합 및 select 훅 추가 - Three-Layer-Standard 준수
 * @rule   three-layer-standard
 * @layer  hook (TQ)
 * @tag    @tanstack-query-msw userSettings
 */

import { useQuery } from '@tanstack/react-query';
import { fetchSettings } from '@/services/settingsService';
import { SettingsData } from '@/types/settings';
import createLogger from '@/lib/logger';
import { FullSettings } from '@/lib/schema/settings-schema';

const logger = createLogger('useUserSettingsQuery');

/**
 * useUserSettingsQuery: 사용자 설정을 가져오는 기본 쿼리 훅
 * @param {string} userId - 사용자 ID
 * @returns {UseQueryResult<SettingsData>} - 사용자 설정 데이터를 포함한 쿼리 결과
 */
export const useUserSettingsQuery = (userId?: string) => {
  return useQuery<SettingsData | null, Error, SettingsData | null>({
    queryKey: ['userSettings', userId],
    queryFn: async () => {
      logger.debug(`[useUserSettingsQuery -> queryFn] 사용자 설정 조회 시작 (userId: ${userId})`);
      
      if (!userId) {
        logger.warn('[useUserSettingsQuery -> queryFn] 사용자 ID가 없어 설정 조회를 건너뜁니다.');
        return null;
      }
      
      try {
        const settingsData = await fetchSettings(userId);
        logger.debug(`[useUserSettingsQuery -> queryFn] 사용자 설정 조회 성공 (userId: ${userId})`);
        return settingsData;
      } catch (error) {
        logger.error(`[useUserSettingsQuery -> queryFn] 사용자 설정 조회 실패 (userId: ${userId}):`, error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 신선하게 유지
    gcTime: 1000 * 60 * 30, // 30분 동안 캐시 유지
  });
};

/**
 * useIdeaMapSettingsFromQuery: 전체 설정에서 아이디어맵 설정만 추출하는 훅
 * @param {string} userId - 사용자 ID
 * @returns {UseQueryResult} - 아이디어맵 설정 데이터를 포함한 쿼리 결과
 */
export const useIdeaMapSettingsFromQuery = (userId?: string) => {
  return useQuery({
    queryKey: ['userSettings', userId],
    queryFn: async () => {
      logger.debug(`[useIdeaMapSettingsFromQuery -> queryFn] 사용자 설정 조회 시작 (userId: ${userId})`);
      
      if (!userId) {
        logger.warn('[useIdeaMapSettingsFromQuery -> queryFn] 사용자 ID가 없어 설정 조회를 건너뜁니다.');
        return null;
      }
      
      try {
        const settingsData = await fetchSettings(userId);
        logger.debug(`[useIdeaMapSettingsFromQuery -> queryFn] 사용자 설정 조회 성공 (userId: ${userId})`);
        return settingsData;
      } catch (error) {
        logger.error(`[useIdeaMapSettingsFromQuery -> queryFn] 사용자 설정 조회 실패 (userId: ${userId}):`, error);
        throw error;
      }
    },
    select: (data) => data ? data.ideamap : null,
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 신선하게 유지
    gcTime: 1000 * 60 * 30, // 30분 동안 캐시 유지
  });
};

/**
 * useThemeSettingsFromQuery: 전체 설정에서 테마 설정만 추출하는 훅
 * @param {string} userId - 사용자 ID
 * @returns {UseQueryResult} - 테마 설정 데이터를 포함한 쿼리 결과
 */
export const useThemeSettingsFromQuery = (userId?: string) => {
  return useQuery({
    queryKey: ['userSettings', userId],
    queryFn: async () => {
      if (!userId) {
        logger.warn('[useThemeSettingsFromQuery -> queryFn] 사용자 ID가 없어 설정 조회를 건너뜁니다.');
        return null;
      }
      
      try {
        const settingsData = await fetchSettings(userId);
        return settingsData;
      } catch (error) {
        logger.error(`[useThemeSettingsFromQuery -> queryFn] 사용자 설정 조회 실패 (userId: ${userId}):`, error);
        throw error;
      }
    },
    select: (data) => data ? data.theme : null,
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};

/**
 * useGeneralSettingsFromQuery: 전체 설정에서 일반 설정만 추출하는 훅
 * @param {string} userId - 사용자 ID
 * @returns {UseQueryResult} - 일반 설정 데이터를 포함한 쿼리 결과
 */
export const useGeneralSettingsFromQuery = (userId?: string) => {
  return useQuery({
    queryKey: ['userSettings', userId],
    queryFn: async () => {
      if (!userId) {
        logger.warn('[useGeneralSettingsFromQuery -> queryFn] 사용자 ID가 없어 설정 조회를 건너뜁니다.');
        return null;
      }
      
      try {
        const settingsData = await fetchSettings(userId);
        return settingsData;
      } catch (error) {
        logger.error(`[useGeneralSettingsFromQuery -> queryFn] 사용자 설정 조회 실패 (userId: ${userId}):`, error);
        throw error;
      }
    },
    select: (data) => data ? data.general : null,
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};

export default useUserSettingsQuery;

/**
 * mermaid 다이어그램:
 * ```mermaid
 * sequenceDiagram
 *   participant Component as 컴포넌트
 *   participant Hook as useUserSettingsQuery
 *   participant Service as settingsService
 *   participant API as /api/settings
 *   participant DB as 데이터베이스
 * 
 *   Component->>Hook: useUserSettingsQuery(userId)
 *   Hook->>Service: fetchSettings(userId)
 *   Service->>API: GET /api/settings?userId={userId}
 *   API->>DB: 사용자 설정 조회
 *   DB-->>API: 설정 데이터 반환
 *   API-->>Service: 설정 데이터 응답
 *   Service-->>Hook: 처리된 설정 데이터 반환
 *   Hook-->>Component: 데이터, 로딩 상태 등 반환
 * ```
 */ 