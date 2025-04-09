/**
 * 파일명: src/lib/auth.test.ts
 * 목적: Auth 모듈의 함수들을 테스트
 * 역할: 인증 관련 기능의 정상 동작 및 에러 처리 검증
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

// 환경 검사 함수 항상 true 반환하도록 모킹
vi.mock('./environment', () => ({
  isClient: vi.fn().mockReturnValue(true),
  isServer: vi.fn().mockReturnValue(false),
  getEnvironment: vi.fn().mockReturnValue('client'),
  executeOnClient: vi.fn(fn => fn()),
  executeOnServer: vi.fn(),
  runInEnvironment: vi.fn(({ client }) => client && client()),
}));

// Supabase 클라이언트 모킹
vi.mock('./supabase/client', () => {
  const mockAuthFunctions = {
    signUp: vi.fn(),
    signOut: vi.fn(),
    signInWithPassword: vi.fn(),
    signInWithOAuth: vi.fn(),
    getSession: vi.fn(),
    getUser: vi.fn(),
    exchangeCodeForSession: vi.fn(),
  };
  
  return {
    createClient: vi.fn(() => ({
      auth: mockAuthFunctions
    }))
  };
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  generateCodeVerifier, 
  generateCodeChallenge, 
  getAuthClient, 
  signIn, 
  signUp, 
  signOut,
  signInWithGoogle,
  getCurrentUser,
  exchangeCodeForSession,
  getSession,
  getUser,
  STORAGE_KEYS
} from './auth';
import * as authModule from './auth';
import * as environmentModule from './environment';
import createLogger from './logger';
import { createClient } from './supabase/client';

// fetch 모킹
const mockFetch = vi.fn();

describe('Auth 모듈', () => {
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
    
    // createClient 모킹 설정
    vi.mocked(createClient).mockReturnValue(mockClient as any);
    
    // 스토리지 모킹
    const storageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    
    // 브라우저 환경 모킹
    vi.stubGlobal('window', {
      localStorage: storageMock,
      sessionStorage: storageMock,
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
          digest: vi.fn().mockImplementation(async (algorithm, data) => {
            // 단순화된 해시 함수 모킹
            return new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
          }),
        },
      },
    });
    
    // 전역 localStorage 및 sessionStorage 모킹
    vi.stubGlobal('localStorage', window.localStorage);
    vi.stubGlobal('sessionStorage', window.sessionStorage);

    vi.stubGlobal('crypto', {
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
      },
    });

    // TextEncoder 모킹
    vi.stubGlobal('TextEncoder', class TextEncoder {
      encode(text: string): Uint8Array {
        return new Uint8Array(Array.from(text).map((char: string) => char.charCodeAt(0)));
      }
    });

    // fetch 모킹
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('success'),
      json: () => Promise.resolve({ success: true }),
    });

    // btoa 모킹
    vi.stubGlobal('btoa', (str: string) => Buffer.from(str).toString('base64'));
    
    // 명시적으로 isClient가 항상 true 반환하도록 확인
    vi.mocked(environmentModule.isClient).mockReturnValue(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('PKCE 함수', () => {
    it('generateCodeVerifier는 유효한 코드 검증기를 생성해야 함', async () => {
      const verifier = await generateCodeVerifier();
      expect(verifier).toBeDefined();
      expect(verifier.length).toBeGreaterThanOrEqual(43);
      expect(verifier.length).toBeLessThanOrEqual(128);
    });

    it('generateCodeChallenge는 코드 검증기에서 코드 챌린지를 생성해야 함', async () => {
      const testVerifier = 'test_code_verifier';
      const challenge = await generateCodeChallenge(testVerifier);
      expect(challenge).toBeDefined();
      // Base64URL 문자셋만 포함해야 함 (특수 문자 없음)
      expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/);
    });
  });

  describe('getAuthClient', () => {
    it('브라우저 환경에서 Supabase 클라이언트를 반환해야 함', () => {
      const client = getAuthClient();
      expect(client).toBeDefined();
      expect(createClient).toHaveBeenCalled();
    });

    it('브라우저 환경이 아닐 때 오류를 발생시켜야 함', () => {
      vi.mocked(environmentModule.isClient).mockReturnValueOnce(false);
      expect(() => getAuthClient()).toThrow('브라우저 환경에서만 사용 가능합니다');
    });
  });

  describe('signUp', () => {
    it('회원가입이 성공하면 사용자 정보를 반환해야 함', async () => {
      // signUp API 성공 응답 모킹
      mockAuthFunctions.signUp.mockResolvedValueOnce({
        data: {
          user: { id: 'test-user-id', email: 'test@example.com' },
          session: null
        },
        error: null
      });
      
      const result = await signUp('test@example.com', 'password123');
      
      expect(mockAuthFunctions.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe('test-user-id');
    });

    it('회원가입 실패 시 오류를 전파해야 함', async () => {
      // signUp API 실패 응답 모킹
      const testError = new Error('이메일이 이미 사용 중입니다');
      mockAuthFunctions.signUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: testError
      });
      
      await expect(signUp('existing@example.com', 'password'))
        .rejects.toEqual(testError);
    });
  });

  describe('signIn', () => {
    it('로그인이 성공하면 세션 정보를 반환해야 함', async () => {
      // signInWithPassword API 성공 응답 모킹
      mockAuthFunctions.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: 'test-user-id', email: 'test@example.com' },
          session: {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              app_metadata: {
                provider: 'email'
              }
            }
          }
        },
        error: null
      });
      
      const result = await signIn('test@example.com', 'password123');
      
      expect(mockAuthFunctions.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe('test-user-id');
      expect(result.session).toBeDefined();
      expect(result.session.access_token).toBe('test-access-token');
    });

    it('로그인 실패 시 오류를 처리해야 함', async () => {
      // signInWithPassword API 실패 응답 모킹
      const testError = new Error('이메일 또는 비밀번호가 잘못되었습니다');
      mockAuthFunctions.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: testError
      });
      
      await expect(signIn('test@example.com', 'wrong-password'))
        .rejects.toThrow('이메일 또는 비밀번호가 잘못되었습니다');
    });
  });

  describe('signOut', () => {
    it('로그아웃 함수가 Supabase 클라이언트의 signOut 메서드를 호출해야 함', async () => {
      // signOut API 성공 응답 모킹
      mockAuthFunctions.signOut.mockResolvedValueOnce({
        error: null
      });
      
      await signOut();
      
      expect(mockAuthFunctions.signOut).toHaveBeenCalled();
    });

    it('로그아웃 실패 시 오류를 처리해야 함', async () => {
      // signOut API 실패 응답 모킹
      const testError = new Error('로그아웃 중 오류가 발생했습니다');
      mockAuthFunctions.signOut.mockResolvedValueOnce({
        error: testError
      });
      
      await expect(signOut())
        .rejects.toThrow('로그아웃 중 오류가 발생했습니다');
    });
  });

  describe('signInWithGoogle', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // 세션 스토리지 초기화 (PKCE 코드 검증기 모킹용)
      (window.sessionStorage.getItem as jest.Mock).mockImplementation((key) => null);
      (window.sessionStorage.setItem as jest.Mock).mockImplementation(() => {});
      (window.sessionStorage.removeItem as jest.Mock).mockImplementation(() => {});
    });

    it('Google 로그인 URL을 생성하고 code_verifier를 sessionStorage에 저장해야 함', async () => {
      // signInWithOAuth API 성공 응답 모킹
      mockAuthFunctions.signInWithOAuth.mockResolvedValueOnce({
        data: {
          url: 'https://accounts.google.com/o/oauth2/v2/auth?code_challenge=test-challenge'
        },
        error: null
      });
      
      const result = await signInWithGoogle();
      
      // signInWithOAuth 메서드가 호출되었는지 확인
      expect(mockAuthFunctions.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          options: expect.objectContaining({
            queryParams: expect.objectContaining({
              code_challenge: expect.any(String),
              code_challenge_method: 'S256'
            })
          })
        })
      );
      
      // sessionStorage에 code_verifier가 저장되었는지 확인
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CODE_VERIFIER,
        expect.any(String)
      );
      
      expect(result.success).toBe(true);
      expect(result.url).toBeDefined();
    });

    it('Google 로그인 URL 생성 실패 시 오류를 반환해야 함', async () => {
      // signInWithOAuth API 실패 응답 모킹
      const testError = new Error('OAuth URL 생성 중 오류가 발생했습니다');
      mockAuthFunctions.signInWithOAuth.mockResolvedValueOnce({
        data: null,
        error: testError
      });
      
      const result = await signInWithGoogle();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      // 실제 구현에서는 에러 메시지를 문자열로 반환함
      expect(result.error).toBe('로그인 처리 중 오류가 발생했습니다.');
    });
  });

  describe('exchangeCodeForSession', () => {
    it('코드 검증기가 없으면 오류를 반환해야 함', async () => {
      // sessionStorage에서 code_verifier가 없음을 모킹
      (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);
      
      try {
        await exchangeCodeForSession('test-code');
        fail('예외가 발생해야 함');
      } catch (error: any) {
        expect(error.message).toContain('코드 검증기를 찾을 수 없습니다');
      }
    });

    it('인증 코드를 세션으로 교환해야 함', async () => {
      // sessionStorage에서 code_verifier 모킹
      (window.sessionStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === STORAGE_KEYS.CODE_VERIFIER) {
          return 'test-code-verifier';
        }
        return null;
      });
      
      // Supabase의 exchangeCodeForSession 성공 응답 모킹
      mockAuthFunctions.exchangeCodeForSession.mockResolvedValueOnce({
        data: {
          session: { access_token: 'test-access-token' },
          user: { id: 'test-user-id' }
        },
        error: null
      });
      
      const result = await exchangeCodeForSession('test-code');
      
      // code_verifier가 sessionStorage에서 삭제되었는지 확인
      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.CODE_VERIFIER);
      
      // Supabase 클라이언트 메서드가 호출되었는지 확인
      expect(mockAuthFunctions.exchangeCodeForSession).toHaveBeenCalledWith('test-code');
      
      // 결과가 있는지 확인
      expect(result).toBeDefined();
      expect(result.session).toBeDefined();
    });
  });

  describe('getCurrentUser', () => {
    it('현재 사용자 정보를 반환해야 함', async () => {
      // getUser API 성공 응답 모킹
      mockAuthFunctions.getUser.mockResolvedValueOnce({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      });
      
      const user = await getCurrentUser();
      
      expect(mockAuthFunctions.getUser).toHaveBeenCalled();
      expect(user).toBeDefined();
      expect(user.id).toBe('test-user-id');
    });

    it('사용자 정보 조회 실패 시 null을 반환해야 함', async () => {
      // getUser API 실패 응답 모킹
      mockAuthFunctions.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: '인증되지 않았습니다' }
      });
      
      const user = await getCurrentUser();
      
      expect(user).toBeNull();
    });
  });
}); 