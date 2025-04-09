/**
 * 파일명: src/lib/auth-integration.test.ts
 * 목적: Auth 모듈의 통합 테스트
 * 역할: 인증 관련 기능들의 상호작용 및 통합 동작 검증
 * 작성일: 2024-07-18
 */

// vi.mock은 파일 최상단으로 호이스팅되므로 import 위에 작성
// 비어있는 객체로 기본 모킹을 설정하고 테스트 내에서 구현 정의
vi.mock('./logger', () => {
  // 간단한 로거 목킹 - 각 함수는 동작하지만 실제로는 아무 작업도 수행하지 않음
  const createLoggerMock = vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }));
  
  return {
    default: createLoggerMock,
    createLogger: createLoggerMock
  };
});

vi.mock('./environment', () => ({
  isClient: vi.fn().mockReturnValue(true),
  isServer: vi.fn().mockReturnValue(false),
  getEnvironment: vi.fn().mockReturnValue('client'),
  executeOnClient: vi.fn(fn => fn()),
  executeOnServer: vi.fn(),
  runInEnvironment: vi.fn(({ client }) => client && client()),
}));

vi.mock('./auth-storage', () => ({
  getAuthData: vi.fn(),
  setAuthData: vi.fn().mockReturnValue(true),
  removeAuthData: vi.fn(),
  clearAllAuthData: vi.fn(),
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_ID: 'user_id',
    PROVIDER: 'provider',
    CODE_VERIFIER: 'code_verifier',
  }
}));

