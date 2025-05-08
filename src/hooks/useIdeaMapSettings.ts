/**
 * 파일명: src/hooks/useIdeaMapSettings.ts
 * 목적: 아이디어맵 설정 관련 React Query 훅 제공
 * 역할: 서버 상태로서의 아이디어맵 설정을 관리하는 훅 제공
 * 작성일: 2025-04-21
 * 수정일: 2025-04-30 : Task 3.1 요구사항 반영 - enabled 조건 개선 및 오류 처리 강화
 * 수정일: 2025-05-05 : Three-Layer-Standard에 맞게 리팩토링 - useUserSettingsQuery 사용
 * 수정일: 2025-05-05 : Lint 에러 수정
 * 수정일: 2025-05-05 : Invalid hook call 오류 수정 - React 훅 규칙 준수
 * 수정일: 2025-05-06 : select 함수를 useCallback으로 메모이제이션하여 불필요한 리렌더링 방지
 * 수정일: 2025-05-06 : 불필요한 로그 제거 및 메모이제이션 주석 추가
 * 수정일: 2025-05-06 : 코드 단순화 - 의존성 쿼리 제거하고 직접 데이터 변환
 * 수정일: 2025-05-06 : 동일한 설정값 업데이트 시 불필요한 API 호출 방지
 * 수정일: 2025-05-12 : Zustand 스토어 연동 개선 - _updateSettingsRef 함수 사용
 * @rule   three-layer-standard
 * @layer  hook (TQ)
 * @tag    @tanstack-query-msw ideaMapSettings
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useUserSettingsQuery } from '@/hooks/useUserSettingsQuery';

import { extractAndMergeSettings } from '@/lib/settings-utils';
import * as settingsService from '@/services/settingsService';
import createLogger from '@/lib/logger';
import { IdeaMapSettings, SettingsData } from '@/types/settings';
import { selectUserId, useAuthStore } from '@/store/useAuthStore';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';

const logger = createLogger('useIdeaMapSettings');

/**
 * 아이디어맵 설정 조회 훅
 * useUserSettingsQuery를 활용하여 서버 상태로서의 아이디어맵 설정을 제공
 * 성능 최적화: 
 * 1. extractAndMergeSettings 함수 메모이제이션 - 동일 입력에 동일 출력 보장
 * 2. useMemo를 통한 데이터 변환 메모이제이션 - 불필요한 리렌더링 방지
 * 3. 데이터 변환 시 참조 동등성 유지 - 컴포넌트 불필요한 리렌더링 방지
 * @returns 아이디어맵 설정 객체와 관련 함수
 */
export function useIdeaMapSettings() {
  const queryClient = useQueryClient();
  // useAuthStore에서 선택기 함수를 통해 userId 가져오기
  const userId = useAuthStore(selectUserId);
  // Zustand 스토어의 _updateSettingsRef 함수 가져오기
  const updateIdeaMapSettingsRef = useIdeaMapStore(state => state._updateSettingsRef);
  
  // useUserSettingsQuery를 사용해 사용자 설정 가져오기
  const {
    data: userSettings,
    isLoading: isSettingsLoading,
    isError: isSettingsError,
    error: settingsError
  } = useUserSettingsQuery(userId);
  
  // useMemo를 사용하여 아이디어맵 설정 추출 메모이제이션
  const ideaMapSettings = useMemo(() => {
    return extractAndMergeSettings<'ideamap'>(userSettings, 'ideamap');
  }, [userSettings]);
  
  // useEffect를 사용하여 설정이 로드되면 Zustand 스토어의 설정 참조 업데이트
  useEffect(() => {
    if (ideaMapSettings && updateIdeaMapSettingsRef) {
      logger.debug('[useIdeaMapSettings] Zustand 스토어의 설정 참조 업데이트', { 
        hasSettings: !!ideaMapSettings 
      });
      updateIdeaMapSettingsRef(ideaMapSettings);
    }
  }, [ideaMapSettings, updateIdeaMapSettingsRef]);
  
  // 설정 업데이트를 위한 useMutation
  const { mutate: updateSettings, isPending: isUpdating } = useMutation({
    mutationFn: (data: { userId: string, settings: Partial<SettingsData> }) => 
      settingsService.updateSettings(data.userId, data.settings),
    onSuccess: (data) => {
      // 성공 시 캐시 업데이트
      if (userId) {
        queryClient.setQueryData(['userSettings', userId], data);
      }
    },
    onError: (error) => {
      logger.error('[useUpdateIdeaMapSettingsMutation] 설정 업데이트 실패:', error);
    }
  });
  
  return {
    ideaMapSettings,
    isLoading: isSettingsLoading,
    isError: isSettingsError,
    error: settingsError,
    updateSettings,
    isUpdating
  };
}

