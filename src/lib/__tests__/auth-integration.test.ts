/**
 * 파일명: src/lib/__tests__/auth-integration.test.ts
 * 목적: 인증 관련 모듈의 통합 테스트
 * 역할: auth.ts와 Supabase 인증 간의 상호작용 테스트
 * 작성일: 2024-04-16
 */

import { vi, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/msw/server';

// 테스트 대상 모듈들을 모킹 설정 이후에 임포트하기 위해 동적 임포트 사용
let auth: typeof import('../auth');
let environment: typeof import('../environment');

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
  auth = await import('../auth');
  environment = await import('../environment');
  
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
    mockStorage.getItem.mockReset();
    mockStorage.setItem.mockReset();
    mockStorage.removeItem.mockReset();
    mockStorage.clear.mockReset();
    vi.unstubAllGlobals();
  });

  describe('로그인 테스트', () => {
    it('성공적인 로그인 처리', async () => {
      // 로그인 수행
      const result = await auth.signIn('test@example.com', 'password123');
      
      // 결과 검증
      expect(result).toBeDefined();
      // auth.signIn()은 이제 data 객체를 직접 반환합니다
      expect(result.session).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe('test_user_id');
      
      // Supabase 호출 검증
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
    
    it('로그인 오류 처리', async () => {
      // 오류 응답 설정
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
        data: { session: null, user: null },
        error: { message: '잘못된 로그인 정보', status: 400 }
      });
      
      // 로그인 실패 검증
      await expect(auth.signIn('wrong@example.com', 'wrongpass')).rejects.toThrow();
      
      // Supabase 호출 검증
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'wrong@example.com',
        password: 'wrongpass'
      });
    });
  });
  
  describe('로그아웃 테스트', () => {
    it('성공적인 로그아웃 처리', async () => {
      // 로그아웃 수행
      await auth.signOut();
      
      // Supabase signOut 호출 검증
      expect(mockSupabaseAuth.signOut).toHaveBeenCalled();
    });

    it('로그아웃 중 오류 발생시 예외를 던진다', async () => {
      // 오류 모킹
      mockSupabaseAuth.signOut.mockResolvedValueOnce({
        error: { message: '로그아웃 실패', status: 400 }
      });

      // 로그아웃 실패 확인
      await expect(auth.signOut()).rejects.toThrow();
    });
  });

  describe('환경 검사 테스트', () => {
    it('클라이언트 환경 확인', async () => {
      simulateClientEnvironment();
      vi.spyOn(environment, 'isClient').mockReturnValue(true);
      vi.spyOn(environment, 'isServer').mockReturnValue(false);

      expect(environment.isClient()).toBe(true);
      expect(environment.isServer()).toBe(false);
      
      // 클라이언트 환경에서 정상 작동 확인
      const client = auth.getAuthClient();
      expect(client).toBeDefined();
    });
    
    it('서버 환경 확인', async () => {
      simulateServerEnvironment();
      vi.spyOn(environment, 'isClient').mockReturnValue(false);
      vi.spyOn(environment, 'isServer').mockReturnValue(true);
      
      expect(environment.isServer()).toBe(true);
      expect(environment.isClient()).toBe(false);
      
      // 서버 환경에서 auth.getAuthClient 호출 시 예외 발생 확인
      expect(() => auth.getAuthClient()).toThrow('브라우저 환경에서만 사용');
    });
  });

  describe('Google OAuth 인증 흐름', () => {
    it('Google 로그인을 시작한다', async () => {
      // 클라이언트 환경 확인
      expect(environment.isClient()).toBe(true);
      
      const result = await auth.signInWithGoogle();
      
      // Supabase API 호출 확인
      expect(mockSupabaseAuth.signInWithOAuth).toHaveBeenCalled();
      
      // 호출 인수 구조 확인
      const callArgs = mockSupabaseAuth.signInWithOAuth.mock.calls[0][0];
      expect(callArgs).toHaveProperty('provider', 'google');
      expect(callArgs).toHaveProperty('options');
      expect(callArgs.options).toHaveProperty('queryParams');
      expect(callArgs.options.queryParams).toHaveProperty('code_challenge');
      expect(callArgs.options.queryParams).toHaveProperty('code_challenge_method', 'S256');
      
      // OAuth URL 반환 확인
      expect(result).toEqual({
        success: true,
        url: expect.stringContaining('code_challenge=test_challenge')
      });
    });
    
    it('OAuth 클라이언트가 에러를 반환하면 로그인이 실패한다', async () => {
      // 오류 시나리오 모킹
      mockSupabaseAuth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: '인증 서버에 연결할 수 없습니다' }
      });
      
      const result = await auth.signInWithGoogle();
      
      expect(result).toEqual({
        success: false,
        error: '로그인 처리 중 오류가 발생했습니다.'
      });
    });
  });

  describe('세션 관리', () => {
    it('현재 사용자 정보를 가져온다', async () => {
      const user = await auth.getCurrentUser();
      
      // Supabase getUser 호출 확인
      expect(mockSupabaseAuth.getUser).toHaveBeenCalled();
      
      // 사용자 정보 확인
      expect(user).toMatchObject({
        id: 'test_user_id',
        email: 'test@example.com'
      });
    });

    it('세션 정보를 가져온다', async () => {
      const { data } = await auth.getSession();
      
      // Supabase getSession 호출 확인
      expect(mockSupabaseAuth.getSession).toHaveBeenCalled();
      
      // 세션 정보 확인
      expect(data.session).toBeDefined();
      if (data.session) { // null 체크 추가
        expect(data.session.access_token).toBe('test_access_token');
      }
    });

    it('사용자 정보 조회에 실패하면 null을 반환한다', async () => {
      // getUser 함수가 오류를 반환하도록 모킹
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: '세션이 유효하지 않습니다', status: 401 }
      });
      
      const user = await auth.getCurrentUser();
      
      expect(user).toBeNull();
    });
  });

  describe('PKCE 함수', () => {
    it('문자열 길이가 43-128인 코드 검증기를 생성한다', async () => {
      vi.restoreAllMocks(); // 이전 모킹을 복원
      
      const verifier = await auth.generateCodeVerifier();
      
      expect(verifier.length).toBeGreaterThanOrEqual(43);
      expect(verifier.length).toBeLessThanOrEqual(128);
      expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/); // RFC 7636 문자셋
    });

    it('코드 검증기에서 코드 챌린지를 생성한다', async () => {
      const verifier = 'test_verifier';
      vi.restoreAllMocks(); // 이전 모킹을 복원
      
      const challenge = await auth.generateCodeChallenge(verifier);
      
      expect(challenge).toBeDefined();
      expect(challenge.length).toBeGreaterThan(0);
      expect(challenge).not.toContain('='); // Base64URL은 padding(=)을 포함하지 않음
      expect(challenge).not.toContain('+'); // Base64URL은 +를 -로 대체
      expect(challenge).not.toContain('/'); // Base64URL은 /를 _로 대체
    });
  });
});

