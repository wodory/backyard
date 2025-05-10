/**
 * 파일명: src/hooks/useUpdateSettingsMutation.ts
 * 목적: 설정 업데이트를 위한 React Query Mutation 훅 제공
 * 역할: 사용자 설정을 업데이트하는 뮤테이션 제공
 * 작성일: 2025-05-05
 * 수정일: 2025-05-05 : 쿼리 키 정책 변경에 맞춰 캐시 무효화 로직 수정
 * 수정일: 2025-05-12 : 낙관적 업데이트 구현 및 Zustand 스토어 연동
 * 수정일: 2025-05-12 : setIdeaMapSettings 대신 _updateSettingsRef 함수 사용
 * 수정일: 2025-05-21 : SettingsData에서 FullSettings 타입으로 변경
 * @rule   three-layer-standard
 * @layer  hook (TQ)
 * @tag    @tanstack-mutation-msw updateSettings
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as settingsService from '@/services/settingsService';
import { FullSettings, IdeaMapSettings } from '@/lib/schema/settings-schema';
import createLogger from '@/lib/logger';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import { deepMergeSettings } from '@/lib/settings-utils';
import { SettingsData, IdeaMapSettings as OldIdeaMapSettings } from '@/types/settings';
import { ConnectionLineType, MarkerType } from '@xyflow/system';

const logger = createLogger('useUpdateSettingsMutation');

/**
 * 두 설정 객체를 병합하여 새로운 설정 객체 생성
 * @param {FullSettings | null} currentSettings - 현재 설정
 * @param {Partial<FullSettings>} updateSettings - 업데이트할 설정
 * @returns {FullSettings} - 병합된 설정
 */
const applyPartialSettings = (
  currentSettings: FullSettings | null,
  updateSettings: Partial<FullSettings>
): FullSettings => {
  if (!currentSettings) {
    // 현재 설정이 없으면 업데이트 설정을 전체 설정으로 간주
    // 타입 불일치가 있을 수 있지만 서비스 계층에서 검증됨
    return updateSettings as FullSettings;
  }

  return deepMergeSettings(currentSettings, updateSettings) as FullSettings;
};

/**
 * FullSettings.ideamap 형식을 SettingsData.ideamap 형식으로 변환
 * @param {FullSettings['ideamap']} ideaMapSettings - Zod 스키마 기반 아이디어맵 설정
 * @returns {SettingsData['ideamap']} - Zustand 스토어 호환 아이디어맵 설정
 */
const convertToStoreCompatibleIdeaMapSettings = (
  ideaMapSettings: FullSettings['ideamap']
): OldIdeaMapSettings => {
  // SettingsData.ideamap 구조에 맞게 변환
  return {
    snapToGrid: ideaMapSettings.snapToGrid,
    snapGrid: ideaMapSettings.snapGrid,
    connectionLineType: ideaMapSettings.edge.connectionLineType as ConnectionLineType,
    markerEnd: ideaMapSettings.edge.markerEnd as MarkerType | null,
    strokeWidth: ideaMapSettings.edge.strokeWidth,
    markerSize: ideaMapSettings.edge.markerSize,
    edgeColor: ideaMapSettings.edge.edgeColor,
    animated: ideaMapSettings.edge.animated,
    selectedEdgeColor: ideaMapSettings.edge.selectedEdgeColor
  };
};

/**
 * FullSettings 타입의 부분 업데이트를 SettingsData 타입으로 변환
 * @param {Partial<FullSettings>} fullSettingsUpdate - FullSettings 기반 업데이트 데이터
 * @returns {Partial<SettingsData>} - SettingsData 형식의 업데이트 데이터
 */
