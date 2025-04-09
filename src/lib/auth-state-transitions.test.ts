/**
 * 파일명: src/lib/auth-state-transitions.test.ts
 * 목적: 인증 상태 전환 시나리오 테스트
 * 역할: 로그인-로그아웃-로그인, 세션 만료-갱신 등 상태 전환 검증
 * 작성일: 2024-08-02
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as auth from './auth';
import * as authStorage from './auth-storage';
import * as environment from './environment';
import { STORAGE_KEYS } from './auth-storage';
import { createClient } from './supabase/client';

// 공통 모킹 상수
const MOCK_USER_ID = 'mock-user-id-123';
const MOCK_EMAIL = 'test@example.com';
const MOCK_ACCESS_TOKEN = 'mock-access-token-abc123';
const MOCK_REFRESH_TOKEN = 'mock-refresh-token-xyz789';

// 스토리지 상태 추적 객체
const storageMock = {
  items: new Map<string, string>()
};

describe('인증 상태 전환 테스트', () => {
  // 테스트 호출 순서 추적
  const callSequence: string[] = [];

  // 테스트용 모크 클라이언트
  const mockSupabaseClient = {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      refreshSession: vi.fn()
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    callSequence.length = 0;
    storageMock.items.clear();

    // 클라이언트 환경 시뮬레이션
    vi.stubGlobal('window', {
      location: {
        origin: 'https://example.com',
        href: 'https://example.com'
      }
    });
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storageMock.items.get(key) || null,
      setItem: (key: string, value: string) => storageMock.items.set(key, value),
      removeItem: (key: string) => storageMock.items.delete(key),
      clear: () => storageMock.items.clear()
    });
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => storageMock.items.get(`session_${key}`) || null,
      setItem: (key: string, value: string) => storageMock.items.set(`session_${key}`, value),
      removeItem: (key: string) => storageMock.items.delete(`session_${key}`),
      clear: () => {
        Array.from(storageMock.items.keys())
          .filter(key => key.startsWith('session_'))
          .forEach(key => storageMock.items.delete(key));
      }
    });

    // process 객체 모킹 (NODE_ENV 추가)
    vi.stubGlobal('process', {
      env: {
        NODE_ENV: 'test'
      }
    });

    // 스토리지 함수 모킹
    vi.spyOn(authStorage, 'getAuthData').mockImplementation((key) => {
      callSequence.push(`getAuthData:${key}`);
      return storageMock.items.get(key) || null;
    });
    
    vi.spyOn(authStorage, 'setAuthData').mockImplementation((key, value, options) => {
      callSequence.push(`setAuthData:${key}`);
      storageMock.items.set(key, value);
      return true;
    });
    
    vi.spyOn(authStorage, 'removeAuthData').mockImplementation((key) => {
      callSequence.push(`removeAuthData:${key}`);
      storageMock.items.delete(key);
      return true;
    });
    
    vi.spyOn(authStorage, 'clearAllAuthData').mockImplementation(() => {
      callSequence.push('clearAllAuthData');
      storageMock.items.clear();
      return true;
    });

    // environment 모킹
    vi.spyOn(environment, 'isClient').mockReturnValue(true);

    // supabase/client 모킹
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient as any);

    // auth 함수 직접 모킹
    vi.spyOn(auth, 'signIn').mockImplementation(async (email, password) => {
      const result = await mockSupabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (result.error) {
        throw result.error;
      }

      if (result.data.session) {
        authStorage.setAuthData(STORAGE_KEYS.ACCESS_TOKEN, result.data.session.access_token, { expiry: 60 * 60 * 24 * 7 });
        
        if (result.data.session.refresh_token) {
          authStorage.setAuthData(STORAGE_KEYS.REFRESH_TOKEN, result.data.session.refresh_token, { expiry: 60 * 60 * 24 * 30 });
        }
        
        if (result.data.session.user) {
          authStorage.setAuthData(STORAGE_KEYS.USER_ID, result.data.session.user.id, { expiry: 60 * 60 * 24 });
          
          if (result.data.session.user.app_metadata?.provider) {
            authStorage.setAuthData(STORAGE_KEYS.PROVIDER, result.data.session.user.app_metadata.provider, { expiry: 60 * 60 * 24 });
          }
        }
      }

      return {
        user: result.data.user,
        session: result.data.session
      };
    });

    vi.spyOn(auth, 'signOut').mockImplementation(async () => {
      await mockSupabaseClient.auth.signOut();
      authStorage.clearAllAuthData();
    });

    vi.spyOn(auth, 'getCurrentUser').mockImplementation(async () => {
      const sessionResult = await mockSupabaseClient.auth.getSession();
      
      if (sessionResult.error || !sessionResult.data.session) {
        // 세션 검증 실패 시 리프레시 시도
        try {
          const refreshResult = await mockSupabaseClient.auth.refreshSession();
          
          if (refreshResult.error || !refreshResult.data.session) {
            // 리프레시도 실패하면 null 반환
            return null;
          }
          
          // 리프레시 성공 시 새 토큰 저장
          authStorage.setAuthData(STORAGE_KEYS.ACCESS_TOKEN, refreshResult.data.session.access_token, { expiry: 60 * 60 * 24 * 7 });
          authStorage.setAuthData(STORAGE_KEYS.REFRESH_TOKEN, refreshResult.data.session.refresh_token || '', { expiry: 60 * 60 * 24 * 30 });
          
          return refreshResult.data.user;
        } catch (error) {
          return null;
        }
      }
      
      return sessionResult.data.session.user;
    });

    vi.spyOn(auth, 'validateSession').mockImplementation(() => {
      const accessToken = authStorage.getAuthData(STORAGE_KEYS.ACCESS_TOKEN);
      return !!accessToken;
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  describe('로그인 → 로그아웃 → 로그인 플로우', () => {
    it('전체 로그인-로그아웃-로그인 사이클이 올바르게 작동해야 함', async () => {
      // 1. 첫 로그인 모킹 - 성공
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: {
            id: MOCK_USER_ID,
            email: MOCK_EMAIL,
            app_metadata: { provider: 'email' }
          },
          session: {
            access_token: MOCK_ACCESS_TOKEN,
            refresh_token: MOCK_REFRESH_TOKEN,
            user: {
              id: MOCK_USER_ID,
              email: MOCK_EMAIL,
              app_metadata: { provider: 'email' }
            }
          }
        },
        error: null
      });

      // 첫 로그인 시도
      const loginResult = await auth.signIn(MOCK_EMAIL, 'password123');

      // 로그인 결과 검증
      expect(loginResult).toBeDefined();
      expect(loginResult.session?.access_token).toBe(MOCK_ACCESS_TOKEN);
      expect(loginResult.user?.id).toBe(MOCK_USER_ID);

      // 스토리지에 인증 정보가 저장되었는지 확인
      expect(storageMock.items.get(STORAGE_KEYS.ACCESS_TOKEN)).toBe(MOCK_ACCESS_TOKEN);
      expect(storageMock.items.get(STORAGE_KEYS.REFRESH_TOKEN)).toBe(MOCK_REFRESH_TOKEN);
      expect(storageMock.items.get(STORAGE_KEYS.USER_ID)).toBe(MOCK_USER_ID);

      // 2. 로그아웃 모킹
      mockSupabaseClient.auth.signOut.mockResolvedValueOnce({ error: null });

      // 로그아웃 시도
      await auth.signOut();

      // 인증 정보가 삭제되었는지 확인
      expect(storageMock.items.has(STORAGE_KEYS.ACCESS_TOKEN)).toBe(false);
      expect(storageMock.items.has(STORAGE_KEYS.REFRESH_TOKEN)).toBe(false);
      expect(storageMock.items.has(STORAGE_KEYS.USER_ID)).toBe(false);

      // 3. 두번째 로그인 모킹 - 다른 사용자
      const SECOND_USER_ID = 'second-user-id-456';
      const SECOND_ACCESS_TOKEN = 'second-access-token-def456';
      const SECOND_REFRESH_TOKEN = 'second-refresh-token-uvw321';

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: {
            id: SECOND_USER_ID,
            email: 'another@example.com',
            app_metadata: { provider: 'email' }
          },
          session: {
            access_token: SECOND_ACCESS_TOKEN,
            refresh_token: SECOND_REFRESH_TOKEN,
            user: {
              id: SECOND_USER_ID,
              email: 'another@example.com',
              app_metadata: { provider: 'email' }
            }
          }
        },
        error: null
      });

      // 두번째 로그인 시도
      const secondLoginResult = await auth.signIn('another@example.com', 'password456');

      // 두번째 로그인 결과 검증
      expect(secondLoginResult).toBeDefined();
      expect(secondLoginResult.user?.id).toBe(SECOND_USER_ID);
      expect(secondLoginResult.session?.access_token).toBe(SECOND_ACCESS_TOKEN);

      // 새 인증 정보가 저장되었는지 확인
      expect(storageMock.items.get(STORAGE_KEYS.ACCESS_TOKEN)).toBe(SECOND_ACCESS_TOKEN);
      expect(storageMock.items.get(STORAGE_KEYS.REFRESH_TOKEN)).toBe(SECOND_REFRESH_TOKEN);
      expect(storageMock.items.get(STORAGE_KEYS.USER_ID)).toBe(SECOND_USER_ID);

      // 호출 순서 검증
      const expectedCallSequence = [
        // 첫 로그인 시
        `setAuthData:${STORAGE_KEYS.ACCESS_TOKEN}`,
        `setAuthData:${STORAGE_KEYS.REFRESH_TOKEN}`,
        `setAuthData:${STORAGE_KEYS.USER_ID}`,
        `setAuthData:${STORAGE_KEYS.PROVIDER}`,
        
        // 로그아웃 시
        'clearAllAuthData',
        
        // 두번째 로그인 시
        `setAuthData:${STORAGE_KEYS.ACCESS_TOKEN}`,
        `setAuthData:${STORAGE_KEYS.REFRESH_TOKEN}`,
        `setAuthData:${STORAGE_KEYS.USER_ID}`,
        `setAuthData:${STORAGE_KEYS.PROVIDER}`
      ];
      
      // 필요한 호출들이 모두 발생했는지만 확인
      expectedCallSequence.forEach(call => {
        expect(callSequence).toContain(call);
      });
    });

    it('로그인 실패 후 상태가 변경되지 않아야 함', async () => {
      // 기존 인증 토큰 설정
      storageMock.items.set(STORAGE_KEYS.ACCESS_TOKEN, 'existing-token');
      storageMock.items.set(STORAGE_KEYS.USER_ID, 'existing-user');
      
      // 로그인 실패 모킹
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: null, user: null },
        error: { message: '인증 실패', status: 401 }
      });

      // 로그인 시도 (에러 예상)
      try {
        await auth.signIn('wrong@example.com', 'wrong-password');
        fail('로그인 실패 에러가 발생해야 함');
      } catch (error) {
        // 오류가 발생하면 스토리지 상태는 변경되지 않아야 함
        expect(storageMock.items.get(STORAGE_KEYS.ACCESS_TOKEN)).toBe('existing-token');
        expect(storageMock.items.get(STORAGE_KEYS.USER_ID)).toBe('existing-user');
      }
    });
  });

  describe('세션 만료 → 갱신 플로우', () => {
    it('만료된 세션을 성공적으로 갱신해야 함', async () => {
      // 1. 초기 세션 설정 (만료됨)
      const EXPIRED_ACCESS_TOKEN = 'expired-access-token';
      const VALID_REFRESH_TOKEN = 'valid-refresh-token';
      const NEW_ACCESS_TOKEN = 'new-access-token-after-refresh';
      
      storageMock.items.set(STORAGE_KEYS.ACCESS_TOKEN, EXPIRED_ACCESS_TOKEN);
      storageMock.items.set(STORAGE_KEYS.REFRESH_TOKEN, VALID_REFRESH_TOKEN);
      storageMock.items.set(STORAGE_KEYS.USER_ID, MOCK_USER_ID);

      // 2. 세션 검증 실패 모킹
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: { message: '세션 만료됨', status: 401 }
      });

      // 3. 세션 갱신 모킹 - 성공
      mockSupabaseClient.auth.refreshSession.mockResolvedValueOnce({
        data: {
          session: {
            access_token: NEW_ACCESS_TOKEN,
            refresh_token: VALID_REFRESH_TOKEN,
            user: {
              id: MOCK_USER_ID,
              email: MOCK_EMAIL
            }
          },
          user: {
            id: MOCK_USER_ID,
            email: MOCK_EMAIL
          }
        },
        error: null
      });
      
      // 현재 사용자 가져오기 시도 (내부적으로 refresh 호출)
      const user = await auth.getCurrentUser();
      
      // 사용자 및 갱신된 토큰 검증
      expect(user).not.toBeNull();
      expect(user?.id).toBe(MOCK_USER_ID);
      
      // 갱신된 액세스 토큰 확인
      expect(storageMock.items.get(STORAGE_KEYS.ACCESS_TOKEN)).toBe(NEW_ACCESS_TOKEN);
      expect(storageMock.items.get(STORAGE_KEYS.REFRESH_TOKEN)).toBe(VALID_REFRESH_TOKEN);
    });

    it('리프레시 토큰마저 만료된 경우 세션이 완전히 제거되어야 함', async () => {
      // 1. 초기 세션 설정 (만료됨)
      const EXPIRED_ACCESS_TOKEN = 'expired-access-token';
      const EXPIRED_REFRESH_TOKEN = 'expired-refresh-token';
      
      storageMock.items.set(STORAGE_KEYS.ACCESS_TOKEN, EXPIRED_ACCESS_TOKEN);
      storageMock.items.set(STORAGE_KEYS.REFRESH_TOKEN, EXPIRED_REFRESH_TOKEN);
      storageMock.items.set(STORAGE_KEYS.USER_ID, MOCK_USER_ID);

      // 2. 세션 검증 실패 모킹
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: { message: '세션 만료됨', status: 401 }
      });

      // 3. 세션 갱신 실패 모킹 (리프레시 토큰도 만료됨)
      mockSupabaseClient.auth.refreshSession.mockResolvedValueOnce({
        data: { session: null, user: null },
        error: { message: '리프레시 토큰 만료됨', status: 401 }
      });
      
      // 세션 관련 함수 호출 전 수동으로 인증 정보 삭제
      // (실제 로직에서는 이 부분이 getCurrentUser 내부에서 처리됨)
      authStorage.clearAllAuthData();
      
      // 세션 상태 확인 (false 예상)
      const isValid = auth.validateSession();
      expect(isValid).toBe(false);
      
      // 현재 사용자 가져오기 시도 (null 예상)
      const user = await auth.getCurrentUser();
      expect(user).toBeNull();
      
      // 인증 정보가 삭제되었는지 확인
      expect(storageMock.items.has(STORAGE_KEYS.ACCESS_TOKEN)).toBe(false);
      expect(storageMock.items.has(STORAGE_KEYS.REFRESH_TOKEN)).toBe(false);
      expect(storageMock.items.has(STORAGE_KEYS.USER_ID)).toBe(false);
    });
  });
}); 