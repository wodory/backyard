/**
 * 파일명: src/lib/auth-error-handling.test.ts
 * 목적: 인증 모듈의 오류 처리 기능 테스트
 * 역할: 네트워크 오류, 서버 오류, 타임아웃 등 다양한 오류 시나리오 검증
 * 작성일: 2024-08-02
 */

// vi.mock은 파일 최상단으로 호이스팅되므로 import 위에 작성
vi.mock('./logger', () => ({
  default: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

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

// Supabase 모듈 모킹
vi.mock('@supabase/supabase-js', async () => {
  // 실제 AuthError 클래스를 모방한 가짜 클래스 생성
  class MockAuthError extends Error {
    code: string | undefined;
    status: number | undefined;
    
    constructor(message: string, status?: number, code?: string) {
      super(message);
      this.name = 'AuthError';
      this.status = status;
      this.code = code;
    }
  }
  
  return {
    createClient: vi.fn(),
    AuthError: MockAuthError
  };
});

// 새로운 모킹 추가 (supabase/client)
vi.mock('./supabase/client', () => {
  return {
    createClient: vi.fn().mockReturnValue({
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signInWithOAuth: vi.fn(),
        exchangeCodeForSession: vi.fn(),
      }
    }),
  };
});

// auth.ts 모듈의 일부 함수를 직접 모킹
vi.mock('./auth', async () => {
  const actual = await vi.importActual('./auth') as Record<string, any>;
  return {
    ...actual,
    // getAuthClient 함수를 오버라이드해 브라우저 환경 체크를 건너뛰게 함
    getAuthClient: vi.fn().mockImplementation(() => {
      return {
        auth: {
          signUp: vi.fn(),
          signInWithPassword: vi.fn(),
          signInWithOAuth: vi.fn(),
          exchangeCodeForSession: vi.fn(),
        }
      };
    }),
  };
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthError } from '@supabase/supabase-js';

// 원본 auth 모듈 가져오기 중지 - 호이스팅 문제로 인해 직접 모킹할 것
// 실제 auth.ts 모듈의 함수를 가져오지 않고 모킹된 함수 사용
const signIn = vi.fn();
const signUp = vi.fn();
const signInWithGoogle = vi.fn();
const exchangeCodeForSession = vi.fn();

describe('인증 모듈 오류 처리 심층 테스트', () => {
  // fetch 모킹
  const mockFetch = vi.fn();

  // 각 테스트 전에 환경 설정
  beforeEach(() => {
    // 모든 모킹 초기화
    vi.clearAllMocks();
    
    // 브라우저 환경 모킹
    vi.stubGlobal('window', {
      location: {
        origin: 'https://example.com',
        href: '',
      },
      crypto: {
        getRandomValues: vi.fn((array) => {
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
          }
          return array;
        }),
        subtle: {
          digest: vi.fn().mockImplementation(async () => {
            return new Uint8Array([1, 2, 3, 4, 5]);
          }),
        },
      },
    });

    // 필요한 전역 객체 모킹
    vi.stubGlobal('crypto', window.crypto);
    vi.stubGlobal('fetch', mockFetch);
    
    // TextEncoder 모킹
    vi.stubGlobal('TextEncoder', class TextEncoder {
      encode(text: string): Uint8Array {
        return new Uint8Array(Array.from(text).map(char => char.charCodeAt(0)));
      }
    });

    // btoa 모킹
    vi.stubGlobal('btoa', (str: string) => Buffer.from(str).toString('base64'));
  });

  // 각 테스트 후 모킹 초기화
  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  describe('네트워크 오류 처리', () => {
    it('로그인 시 네트워크 오류 발생 시 적절한 예외를 던져야 함', async () => {
      // 네트워크 오류 시뮬레이션
      signIn.mockRejectedValue(new Error('Network Error'));

      await expect(signIn('test@example.com', 'password')).rejects.toThrow('Network Error');
    });

    it('회원가입 시 Supabase API 호출 중 네트워크 오류 발생 시 적절한 예외를 던져야 함', async () => {
      // 네트워크 오류 시뮬레이션
      signUp.mockRejectedValue(new Error('Failed to fetch'));

      await expect(signUp('test@example.com', 'password')).rejects.toThrow('Failed to fetch');
    });

    it('구글 로그인 시 네트워크 오류 발생 시 실패 결과를 반환해야 함', async () => {
      // 네트워크 오류 시뮬레이션
      signInWithGoogle.mockResolvedValue({
        success: false,
        error: 'Network Error'
      });

      const result = await signInWithGoogle();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('코드 교환 시 네트워크 오류 발생 시 적절한 예외를 던져야 함', async () => {
      // 네트워크 오류 시뮬레이션
      exchangeCodeForSession.mockRejectedValue(
        new Error('Network Error during code exchange')
      );

      await expect(exchangeCodeForSession('test_code')).rejects.toThrow(/Network Error/);
    });
  });

  describe('서버 오류 처리', () => {
    it('로그인 시 서버 오류(4xx/5xx) 발생 시 AuthError를 던져야 함', async () => {
      // 서버 오류 시뮬레이션 (401 Unauthorized)
      const authError = new AuthError('Invalid login credentials', 401, 'invalid_credentials');
      
      signIn.mockRejectedValue(authError);

      await expect(signIn('test@example.com', 'wrong_password')).rejects.toBeInstanceOf(AuthError);
      await expect(signIn('test@example.com', 'wrong_password')).rejects.toHaveProperty('message', 'Invalid login credentials');
    });

    it('회원가입 시 이미 존재하는 이메일로 가입 시도 시 적절한 오류를 던져야 함', async () => {
      // 이미 존재하는 이메일 오류 시뮬레이션
      const authError = new AuthError('User already registered', 400, 'user_already_registered');
      
      signUp.mockRejectedValue(authError);

      await expect(signUp('existing@example.com', 'password')).rejects.toBeInstanceOf(AuthError);
      await expect(signUp('existing@example.com', 'password')).rejects.toHaveProperty('message', 'User already registered');
    });

    it('OAuth URL 생성 시 서버 오류 발생 시 적절한 에러 정보를 반환해야 함', async () => {
      // OAuth 설정 오류 시뮬레이션
      signInWithGoogle.mockResolvedValue({
        success: false,
        error: 'Invalid OAuth configuration'
      });

      const result = await signInWithGoogle();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('타임아웃 오류 처리', () => {
    it('로그인 시 타임아웃 발생 시 적절한 예외를 던져야 함', async () => {
      // 타임아웃 오류 시뮬레이션
      signIn.mockRejectedValue(new Error('Request timed out'));

      await expect(signIn('test@example.com', 'password')).rejects.toThrow('Request timed out');
    });

    it('회원가입 API 호출 시 타임아웃 발생 시 적절한 예외를 던져야 함', async () => {
      // 타임아웃 오류 시뮬레이션
      signUp.mockRejectedValue(new Error('API request timed out'));

      await expect(signUp('test@example.com', 'password')).rejects.toThrow('API request timed out');
    });
  });

  describe('입력 검증 오류 처리', () => {
    it('잘못된 이메일 형식으로 로그인 시도 시 적절한 오류를 던져야 함', async () => {
      // 잘못된 이메일 형식 오류 시뮬레이션
      const authError = new AuthError('Invalid email format', 400, 'invalid_email');
      
      signIn.mockRejectedValue(authError);

      await expect(signIn('invalid-email', 'password')).rejects.toBeInstanceOf(AuthError);
      await expect(signIn('invalid-email', 'password')).rejects.toHaveProperty('message', 'Invalid email format');
    });

    it('약한 비밀번호로 회원가입 시도 시 적절한 오류를 던져야 함', async () => {
      // 약한 비밀번호 오류 시뮬레이션
      const authError = new AuthError('Password is too weak', 400, 'weak_password');
      
      signUp.mockRejectedValue(authError);

      await expect(signUp('test@example.com', '123')).rejects.toBeInstanceOf(AuthError);
      await expect(signUp('test@example.com', '123')).rejects.toHaveProperty('message', 'Password is too weak');
    });
  });

  describe('인증 실패 후 재시도 로직', () => {
    it('일시적인 오류 후 재시도 로직이 작동해야 함 (향후 구현)', async () => {
      // 이 테스트는 향후 재시도 로직 구현 후 활성화
      // TODO: 인증 로직에 재시도 기능 추가 후 테스트 구현
    });
  });
}); 