/**
 * 파일명: src/hooks/useIdeaMapSettings.ts
 * 목적: 아이디어맵 설정 관련 React Query 훅 제공
 * 역할: 서버 상태로서의 아이디어맵 설정을 관리하는 훅 제공
 * 작성일: 2025-04-21
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Settings, DEFAULT_SETTINGS } from '@/lib/ideamap-utils';
import * as settingsService from '@/services/settingsService';

/**
 * useIdeaMapSettings: 아이디어맵 설정을 가져오는 쿼리 훅
 * @param {string} userId - 사용자 ID
 * @returns {Object} 설정 데이터와 로딩 상태를 포함한 객체
 */
export const useIdeaMapSettings = (userId: string) => {
  return useQuery({
    queryKey: ['ideaMapSettings', userId],
    queryFn: () => settingsService.fetchSettings(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 신선하게 유지
    initialData: DEFAULT_SETTINGS,
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
      settings: Partial<Settings>; 
    }) => 
      settingsService.updateSettings(userId, settings),
    onSuccess: (data, variables) => {
      const { userId } = variables;
      
      // 쿼리 캐시 무효화
      queryClient.invalidateQueries({ 
        queryKey: ['ideaMapSettings', userId] 
      });
      
      // 로컬 캐시 낙관적 업데이트
      queryClient.setQueryData(['ideaMapSettings', userId], (oldData: any) => {
        if (!oldData) return data;
        return { ...oldData, ...variables.settings };
      });
    },
  });
};

/**
 * useCreateIdeaMapSettingsMutation: 새 아이디어맵 설정을 생성하는 뮤테이션 훅
 * @returns {Object} mutate 함수와 상태를 포함한 객체
 */
export const useCreateIdeaMapSettingsMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      settings 
    }: { 
      userId: string; 
      settings: Settings; 
    }) => 
      settingsService.createSettings(userId, settings),
    onSuccess: (data, variables) => {
      const { userId } = variables;
      queryClient.invalidateQueries({ 
        queryKey: ['ideaMapSettings', userId] 
      });
    },
  });
}; 