// Supabase 클라이언트 모킹
vi.mock('./supabase/client', () => {
  return {
    createClient: vi.fn(),
  };
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { signIn, signUp, signOut, getCurrentUser, signInWithGoogle } from './auth';
import * as authStorage from './auth-storage';
import { createClient } from './supabase/client';

describe('Auth 모듈 통합 테스트', () => {
  // 모킹된 auth 객체
  const mockAuthFunctions = {
    signUp: vi.fn(),
    signOut: vi.fn(),
    signInWithPassword: vi.fn(),
    signInWithOAuth: vi.fn(),
    getSession: vi.fn(),
    getUser: vi.fn(),
    exchangeCodeForSession: vi.fn(),
  };
  
  const mockClient = {
    auth: mockAuthFunctions
  };

  // 각 테스트 전에 환경 설정
  beforeEach(() => {
    // 모든 모킹 초기화
    vi.clearAllMocks();
    
    // Supabase 클라이언트 모킹 설정
    vi.mocked(createClient).mockReturnValue(mockClient as any);
    
    // localStorage 모킹
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    
    // crypto 모킹 - 별도로 먼저 정의하여 window.crypto에 할당
    const cryptoMock = {
      getRandomValues: vi.fn((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      }),
      subtle: {
        digest: vi.fn().mockImplementation(async (algorithm, data) => {
          // 단순화된 해시 함수 모킹
          return new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        }),
        encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
        decrypt: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
        sign: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
        verify: vi.fn().mockResolvedValue(true),
        deriveBits: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
        deriveKey: vi.fn().mockResolvedValue({}),
        importKey: vi.fn().mockResolvedValue({}),
        exportKey: vi.fn().mockResolvedValue({}),
        wrapKey: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
        unwrapKey: vi.fn().mockResolvedValue({}),
        generateKey: vi.fn().mockResolvedValue({})
      },
      // randomUUID 추가
      randomUUID: vi.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
    };
    
    // 전역 crypto 직접 모킹
    global.crypto = cryptoMock;
    
    // 브라우저 환경 모킹
    vi.stubGlobal('window', {
      localStorage: localStorageMock,
      sessionStorage: localStorageMock,
      location: {
        origin: 'https://example.com',
        href: '',
      },
      crypto: cryptoMock,
    });
    
    // 전역 localStorage 및 sessionStorage 모킹
    vi.stubGlobal('localStorage', window.localStorage);
    vi.stubGlobal('sessionStorage', window.sessionStorage);

    // fetch 모킹
    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'user-id', email: 'user@example.com' }),
      });
    });
  });

  // 각 테스트 후에 모킹 복원
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('로그인 및 회원가입 흐름', () => {
    it('회원가입 후 로그인', async () => {
      // 회원가입 모킹 설정
      mockAuthFunctions.signUp.mockResolvedValueOnce({
        data: {
          user: { id: 'new-user-id', email: 'newuser@example.com' },
          session: null
        },
        error: null
      });

      // 회원가입 실행
      const signUpResult = await signUp('newuser@example.com', 'password123', 'New User');
      
      // 회원가입 확인
      expect(signUpResult.user).toBeDefined();
      expect(signUpResult.user.id).toBe('new-user-id');
      
      // 로그인 모킹 설정
      mockAuthFunctions.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: 'new-user-id', email: 'newuser@example.com' },
          session: {
            access_token: 'test-token',
            expires_at: Date.now() / 1000 + 3600
          }
        },
        error: null
      });
      
      // 로그인 실행
      const signInResult = await signIn('newuser@example.com', 'password123');
      
      // 로그인 확인
      expect(signInResult.session).toBeDefined();
      expect(signInResult.session.access_token).toBe('test-token');
      
      // 인증 저장소에 올바른 데이터가 저장되었는지 확인
      expect(authStorage.setAuthData).toHaveBeenCalledWith(
        authStorage.STORAGE_KEYS.ACCESS_TOKEN,
        'test-token',
        expect.anything()
      );
    });
    
    it('로그인 후 로그아웃', async () => {
      // 로그인 모킹 설정
      mockAuthFunctions.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: 'user-id', email: 'user@example.com' },
          session: {
            access_token: 'test-token',
            expires_at: Date.now() / 1000 + 3600
          }
        },
        error: null
      });
      
      // 로그인 실행
      await signIn('user@example.com', 'password123');
      
      // 로그아웃 모킹 설정
      mockAuthFunctions.signOut.mockResolvedValueOnce({
        error: null
      });
      
      // 로그아웃 실행
      await signOut();
      
      // 로그아웃 확인
      expect(mockAuthFunctions.signOut).toHaveBeenCalled();
      expect(authStorage.removeAuthData).toHaveBeenCalled();
    });
  });
  
  describe('Google 로그인 흐름', () => {
    it('Google OAuth URL 생성', async () => {
      // code_verifier 미리 설정
      vi.mocked(authStorage.getAuthData).mockReturnValue(null); // 기존 코드 검증기 없음
      vi.mocked(authStorage.setAuthData).mockReturnValue(true); // 저장 성공
      
      // OAuth URL 생성 모킹
      mockAuthFunctions.signInWithOAuth.mockResolvedValueOnce({
        data: {
          url: 'https://accounts.google.com/o/oauth2/v2/auth?test=true'
        },
        error: null
      });
      
      // Google 로그인 실행
      const result = await signInWithGoogle();
      
      // 결과 확인
      expect(result.success).toBe(true);
      expect(result.url).toBeDefined();
      
      // Code Verifier가 저장되었는지 확인
      expect(authStorage.setAuthData).toHaveBeenCalledWith(
        authStorage.STORAGE_KEYS.CODE_VERIFIER,
        expect.any(String),
        expect.anything()
      );
    });
    
    it('OAuth URL 생성 실패 시 오류 객체를 반환해야 함', async () => {
      // OAuth URL 생성 실패 모킹
      mockAuthFunctions.signInWithOAuth.mockResolvedValueOnce({
        data: { url: null },
        error: new Error('인증 서버 오류')
      });
      
      // Google 로그인 실행
      const result = await signInWithGoogle();
      
      // 결과 확인 - 실패 케이스
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
  
  describe('사용자 정보 조회', () => {
    it('현재 로그인된 사용자 정보 가져오기', async () => {
      // 사용자 정보 조회 모킹
      mockAuthFunctions.getUser.mockResolvedValueOnce({
        data: {
          user: {
            id: 'current-user-id',
            email: 'current@example.com',
            user_metadata: {
              name: 'Current User'
            }
          }
        },
        error: null
      });
      
      // 사용자 정보 조회 실행
      const user = await getCurrentUser();
      
      // 결과 확인
      expect(user).toBeDefined();
      if (user) { // user가 null이 아닌 경우에만 확인
        expect(user.id).toBe('current-user-id');
        expect(user.email).toBe('current@example.com');
      }
    });
    
    it('로그인되지 않은 상태에서 null 반환', async () => {
      // 사용자 정보 조회 모킹 - 로그인되지 않음
      mockAuthFunctions.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null
      });
      
      // 사용자 정보 조회 실행
      const user = await getCurrentUser();
      
      // 결과 확인
      expect(user).toBeNull();
    });
  });
}); 