/**
 * useUpdateIdeaMapSettingsMutation: 아이디어맵 설정을 업데이트하는 뮤테이션 훅
 * @returns {Object} mutate 함수와 상태를 포함한 객체
 */
export const useUpdateIdeaMapSettingsMutation = () => {
  const queryClient = useQueryClient();
  // Zustand 스토어의 _updateSettingsRef 함수 가져오기
  const updateIdeaMapSettingsRef = useIdeaMapStore(state => state._updateSettingsRef);
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      settings 
    }: { 
      userId: string; 
      settings: Partial<IdeaMapSettings>; 
    }) => {
      // 빈 업데이트 감지 및 처리
      if (!settings || Object.keys(settings).length === 0) {
        const errorMsg = '빈 아이디어맵 설정 업데이트 감지 - 업데이트가 수행되지 않습니다';
        logger.error('[useUpdateIdeaMapSettingsMutation] ' + errorMsg, { userId });
        // 빈 객체 업데이트 요청은 거부하고 현재 설정 반환
        const currentSettings = queryClient.getQueryData<SettingsData>(['userSettings', userId]);
        if (currentSettings) {
          return Promise.resolve(currentSettings);
        }
        // 현재 설정도 없는 경우는 에러 발생
        return Promise.reject(new Error(errorMsg));
      }
      
      // 최적화: 현재 설정과 동일한 값으로 업데이트하려는 경우 API 호출 방지
      const currentSettings = queryClient.getQueryData<SettingsData>(['userSettings', userId]);
      
      if (currentSettings) {
        const currentIdeaMapSettings = extractAndMergeSettings<'ideamap'>(currentSettings, 'ideamap');
        let hasChanges = false;
        
        // 실제 변경사항이 있는지 확인
        for (const key in settings) {
          if (settings[key as keyof Partial<IdeaMapSettings>] !== undefined && 
              JSON.stringify(settings[key as keyof Partial<IdeaMapSettings>]) !== 
              JSON.stringify(currentIdeaMapSettings[key as keyof IdeaMapSettings])) {
            hasChanges = true;
            break;
          }
        }
        
        // 변경사항이 없으면 현재 설정 그대로 반환 (API 호출 건너뛰기)
        if (!hasChanges) {
          logger.debug('[useUpdateIdeaMapSettingsMutation] 설정 변경 없음, API 호출 건너뛰기');
          return Promise.resolve(currentSettings);
        }
      }
      
      // 아이디어맵 설정만 업데이트하도록 중첩 객체로 구성
      const partialUpdate: Partial<SettingsData> = {
        ideamap: settings as IdeaMapSettings // 타입 캐스팅으로 lint 에러 해결
      };
      
      logger.debug(`[useUpdateIdeaMapSettingsMutation] 설정 업데이트 요청 시작 (userId: ${userId})`, { partialUpdate });
      return settingsService.updateSettings(userId, partialUpdate);
    },
    onMutate: async (variables) => {
      const { userId, settings } = variables;
      
      // 낙관적 업데이트를 위해 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ 
        queryKey: ['userSettings', userId] 
      });
      
      // 현재 설정 저장
      const previousSettings = queryClient.getQueryData<SettingsData>(['userSettings', userId]);
      
      if (previousSettings) {
        // 낙관적 업데이트 계산
        const updatedSettings = {
          ...previousSettings,
          ideamap: {
            ...previousSettings.ideamap,
            ...settings
          }
        };
        
        // 쿼리 캐시 낙관적 업데이트
        queryClient.setQueryData(['userSettings', userId], updatedSettings);
        
        // Zustand 스토어 낙관적 업데이트
        if (updateIdeaMapSettingsRef) {
          logger.debug('[useUpdateIdeaMapSettingsMutation] Zustand 스토어 낙관적 업데이트');
          updateIdeaMapSettingsRef(updatedSettings.ideamap);
        }
      }
      
      return { previousSettings };
    },
    onSuccess: (data, variables) => {
      const { userId } = variables;
      
      logger.debug(`[useUpdateIdeaMapSettingsMutation] 설정 업데이트 성공 (userId: ${userId}), 캐시 무효화 중...`);
      
      // Core 쿼리 키만 무효화하면 select 훅들이 자동으로 업데이트됨
      queryClient.invalidateQueries({ 
        queryKey: ['userSettings', userId] 
      });
      
      // 엣지 스타일 즉시 업데이트를 위해 useIdeaMapStore의 updateAllEdgeStylesAction 호출
      // Three-Layer-Standard에 따라 store의 액션을 직접 호출
      try {
        const { updateAllEdgeStylesAction } = useIdeaMapStore.getState();
        if (updateAllEdgeStylesAction) {
          logger.debug('[useUpdateIdeaMapSettingsMutation] 엣지 스타일 즉시 업데이트 실행');
          updateAllEdgeStylesAction();
        }
      } catch (error) {
        logger.error('[useUpdateIdeaMapSettingsMutation] 엣지 스타일 업데이트 실패:', error);
      }
    },
    onError: (error, variables, context) => {
      const { userId } = variables;
      logger.error('[useUpdateIdeaMapSettingsMutation] 설정 업데이트 실패:', error);
      
      // 낙관적 업데이트 롤백
      if (context?.previousSettings) {
        queryClient.setQueryData(['userSettings', userId], context.previousSettings);
        
        // Zustand 스토어도 롤백
        if (updateIdeaMapSettingsRef) {
          logger.debug('[useUpdateIdeaMapSettingsMutation] Zustand 스토어 롤백');
          updateIdeaMapSettingsRef(context.previousSettings.ideamap);
        }
      }
    }
  });
};

