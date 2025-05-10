/**
 * 파일명: src/hooks/useIdeaMapSettings.ts
 * 목적: 아이디어맵 설정 관련 React Query 훅 제공
 * 역할: 서버 상태로서의 아이디어맵 설정을 관리하는 훅 제공
 * 작성일: 2025-04-21
 * @rule   three-layer-standard
 * @layer  hook (TQ)
 * @tag    @tanstack-query-msw ideaMapSettings
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import isEqual from 'lodash.isequal';

import { useIdeaMapSettingsFromQuery } from '@/hooks/useUserSettingsQuery';
import createLogger from '@/lib/logger';
import { FullSettings as SchemaFullSettings, IdeaMapSettings as SchemaIdeaMapSettings } from '@/lib/schema/settings-schema';
import * as settingsService from '@/services/settingsService';
import { selectUserId, useAuthStore } from '@/store/useAuthStore';

const logger = createLogger('useIdeaMapSettings');

/**
 * 아이디어맵 설정 조회 훅
 * useUserSettingsQuery를 활용하여 서버 상태로서의 아이디어맵 설정을 제공
 * 성능 최적화: 
 * 1. select 함수로 아이디어맵 설정만 추출 - 동일 입력에 동일 출력 보장
 * 2. useMemo를 통한 데이터 변환 메모이제이션 - 불필요한 리렌더링 방지
 * 3. 데이터 변환 시 참조 동등성 유지 - 컴포넌트 불필요한 리렌더링 방지
 * @returns 아이디어맵 설정 객체와 관련 함수
 */
export function useIdeaMapSettings() {
  // useAuthStore에서 선택기 함수를 통해 userId 가져오기
  const userId = useAuthStore(selectUserId);
  
  // useIdeaMapSettingsFromQuery를 사용하여 아이디어맵 설정 가져오기
  const {
    data: ideaMapSettings,
    isLoading: isSettingsLoading,
    isError: isSettingsError,
    error: settingsError
  } = useIdeaMapSettingsFromQuery(userId);
  
  const { 
    mutate: updateSettings, 
    isPending: isUpdating 
  } = useUpdateIdeaMapSettingsMutation();
  
  return {
    ideaMapSettings,
    isLoading: isSettingsLoading,
    isError: isSettingsError,
    error: settingsError,
    updateSettings: (settings: Partial<SchemaIdeaMapSettings>) => {
      if (userId) {
        updateSettings({ userId, settings });
      } else {
        logger.error('[useIdeaMapSettings] userId가,없어 설정을 업데이트할 수 없습니다.');
      }
    },
    isUpdating
  };
}

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
      settings: Partial<SchemaIdeaMapSettings>; 
    }) => {
      // 빈 업데이트 감지 및 처리
      if (!settings || Object.keys(settings).length === 0) {
        const errorMsg = '빈 아이디어맵 설정 업데이트 감지 - 업데이트가 수행되지 않습니다';
        logger.error('[useUpdateIdeaMapSettingsMutation] ' + errorMsg, { userId });
        return Promise.reject(new Error(errorMsg));
      }
      
      // 요청 데이터 구성: SchemaFullSettings 형태로 부분 업데이트 객체 생성
      const partialUpdateForService: Partial<SchemaFullSettings> = {
        ideamap: settings
      } as Partial<SchemaFullSettings>;
      
      logger.debug(`[useUpdateIdeaMapSettingsMutation] 설정 업데이트 요청 시작 (userId: ${userId})`, { 
        partialUpdateForService
      });
      
      return settingsService.updateSettings(userId, partialUpdateForService);
    },
    onMutate: async (variables) => {
      const { userId, settings } = variables;
      
      // 낙관적 업데이트를 위해 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ 
        queryKey: ['userSettings', userId] 
      });
      
      // 현재 설정 저장
      const previousSettings = queryClient.getQueryData<SchemaFullSettings>(['userSettings', userId]);
      
      if (previousSettings) {
        // 깊은 병합을 위한 함수
        const deepMerge = <T extends Record<string, any>>(base: T, update: Partial<T> | undefined): T => {
          if (!update) return base;
          
          const result = { ...base };
          
          // 업데이트 객체의 각 키에 대해 병합
          Object.keys(update).forEach(key => {
            const updateValue = update[key as keyof T];
            const baseValue = base[key as keyof T];
            
            // 둘 다 객체이고 배열이 아닌 경우 재귀적으로 병합
            if (
              typeof baseValue === 'object' && 
              baseValue !== null &&
              !Array.isArray(baseValue) &&
              typeof updateValue === 'object' && 
              updateValue !== null &&
              !Array.isArray(updateValue)
            ) {
              result[key as keyof T] = deepMerge(baseValue, updateValue);
            } else if (updateValue !== undefined) {
              // 객체가 아니거나 배열인 경우는 직접 업데이트
              result[key as keyof T] = updateValue as T[keyof T];
            }
          });
          
          return result;
        };
        
        // IdeaMapSettings 깊은 병합 수행
        const updatedIdeamapSettings = deepMerge(
          previousSettings.ideamap,
          settings
        );
        
        // 전체 설정 업데이트
        const updatedSettings: SchemaFullSettings = {
          ...previousSettings,
          ideamap: updatedIdeamapSettings,
        };
        
        // 쿼리 캐시 낙관적 업데이트
        queryClient.setQueryData(['userSettings', userId], updatedSettings);
        logger.info('[onMutate] 낙관적 업데이트 적용', { 
          updatedSettings: updatedIdeamapSettings,
          originalSettings: settings
        });
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
    },
    onError: (error, variables, context) => {
      const { userId } = variables;
      logger.error('[useUpdateIdeaMapSettingsMutation] 설정 업데이트 실패:', error);
      
      // 에러 발생 시 이전 설정으로 롤백
      if (context?.previousSettings) {
        queryClient.setQueryData(['userSettings', userId], context.previousSettings);
        
        logger.info('설정 업데이트 실패로 이전 상태로 롤백함');
      }
    }
  });
};

