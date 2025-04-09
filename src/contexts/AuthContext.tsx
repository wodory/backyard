/**
 * 파일명: AuthContext.tsx
 * 목적: 전역 인증 상태 관리
 * 역할: 인증 상태, code_verifier 등의 인증 관련 데이터를 전역적으로 관리
 * 작성일: 2024-03-30
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session, SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { getAuthData, setAuthData, removeAuthData, clearAllAuthData, STORAGE_KEYS } from '@/lib/auth-storage';
import { Database } from '@/types/supabase';
import createLogger from '@/lib/logger';
import { isClient } from '@/lib/environment';

// 모듈별 로거 생성
const logger = createLogger('AuthContext');

// 클라이언트 환경 확인 (전역 변수로 미리 설정)
const isClientEnv = typeof window !== 'undefined';

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
  // 서버 환경에서는 빈 Provider만 반환
  if (!isClientEnv) {
    logger.error('AuthProvider가 서버 환경에서 사용되었습니다. 클라이언트 컴포넌트에서만 사용해야 합니다.');
    return <AuthContext.Provider value={{
      user: null,
      session: null,
      isLoading: false,
      signOut: async () => { },
      codeVerifier: null,
      error: null,
      setCodeVerifier: () => { },
    }}>{children}</AuthContext.Provider>;
  }

  // 여기서부터는 클라이언트 환경에서만 실행됨
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [codeVerifier, setCodeVerifier] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);

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

  // 세션 복구 시도 함수
  const attemptSessionRecovery = useCallback(async () => {
    if (recoveryAttempts >= 3) {
      logger.warn('최대 복구 시도 횟수 초과, 세션 복구 중단');
      return false;
    }

    try {
      logger.info('세션 복구 시도', { 시도횟수: recoveryAttempts + 1 });
      setRecoveryAttempts(prev => prev + 1);

      // 1. 리프레시 토큰으로 복구 시도
      const refreshToken = getAuthData(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        logger.info('리프레시 토큰으로 세션 복구 시도');

        try {
          const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken
          });

          if (error) {
            logger.error('리프레시 토큰으로 세션 복구 실패', error);
          } else if (data?.session) {
            logger.info('리프레시 토큰으로 세션 복구 성공');
            setSession(data.session);
            setUser(data.session.user);
            return true;
          }
        } catch (refreshError) {
          logger.error('리프레시 토큰 사용 중 오류', refreshError);
        }
      }

      // 2. 로컬 스토리지의 Supabase 내장 세션 확인
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          logger.error('내장 세션 확인 실패', error);
        } else if (data?.session) {
          logger.info('내장 세션으로 복구 성공');
          setSession(data.session);
          setUser(data.session.user);
          return true;
        }
      } catch (sessionError) {
        logger.error('내장 세션 확인 중 오류', sessionError);
      }

      logger.warn('세션 복구 실패');
      return false;
    } catch (error) {
      logger.error('세션 복구 프로세스 오류', error);
      return false;
    }
  }, [recoveryAttempts]);

  useEffect(() => {
    // 이미 초기화되었으면 다시 실행하지 않음
    if (isInitialized) {
      return;
    }

    async function initializeAuth() {
      try {
        logger.info('인증 컨텍스트 초기화 시작');

        // code_verifier 복원 시도 (여러 스토리지 확인)
        const storedVerifier = getAuthData(STORAGE_KEYS.CODE_VERIFIER);

        if (storedVerifier) {
          setCodeVerifier(storedVerifier);
          logger.info('code_verifier 복원됨', {
            길이: storedVerifier.length,
            첫_5글자: storedVerifier.substring(0, 5)
          });
        } else {
          logger.warn('code_verifier를 찾을 수 없음');
        }

        // 현재 세션 가져오기
        try {
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            logger.error('세션 가져오기 실패', error);
            setAuthError(new Error(error.message));

            // 세션 복구 시도
            const recovered = await attemptSessionRecovery();
            if (!recovered) {
              // 복구 실패 시 새로운 세션을 위한 준비
              logger.info('세션 복구 실패, 로그인 준비 상태로 전환');
            }
          } else if (data.session) {
            setSession(data.session);
            setUser(data.session.user);

            // 세션 토큰 저장 (여러 스토리지에)
            setAuthData(STORAGE_KEYS.ACCESS_TOKEN, data.session.access_token, { expiry: 60 * 60 });
            if (data.session.refresh_token) {
              setAuthData(STORAGE_KEYS.REFRESH_TOKEN, data.session.refresh_token, { expiry: 60 * 60 * 24 * 7 });
            }

            logger.info('현재 세션 복원 성공', {
              user_id: data.session.user?.id?.substring(0, 8) + '...',
              provider: data.session.user?.app_metadata?.provider
            });
          } else {
            logger.info('활성 세션 없음');
          }
        } catch (sessionError) {
          logger.error('세션 가져오기 중 오류 발생', sessionError);
          setAuthError(sessionError instanceof Error ? sessionError : new Error('세션 초기화 오류'));
        }

        setIsLoading(false);
        setIsInitialized(true);
        logger.info('인증 컨텍스트 초기화 완료');
      } catch (error) {
        logger.error('인증 초기화 실패', error);
        setAuthError(error instanceof Error ? error : new Error('인증 초기화 오류'));
        setIsLoading(false);
        setIsInitialized(true);
      }
    }

    initializeAuth();

    // 세션 상태 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      logger.info('인증 상태 변경 이벤트', { event });

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession) {
        // 오류 상태 초기화
        setAuthError(null);
        setRecoveryAttempts(0);

        logger.info('인증 상태 변경', {
          event,
          user_id: currentSession.user?.id.substring(0, 8) + '...',
          provider: currentSession.user?.app_metadata?.provider
        });

        // 인증 성공 시 액세스 토큰과 리프레시 토큰 저장
        setAuthData(
          STORAGE_KEYS.ACCESS_TOKEN,
          currentSession.access_token,
          { expiry: 60 }
        );

        setAuthData(
          STORAGE_KEYS.REFRESH_TOKEN,
          currentSession.refresh_token,
          { expiry: 60 * 24 * 14 }
        );

        if (currentSession.user) {
          setAuthData(STORAGE_KEYS.USER_ID, currentSession.user.id, { expiry: 60 });

          if (currentSession.user.app_metadata?.provider) {
            setAuthData(
              STORAGE_KEYS.PROVIDER,
              currentSession.user.app_metadata.provider,
              { expiry: 60 }
            );
          }
        }
      } else {
        logger.info('인증 상태 변경', { event, user: null });

        if (event === 'SIGNED_OUT') {
          // 로그아웃 시 코드 검증기를 제외한 인증 데이터 삭제
          removeAuthData(STORAGE_KEYS.ACCESS_TOKEN);
          removeAuthData(STORAGE_KEYS.REFRESH_TOKEN);
          removeAuthData(STORAGE_KEYS.USER_ID);
          removeAuthData(STORAGE_KEYS.PROVIDER);
          removeAuthData(STORAGE_KEYS.SESSION);
        } else if (event === 'TOKEN_REFRESHED') {
          // 토큰 리프레시 이벤트는 세션이 없어도 발생할 수 있음
          logger.info('토큰 리프레시 이벤트 발생, 세션 복구 시도');
          attemptSessionRecovery();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isInitialized, attemptSessionRecovery]);

  const signOut = async () => {
    try {
      logger.info('로그아웃 시작');

      // code_verifier 백업 (여러 스토리지에 저장)
      if (codeVerifier) {
        setAuthData(STORAGE_KEYS.CODE_VERIFIER, codeVerifier, { expiry: 60 });
        logger.info('code_verifier 백업 완료');
      } else {
        logger.warn('로그아웃 시 code_verifier가 없음');
      }

      // Supabase 로그아웃
      logger.info('Supabase 로그아웃 호출');
      await supabase.auth.signOut();

      // 인증 데이터 삭제 (code_verifier는 보존)
      Object.values(STORAGE_KEYS).forEach(key => {
        if (key !== STORAGE_KEYS.CODE_VERIFIER) {
          removeAuthData(key);
        }
      });

      // code_verifier 복원
      if (codeVerifier) {
        setAuthData(STORAGE_KEYS.CODE_VERIFIER, codeVerifier, { expiry: 60 });
        logger.info('code_verifier 복원 완료');
      } else {
        const storedVerifier = getAuthData(STORAGE_KEYS.CODE_VERIFIER);

        if (storedVerifier) {
          setCodeVerifier(storedVerifier);
          logger.info('code_verifier 스토리지에서 복원 완료');
        } else {
          logger.warn('code_verifier 복원 실패 - 저장된 값 없음');
        }
      }

      // 상태 초기화
      setUser(null);
      setSession(null);
      setAuthError(null);
      setRecoveryAttempts(0);

      logger.info('로그아웃 완료');
    } catch (error) {
      logger.error('로그아웃 오류', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
    codeVerifier,
    error: authError,
    setCodeVerifier: (value: string | null) => {
      if (value) {
        setAuthData(STORAGE_KEYS.CODE_VERIFIER, value, { expiry: 60 });
      } else {
        removeAuthData(STORAGE_KEYS.CODE_VERIFIER);
      }
      setCodeVerifier(value);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 