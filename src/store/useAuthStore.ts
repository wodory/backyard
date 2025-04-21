/**
 * 파일명: src/store/useAuthStore.ts
 * 목적: Zustand를 사용한 인증 상태 관리
 * 역할: Supabase 사용자 정보와 인증 관련 상태를 중앙 집중적으로 관리
 * 작성일: 2025-04-09
 * 수정일: 2025-04-24 : 스토어 리팩토링 - 토큰 및 인증 관련 정보를 제거하고 사용자 프로필과 상태만 관리하도록 수정
 */

'use client';

import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

import createLogger from '@/lib/logger';

// 로거 생성
const logger = createLogger('AuthStore');

// 인증 상태 인터페이스
interface AuthState {
  // 상태 (State)
  profile: User | null;
  isLoading: boolean;
  error: string | null;
  
  // 액션 (Actions)
  setProfile: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Zustand 스토어 생성
export const useAuthStore = create<AuthState>((set) => ({
  // 초기 상태
  profile: null,
  isLoading: true,
  error: null,
  
  // 액션 구현
  setProfile: (user) => {
    logger.info('사용자 프로필 설정', { 
      hasUser: !!user, 
      userId: user?.id
    });
    set({ profile: user });
  },
  
  setLoading: (isLoading) => {
    set({ isLoading });
  },
  
  setError: (error) => {
    if (error) {
      logger.error('인증 오류 설정', error);
    } else {
      logger.debug('인증 오류 초기화');
    }
    set({ error });
  }
}));

// 선택기 (Selectors)
export const selectIsAuthenticated = (state: AuthState) => !!state.profile;
export const selectUserId = (state: AuthState) => state.profile?.id;
export const selectUserEmail = (state: AuthState) => state.profile?.email;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error; 