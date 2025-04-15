/**
 * 파일명: src/store/useAuthStore.ts
 * 목적: Zustand를 사용한 인증 상태 관리
 * 역할: 클라이언트 측 인증 상태(토큰, 사용자 ID 등)를 중앙 집중적으로 관리
 * 작성일: 2025-04-09
 */

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import createLogger from '@/lib/logger';

// 로거 생성
const logger = createLogger('AuthStore');

// 인증 상태 인터페이스
interface AuthState {
  // 상태 (State)
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  provider: string | null;
  codeVerifier: string | null;
  isLoading: boolean;
  error: Error | null;
  
  // 액션 (Actions)
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setUser: (userId: string | null, provider?: string | null) => void;
  setCodeVerifier: (value: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  clearAuth: () => void;
  removeCodeVerifier: () => void;
}

// Zustand 스토어 생성
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 초기 상태
      accessToken: null,
      refreshToken: null,
      userId: null,
      provider: null,
      codeVerifier: null,
      isLoading: false,
      error: null,
      
      // 액션 구현
      setTokens: (accessToken, refreshToken) => {
        logger.info('인증 토큰 설정', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken
        });
        set({ accessToken, refreshToken });
      },
      
      setUser: (userId, provider = null) => {
        logger.info('사용자 정보 설정', { 
          hasUserId: !!userId, 
          provider
        });
        set({ userId, provider });
      },
      
      setCodeVerifier: (codeVerifier) => {
        if (codeVerifier) {
          logger.debug('PKCE 코드 검증기 설정', { 
            length: codeVerifier.length, 
            firstChars: codeVerifier.substring(0, 5) + '...' 
          });
        } else {
          logger.debug('PKCE 코드 검증기 초기화');
        }
        set({ codeVerifier });
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
      },
      
      clearAuth: () => {
        logger.info('인증 상태 초기화');
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          provider: null,
          error: null,
          // code_verifier는 유지 (다른 호출에서 필요할 수 있음)
        });
      },
      
      removeCodeVerifier: () => {
        logger.debug('PKCE 코드 검증기 제거');
        set({ codeVerifier: null });
      },
    }),
    {
      name: 'auth-storage', // localStorage 키
      storage: createJSONStorage(() => localStorage),
      // 지속될 상태만 선택 (일시적인 상태는 제외)
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userId: state.userId,
        provider: state.provider,
        // codeVerifier, isLoading, error는 제외 (일시적 상태)
      }),
    }
  )
);

// 선택기 (Selectors)
export const selectIsAuthenticated = (state: AuthState) => !!state.accessToken;
export const selectUserId = (state: AuthState) => state.userId;
export const selectProvider = (state: AuthState) => state.provider;
export const selectAuthTokens = (state: AuthState) => ({
  accessToken: state.accessToken,
  refreshToken: state.refreshToken,
});
export const selectCodeVerifier = (state: AuthState) => state.codeVerifier;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error; 