describe('auth 모듈 추가 테스트', () => {
  beforeEach(() => {
    // 클라이언트 환경으로 복원
    vi.spyOn(environment, 'isClient').mockReturnValue(true);
    vi.spyOn(environment, 'isServer').mockReturnValue(false);
    
    vi.clearAllMocks();
    mockStorage.getItem.mockReset();
    mockStorage.setItem.mockReset();
    mockStorage.removeItem.mockReset();
  });
  
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  
  it('브라우저 환경이 아닐 때 getAuthClient 호출 시 에러를 발생시킨다', () => {
    // 서버 환경으로 설정
    vi.spyOn(environment, 'isClient').mockReturnValue(false);
    
    expect(() => auth.getAuthClient()).toThrow('브라우저 환경에서만 사용 가능합니다');
  });
  
  it('Google 로그인 시 브라우저 환경이 아닐 때 오류를 반환한다', async () => {
    // 서버 환경으로 설정
    vi.spyOn(environment, 'isClient').mockReturnValue(false);
    
    const result = await auth.signInWithGoogle();
    
    expect(result).toEqual({
      success: false,
      error: expect.any(String)
    });
  });
  
  it('로그인 중 오류가 발생하면 오류를 전파한다', async () => {
    // 오류 발생 모킹
    mockSupabaseAuth.signInWithPassword.mockRejectedValue(new Error('로그인 오류'));
    
    // 오류 전파 확인
    await expect(auth.signIn('test@example.com', 'password')).rejects.toThrow('로그인 오류');
  });
  
  it('signUp이 성공하면 사용자 객체를 반환한다', async () => {
    // 회원가입 성공 모킹
    mockSupabaseAuth.signUp.mockResolvedValue({
      data: {
        user: { id: 'new_user_id', email: 'new@example.com' }
      },
      error: null
    });
    
    // fetch 모킹 (사용자 DB 정보 저장 API)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: 'new_user_id', email: 'new@example.com' }),
      text: vi.fn().mockResolvedValue('')
    });
    
    const result = await auth.signUp('new@example.com', 'password123', 'New User');
    
    expect(result).toHaveProperty('user');
    expect(result.user).toHaveProperty('id', 'new_user_id');
    expect(global.fetch).toHaveBeenCalledWith('/api/user/register', expect.anything());
  });
  
  it('signUp API 호출 중 오류가 발생해도 사용자 생성은 성공한다', async () => {
    // 회원가입 성공 모킹
    mockSupabaseAuth.signUp.mockResolvedValue({
      data: {
        user: { id: 'new_user_id', email: 'new@example.com' }
      },
      error: null
    });
    
    // API 오류 모킹
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue('DB 오류')
    });
    
    // 콘솔 경고 모니터링
    const originalConsoleWarn = console.warn;
    console.warn = vi.fn();
    
    try {
      const result = await auth.signUp('new@example.com', 'password123');
      
      // 경고 로깅 확인
      expect(console.warn).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
    } finally {
      console.warn = originalConsoleWarn;
    }
  });
  
  it('signUp 인증 오류 시 오류를 전파한다', async () => {
    // 인증 오류 모킹
    mockSupabaseAuth.signUp.mockResolvedValue({
      data: { user: null },
      error: { message: '이메일이 이미 사용 중입니다' }
    });
    
    await expect(auth.signUp('existing@example.com', 'password')).rejects.toHaveProperty(
      'message',
      '이메일이 이미 사용 중입니다'
    );
  });
  
  it('getCurrentUser에서 오류가 발생하면 null을 반환한다', async () => {
    // 오류 반환 모킹
    mockSupabaseAuth.getUser.mockRejectedValue(new Error('세션 오류'));
    
    const user = await auth.getCurrentUser();
    
    expect(user).toBeNull();
  });
});

