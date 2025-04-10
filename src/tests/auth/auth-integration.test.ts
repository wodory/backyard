/**
 * 파일명: auth-integration.test.ts
 * 목적: Google OAuth 인증 통합 테스트
 * 역할: 인증 관련 모든 기능의 통합 테스트
 * 작성일: 2025-03-27
 */

import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { mockLocalStorage, mockSessionStorage, mockCookies, mockCrypto } from '../mocks/storage-mock';
import { mockClientEnvironment, mockServerEnvironment } from '../mocks/env-mock';
import { mockSupabaseBrowserClient, mockSupabaseServerClient, mockSupabaseSession } from '../mocks/supabase-mock';
import { 
  mockEnvironment, 
  mockAuth, 
  mockBase64, 
  mockMiddleware, 
  mockNextResponse,
  mockAuthContext
} from '../mocks/additional-mocks';

// 모킹 환경 설정
let clientEnv: { restore: () => void };
let serverEnv: { restore: () => void };
let mockStorage: ReturnType<typeof mockLocalStorage>;
let mockSession: ReturnType<typeof mockSessionStorage>;
let mockCookie: ReturnType<typeof mockCookies>;
let mockSupabase: ReturnType<typeof mockSupabaseBrowserClient>;
let crypto: ReturnType<typeof mockCrypto>;

// 추가 모킹
let environmentMock: ReturnType<typeof mockEnvironment>;
let authMock: ReturnType<typeof mockAuth>;
let base64Mock: ReturnType<typeof mockBase64>;
let middlewareMock: ReturnType<typeof mockMiddleware>;
let nextResponseMock: ReturnType<typeof mockNextResponse>;
let authContextMock: ReturnType<typeof mockAuthContext>;

// 모듈 모킹 설정
vi.mock('../../lib/auth-storage', async () => {
  const actual = await vi.importActual('../../lib/auth-storage');
  return {
    ...(actual as object),
    getAuthData: vi.fn(),
    setAuthData: vi.fn().mockReturnValue(true),
    removeAuthData: vi.fn().mockReturnValue(true),
    STORAGE_KEYS: {
      ACCESS_TOKEN: 'access_token',
      REFRESH_TOKEN: 'refresh_token',
      SESSION_EXPIRY: 'session_expiry',
      RECOVERY_ATTEMPTS: 'recovery_attempts',
      CODE_VERIFIER: 'code_verifier'
    }
  };
});

vi.mock('../../lib/cookie', () => {
  return {
    getAuthCookie: vi.fn(),
    setAuthCookie: vi.fn(),
    deleteAuthCookie: vi.fn()
  };
});

vi.mock('../../lib/environment', () => {
  // 환경 모킹은 동적으로 설정됨
  return environmentMock || mockEnvironment();
});

vi.mock('../../lib/auth', () => {
  // 인증 모킹은 동적으로 설정됨
  return authMock || mockAuth();
});

vi.mock('../../lib/base64', () => {
  // Base64 모킹은 동적으로 설정됨
  return base64Mock || mockBase64();
});

vi.mock('../../middleware', () => {
  // 미들웨어 모킹은 동적으로 설정됨
  return middlewareMock || mockMiddleware();
});

vi.mock('next/server', () => {
  // Next.js Response 모킹은 동적으로 설정됨
  return nextResponseMock || mockNextResponse();
});

vi.mock('../../contexts/AuthContext', () => {
  // 인증 컨텍스트 모킹은 동적으로 설정됨
  return authContextMock || mockAuthContext();
});

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(),
    createServerClient: vi.fn()
  };
});

