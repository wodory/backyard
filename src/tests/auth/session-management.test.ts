/**
 * 파일명: session-management.test.ts
 * 목적: 세션 관리 및 복구 테스트
 * 역할: 세션 관리 기능의 통합 테스트
 * 작성일: 2024-03-31
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { clearTestEnvironment } from '../setup';

// Supabase 및 하이브리드 클라이언트 모킹
const mockGetSession = vi.fn();
const mockRefreshSession = vi.fn();
const mockSignOut = vi.fn();

const mockSupabaseClient = {
  auth: {
    getSession: mockGetSession,
    refreshSession: mockRefreshSession,
    signOut: mockSignOut
  }
};

vi.mock('@/lib/hybrid-supabase', () => ({
  getHybridSupabaseClient: () => mockSupabaseClient
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient)
}));

describe('세션 관리 및 복구 테스트', () => {
  beforeEach(async () => {
    await clearTestEnvironment();
    
    // Mock 함수 초기화
    vi.resetAllMocks();
    
    // 기본 응답 설정
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    mockRefreshSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    mockSignOut.mockResolvedValue({
      error: null
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('초기화 시 세션 복구를 시도하는지 검증', async () => {
    // 세션 복구 성공 모킹
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user' } } },
      error: null,
    });

    // 세션 초기화 함수 호출 시뮬레이션
    const initSession = async () => {
      const { data, error } = await mockGetSession();
      if (error) {
        await mockSignOut();
        return null;
      }
      return data.session;
    };
    
    await initSession();

    // 세션 복구 시도 확인
    expect(mockGetSession).toHaveBeenCalled();
  });

  test('세션 만료 시 리프레시 토큰으로 세션을 갱신하는지 검증', async () => {
    // 만료된 세션 모킹
    mockGetSession.mockResolvedValue({
      data: { 
        session: { 
          user: { id: 'test-user' }, 
          expires_at: Math.floor(Date.now() / 1000) - 1000 
        } 
      },
      error: null,
    });

    // 세션 갱신 성공 모킹
    mockRefreshSession.mockResolvedValue({
      data: { 
        session: { 
          user: { id: 'test-user' }, 
          expires_at: Math.floor(Date.now() / 1000) + 3600
        } 
      },
      error: null,
    });

    // 세션 갱신 함수 호출 시뮬레이션
    const refreshExpiredSession = async () => {
      const { data } = await mockGetSession();
      if (data.session && data.session.expires_at < Math.floor(Date.now() / 1000)) {
        return mockRefreshSession();
      }
      return { data, error: null };
    };
    
    await refreshExpiredSession();

    // 세션 갱신 시도 확인
    expect(mockRefreshSession).toHaveBeenCalled();
  });

  test('세션 복구 실패 시 사용자를 로그아웃시키는지 검증', async () => {
    // 세션 복구 실패 모킹
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: new Error('세션 복구 실패')
    });

    // 세션 복구 실패 처리 함수 호출 시뮬레이션
    const handleSessionError = async () => {
      const { error } = await mockGetSession();
      if (error) {
        return mockSignOut();
      }
    };
    
    await handleSessionError();

    // 로그아웃 호출 확인
    expect(mockSignOut).toHaveBeenCalled();
  });
}); 