const convertFullSettingsUpdateToSettingsData = (
  fullSettingsUpdate: Partial<FullSettings>
): Partial<SettingsData> => {
  const result: Partial<SettingsData> = {};
  
  // theme 변환
  if (fullSettingsUpdate.theme) {
    result.theme = fullSettingsUpdate.theme;
  }
  
  // general 변환
  if (fullSettingsUpdate.general) {
    result.general = fullSettingsUpdate.general;
  }
  
  // ideamap 변환
  if (fullSettingsUpdate.ideamap) {
    result.ideamap = convertToStoreCompatibleIdeaMapSettings(fullSettingsUpdate.ideamap);
  }
  
  return result;
};

/**
 * useUpdateSettingsMutation: 사용자 설정을 업데이트하는 뮤테이션 훅
 * @returns {UseMutationResult} 뮤테이션 결과
 */
export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();
  // Zustand 스토어에서 _updateSettingsRef 함수 가져오기
  const updateIdeaMapSettingsRef = useIdeaMapStore(state => state._updateSettingsRef);
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      partialUpdate 
    }: { 
      userId: string; 
      partialUpdate: Partial<FullSettings>; 
    }) => {
      // 빈 업데이트 객체 감지 및 처리
      if (!partialUpdate || Object.keys(partialUpdate).length === 0) {
        const errorMsg = '빈 설정 업데이트 감지 - 업데이트가 수행되지 않습니다';
        logger.error('[useUpdateSettingsMutation] ' + errorMsg, { userId });
        // 빈 객체 업데이트 요청은 거부하고 현재 설정 반환
        const currentSettings = queryClient.getQueryData<FullSettings>(['userSettings', userId]);
        if (currentSettings) {
          return Promise.resolve(currentSettings);
        }
        // 현재 설정도 없는 경우는 에러 발생
        return Promise.reject(new Error(errorMsg));
      }
      
      logger.debug('[useUpdateSettingsMutation] 설정 업데이트 시작', { 
        userId, 
        hasIdeaMapSettings: !!partialUpdate.ideamap
      });
      
      // FullSettings 형식을 SettingsData 형식으로 변환하여 서비스에 전달
      const settingsDataUpdate = convertFullSettingsUpdateToSettingsData(partialUpdate);
      
      return settingsService.updateSettings(userId, settingsDataUpdate);
    },
    
    // 낙관적 업데이트를 위한 onMutate 함수
    onMutate: async (variables) => {
      const { userId, partialUpdate } = variables;
      
      // 진행 중인 설정 쿼리 취소
      await queryClient.cancelQueries({ 
        queryKey: ['userSettings', userId] 
      });

      // 현재 캐시의 데이터 가져오기
      const previousSettings = queryClient.getQueryData<FullSettings | null>(
        ['userSettings', userId]
      );

      // 캐시 데이터 없을 경우 early return
      if (!previousSettings) {
        logger.warn('[useUpdateSettingsMutation] 캐시에 이전 설정 없음, 낙관적 업데이트 건너뜀');
        return { previousSettings: null };
      }

      logger.debug('[useUpdateSettingsMutation] 낙관적 업데이트 시작', { 
        hasIdeaMapSettings: !!partialUpdate.ideamap
      });

      // 낙관적으로 업데이트된 설정 계산
      const nextSettings = applyPartialSettings(previousSettings, partialUpdate);

      // 쿼리 캐시 즉시 업데이트
      queryClient.setQueryData<FullSettings>(
        ['userSettings', userId],
        nextSettings
      );

      // 아이디어맵 설정이 포함된 경우 Zustand 스토어의 설정 참조도 업데이트
      if (partialUpdate.ideamap && updateIdeaMapSettingsRef && nextSettings.ideamap) {
        logger.debug('[useUpdateSettingsMutation] Zustand 스토어의 아이디어맵 설정 참조 업데이트');
        
        // FullSettings.ideamap을 SettingsData['ideamap'] 형식으로 변환
        const storeCompatibleSettings = convertToStoreCompatibleIdeaMapSettings(nextSettings.ideamap);
        updateIdeaMapSettingsRef(storeCompatibleSettings);
      }

      return {
        previousSettings,
      };
    },
    
    // 뮤테이션 성공 시 처리
    onSuccess: (data, variables) => {
      const { userId } = variables;
      
      // Core 쿼리 캐시 무효화
      logger.debug('[useUpdateSettingsMutation] userSettings 쿼리 캐시 무효화');
      queryClient.invalidateQueries({ 
        queryKey: ['userSettings', userId] 
      });
      
      logger.debug('[useUpdateSettingsMutation] 설정 업데이트 성공', { userId });
    },
    
    // 뮤테이션 오류 시 처리
    onError: (error, variables, context) => {
      const { userId } = variables;
      logger.error('[useUpdateSettingsMutation] 설정 업데이트 실패', { userId, error });
      
      // 이전 상태가 있는 경우 롤백
      if (context?.previousSettings) {
        logger.debug('[useUpdateSettingsMutation] 낙관적 업데이트 롤백');
        
        // 쿼리 캐시 롤백
        queryClient.setQueryData(
          ['userSettings', userId],
          context.previousSettings
        );
        
        // Zustand 스토어의 설정 참조도 롤백
        if (variables.partialUpdate.ideamap && updateIdeaMapSettingsRef && context.previousSettings.ideamap) {
          logger.debug('[useUpdateSettingsMutation] Zustand 스토어의 아이디어맵 설정 참조 롤백');
          
          // FullSettings.ideamap을 SettingsData['ideamap'] 형식으로 변환
          const storeCompatibleSettings = convertToStoreCompatibleIdeaMapSettings(context.previousSettings.ideamap);
          updateIdeaMapSettingsRef(storeCompatibleSettings);
        }
      }
    },
    
    // 뮤테이션 완료 시 처리 (성공/실패 모두)
    onSettled: (data, error, variables) => {
      const { userId } = variables;
      logger.debug('[useUpdateSettingsMutation] 설정 업데이트 작업 완료', { 
        userId, 
        success: !error 
      });
    }
  });
};

