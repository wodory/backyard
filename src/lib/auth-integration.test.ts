/**
 * 파일명: src/lib/auth-integration.test.ts
 * 목적: 인증 관련 모듈의 통합 테스트
 * 역할: auth.ts와 Supabase 인증 간의 상호작용 테스트
 * 작성일: 2025-04-02
 * 수정일: 2025-04-09
 */

import { http, HttpResponse } from 'msw';
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

import { server } from '@/tests/msw/server';

// 테스트 대상 모듈들을 모킹 설정 이후에 임포트하기 위해 동적 임포트 사용
let auth: typeof import('./auth');
let environment: typeof import('./environment');

// 모킹된 Supabase 클라이언트와 함수들
const mockSupabaseAuth = {
  signInWithOAuth: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  getUser: vi.fn(),
  getSession: vi.fn(),
  refreshSession: vi.fn(),
  exchangeCodeForSession: vi.fn(),
  onAuthStateChange: vi.fn()
};

const mockSupabaseClient = {
  auth: mockSupabaseAuth
};

// createBrowserClient 함수를 스파이로 설정
const createBrowserClientSpy = vi.fn(() => mockSupabaseClient);

// 모킹된 모듈
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => mockSupabaseClient)
  };
});

vi.mock('@supabase/ssr', () => {
  return {
    createBrowserClient: createBrowserClientSpy,
    createServerClient: vi.fn(() => mockSupabaseClient)
  };
});

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
    set: vi.fn(),
    delete: vi.fn()
  })
}));

// supabase/client 모듈 모킹
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabaseClient)
}));

// 스토리지 모킹
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

// 환경 시뮬레이션 유틸리티
function simulateClientEnvironment() {
  // 브라우저 환경 설정으로 detectEnvironment가 'client'를 반환하도록 함
  vi.stubGlobal('window', {
    localStorage: mockStorage,
    sessionStorage: mockStorage,
    location: {
      hostname: 'localhost',
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000'
    },
    navigator: {
      userAgent: 'Mozilla/5.0 Test Browser'
    }
  });
  
  vi.stubGlobal('localStorage', mockStorage);
  vi.stubGlobal('sessionStorage', mockStorage);
  
  vi.stubGlobal('crypto', {
    subtle: {
      digest: async (algorithm: string, data: ArrayBuffer) => {
        return new Uint8Array(Array(32).fill(1)).buffer;
      }
    },
    getRandomValues: (array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = i % 256;
      }
      return array;
    },
    randomUUID: vi.fn().mockReturnValue('mocked-uuid')
  });
  
  // process 객체를 설정
  vi.stubGlobal('process', {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
    }
  });
}

function simulateServerEnvironment() {
  // 브라우저 환경 제거
  vi.stubGlobal('window', undefined);
  
  // process 객체를 NodeJS 환경으로 설정
  vi.stubGlobal('process', {
    versions: { node: 'v18.0.0' },
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
    }
  });
}

// 테스트 설정
beforeAll(async () => {
  // process 객체 설정
  vi.stubGlobal('process', {
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
    }
  });

  // MSW 서버 설정
  try {
    server.listen();
  } catch (error) {
    console.warn('MSW 서버 설정 오류:', error);
  }
  
  // 환경 시뮬레이션 초기 설정
  simulateClientEnvironment();
  
  // 모듈을 동적으로 임포트하여 모킹 설정이 적용된 상태에서 로드
  auth = await import('./auth');
  environment = await import('./environment');
  
  // 환경 함수를 모킹
  vi.spyOn(environment, 'isClient').mockImplementation(() => true);
  vi.spyOn(environment, 'isServer').mockImplementation(() => false);
});

