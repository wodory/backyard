/**
 * 파일명: AuthContext.tsx
 * 목적: 전역 인증 상태 관리
 * 역할: 인증 상태, code_verifier 등의 인증 관련 데이터를 전역적으로 관리
 * 작성일: 2025-03-08
 * 수정일: 2025-04-09
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session, SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { STORAGE_KEYS } from '@/lib/auth';
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
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
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
        const storedVerifier = sessionStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);

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

            // 세션 토큰 저장
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.session.access_token);
            if (data.session.refresh_token) {
              localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.session.refresh_token);
            }
            if (data.session.user?.id) {
              localStorage.setItem(STORAGE_KEYS.USER_ID, data.session.user.id);
            }
            if (data.session.user?.app_metadata?.provider) {
              localStorage.setItem(STORAGE_KEYS.PROVIDER, data.session.user.app_metadata.provider);
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
  }, [attemptSessionRecovery]);

  // Supabase 세션 상태 변경 감지
  useEffect(() => {
    if (!isClientEnv) return;

    try {
      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange((event, newSession) => {
        logger.info('Supabase 인증 상태 변경 감지', { event });

        if (event === 'SIGNED_IN' && newSession) {
          logger.info('로그인 이벤트 발생');
          setUser(newSession.user);
          setSession(newSession);

          // 세션 토큰 저장
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newSession.access_token);
          if (newSession.refresh_token) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newSession.refresh_token);
          }
          if (newSession.user?.id) {
            localStorage.setItem(STORAGE_KEYS.USER_ID, newSession.user.id);
          }
          if (newSession.user?.app_metadata?.provider) {
            localStorage.setItem(STORAGE_KEYS.PROVIDER, newSession.user.app_metadata.provider);
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

          // 인증 데이터 제거
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_ID);
          localStorage.removeItem(STORAGE_KEYS.PROVIDER);
          sessionStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
        } else if (event === 'TOKEN_REFRESHED' && newSession) {
          logger.info('토큰 갱신 이벤트 발생');
          setUser(newSession.user);
          setSession(newSession);

          // 새로운 토큰 저장
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newSession.access_token);
          if (newSession.refresh_token) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newSession.refresh_token);
          }
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

      // 인증 데이터 제거
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_ID);
      localStorage.removeItem(STORAGE_KEYS.PROVIDER);
      sessionStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);

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
          if (value) {
            sessionStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, value);
          } else {
            sessionStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
          }
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