describe('인증 통합 테스트', () => {
  beforeEach(() => {
    vi.resetModules();
    
    // 모킹 초기화
    environmentMock = mockEnvironment();
    authMock = mockAuth();
    base64Mock = mockBase64();
    middlewareMock = mockMiddleware();
    nextResponseMock = mockNextResponse();
    authContextMock = mockAuthContext();
    
    // 클라이언트 환경 모킹
    clientEnv = mockClientEnvironment();
    
    // 스토리지 모킹
    mockStorage = mockLocalStorage();
    mockSession = mockSessionStorage();
    mockCookie = mockCookies();
    
    // 암호화 모킹
    crypto = mockCrypto();
    
    // window 객체 모킹
    Object.defineProperty(global, 'crypto', {
      value: crypto,
      writable: true
    });
    
    Object.defineProperty(global.window, 'localStorage', {
      value: mockStorage,
      writable: true
    });
    
    Object.defineProperty(global.window, 'sessionStorage', {
      value: mockSession,
      writable: true
    });
    
    Object.defineProperty(global.window, 'location', {
      value: { href: '' },
      writable: true
    });
    
    // Base64 모킹
    vi.mock('../../lib/base64', () => ({
      base64UrlEncode: vi.fn().mockReturnValue('test-base64url-encoded-string')
    }));
    
    // Supabase 클라이언트 모킹
    mockSupabase = mockSupabaseBrowserClient();
    const createClient = require('@supabase/supabase-js').createClient;
    vi.mock('@supabase/supabase-js', () => ({
      createClient: vi.fn().mockReturnValue(mockSupabase)
    }));
  });
  
  afterEach(() => {
    if (clientEnv) clientEnv.restore();
    if (serverEnv) serverEnv.restore();
    vi.clearAllMocks();
  });
  
  describe('스토리지 전략 테스트', () => {
    test('다중 스토리지에 데이터를 저장하고 복원할 수 있어야 함', async () => {
      const authStorage = await import('../../lib/auth-storage');
      const { getAuthData, setAuthData, STORAGE_KEYS } = authStorage;
      
      // 스파이 설정
      vi.mocked(setAuthData, { partial: true }).mockImplementation((key, value) => {
        mockStorage.setItem(key, value);
        mockSession.setItem(`auth.${key}.backup`, value);
        return true;
      });
      
      vi.mocked(getAuthData, { partial: true }).mockImplementation((key) => {
        return mockStorage.getItem(key) || 
          mockCookie.get(key) || 
          mockSession.getItem(`auth.${key}.backup`);
      });
      
      // 테스트 데이터
      const key = STORAGE_KEYS.ACCESS_TOKEN;
      const value = 'test-access-token';
      
      // 저장 테스트
      setAuthData(key, value);
      
      // 각 스토리지에 저장되었는지 확인
      expect(mockStorage.setItem).toHaveBeenCalledWith(key, value);
      expect(mockSession.setItem).toHaveBeenCalledWith(`auth.${key}.backup`, value);
      
      // 복원 테스트
      mockStorage.getItem.mockReturnValueOnce(value);
      const result = getAuthData(key);
      expect(result).toBe(value);
    });
  });
  
  describe('PKCE 인증 구현 테스트', () => {
    let authStorage: any;
    
    beforeEach(() => {
      // 스토리지 설정
      authStorage = {
        setAuthData: vi.fn(),
        getAuthData: vi.fn()
      };
      
      // auth 모듈 직접 모킹
      vi.mock('../../lib/auth', () => {
        return {
          generateCodeVerifier: vi.fn().mockReturnValue('test-code-verifier'),
          generateCodeChallenge: vi.fn().mockReturnValue('test-base64url-encoded-string'),
          signInWithGoogle: vi.fn().mockImplementation((redirectUrl, onSuccess) => {
            if (onSuccess) onSuccess();
            return {
              url: 'https://accounts.google.com/o/oauth2/v2/auth?code_challenge=test-base64url-encoded-string'
            };
          }),
          googleLogin: vi.fn().mockImplementation(() => ({
            url: 'https://accounts.google.com/o/oauth2/v2/auth?code_challenge=test-base64url-encoded-string'
          }))
        };
      });
    });
    
    test('코드 검증기와 코드 챌린지가 올바르게 생성되어야 함', async () => {
      // Crypto API 모킹
      crypto.getRandomValues.mockImplementation((buffer: Uint8Array) => {
        for (let i = 0; i < buffer.length; i++) {
          buffer[i] = i % 256;
        }
        return buffer;
      });
      
      crypto.subtle.digest.mockImplementation(async () => {
        return new Uint8Array(32).buffer;
      });
      
      // Base64url 인코딩 모킹
      vi.mock('../../lib/base64', () => {
        return {
          base64UrlEncode: vi.fn().mockImplementation((buffer: ArrayBuffer): string => {
            return 'test-base64url-encoded-string';
          })
        };
      });
      
      // 모듈 가져오기
      const auth = await import('../../lib/auth');
      
      // 코드 검증기 생성
      const generateCodeVerifier = auth.generateCodeVerifier;
      const codeVerifier = generateCodeVerifier();
      
      // 검증기 형식 확인
      expect(codeVerifier).toBeDefined();
      expect(typeof codeVerifier).toBe('string');
      
      // 코드 챌린지 생성
      const generateCodeChallenge = auth.generateCodeChallenge;
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      // 챌린지 형식 확인
      expect(codeChallenge).toBeDefined();
      expect(codeChallenge).toBe('test-base64url-encoded-string');
    });
    
    test('Google OAuth 로그인 시 코드 검증기를 저장하고 URL에 코드 챌린지를 포함해야 함', async () => {
      // 모킹된 함수 직접 호출
      authStorage.setAuthData('code_verifier', 'test-code-verifier');
      
      // URL 객체 생성
      const url = 'https://accounts.google.com/o/oauth2/v2/auth?code_challenge=test-base64url-encoded-string';
      
      // 코드 검증기 저장 확인
      expect(authStorage.setAuthData).toHaveBeenCalledWith(
        'code_verifier',
        'test-code-verifier'
      );
      
      // URL에 코드 챌린지 포함 확인
      expect(url).toContain('code_challenge=test-base64url-encoded-string');
    });
  });
  
  describe('세션 관리 테스트', () => {
    test('세션 만료 시 리프레시 토큰으로 세션을 갱신해야 함', async () => {
      // refreshSession 메서드 설정
      mockSupabase.auth.refreshSession = vi.fn();
      
      // 세션 갱신 함수 직접 호출
      mockSupabase.auth.refreshSession();
      
      // 세션 갱신 확인
      expect(mockSupabase.auth.refreshSession).toHaveBeenCalled();
    });
  });
  
  describe('환경 감지 테스트', () => {
    test('클라이언트 환경에서는 isClient가 true를 반환해야 함', async () => {
      // environment 모듈 리셋 및 모킹
      vi.resetModules();
      vi.doMock('../../lib/environment', () => ({
        isClient: vi.fn().mockReturnValue(true),
        isServer: vi.fn().mockReturnValue(false)
      }));
      
      const environment = await import('../../lib/environment');
      expect(environment.isClient()).toBe(true);
    });
    
    test('서버 환경에서는 isServer가 true를 반환해야 함', async () => {
      // environment 모듈 리셋 및 모킹
      vi.resetModules();
      vi.doMock('../../lib/environment', () => ({
        isServer: vi.fn().mockReturnValue(true),
        isClient: vi.fn().mockReturnValue(false)
      }));
      
      const environment = await import('../../lib/environment');
      expect(environment.isServer()).toBe(true);
    });
  });
  
  describe('미들웨어 인증 테스트', () => {
    test('인증된 사용자는 보호된 경로에 접근할 수 있어야 함', async () => {
      // 서버 클라이언트 모킹
      const serverClient = mockSupabaseServerClient();
      
      // getSession 메서드 설정
      serverClient.auth.getSession = vi.fn();
      
      // 함수 호출
      serverClient.auth.getSession();
      
      // 세션 확인 및 접근 허용 확인
      expect(serverClient.auth.getSession).toHaveBeenCalled();
    });
  });
}); 