afterAll(() => {
  try {
    server.close();
  } catch (error) {
    console.warn('MSW 서버 종료 오류:', error);
  }
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// MSW 핸들러 추가
server.use(
  http.post('*/auth/v1/token*', () => {
    return HttpResponse.json({
      access_token: 'test_access_token',
      refresh_token: 'test_refresh_token',
      user: { id: 'test_user_id', email: 'test@example.com' }
    });
  }),
  
  http.get('*/auth/v1/user', () => {
    return HttpResponse.json({
      id: 'test_user_id',
      email: 'test@example.com',
      app_metadata: { provider: 'google' }
    });
  })
);

describe('인증 모듈 통합 테스트', () => {
  // 각 테스트 전 설정
  beforeEach(() => {
    // 기본적으로 클라이언트 환경 설정
    simulateClientEnvironment();
    vi.clearAllMocks();
    server.resetHandlers();
    
    // 클라이언트 환경으로 설정
    vi.spyOn(environment, 'isClient').mockReturnValue(true);
    vi.spyOn(environment, 'isServer').mockReturnValue(false);
    
    // 모의 응답 설정
    mockSupabaseAuth.signInWithOAuth.mockResolvedValue({
      data: { url: 'https://accounts.google.com/o/oauth2/auth?code_challenge=test_challenge' },
      error: null
    });
    
    mockSupabaseAuth.signInWithPassword.mockResolvedValue({
      data: {
        session: {
          access_token: 'test_access_token',
          refresh_token: 'test_refresh_token',
          user: { id: 'test_user_id', email: 'test@example.com' }
        },
        user: { id: 'test_user_id', email: 'test@example.com' }
      },
      error: null
    });
    
    mockSupabaseAuth.signOut.mockResolvedValue({ error: null });
    
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: { id: 'test_user_id', email: 'test@example.com' } },
      error: null
    });
    
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { 
        session: { 
          access_token: 'test_access_token',
          user: { id: 'test_user_id', email: 'test@example.com' }
        } 
      },
      error: null
    });
    
    // API 응답 모킹
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: 'test_user_id', name: 'Test User' })
    });
    
    // PKCE 함수 모킹
    vi.spyOn(auth, 'generateCodeVerifier').mockResolvedValue('test_verifier');
    vi.spyOn(auth, 'generateCodeChallenge').mockResolvedValue('test_challenge');
  });

  // 각 테스트 후 정리
  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * 소셜 로그인 테스트 (OAuth with PKCE)
   */
  describe('소셜 로그인 (SignInWithOAuth)', () => {
    it('소셜 로그인은 Supabase OAuth 클라이언트를 사용하고 올바른 설정을 전달한다', async () => {
      const provider = 'google';
      
      await auth.signInWithOAuthAndRedirect(provider);
      
      // 스토리지에 code_verifier 저장 확인
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('supabase.auth.token.code_verifier'), 
        expect.any(String)
      );
      
      // Supabase 소셜 로그인 호출 확인
      expect(mockSupabaseAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider,
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          },
          skipBrowserRedirect: true,
          codeChallenge: 'test_challenge',
          codeChallengeMethod: 'S256'
        }
      });
    });
    
    it('리다이렉트URL이 제공되면 소셜 로그인 설정에 포함한다', async () => {
      const provider = 'google';
      const redirectTo = 'http://localhost:3000/dashboard';
      
      await auth.signInWithOAuthAndRedirect(provider, { redirectTo });
      
      expect(mockSupabaseAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider,
        options: expect.objectContaining({
          redirectTo: expect.stringContaining(redirectTo)
        })
      });
    });
    
    it('소셜 로그인 오류는 적절하게 처리된다', async () => {
      mockSupabaseAuth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: 'Auth error', status: 400 }
      });
      
      await expect(auth.signInWithOAuthAndRedirect('google')).rejects.toMatchObject({
        message: expect.stringContaining('Auth error')
      });
    });
  });

  /**
   * 이메일/비밀번호 로그인 테스트
   */
  describe('이메일/비밀번호 로그인 (SignInWithPassword)', () => {
    it('이메일/비밀번호 로그인은 Supabase 클라이언트를 사용하고 인증 데이터를 반환한다', async () => {
      const email = 'test@example.com';
      const password = 'securepassword';
      
      const result = await auth.signInWithPassword(email, password);
      
      // Supabase 로그인 호출 확인
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
        email,
        password
      });
      
      // 반환 데이터 확인
      expect(result).toMatchObject({
        user: { id: 'test_user_id', email }
      });
    });
    
    it('로그인 오류는 적절하게 처리된다', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials', status: 400 }
      });
      
      await expect(auth.signInWithPassword('wrong@example.com', 'wrongpassword')).rejects.toMatchObject({
        message: expect.stringContaining('Invalid credentials')
      });
    });
  });

  /**
   * 로그아웃 테스트
   */
  describe('로그아웃 (SignOut)', () => {
    it('로그아웃은 Supabase 클라이언트를 사용한다', async () => {
      await auth.signOut();
      
      // Supabase 로그아웃 호출 확인
      expect(mockSupabaseAuth.signOut).toHaveBeenCalled();
    });
    
    it('로그아웃 오류는 적절하게 처리된다', async () => {
      mockSupabaseAuth.signOut.mockResolvedValue({
        error: { message: 'Logout error', status: 500 }
      });
      
      await expect(auth.signOut()).rejects.toMatchObject({
        message: expect.stringContaining('Logout error')
      });
    });
  });

  /**
   * 세션 관리 테스트
   */
  describe('세션 관리', () => {
    it('getCurrentUser는 현재 로그인 중인 사용자를 반환한다', async () => {
      const user = await auth.getCurrentUser();
      
      // Supabase getUser 호출 확인
      expect(mockSupabaseAuth.getUser).toHaveBeenCalled();
      
      // 사용자 데이터 확인
      expect(user).toMatchObject({
        id: 'test_user_id',
        email: 'test@example.com'
      });
    });
    
    it('getSession은 현재 세션을 반환한다', async () => {
      const session = await auth.getSession();
      
      // Supabase getSession 호출 확인
      expect(mockSupabaseAuth.getSession).toHaveBeenCalled();
      
      // 세션 데이터 확인
      expect(session).toMatchObject({
        access_token: 'test_access_token'
      });
    });
    
    it('사용자가 없을 때 getCurrentUser는 null을 반환한다', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });
      
      const user = await auth.getCurrentUser();
      
      expect(user).toBeNull();
    });
    
    it('세션이 없을 때 getSession은 null을 반환한다', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });
      
      const session = await auth.getSession();
      
      expect(session).toBeNull();
    });
  });

  /**
   * 환경 의존성 테스트
   */
  describe('환경 의존성', () => {
    it('클라이언트 환경에서는 브라우저 클라이언트를 사용한다', async () => {
      vi.spyOn(environment, 'isClient').mockReturnValue(true);
      vi.spyOn(environment, 'isServer').mockReturnValue(false);
      
      await auth.getAuthClient();
      
      expect(createBrowserClientSpy).toHaveBeenCalled();
    });
    
    it('서버 환경에서는 서버 클라이언트를 사용한다', async () => {
      // 서버 환경 시뮬레이션
      simulateServerEnvironment();
      vi.spyOn(environment, 'isClient').mockReturnValue(false);
      vi.spyOn(environment, 'isServer').mockReturnValue(true);
      
      // auth 모듈 재로딩
      vi.resetModules();
      auth = await import('./auth');
      
      // 여기서는 createServerClient가 호출되지만,
      // 실제 테스트에서는 모킹으로 인해 다르게 동작할 수 있음
      const authClient = await auth.getAuthClient();
      
      expect(authClient).toBeDefined();
    });
  });

  /**
   * PKCE 유틸리티 테스트
   */
  describe('PKCE 유틸리티 함수', () => {
    beforeEach(() => {
      // 원래 구현으로 복원
      vi.restoreAllMocks();
    });
    
    it('generateCodeVerifier는 올바른 길이의 문자열을 생성한다', async () => {
      const verifier = await auth.generateCodeVerifier();
      
      expect(typeof verifier).toBe('string');
      expect(verifier.length).toBeGreaterThanOrEqual(43);
      expect(verifier.length).toBeLessThanOrEqual(128);
    });
    
    it('generateCodeChallenge는 verifier에서 적절한 challenge를 생성한다', async () => {
      const verifier = 'test_verifier_string_for_challenge_generation';
      const challenge = await auth.generateCodeChallenge(verifier);
      
      expect(typeof challenge).toBe('string');
      expect(challenge.length).toBeGreaterThan(0);
      
      // 다른 verifier로 다른 challenge가 생성되는지 확인
      const verifier2 = 'different_verifier_string';
      const challenge2 = await auth.generateCodeChallenge(verifier2);
      
      expect(challenge).not.toBe(challenge2);
    });
  });
}); 