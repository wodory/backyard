/**
 * 파일명: src/hooks/useAuth.ts
 * 목적: Supabase 인증 상태 변경 이벤트 구독 및 상태 관리
 * 역할: Auth 이벤트 리스닝과 전역 상태 동기화를 담당하는 커스텀 훅
 * 작성일: 2024-05-13
 * 수정일: 2025-04-24 : useAuthStore 리팩토링에 맞춰 업데이트 - setUser 대신 setProfile 사용
 * 수정일: 2024-05-25 : three-layer-Standard 룰 적용
 * @rule   three-layer-Standard
 * @layer  hooks
 * @tag    @tanstack-query-msw useAuth
 */

'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import createLogger from '@/lib/logger';

// 로거 생성
const logger = createLogger('useAuth');

/**
 * 인증 상태 인터페이스 정의
 */
interface AuthStatus {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * useAuth: Supabase 인증 상태 변경을 구독하여 앱 상태에 반영하는 훅
 * @returns {AuthStatus} 현재 사용자 정보, 로딩 및 에러 상태
 */
export function useAuth(): AuthStatus {
  // 로컬 상태 설정
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [localIsLoading, setLocalIsLoading] = useState<boolean>(true);
  const [localError, setLocalError] = useState<Error | null>(null);

  // Zustand 스토어에서 액션 가져오기
  const setStoreLoading = useAuthStore((state) => state.setLoading);
  const setStoreProfile = useAuthStore((state) => state.setProfile);
  const setStoreError = useAuthStore((state) => state.setError);

  useEffect(() => {
    let mounted = true;
    
    async function initializeAuth() {
      try {
        // 중앙화된 Supabase 클라이언트 사용
        const supabase = createClient();
        
        // 초기 세션 확인
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        // 현재 사용자 정보 설정
        if (session?.user) {
          if (mounted) {
            setStoreProfile(session.user);
            setStoreLoading(false);
          }
        } else {
          if (mounted) {
            setStoreProfile(null);
            setStoreLoading(false);
          }
        }

        // 인증 상태 변경 이벤트 리스너 등록
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            logger.info('인증 상태 변경 감지', { event });

            if (mounted) {
              // 이벤트에 따른 로컬 및 전역 상태 업데이트
              setStoreLoading(true);

              if (newSession?.user) {
                setStoreProfile(newSession.user);
              } else {
                setStoreProfile(null);
              }

              setStoreLoading(false);
            }
          }
        );

        // 언마운트 시 리스너 정리
        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (err) {
        logger.error('인증 초기화 오류', err);
        
        if (mounted) {
          const authError = err instanceof Error ? err : new Error('인증 초기화 중 오류 발생');
          setStoreError(authError.message);
          setStoreLoading(false);
        }

        return () => {
          mounted = false;
        };
      }
    }

    initializeAuth();
  }, [setStoreLoading, setStoreProfile, setStoreError]);

  // 로컬 상태와 함께 전역 상태도 useAuthStore에서 가져와 반환
  const profile = useAuthStore((state) => state.profile);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  // Zustand 스토어의 상태를 우선시하여 반환
  return {
    user: profile,
    isLoading: isLoading,
    error: error ? new Error(error) : null
  };
} 