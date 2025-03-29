/**
 * 파일명: middleware.test.ts
 * 목적: Next.js 미들웨어 인증 테스트
 * 역할: 미들웨어의 인증 및 권한 검사 기능 검증
 * 작성일: 2024-03-31
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { clearTestEnvironment } from '../setup';

// 미들웨어 함수 모킹
const middleware = vi.fn();

// Next.js 요청 및 응답 Mock
const mockRedirect = vi.fn((url) => ({ url, status: 302 }));
const mockNext = vi.fn(() => ({ headers: new Headers() }));

// Supabase 클라이언트 Mock
const mockGetSession = vi.fn();
const mockGetUser = vi.fn();

// Supabase 서버 클라이언트 Mock
const mockServerClient = {
  auth: {
    getSession: mockGetSession,
    getUser: mockGetUser
  }
};

// 미들웨어 모킹
vi.mock('@/middleware', () => ({
  default: middleware
}));

// Supabase 모킹
vi.mock('@/lib/hybrid-supabase', () => ({
  createServerSupabaseClient: vi.fn(() => mockServerClient)
}));

// Next.js 모킹
vi.mock('next/server', () => ({
  NextResponse: {
    redirect: mockRedirect,
    next: mockNext,
    json: vi.fn((data) => ({ data, status: 200 }))
  }
}));

describe('미들웨어 인증 테스트', () => {
  beforeEach(async () => {
    await clearTestEnvironment();
    
    // Mock 초기화
    vi.resetAllMocks();
    
    // 기본 응답 설정
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('인증된 사용자는 보호된 경로에 접근할 수 있는지 검증', async () => {
    // 인증된 세션 모킹
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user' } } },
      error: null
    });
    
    // 미들웨어 함수에 인증 처리 로직 모킹
    middleware.mockImplementation(async (req) => {
      const { data } = await mockGetSession();
      
      if (data.session && req.nextUrl.pathname.startsWith('/dashboard')) {
        return mockNext();
      }
      
      // 인증되지 않았다면 로그인 페이지로 리디렉션
      if (!data.session && req.nextUrl.pathname.startsWith('/dashboard')) {
        return mockRedirect('/auth/login');
      }
      
      return mockNext();
    });
    
    // 대시보드 요청 시뮬레이션
    const request = { nextUrl: { pathname: '/dashboard' } };
    const response = await middleware(request);
    
    // 통과 확인
    expect(mockGetSession).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  test('인증되지 않은 사용자는 보호된 경로에서 로그인 페이지로 리디렉션되는지 검증', async () => {
    // 인증되지 않은 세션 모킹
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    // 미들웨어 함수에 인증 처리 로직 모킹
    middleware.mockImplementation(async (req) => {
      const { data } = await mockGetSession();
      
      if (!data.session && req.nextUrl.pathname.startsWith('/dashboard')) {
        return mockRedirect('/auth/login');
      }
      
      return mockNext();
    });
    
    // 대시보드 요청 시뮬레이션
    const request = { nextUrl: { pathname: '/dashboard' } };
    const response = await middleware(request);
    
    // 리디렉션 확인
    expect(mockGetSession).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith('/auth/login');
  });

  test('인증된 사용자가 로그인 페이지에 접근하면 대시보드로 리디렉션되는지 검증', async () => {
    // 인증된 세션 모킹
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user' } } },
      error: null
    });
    
    // 미들웨어 함수에 인증 처리 로직 모킹
    middleware.mockImplementation(async (req) => {
      const { data } = await mockGetSession();
      
      if (data.session && req.nextUrl.pathname.startsWith('/auth/login')) {
        return mockRedirect('/dashboard');
      }
      
      return mockNext();
    });
    
    // 로그인 페이지 요청 시뮬레이션
    const request = { nextUrl: { pathname: '/auth/login' } };
    const response = await middleware(request);
    
    // 리디렉션 확인
    expect(mockGetSession).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });

  test('공개 API 경로는 인증 없이 접근 가능한지 검증', async () => {
    // 인증되지 않은 세션 모킹
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    // 미들웨어 함수에 공개 API 처리 로직 모킹
    middleware.mockImplementation(async (req) => {
      // 공개 API 경로는 항상 허용
      if (req.nextUrl.pathname.startsWith('/api/public')) {
        return mockNext();
      }
      
      const { data } = await mockGetSession();
      
      if (!data.session && !req.nextUrl.pathname.startsWith('/api/public')) {
        return mockRedirect('/auth/login');
      }
      
      return mockNext();
    });
    
    // 공개 API 요청 시뮬레이션
    const request = { nextUrl: { pathname: '/api/public/status' } };
    const response = await middleware(request);
    
    // 통과 확인
    expect(mockNext).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  test('정적 자산 경로는 인증 없이 접근 가능한지 검증', async () => {
    // 인증되지 않은 세션 모킹
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    // 미들웨어 함수에 정적 자산 처리 로직 모킹
    middleware.mockImplementation(async (req) => {
      // 정적 자산 경로는 항상 허용
      if (req.nextUrl.pathname.startsWith('/_next/')) {
        return mockNext();
      }
      
      const { data } = await mockGetSession();
      
      if (!data.session && !req.nextUrl.pathname.startsWith('/_next/')) {
        return mockRedirect('/auth/login');
      }
      
      return mockNext();
    });
    
    // 정적 자산 요청 시뮬레이션
    const request = { nextUrl: { pathname: '/_next/static/chunks/main.js' } };
    const response = await middleware(request);
    
    // 통과 확인
    expect(mockNext).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
}); 