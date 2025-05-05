/**
 * 파일명: src/hooks/useUpdateSettingsMutation.ts
 * 목적: 설정 업데이트를 위한 React Query Mutation 훅 제공
 * 역할: 사용자 설정을 업데이트하는 뮤테이션 제공
 * 작성일: 2025-05-05
 * 수정일: 2025-05-05 : 쿼리 키 정책 변경에 맞춰 캐시 무효화 로직 수정
 * @rule   three-layer-standard
 * @layer  hook (TQ)
 * @tag    @tanstack-mutation-msw updateSettings
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as settingsService from '@/services/settingsService';
import { SettingsData } from '@/types/settings';
import createLogger from '@/lib/logger';

const logger = createLogger('useUpdateSettingsMutation');

/**
 * useUpdateSettingsMutation: 사용자 설정을 업데이트하는 뮤테이션 훅
 * @returns {UseMutationResult} 뮤테이션 결과
 */
export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      partialUpdate 
    }: { 
      userId: string; 
      partialUpdate: Partial<SettingsData>; 
    }) => {
      logger.debug('[useUpdateSettingsMutation] 설정 업데이트 시작', { userId });
      return settingsService.updateSettings(userId, partialUpdate);
    },
    onSuccess: (data, variables) => {
      const { userId } = variables;
      
      // Core 쿼리 캐시 무효화
      logger.debug('[useUpdateSettingsMutation] userSettings 쿼리 캐시 무효화');
      queryClient.invalidateQueries({ 
        queryKey: ['userSettings', userId] 
      });
      
      // 모든 feature 훅은 ['userSettings', userId] 쿼리 키를 사용하므로
      // 위의 무효화만으로 충분합니다. 아래 코드는 더 이상 필요 없습니다.
      
      // // 기능별 캐시도 함께 무효화
      // logger.debug('[useUpdateSettingsMutation] 관련 기능별 캐시도 함께 무효화');
      // 
      // // ideaMapSettings 캐시 무효화
      // if (variables.partialUpdate.ideamap) {
      //   queryClient.invalidateQueries({ 
      //     queryKey: ['ideaMapSettings', userId] 
      //   });
      // }
      // 
      // // themeSettings 캐시 무효화
      // if (variables.partialUpdate.theme) {
      //   queryClient.invalidateQueries({ 
      //     queryKey: ['themeSettings', userId] 
      //   });
      // }
      
      logger.debug('[useUpdateSettingsMutation] 설정 업데이트 성공', { userId });
    },
    onError: (error, variables) => {
      const { userId } = variables;
      logger.error('[useUpdateSettingsMutation] 설정 업데이트 실패', { userId, error });
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
 *   participant Service as settingsService
 *   participant API as /api/settings
 *   participant DB as 데이터베이스
 *   participant QueryCache as React Query 캐시
 * 
 *   UI->>MutationHook: mutate({userId, partialUpdate})
 *   MutationHook->>Service: updateSettings(userId, partialUpdate)
 *   Service->>API: PATCH /api/settings
 *   API->>DB: 설정 업데이트
 *   DB-->>API: 업데이트 성공 응답
 *   API-->>Service: 성공 응답
 *   Service-->>MutationHook: 성공 응답
 *   MutationHook->>QueryCache: invalidateQueries(['userSettings', userId])
 *   MutationHook-->>UI: 성공 상태 반환
 * ```
 */ 