export default useUpdateSettingsMutation;

/**
 * mermaid 다이어그램:
 * ```mermaid
 * sequenceDiagram
 *   participant UI as UI 컴포넌트
 *   participant MutationHook as useUpdateSettingsMutation
 *   participant ZustandStore as useIdeaMapStore
 *   participant QueryCache as React Query 캐시
 *   participant Service as settingsService
 *   participant API as /api/settings
 *   participant DB as 데이터베이스
 * 
 *   UI->>MutationHook: mutate({userId, partialUpdate})
 *   MutationHook->>QueryCache: 진행 중인 쿼리 취소
 *   MutationHook->>QueryCache: 현재 설정 가져오기
 *   MutationHook->>MutationHook: 낙관적 업데이트 계산
 *   MutationHook->>QueryCache: setQueryData(nextSettings)
 *   MutationHook->>MutationHook: convertToStoreCompatibleIdeaMapSettings()
 *   MutationHook->>ZustandStore: _updateSettingsRef(storeCompatibleSettings)
 *   ZustandStore->>ZustandStore: updateAllEdgeStylesAction() 실행
 *   MutationHook-->>UI: 낙관적 UI 업데이트 (즉시 반영)
 *   MutationHook->>MutationHook: convertFullSettingsUpdateToSettingsData()
 *   MutationHook->>Service: updateSettings(userId, settingsDataUpdate)
 *   Service->>API: PATCH /api/settings
 *   API->>DB: 설정 업데이트
 *   DB-->>API: 업데이트 성공 응답
 *   API-->>Service: 성공 응답
 *   Service-->>MutationHook: 성공 응답
 *   alt 성공 시
 *     MutationHook->>QueryCache: invalidateQueries(['userSettings', userId])
 *   else 실패 시
 *     MutationHook->>MutationHook: convertToStoreCompatibleIdeaMapSettings()
 *     MutationHook->>QueryCache: setQueryData(previousSettings) (롤백)
 *     MutationHook->>ZustandStore: _updateSettingsRef(storeCompatibleSettings) (롤백)
 *   end
 *   MutationHook-->>UI: 최종 상태 반환
 * ```
 */ 