/**
 * 아이디어맵 초기 설정 생성 뮤테이션 훅
 */
export const useCreateInitialIdeaMapSettingsMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      // 아이디어맵 설정을 스키마 기반으로 생성
      const initialFullSettings: SchemaFullSettings = {
        theme: {
          mode: 'light',
          accentColor: '#3498db'
        },
        general: {
          autoSaveIntervalMinutes: 1
        },
        ideamap: {
          snapToGrid: true,
          snapGrid: [15, 15],
          edge: {
            animated: false,
            edgeColor: '#C1C1C1',
            markerEnd: 'arrowclosed',
            markerSize: 20,
            strokeWidth: 3,
            selectedEdgeColor: '#000000',
            connectionLineType: 'bezier'
          },
          layout: {
            defaultPadding: 20,
            defaultSpacing: {
              horizontal: 30,
              vertical: 30
            },
            nodeSize: {
              width: 500,
              height: 48,
              maxHeight: 180
            },
            graphSettings: {
              nodesep: 60,
              ranksep: 100,
              edgesep: 100
            }
          },
          cardNode: {
            handles: {
              size: 10,
              backgroundColor: '#FFFFFF',
              borderColor: '#555555',
              borderWidth: 1
            },
            nodeSize: {
              width: 500,
              height: 48,
              maxHeight: 180
            },
            fontSizes: {
              default: 16,
              title: 16,
              content: 14,
              tags: 12
            },
            borderRadius: 8,
            defaultWidth: 130,
            backgroundColor: '#FFFFFF',
            tagBackgroundColor: '#F2F2F2'
          }
        }
      };
      
      logger.debug('[useCreateInitialIdeaMapSettingsMutation] 초기 설정 생성 요청', { userId });
      const result = await settingsService.createInitialSettings(userId, initialFullSettings);
      logger.debug('[useCreateInitialIdeaMapSettingsMutation] 초기 설정 생성 성공', { userId });
      return result;
    },
    onSuccess: (data, variables) => {
      const { userId } = variables;
      
      // 설정 쿼리 캐시 업데이트
      queryClient.setQueryData(['userSettings', userId], data);
      
      logger.info('[useCreateInitialIdeaMapSettingsMutation] 초기 설정 생성 성공, 캐시 업데이트 완료');
    },
    onError: (error) => {
      logger.error('[useCreateInitialIdeaMapSettingsMutation] 초기 설정 생성 실패:', error);
    }
  });
};

/**
 * mermaid 다이어그램:
 * ```mermaid
 * sequenceDiagram
 *   participant Component as UI 컴포넌트
 *   participant Hook as useIdeaMapSettings
 *   participant TQ_Hook as useIdeaMapSettingsFromQuery
 *   participant TQ_Mutation as useUpdateIdeaMapSettingsMutation
 *   participant Service as settingsService
 *   participant API as /api/settings
 *   participant DB as 데이터베이스
 * 
 *   Component->>Hook: useIdeaMapSettings()
 *   Hook->>TQ_Hook: useIdeaMapSettingsFromQuery(userId)
 *   TQ_Hook-->>Hook: ideaMapSettings (SchemaIdeaMapSettings)
 *   Hook-->>Component: ideaMapSettings, updateSettings 함수 제공
 *   
 *   Component->>Hook: updateSettings({ edge: { animated: true } })
 *   Hook->>TQ_Mutation: mutate({ userId, settings })
 *   TQ_Mutation->>TQ_Mutation: onMutate - 낙관적 UI 업데이트
 *   TQ_Mutation->>Service: updateSettings(userId, { ideamap: settings })
 *   Service->>API: PATCH /api/settings { userId, ideamap: {...} }
 *   API->>DB: UPDATE settings
 *   DB-->>API: updated settings
 *   API-->>Service: { settings_data: {...} }
 *   Service-->>TQ_Mutation: SchemaFullSettings
 *   TQ_Mutation->>TQ_Mutation: onSuccess - 캐시 무효화
 *   TQ_Mutation-->>Component: 업데이트 완료
 * ```
 */ 