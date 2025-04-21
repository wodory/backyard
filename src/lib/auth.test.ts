/**
 * 파일명: src/lib/auth.test.ts
 * 목적: Auth 모듈의 함수들을 테스트
 * 역할: 인증 관련 기능의 정상 동작 및 에러 처리 검증
 * 작성일: 2025-04-01
 * 수정일: 2025-04-09
 * 수정일: 2024-05-18 : 클라이언트 인증 유틸 정리에 따른 테스트 수정
 */

// vi.mock은 파일 최상단으로 호이스팅되므로 import 위에 작성
// 비어있는 객체로 기본 모킹을 설정하고 테스트 내에서 구현 정의
vi.mock('./logger', () => {
  // 모킹된 로거 메서드들을 생성
  const mockDebug = vi.fn();
  const mockInfo = vi.fn();
  const mockWarn = vi.fn();
  const mockError = vi.fn();
  
  // 실제 로거 객체와 유사한 모킹된 로거 객체 반환
  const mockLogger = {
    debug: mockDebug,
    info: mockInfo,
    warn: mockWarn,
    error: mockError
  };
  
  // 로거 팩토리 함수 모킹
  const createLoggerMock = vi.fn(() => mockLogger);
  
  return {
    default: createLoggerMock,
    logger: mockLogger,
    __esModule: true
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
  getAuthClient, 
  signIn, 
  signUp, 
  signOut,
  signInWithGoogle,
  getCurrentUser,
  exchangeCodeForSession,
  getSession,
  getUser,
} from './auth';
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
    });
    
    // 전역 localStorage 및 sessionStorage 모킹
    vi.stubGlobal('localStorage', window.localStorage);
    vi.stubGlobal('sessionStorage', window.sessionStorage);

    // fetch 모킹
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('success'),
      json: () => Promise.resolve({ success: true }),
    });
    
    // 명시적으로 isClient가 항상 true 반환하도록 확인
    vi.mocked(environmentModule.isClient).mockReturnValue(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getAuthClient 함수', () => {
    it('브라우저 환경에서 Supabase 클라이언트를 반환해야 함', () => {
      const client = getAuthClient();
      expect(client).toBe(mockClient);
      expect(createClient).toHaveBeenCalled();
    });

    it('서버 환경에서 호출 시 오류를 던져야 함', () => {
      vi.mocked(environmentModule.isClient).mockReturnValueOnce(false);
      expect(() => getAuthClient()).toThrow('브라우저 환경에서만 사용 가능합니다.');
    });
  });

  describe('signUp 함수', () => {
    it('성공적으로 사용자를 생성하고 API를 호출해야 함', async () => {
      // 성공 응답 모킹
      const mockUser = { id: 'user123', email: 'test@example.com' };
      mockAuthFunctions.signUp.mockResolvedValueOnce({ 
        data: { user: mockUser }, 
        error: null 
      });

      // 함수 호출
      const result = await signUp('test@example.com', 'password123', 'Test User');

      // Supabase 인증 API 호출 검증
      expect(mockAuthFunctions.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      // API 호출 검증
      expect(mockFetch).toHaveBeenCalledWith('/api/user/register', expect.any(Object));
      expect(mockFetch.mock.calls[0][1].body).toContain('Test User');

      // 반환 값 검증
      expect(result.user).toBe(mockUser);
    });

    it('Supabase 오류 발생 시 오류를 던져야 함', async () => {
      // 오류 응답 모킹
      const mockError = new Error('회원가입 실패');
      mockAuthFunctions.signUp.mockResolvedValueOnce({ 
        data: { user: null }, 
        error: mockError
      });

      // 오류 전파 확인
      await expect(signUp('test@example.com', 'password123')).rejects.toThrow(mockError);
      expect(mockFetch).not.toHaveBeenCalled(); // API 호출이 되지 않아야 함
    });

    it('사용자 데이터가 없을 경우 오류를 던져야 함', async () => {
      // 사용자 데이터 없음 모킹
      mockAuthFunctions.signUp.mockResolvedValueOnce({ 
        data: { user: null }, 
        error: null
      });

      // 오류 전파 확인
      await expect(signUp('test@example.com', 'password123')).rejects.toThrow('사용자 생성 실패');
      expect(mockFetch).not.toHaveBeenCalled(); // API 호출이 되지 않아야 함
    });

    it('API 호출 실패 시에도 사용자는 반환해야 함', async () => {
      // 성공 응답 모킹
      const mockUser = { id: 'user123', email: 'test@example.com' };
      mockAuthFunctions.signUp.mockResolvedValueOnce({ 
        data: { user: mockUser }, 
        error: null 
      });

      // API 호출 실패 모킹
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('API 오류'),
      });

      // 함수 호출 및 결과 검증
      const result = await signUp('test@example.com', 'password123');
      expect(result.user).toBe(mockUser); // 여전히 사용자 데이터는 반환됨
    });
  });

  describe('signIn 함수', () => {
    it('성공적으로 로그인해야 함', async () => {
      // 성공 응답 모킹
      const mockSession = { accessToken: 'token123' };
      mockAuthFunctions.signInWithPassword.mockResolvedValueOnce({ 
        data: { session: mockSession, user: { id: 'user123' } },
        error: null 
      });

      // 함수 호출
      const result = await signIn('test@example.com', 'password123');

      // Supabase 인증 API 호출 검증
      expect(mockAuthFunctions.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      // 반환 값 검증
      expect(result.session).toBe(mockSession);
    });

    it('로그인 실패 시 오류를 던져야 함', async () => {
      // 오류 응답 모킹
      const mockError = new Error('로그인 실패');
      mockAuthFunctions.signInWithPassword.mockResolvedValueOnce({ 
        data: {}, 
        error: mockError 
      });

      // 오류 전파 확인
      await expect(signIn('test@example.com', 'password123')).rejects.toThrow(mockError);
    });
  });

  describe('signInWithGoogle 함수', () => {
    it('Google OAuth URL을 생성해야 함', async () => {
      // OAuth URL 생성 성공 모킹
      const mockOAuthUrl = 'https://accounts.google.com/o/oauth2/auth?...';
      mockAuthFunctions.signInWithOAuth.mockResolvedValueOnce({ 
        data: { url: mockOAuthUrl }, 
        error: null 
      });

      // 함수 호출
      const result = await signInWithGoogle();

      // Supabase OAuth API 호출 검증
      expect(mockAuthFunctions.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'https://example.com/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      // 반환 값 검증
      expect(result.success).toBe(true);
      expect(result.url).toBe(mockOAuthUrl);
    });

    it('브라우저 환경이 아닌 경우 오류를 반환해야 함', async () => {
      // 서버 환경 시뮬레이션
      vi.mocked(environmentModule.isClient).mockReturnValueOnce(false);

      // 함수 호출 및 결과 검증
      const result = await signInWithGoogle();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockAuthFunctions.signInWithOAuth).not.toHaveBeenCalled();
    });

    it('OAuth URL 생성 실패 시 오류를 반환해야 함', async () => {
      // OAuth 오류 모킹
      const mockError = new Error('OAuth 실패');
      mockAuthFunctions.signInWithOAuth.mockResolvedValueOnce({ 
        data: {}, 
        error: mockError 
      });

      // 함수 호출 및 결과 검증
      const result = await signInWithGoogle();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('OAuth URL이 반환되지 않을 경우 오류를 반환해야 함', async () => {
      // URL 없는 응답 모킹
      mockAuthFunctions.signInWithOAuth.mockResolvedValueOnce({ 
        data: { url: null }, 
        error: null 
      });

      // 함수 호출 및 결과 검증
      const result = await signInWithGoogle();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('signOut 함수', () => {
    it('로그아웃이 성공해야 함', async () => {
      // 로그아웃 성공 모킹
      mockAuthFunctions.signOut.mockResolvedValueOnce({ error: null });

      // 함수 호출
      await signOut();

      // Supabase 로그아웃 API 호출 검증
      expect(mockAuthFunctions.signOut).toHaveBeenCalled();
    });

    it('로그아웃 실패 시 오류를 던져야 함', async () => {
      // 로그아웃 오류 모킹
      const mockError = new Error('로그아웃 실패');
      mockAuthFunctions.signOut.mockResolvedValueOnce({ error: mockError });

      // 오류 전파 확인
      await expect(signOut()).rejects.toThrow(mockError);
    });
  });

  describe('getCurrentUser 함수', () => {
    it('사용자 정보를 반환해야 함', async () => {
      // 사용자 정보 성공 모킹
      const mockUser = { id: 'user123', email: 'test@example.com' };
      mockAuthFunctions.getUser.mockResolvedValueOnce({ 
        data: { user: mockUser }, 
        error: null 
      });

      // DB 사용자 정보 성공 모킹
      const mockDbUser = { id: 'user123', name: 'Test User' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDbUser),
      });

      // 함수 호출
      const result = await getCurrentUser();

      // API 호출 검증
      expect(mockAuthFunctions.getUser).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(`/api/user/${mockUser.id}`);

      // 반환 값 검증
      expect(result).toEqual({
        ...mockUser,
        dbUser: mockDbUser,
      });
    });

    it('사용자 정보 없을 경우 null을 반환해야 함', async () => {
      // 사용자 정보 없음 모킹
      mockAuthFunctions.getUser.mockResolvedValueOnce({ 
        data: { user: null }, 
        error: null 
      });

      // 함수 호출 및 결과 검증
      const result = await getCurrentUser();
      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('사용자 정보 조회 실패 시 null을 반환해야 함', async () => {
      mockAuthFunctions.getUser.mockRejectedValueOnce(new Error('인증 실패'));
      
      // 함수 호출
      const result = await getCurrentUser();
      
      // 검증
      expect(result).toBeNull();
      
      // mockFetch 호출 검증 - '/api/user/' 경로로 시작하는 요청만 필터링하여 검증
      const userApiCalls = mockFetch.mock.calls.filter(call => 
        typeof call[0] === 'string' && call[0].startsWith('/api/user/')
      );
      expect(userApiCalls.length).toBe(0);
    });

    it('DB 사용자 정보 조회 실패해도 기본 사용자 정보를 반환해야 함', async () => {
      // 사용자 정보 성공 모킹
      const mockUser = { id: 'user123', email: 'test@example.com' };
      mockAuthFunctions.getUser.mockResolvedValueOnce({ 
        data: { user: mockUser }, 
        error: null 
      });

      // DB 사용자 정보 실패 모킹
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      // 함수 호출 및 결과 검증
      const result = await getCurrentUser();
      expect(result).toEqual(mockUser); // DB 정보 없이 기본 사용자 정보만 반환
    });
  });

  describe('유틸리티 함수', () => {
    it('getSession 함수가 Supabase 세션을 조회해야 함', async () => {
      // 세션 정보 모킹
      const mockSession = { accessToken: 'token123' };
      mockAuthFunctions.getSession.mockResolvedValueOnce({ 
        data: { session: mockSession }, 
        error: null 
      });

      // 함수 호출
      const result = await getSession();

      // API 호출 검증
      expect(mockAuthFunctions.getSession).toHaveBeenCalled();
      
      // 반환 값 검증
      expect(result).toEqual({
        data: { session: mockSession },
        error: null
      });
    });

    it('getUser 함수가 Supabase 사용자를 조회해야 함', async () => {
      // 사용자 정보 모킹
      const mockUser = { id: 'user123', email: 'test@example.com' };
      mockAuthFunctions.getUser.mockResolvedValueOnce({ 
        data: { user: mockUser }, 
        error: null 
      });

      // 함수 호출
      const result = await getUser();

      // API 호출 검증
      expect(mockAuthFunctions.getUser).toHaveBeenCalled();
      
      // 반환 값 검증
      expect(result).toEqual({
        data: { user: mockUser },
        error: null
      });
    });

    it('exchangeCodeForSession 함수가 인증 코드를 세션으로 교환해야 함', async () => {
      // 세션 교환 성공 모킹
      const mockSession = { accessToken: 'token123' };
      mockAuthFunctions.exchangeCodeForSession.mockResolvedValueOnce({ 
        data: { session: mockSession },
        error: null 
      });

      // 함수 호출
      const result = await exchangeCodeForSession('auth-code-123');

      // API 호출 검증
      expect(mockAuthFunctions.exchangeCodeForSession).toHaveBeenCalledWith('auth-code-123');
      
      // 반환 값 검증
      expect(result).toEqual({ session: mockSession });
    });

    it('exchangeCodeForSession 실패 시 오류를 던져야 함', async () => {
      // 세션 교환 실패 모킹
      const mockError = new Error('코드 교환 실패');
      mockAuthFunctions.exchangeCodeForSession.mockResolvedValueOnce({ 
        data: null,
        error: mockError 
      });

      // 오류 전파 검증
      await expect(exchangeCodeForSession('invalid-code')).rejects.toThrow(mockError);
    });
  });
}); 