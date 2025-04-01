/**
 * 파일명: route.test.ts
 * 목적: 인증 상태 API 엔드포인트 테스트
 * 역할: 로그인 상태 확인 및 사용자 정보 반환 API 기능 검증
 * 작성일: 2024-04-01
 */

import { NextResponse } from 'next/server';
import { expect, vi, describe, it, beforeEach } from 'vitest';
import { GET } from './route';

// Mock client 객체 정의
const mockAuthClient = {
  getUser: vi.fn()
};

// createClient 모킹
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(() => ({
    auth: mockAuthClient
  }))
}));

// NextResponse 모킹
vi.mock('next/server', () => {
  const mockResponse = (data: any, init: any = {}) => {
    return {
      status: init?.status || 200,
      json: async () => data,
    };
  };
  
  return {
    NextResponse: {
      json: vi.fn().mockImplementation((data, init) => mockResponse(data, init)),
    },
  };
});

describe('인증 상태 API 테스트', () => {
  // 콘솔 모킹
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('로그인한 사용자의 정보를 반환해야 함', async () => {
    // 로그인된 사용자 정보 모킹
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      app_metadata: {
        provider: 'google',
      },
    };
    
    // Supabase getUser 응답 모킹
    mockAuthClient.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });
    
    const response = await GET();
    const data = await response.json();
    
    // 응답 검증
    expect(response.status).toBe(200);
    expect(data).toEqual({
      loggedIn: true,
      user: {
        id: 'user-123',
        email: 'test@example.com',
        provider: 'google',
      },
    });
    
    // Supabase 클라이언트 호출 검증
    expect(mockAuthClient.getUser).toHaveBeenCalled();
    
    // 콘솔 에러가 호출되지 않았는지 검증
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('로그인하지 않은 사용자에 대해 loggedIn: false 반환해야 함', async () => {
    // 로그인하지 않은 사용자 모킹
    mockAuthClient.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });
    
    const response = await GET();
    const data = await response.json();
    
    // 응답 검증
    expect(response.status).toBe(200);
    expect(data).toEqual({
      loggedIn: false,
      user: null,
    });
    
    // Supabase 클라이언트 호출 검증
    expect(mockAuthClient.getUser).toHaveBeenCalled();
  });

  it('인증 오류 발생 시 오류 메시지를 반환해야 함', async () => {
    // 인증 오류 모킹
    mockAuthClient.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: '세션이 만료되었습니다' },
    });
    
    const response = await GET();
    const data = await response.json();
    
    // 응답 검증
    expect(response.status).toBe(200);
    expect(data).toEqual({
      loggedIn: false,
      error: '세션이 만료되었습니다',
    });
  });

  it('외부 모듈 예외 발생 시 500 오류 반환해야 함', async () => {
    // 예외 발생 시나리오 모킹
    mockAuthClient.getUser.mockRejectedValueOnce(
      new Error('Supabase 연결 오류')
    );
    
    const response = await GET();
    const data = await response.json();
    
    // 응답 검증
    expect(response.status).toBe(500);
    expect(data).toEqual({
      loggedIn: false,
      error: '인증 상태 확인 중 오류가 발생했습니다',
    });
    
    // 콘솔 에러 호출 검증
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '인증 상태 확인 중 오류:',
      expect.any(Error)
    );
  });

  it('app_metadata가 없는 사용자에 대해 provider를 "unknown"으로 설정해야 함', async () => {
    // app_metadata가 없는 사용자 모킹
    const mockUserWithoutMetadata = {
      id: 'user-456',
      email: 'no-metadata@example.com',
      // app_metadata가 없음
    };
    
    // Supabase getUser 응답 모킹
    mockAuthClient.getUser.mockResolvedValueOnce({
      data: { user: mockUserWithoutMetadata },
      error: null,
    });
    
    const response = await GET();
    const data = await response.json();
    
    // 응답 검증
    expect(response.status).toBe(200);
    expect(data).toEqual({
      loggedIn: true,
      user: {
        id: 'user-456',
        email: 'no-metadata@example.com',
        provider: 'unknown',
      },
    });
  });
}); 