/**
 * useCreateInitialIdeaMapSettingsMutation: 초기 아이디어맵 설정을 생성하는 뮤테이션 훅
 * @returns {Object} mutate 함수와 상태를 포함한 객체
 */
export const useCreateInitialIdeaMapSettingsMutation = () => {
  const queryClient = useQueryClient();
  // Zustand 스토어의 _updateSettingsRef 함수 가져오기
  const updateIdeaMapSettingsRef = useIdeaMapStore(state => state._updateSettingsRef);
  
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
      const { userId, settings } = variables;
      // Core 쿼리 키만 무효화
      queryClient.invalidateQueries({ 
        queryKey: ['userSettings', userId] 
      });
      
      // 성공 시 Zustand 스토어 업데이트
      if (updateIdeaMapSettingsRef) {
        logger.debug('[useCreateInitialIdeaMapSettingsMutation] Zustand 스토어 업데이트');
        updateIdeaMapSettingsRef(settings);
      }
    },
  });
};

/**
 * mermaid 다이어그램:
 * ```mermaid
 * sequenceDiagram
 *   participant UI as UI 컴포넌트
 *   participant FeatureHook as useIdeaMapSettings
 *   participant ZustandStore as useIdeaMapStore
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
 *   FeatureHook->>ZustandStore: _updateSettingsRef(ideaMapSettings)
 *   ZustandStore->>ZustandStore: updateAllEdgeStylesAction() 실행
 *   FeatureHook-->>UI: 아이디어맵 설정만 포함한 데이터 반환
 * 
 *   UI->>FeatureHook: updateIdeaMapSettings()
 *   FeatureHook->>FeatureHook: 낙관적 업데이트 계산
 *   FeatureHook->>ZustandStore: _updateSettingsRef(낙관적 설정)
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