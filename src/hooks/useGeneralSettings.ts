/**
 * 파일명: src/hooks/useGeneralSettings.ts
 * 목적: 일반 설정 관련 React Query 훅 제공
 * 역할: 서버 상태로서의 일반 설정을 관리하는 훅 제공
 * 작성일: 2025-05-05
 * 수정일: 2025-05-05 : Invalid hook call 오류 수정 - React 훅 규칙 준수
 * 수정일: 2025-05-08 : SettingsData에서 FullSettings로 타입 변경
 * @rule   three-layer-standard
 * @layer  hook (TQ)
 * @tag    @tanstack-query-msw generalSettings
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getDefaultSettings } from '@/lib/settings-utils';
import * as settingsService from '@/services/settingsService';
import createLogger from '@/lib/logger';
// import { useUserSettingsQuery } from './useUserSettingsQuery'; // 더 이상 직접 호출하지 않음
import { SettingsData } from '@/types/settings';
import { FullSettings, GeneralSettings } from '@/lib/schema/settings-schema';

const logger = createLogger('useGeneralSettings');

/**
 * useGeneralSettings: 일반 설정을 가져오는 쿼리 훅
 * @param {string} userId - 사용자 ID
 * @returns {Object} 일반 설정 데이터와 로딩 상태를 포함한 객체
 */
export const useGeneralSettings = (userId?: string) => {
  return useQuery<FullSettings | null, Error, GeneralSettings>({
    queryKey: ['userSettings', userId], // Core 쿼리 키 공유
    queryFn: async () => {
      logger.debug(`[useGeneralSettings -> queryFn] 사용자 설정 조회 시작 (userId: ${userId})`);
      
      if (!userId) {
        logger.warn('[useGeneralSettings -> queryFn] 사용자 ID 없음, 빈 데이터 반환');
        return null;
      }
      
      try {
        const settingsData = await settingsService.fetchSettings(userId);
        logger.debug(`[useGeneralSettings -> queryFn] 사용자 설정 조회 성공 (userId: ${userId})`);
        return settingsData;
      } catch (error) {
        logger.error(`[useGeneralSettings -> queryFn] 사용자 설정 조회 실패 (userId: ${userId}):`, error);
        throw error;
      }
    },
    // select 옵션에서 데이터 가공 - 항상 유효한 GeneralSettings 객체 반환
    select: (data: FullSettings | null) => {
      logger.debug('[useGeneralSettings -> select] 일반 설정 추출 시작', { data });
      // null인 경우 기본 일반 설정 반환
      if (!data) {
        logger.debug('[useGeneralSettings -> select] 데이터가 없어 기본 일반 설정 반환');
        return getDefaultSettings('general');
      }
      return data.general;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 신선하게 유지
    gcTime: 1000 * 60 * 30, // 30분 동안 캐시 유지
  });
};

/**
 * useUpdateGeneralSettingsMutation: 일반 설정을 업데이트하는 뮤테이션 훅
 * @returns {Object} mutate 함수와 상태를 포함한 객체
 */
export const useUpdateGeneralSettingsMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      settings 
    }: { 
      userId: string; 
      settings: Partial<GeneralSettings>; 
    }) => {
      // 일반 설정만 업데이트하도록 중첩 객체로 구성
      const partialUpdate: Partial<SettingsData> = {
        general: settings as any // 타입 캐스팅으로 lint 에러 해결
      };
      logger.debug(`[useUpdateGeneralSettingsMutation] 설정 업데이트 요청 시작 (userId: ${userId})`, { partialUpdate });
      return settingsService.updateSettings(userId, partialUpdate);
    },
    onSuccess: (data, variables) => {
      const { userId } = variables;
      
      logger.debug(`[useUpdateGeneralSettingsMutation] 설정 업데이트 성공 (userId: ${userId}), 캐시 무효화 중...`);
      // Core 쿼리 키만 무효화하면 select 훅들이 자동으로 업데이트됨
      queryClient.invalidateQueries({ 
        queryKey: ['userSettings', userId] 
      });
    },
    onError: (error) => {
      logger.error('[useUpdateGeneralSettingsMutation] 설정 업데이트 실패:', error);
    }
  });
};

/**
 * mermaid 다이어그램:
 * ```mermaid
 * sequenceDiagram
 *   participant UI as UI 컴포넌트
 *   participant FeatureHook as useGeneralSettings
 *   participant Service as settingsService
 *   participant API as /api/settings
 *   participant DB as 데이터베이스
 * 
 *   UI->>FeatureHook: useGeneralSettings(userId)
 *   FeatureHook->>Service: fetchSettings(userId)
 *   Service->>API: GET /api/settings?userId={userId}
 *   API->>DB: 사용자 설정 조회
 *   DB-->>API: 설정 데이터 반환
 *   API-->>Service: 설정 데이터 응답
 *   Service-->>FeatureHook: 처리된 전체 설정 데이터 반환
 *   FeatureHook->>FeatureHook: select 함수로 general 설정만 추출
 *   FeatureHook-->>UI: 일반 설정만 포함한 데이터 반환
 * 
 *   UI->>FeatureHook: updateGeneralSettings()
 *   FeatureHook->>Service: updateSettings(userId, {general: settings})
 *   Service->>API: PATCH /api/settings
 *   API->>DB: 설정 업데이트
 *   DB-->>API: 업데이트 성공 응답
 *   API-->>Service: 성공 응답
 *   Service-->>FeatureHook: 성공 응답
 *   FeatureHook->>FeatureHook: invalidateQueries(['userSettings', userId])
 *   FeatureHook-->>UI: 성공 상태 반환
 * ```
 */ 