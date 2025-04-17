/**
 * 파일명: supabase-mock.ts
 * 목적: Supabase 클라이언트 모킹
 * 역할: 테스트 환경에서 Supabase 인증 및 API 호출 시뮬레이션
 * 작성일: 2025-03-27
 * 수정일: 2023-10-27 : 타입 정의 개선 - Function 타입을 구체적인 함수 시그니처로 변경
 */

import { User, Session } from '@supabase/supabase-js';
import { vi } from 'vitest';

/**
 * 모의 Supabase 세션 생성
 * @param userId 사용자 ID
 * @param provider 인증 공급자
 * @returns 모의 세션 객체
 */
export function mockSupabaseSession(
  userId: string = 'test_user_id', 
  provider: string = 'google'
): Session {
  return {
    access_token: `mock_access_token_${userId}`,
    refresh_token: `mock_refresh_token_${userId}`,
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      id: userId,
      app_metadata: {
        provider,
        providers: [provider]
      },
      user_metadata: {
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.png'
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      role: 'authenticated',
      email: `${userId}@example.com`,
    }
  };
}

/**
 * 모의 Supabase 응답 생성
 * @param data 응답 데이터
 * @param error 응답 오류
 * @returns 모의 Supabase 응답 객체
 */
export function mockSupabaseResponse<T>(data: T | null = null, error: Error | null = null) {
  return { data, error };
}

/**
 * 클라이언트 환경 Supabase 모킹
 * @returns 모의 Supabase 클라이언트
 */
export function mockSupabaseBrowserClient() {
  // 기본 세션 및 사용자 상태
  let currentSession: Session | null = null;
  let currentUser: User | null = null;
  let codeVerifier: string | null = null;
  
  // 상태 변경 콜백 저장
  // 구체적인 함수 시그니처 정의
  const authStateChangeCallbacks: Array<(event: string, session: Session | null) => void> = [];

  return {
    auth: {
      getSession: vi.fn(() => {
        return Promise.resolve(mockSupabaseResponse(
          { session: currentSession }, 
          null
        ));
      }),
      getUser: vi.fn(() => {
        return Promise.resolve(mockSupabaseResponse(
          { user: currentUser }, 
          null
        ));
      }),
      signInWithOAuth: vi.fn(({ provider, options }: any) => {
        // PKCE 플로우 검증을 위한 옵션 저장
        if (options.queryParams.code_challenge) {
          // 코드 검증기는 저장하지 않지만, 코드 챌린지는 사용
          codeVerifier = 'mock_code_verifier';
        }
        
        return Promise.resolve(mockSupabaseResponse(
          { url: `https://example.com/oauth/${provider}/authorize?code_challenge=${options.queryParams.code_challenge || ''}` },
          null
        ));
      }),
      exchangeCodeForSession: vi.fn((code: string) => {
        // 유효한 코드와 검증기가 있으면 세션 반환
        if (code === 'valid_code' && codeVerifier) {
          const newSession = mockSupabaseSession();
          currentSession = newSession;
          currentUser = newSession.user;
          
          // 상태 변경 콜백 호출
          authStateChangeCallbacks.forEach(cb => 
            cb('SIGNED_IN', newSession)
          );
          
          return Promise.resolve(mockSupabaseResponse(
            { session: newSession },
            null
          ));
        } else {
          return Promise.resolve(mockSupabaseResponse(
            null,
            new Error('invalid request: both auth code and code verifier should be non-empty')
          ));
        }
      }),
      refreshSession: vi.fn(({ refresh_token }: any) => {
        // 유효한 리프레시 토큰이면 새 세션 반환
        if (refresh_token && refresh_token.startsWith('mock_refresh_token_')) {
          const newSession = mockSupabaseSession();
          currentSession = newSession;
          currentUser = newSession.user;
          
          // 상태 변경 콜백 호출
          authStateChangeCallbacks.forEach(cb => 
            cb('TOKEN_REFRESHED', newSession)
          );
          
          return Promise.resolve(mockSupabaseResponse(
            { session: newSession },
            null
          ));
        } else {
          return Promise.resolve(mockSupabaseResponse(
            null,
            new Error('Invalid refresh token')
          ));
        }
      }),
      signOut: vi.fn(() => {
        currentSession = null;
        currentUser = null;
        
        // 상태 변경 콜백 호출
        authStateChangeCallbacks.forEach(cb => 
          cb('SIGNED_OUT', null)
        );
        
        return Promise.resolve(mockSupabaseResponse(null, null));
      }),
      onAuthStateChange: vi.fn((callback: (event: string, session: Session | null) => void) => {
        authStateChangeCallbacks.push(callback);
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(() => {
                // 콜백 제거
                const index = authStateChangeCallbacks.indexOf(callback);
                if (index > -1) {
                  authStateChangeCallbacks.splice(index, 1);
                }
              })
            }
          }
        };
      }),
      // 테스트 헬퍼
      _setSession: (session: Session | null) => {
        currentSession = session;
        currentUser = session?.user || null;
      },
      _getCodeVerifier: () => codeVerifier,
      _setCodeVerifier: (verifier: string | null) => {
        codeVerifier = verifier;
      },
      _triggerAuthChange: (event: string, session: Session | null) => {
        authStateChangeCallbacks.forEach(cb => cb(event, session));
      }
    },
    // 데이터베이스 조작 메서드도 필요하면 추가
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve(mockSupabaseResponse(null, null)))
        }))
      }))
    }))
  };
}

/**
 * 서버 환경 Supabase 모킹
 * @returns 모의 Supabase 서버 클라이언트
 */
export function mockSupabaseServerClient() {
  // 주로 세션 조회 기능만 필요
  let currentSession: Session | null = null;
  
  return {
    auth: {
      getSession: vi.fn(() => {
        return Promise.resolve(mockSupabaseResponse(
          { session: currentSession }, 
          null
        ));
      }),
      // 테스트 헬퍼
      _setSession: (session: Session | null) => {
        currentSession = session;
      }
    },
    // 필요한 다른 메서드 추가
  };
}

/**
 * Next.js 미들웨어용 Supabase 클라이언트 모킹
 */
export function mockCreateServerClient() {
  return vi.fn(() => mockSupabaseServerClient());
}

/**
 * 브라우저용 Supabase 클라이언트 생성자 모킹
 */
export function mockCreateBrowserClient() {
  return vi.fn(() => mockSupabaseBrowserClient());
} 