describe('세션 관리 고급 테스트', () => {
  beforeEach(() => {
    simulateClientEnvironment();
    vi.spyOn(environment, 'isClient').mockReturnValue(true);
    
    vi.clearAllMocks();
    
    // crypto.randomUUID 모킹
    if (!crypto.randomUUID) {
      Object.defineProperty(crypto, 'randomUUID', {
        value: vi.fn().mockReturnValue('mocked-uuid'),
        configurable: true
      });
    } else {
      vi.spyOn(crypto, 'randomUUID').mockReturnValue('mocked-uuid');
    }
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  
  it('getSession이 null 세션을 반환하면 빈 데이터 객체를 반환한다', async () => {
    // null 세션 모킹
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    const { data } = await auth.getSession();
    
    expect(data).toEqual({ session: null });
  });
  
  it('getSession에서 오류가 발생하면 오류 객체를 반환한다', async () => {
    // 오류 발생 모킹
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: '세션 가져오기 실패' }
    });
    
    const { error } = await auth.getSession();
    
    expect(error).toEqual({ message: '세션 가져오기 실패' });
  });
});

describe('DB 사용자 정보 가져오기 테스트', () => {
  beforeEach(() => {
    simulateClientEnvironment();
    vi.spyOn(environment, 'isClient').mockReturnValue(true);
    vi.clearAllMocks();
    
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: { id: 'test_user_id', email: 'test@example.com' } },
      error: null
    });
  });
  
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  
  it('로그인 상태에서 getCurrentUser가 DB 사용자 정보를 가져온다', async () => {
    // fetch 모킹
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        id: 'test_user_id',
        name: '테스트 사용자',
        profile: { avatarUrl: 'https://example.com/avatar.jpg' }
      })
    });
    
    const user = await auth.getCurrentUser();
    
    // DB 사용자 정보가 포함된 확장 사용자 객체를 반환했는지 확인
    expect(user).not.toBeNull();
    if (user) {
      expect(user).toHaveProperty('id', 'test_user_id');
      expect(user).toHaveProperty('dbUser');
      expect(user.dbUser).toHaveProperty('name', '테스트 사용자');
      expect(user.dbUser).toHaveProperty('profile.avatarUrl');
    }
    expect(global.fetch).toHaveBeenCalledWith(`/api/user/test_user_id`);
  });
  
  it('DB 정보 가져오기 실패시에도 기본 사용자 정보만 반환한다', async () => {
    // DB 정보 가져오기 실패 모킹
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockRejectedValue(new Error('DB 오류'))
    });
    
    const user = await auth.getCurrentUser();
    
    // DB 정보 없이 기본 사용자 정보만 있는지 확인
    expect(user).not.toBeNull();
    if (user) {
      expect(user).toHaveProperty('id', 'test_user_id');
      expect(user).toHaveProperty('email', 'test@example.com');
      // dbUser 속성이 없어야 함
      expect(user).not.toHaveProperty('dbUser');
    }
  });
}); 