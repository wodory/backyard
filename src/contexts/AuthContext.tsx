/**
 * 파일명: AuthContext.tsx
 * 목적: 전역 인증 상태 관리
 * 역할: 인증 상태, code_verifier 등의 인증 관련 데이터를 전역적으로 관리
 * 작성일: 2025-03-08
 * 수정일: 2025-04-09
 * 수정일: 2024-05-08 : localStorage 관련 코드 제거 - @supabase/ssr의 쿠키 기반 세션 관리와 호환되도록 수정
 * 수정일: 2023-10-27 : 불필요한 서버 환경 체크 로직 제거 ('use client' 지시문이 있으므로 항상 클라이언트에서 실행됨)
 * 수정일: 2024-04-19 : sessionStorage 관련 code_verifier 관리 코드 제거 - @supabase/ssr의 쿠키 기반 세션 관리와 충돌 방지
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { User, Session, SupabaseClient } from '@supabase/supabase-js';

import { STORAGE_KEYS } from '@/lib/auth';
// import { isClient } from '@/lib/environment';
import createLogger from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

// 모듈별 로거 생성
const logger = createLogger('AuthContext');

// 클라이언트 환경 확인 (전역 변수로 미리 설정)
// const isClientEnv = typeof window !== 'undefined';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  codeVerifier: string | null;
  error: Error | null;
  setCodeVerifier: (value: string | null) => void;
}

// 기본 컨텍스트 값
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => { },
  codeVerifier: null,
  error: null,
  setCodeVerifier: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // 'use client'가 있으므로 이 코드는 항상 클라이언트에서만 실행됨
  // 서버 환경 체크는 불필요함
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [codeVerifier, setCodeVerifier] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Supabase 인스턴스 접근
  let supabase: SupabaseClient<Database>;
  try {
    supabase = createClient();
  } catch (error) {
    logger.error('AuthProvider에서 Supabase 초기화 실패', error);
    return <AuthContext.Provider value={{
      user: null,
      session: null,
      isLoading: false,
      signOut: async () => { },
      codeVerifier: null,
      error: error instanceof Error ? error : new Error('Supabase 초기화 실패'),
      setCodeVerifier: () => { },
    }}>{children}</AuthContext.Provider>;
  }

  useEffect(() => {
    // 이미 초기화되었으면 다시 실행하지 않음
    if (isInitialized) {
      return;
    }

    async function initializeAuth() {
      try {
        logger.info('인증 컨텍스트 초기화 시작');

        // @supabase/ssr이 쿠키를 통해 code_verifier를 관리하므로 수동 관리 코드 제거
        logger.warn('code_verifier를 찾을 수 없음');

        // 현재 세션 가져오기
        try {
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            logger.error('세션 가져오기 실패', error);
            setAuthError(new Error(error.message));
          } else if (data.session) {
            setSession(data.session);
            setUser(data.session.user);

            // 로그인 성공 시 localStorage에 사용자 정보 저장
            try {
              localStorage.setItem('user', JSON.stringify({
                id: data.session.user.id,
                email: data.session.user.email,
                name: data.session.user.user_metadata?.full_name || '',
                provider: data.session.user.app_metadata?.provider || ''
              }));
            } catch (storageError) {
              logger.error('사용자 정보 저장 중 오류', storageError);
            }

            logger.info('현재 세션 복원 성공', {
              user_id: data.session.user?.id?.substring(0, 8) + '...',
              provider: data.session.user?.app_metadata?.provider
            });

            // 로그인 시 사용자 정보 출력 (디버깅용)
            console.log('=== 로그인 성공: 사용자 정보 ===');
            console.log('ID:', data.session.user?.id);
            console.log('이메일:', data.session.user?.email);
            console.log('이름:', data.session.user?.user_metadata?.full_name);
            console.log('로그인 제공자:', data.session.user?.app_metadata?.provider);
            console.log('마지막 로그인:', new Date(data.session.user?.last_sign_in_at || '').toLocaleString());
            console.log('사용자 메타데이터:', data.session.user?.user_metadata);
            console.log('앱 메타데이터:', data.session.user?.app_metadata);
            console.log('==================');
          } else {
            logger.info('활성 세션 없음');
          }
        } catch (sessionError) {
          logger.error('세션 가져오기 중 오류 발생', sessionError);
          setAuthError(sessionError instanceof Error ? sessionError : new Error('세션 초기화 오류'));
        }

        // 초기화 완료
        setIsLoading(false);
        setIsInitialized(true);
        logger.info('인증 컨텍스트 초기화 완료');
      } catch (initError) {
        logger.error('인증 컨텍스트 초기화 오류', initError);
        setAuthError(initError instanceof Error ? initError : new Error('인증 초기화 실패'));
        setIsLoading(false);
      }
    }

    initializeAuth();
  }, []);

  // Supabase 세션 상태 변경 감지
  useEffect(() => {
    try {
      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        logger.info('Supabase 인증 상태 변경 감지', { event });

        if (event === 'SIGNED_IN' && newSession) {
          logger.info('로그인 이벤트 발생');
          setUser(newSession.user);
          setSession(newSession);

          // localStorage에 사용자 정보 저장
          try {
            localStorage.setItem('user', JSON.stringify({
              id: newSession.user.id,
              email: newSession.user.email,
              name: newSession.user.user_metadata?.full_name || '',
              provider: newSession.user.app_metadata?.provider || ''
            }));
          } catch (storageError) {
            logger.error('사용자 정보 저장 중 오류', storageError);
          }

          // 로그인 시 사용자 정보 출력 (디버깅용)
          console.log('=== 로그인 성공: 사용자 정보 ===');
          console.log('ID:', newSession.user?.id);
          console.log('이메일:', newSession.user?.email);
          console.log('이름:', newSession.user?.user_metadata?.full_name);
          console.log('로그인 제공자:', newSession.user?.app_metadata?.provider);
          console.log('마지막 로그인:', new Date(newSession.user?.last_sign_in_at || '').toLocaleString());
          console.log('사용자 메타데이터:', newSession.user?.user_metadata);
          console.log('앱 메타데이터:', newSession.user?.app_metadata);
          console.log('==================');
        } else if (event === 'SIGNED_OUT') {
          logger.info('로그아웃 이벤트 발생');
          setUser(null);
          setSession(null);

          // localStorage에서 사용자 정보 제거
          try {
            localStorage.removeItem('user');
          } catch (storageError) {
            logger.error('사용자 정보 제거 중 오류', storageError);
          }
        } else if (event === 'TOKEN_REFRESHED' && newSession) {
          logger.info('토큰 갱신 이벤트 발생');
          setUser(newSession.user);
          setSession(newSession);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      logger.error('인증 이벤트 리스너 설정 오류', error);
    }
  }, []);

  // 로그아웃 처리
  const signOut = async () => {
    try {
      logger.info('로그아웃 시작');

      // Supabase 로그아웃
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      // 상태 업데이트 (이벤트 리스너에서도 처리하지만 중복 실행 안전함)
      setUser(null);
      setSession(null);

      logger.info('로그아웃 성공');
    } catch (error) {
      logger.error('로그아웃 오류', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signOut,
        codeVerifier,
        error: authError,
        setCodeVerifier: (value) => {
          setCodeVerifier(value);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 