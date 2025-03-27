/**
 * 파일명: middleware.test.ts
 * 목적: Next.js 미들웨어 인증 검증 테스트
 * 역할: 서버 측 미들웨어의 인증 검증 로직 테스트
 * 작성일: 2024-03-26
 */

import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals';
import { mockServerEnvironment } from '../mocks/env-mock';
import { mockSupabaseServerClient, mockSupabaseSession } from '../mocks/supabase-mock';

// Next.js Request, Response 및 NextResponse 모킹
jest.mock('next/server', () => {
  return {
    NextResponse: {
      next: jest.fn(() => ({ type: 'next' })),
      redirect: jest.fn((url) => ({ type: 'redirect', url })),
    },
  };
});

// Supabase 클라이언트 모킹
jest.mock('@supabase/supabase-js', () => {
  return {
    createServerClient: jest.fn()
  };
});

// 테스트 환경 설정
let serverEnv: { restore: () => void };
let mockSupabase: ReturnType<typeof mockSupabaseServerClient>;
let nextModule: any;

// 테스트용 URL 및 경로 설정
const TEST_BASE_URL = 'http://localhost:3000';
const PUBLIC_PATHS = ['/login', '/signup', '/reset-password'];
const PROTECTED_PATHS = ['/dashboard', '/profile', '/settings'];

describe('미들웨어 인증 테스트', () => {
  beforeEach(() => {
    // 테스트 환경 초기화
    jest.resetModules();
    
    // 서버 환경 모킹
    serverEnv = mockServerEnvironment();
    
    // Supabase 서버 클라이언트 모킹
    mockSupabase = mockSupabaseServerClient();
    require('@supabase/supabase-js').createServerClient.mockReturnValue(mockSupabase);
    
    // Next.js 모듈 가져오기
    nextModule = require('next/server');
  });
  
  afterEach(() => {
    // 테스트 환경 정리
    serverEnv.restore();
    jest.clearAllMocks();
  });
  
  // 테스트용 요청 객체 생성 함수
  const createRequest = (path: string) => {
    return {
      url: `${TEST_BASE_URL}${path}`,
      nextUrl: { pathname: path },
      cookies: {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
      },
      headers: {
        get: jest.fn(),
        has: jest.fn(),
      },
    };
  };
  
  test('인증된 사용자는 보호된 경로에 접근할 수 있는지 검증', async () => {
    // 인증된 세션 모킹
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSupabaseSession() },
      error: null
    });
    
    // 미들웨어 가져오기
    const { middleware } = await import('../../middleware');
    
    // 보호된 경로로 요청
    const request = createRequest('/dashboard');
    const response = await middleware(request);
    
    // 검증: 인증된 사용자는 접근 가능
    expect(mockSupabase.auth.getSession).toHaveBeenCalled();
    expect(nextModule.NextResponse.next).toHaveBeenCalled();
    expect(response).toHaveProperty('type', 'next');
  });
  
  test('인증되지 않은 사용자는 보호된 경로에서 로그인 페이지로 리디렉션되는지 검증', async () => {
    // 인증되지 않은 세션 모킹
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    // 미들웨어 가져오기
    const { middleware } = await import('../../middleware');
    
    // 보호된 경로로 요청
    const request = createRequest('/dashboard');
    const response = await middleware(request);
    
    // 검증: 로그인 페이지로 리디렉션
    expect(mockSupabase.auth.getSession).toHaveBeenCalled();
    expect(nextModule.NextResponse.redirect).toHaveBeenCalledWith(
      expect.stringContaining('/login')
    );
    expect(response).toHaveProperty('type', 'redirect');
    expect(response.url).toContain('/login');
  });
  
  test('인증된 사용자가 로그인 페이지에 접근하면 대시보드로 리디렉션되는지 검증', async () => {
    // 인증된 세션 모킹
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSupabaseSession() },
      error: null
    });
    
    // 미들웨어 가져오기
    const { middleware } = await import('../../middleware');
    
    // 로그인 페이지로 요청
    const request = createRequest('/login');
    const response = await middleware(request);
    
    // 검증: 대시보드로 리디렉션
    expect(mockSupabase.auth.getSession).toHaveBeenCalled();
    expect(nextModule.NextResponse.redirect).toHaveBeenCalledWith(
      expect.stringContaining('/dashboard')
    );
    expect(response).toHaveProperty('type', 'redirect');
    expect(response.url).toContain('/dashboard');
  });
  
  test('미들웨어에서 쿠키에서 리프레시 토큰을 확인하는지 검증', async () => {
    // 인증되지 않은 세션 모킹
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    // 리프레시 토큰 쿠키 존재 모킹
    const request = createRequest('/dashboard');
    request.cookies.get.mockImplementation((name) => {
      if (name === 'refresh_token') {
        return { value: 'valid-refresh-token' };
      }
      return null;
    });
    
    // 리프레시 성공 모킹
    mockSupabase.auth.refreshSession.mockResolvedValue({
      data: { session: mockSupabaseSession() },
      error: null
    });
    
    // 미들웨어 가져오기
    const { middleware } = await import('../../middleware');
    
    // 실행
    const response = await middleware(request);
    
    // 검증: 쿠키 확인 및 세션 리프레시 시도
    expect(request.cookies.get).toHaveBeenCalledWith('refresh_token');
    expect(mockSupabase.auth.refreshSession).toHaveBeenCalled();
    expect(nextModule.NextResponse.next).toHaveBeenCalled();
    expect(response).toHaveProperty('type', 'next');
  });
  
  test('공개 API 경로는 항상 접근 가능한지 검증', async () => {
    // 인증되지 않은 세션 모킹
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    // 미들웨어 가져오기
    const { middleware } = await import('../../middleware');
    
    // API 경로로 요청
    const request = createRequest('/api/public/data');
    const response = await middleware(request);
    
    // 검증: 공개 API는 인증 여부와 관계없이 접근 가능
    expect(nextModule.NextResponse.next).toHaveBeenCalled();
    expect(response).toHaveProperty('type', 'next');
  });
  
  test('정적 자산 경로는 항상 접근 가능한지 검증', async () => {
    // 인증되지 않은 세션 모킹
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    // 미들웨어 가져오기
    const { middleware } = await import('../../middleware');
    
    // 정적 자산 경로로 요청
    const staticPaths = ['/_next/static/chunk.js', '/favicon.ico', '/assets/image.png'];
    
    for (const path of staticPaths) {
      // 각 경로에 대한 요청 생성
      const request = createRequest(path);
      const response = await middleware(request);
      
      // 검증: 정적 자산은 인증 여부와 관계없이 접근 가능
      expect(nextModule.NextResponse.next).toHaveBeenCalled();
      expect(response).toHaveProperty('type', 'next');
      
      // 모킹 초기화
      jest.clearAllMocks();
    }
  });
}); 