/**
 * 파일명: src/hooks/useIdeaMapSettings.ts
 * 목적: 아이디어맵 설정 관련 React Query 훅 제공
 * 역할: 서버 상태로서의 아이디어맵 설정을 관리하는 훅 제공
 * 작성일: 2025-04-21
 * 수정일: 2025-04-30 : Task 3.1 요구사항 반영 - enabled 조건 개선 및 오류 처리 강화
 * 수정일: 2025-05-05 : Three-Layer-Standard에 맞게 리팩토링 - useUserSettingsQuery 사용
 * 수정일: 2025-05-05 : Lint 에러 수정
 * 수정일: 2025-05-05 : Invalid hook call 오류 수정 - React 훅 규칙 준수
 * @rule   three-layer-standard
 * @layer  hook (TQ)
 * @tag    @tanstack-query-msw ideaMapSettings
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { extractAndMergeSettings } from '@/lib/settings-utils';
import * as settingsService from '@/services/settingsService';
import createLogger from '@/lib/logger';
// import { useUserSettingsQuery } from './useUserSettingsQuery'; // 더 이상 직접 호출하지 않음
import { IdeaMapSettings, SettingsData } from '@/types/settings';

const logger = createLogger('useIdeaMapSettings');

/**
 * useIdeaMapSettings: 아이디어맵 설정을 가져오는 쿼리 훅
 * @param {string} userId - 사용자 ID
 * @returns {Object} 아이디어맵 설정 데이터와 로딩 상태를 포함한 객체
 */
export const useIdeaMapSettings = (userId?: string) => {
  return useQuery<SettingsData | null, Error, IdeaMapSettings>({
    queryKey: ['userSettings', userId], // Core 쿼리 키 공유
    queryFn: async () => {
      logger.debug(`[useIdeaMapSettings -> queryFn] 사용자 설정 조회 시작 (userId: ${userId})`);
      
      if (!userId) {
        logger.warn('[useIdeaMapSettings -> queryFn] 사용자 ID 없음, 빈 데이터 반환');
        return null;
      }
      
      try {
        const settingsData = await settingsService.fetchSettings(userId);
        logger.debug(`[useIdeaMapSettings -> queryFn] 사용자 설정 조회 성공 (userId: ${userId})`);
        return settingsData;
      } catch (error) {
        logger.error(`[useIdeaMapSettings -> queryFn] 사용자 설정 조회 실패 (userId: ${userId}):`, error);
        throw error;
      }
    },
    // select 옵션에서 데이터 가공 (기본값 병합 포함)
    select: (data: SettingsData | null) => {
      logger.debug('[useIdeaMapSettings -> select] 아이디어맵 설정 추출 및 병합 시작', { data });
      const ideaMapSettings = extractAndMergeSettings(data, 'ideamap');
      logger.debug('[useIdeaMapSettings -> select] 아이디어맵 설정 추출 및 병합 완료', { ideaMapSettings });
      return ideaMapSettings;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 신선하게 유지
    gcTime: 1000 * 60 * 30, // 30분 동안 캐시 유지
  });
};

/**
 * useUpdateIdeaMapSettingsMutation: 아이디어맵 설정을 업데이트하는 뮤테이션 훅
 * @returns {Object} mutate 함수와 상태를 포함한 객체
 */
export const useUpdateIdeaMapSettingsMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      settings 
    }: { 
      userId: string; 
      settings: Partial<IdeaMapSettings>; 
    }) => {
      // 아이디어맵 설정만 업데이트하도록 중첩 객체로 구성
      const partialUpdate: Partial<SettingsData> = {
        ideamap: settings as IdeaMapSettings // 타입 캐스팅으로 lint 에러 해결
      };
      logger.debug(`[useUpdateIdeaMapSettingsMutation] 설정 업데이트 요청 시작 (userId: ${userId})`, { partialUpdate });
      return settingsService.updateSettings(userId, partialUpdate);
    },
    onSuccess: (data, variables) => {
      const { userId } = variables;
      
      logger.debug(`[useUpdateIdeaMapSettingsMutation] 설정 업데이트 성공 (userId: ${userId}), 캐시 무효화 중...`);
      // Core 쿼리 키만 무효화하면 select 훅들이 자동으로 업데이트됨
      queryClient.invalidateQueries({ 
        queryKey: ['userSettings', userId] 
      });
      
      // 더 이상 필요하지 않음 (Core 쿼리를 공유하므로)
      // queryClient.invalidateQueries({ 
      //   queryKey: ['ideaMapSettings', userId] 
      // });
    },
    onError: (error) => {
      logger.error('[useUpdateIdeaMapSettingsMutation] 설정 업데이트 실패:', error);
    }
  });
};

/**
 * useCreateInitialIdeaMapSettingsMutation: 초기 아이디어맵 설정을 생성하는 뮤테이션 훅
 * @returns {Object} mutate 함수와 상태를 포함한 객체
 */
export const useCreateInitialIdeaMapSettingsMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      settings 
    }: { 
      userId: string; 
      settings: IdeaMapSettings; 
    }) => {
      // 초기 설정 생성을 위해 createInitialSettings 사용
      const initialData: Partial<SettingsData> = {
        ideamap: settings,
        // 다른 설정들은 기본값으로 서비스에서 처리할 수 있도록 전달
        card: {} as any,
        handles: {} as any,
        layout: {} as any,
        general: {} as any,
        theme: {} as any
      };
      return settingsService.createInitialSettings(userId, initialData as SettingsData);
    },
    onSuccess: (data, variables) => {
      const { userId } = variables;
      // Core 쿼리 키만 무효화
      queryClient.invalidateQueries({ 
        queryKey: ['userSettings', userId] 
      });
    },
  });
};

/**
 * mermaid 다이어그램:
 * ```mermaid
 * sequenceDiagram
 *   participant UI as UI 컴포넌트
 *   participant FeatureHook as useIdeaMapSettings
 *   participant Service as settingsService
 *   participant API as /api/settings
 *   participant DB as 데이터베이스
 * 
 *   UI->>FeatureHook: useIdeaMapSettings(userId)
 *   FeatureHook->>Service: fetchSettings(userId)
 *   Service->>API: GET /api/settings?userId={userId}
 *   API->>DB: 사용자 설정 조회
 *   DB-->>API: 설정 데이터 반환
 *   API-->>Service: 설정 데이터 응답
 *   Service-->>FeatureHook: 처리된 전체 설정 데이터 반환
 *   FeatureHook->>FeatureHook: select 함수로 ideamap 설정만 추출 및 병합
 *   FeatureHook-->>UI: 아이디어맵 설정만 포함한 데이터 반환
 * 
 *   UI->>FeatureHook: updateIdeaMapSettings()
 *   FeatureHook->>Service: updateSettings(userId, {ideamap: settings})
 *   Service->>API: PATCH /api/settings
 *   API->>DB: 설정 업데이트
 *   DB-->>API: 업데이트 성공 응답
 *   API-->>Service: 성공 응답
 *   Service-->>FeatureHook: 성공 응답
 *   FeatureHook->>FeatureHook: invalidateQueries(['userSettings', userId])
 *   FeatureHook-->>UI: 성공 상태 반환
 * ```
 */ 