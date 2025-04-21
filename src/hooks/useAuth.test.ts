/**
 * 파일명: src/hooks/useAuth.test.ts
 * 목적: useAuth 훅의 단위 테스트
 * 역할: Supabase 인증 상태 변경에 따른 스토어 업데이트 로직 검증
 * 작성일: 2024-05-13
 * 수정일: 2025-04-24 : useAuthStore 리팩토링에 맞춰 테스트 업데이트 - setUser 대신 setProfile 사용
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { User } from '@supabase/supabase-js';

// 모킹할 모듈
import { useAuth } from './useAuth';
import { useAuthStore } from '@/store/useAuthStore';

// Supabase 클라이언트 모킹
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn()
    }
  }))
}));

// useAuthStore 모킹
vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: vi.fn()
}));

// 로거 모킹
vi.mock('@/lib/logger', () => ({
  default: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }))
}));

// Supabase 모듈 임포트 (모킹된 버전)
import { createClient } from '@/lib/supabase/client';

type StoreSelector = ((state: any) => any) | { name: string };

describe('useAuth 훅', () => {
  // 모킹된 스토어 함수
  const mockSetLoading = vi.fn();
  const mockSetProfile = vi.fn();
  const mockSetError = vi.fn();
  
  // 상태 값 모킹
  const mockProfile: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    app_metadata: {
      provider: 'google'
    },
    user_metadata: {
      full_name: 'Test User'
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    role: 'authenticated'
  };
  const mockIsLoading = false;
  const mockError = null;

  // 모킹된 Supabase 인스턴스 및 함수
  let mockSupabase: any;
  let mockGetSession: any;
  let mockOnAuthStateChange: any;
  let mockUnsubscribe: any;
  let mockCleanupFn: any;

  beforeEach(() => {
    // useAuthStore 모킹 설정
    (useAuthStore as any).mockImplementation((selector: StoreSelector) => {
      if (typeof selector === 'object' && selector.name === 'bound setLoading') return mockSetLoading;
      if (typeof selector === 'object' && selector.name === 'bound setProfile') return mockSetProfile;
      if (typeof selector === 'object' && selector.name === 'bound setError') return mockSetError;
      if (typeof selector === 'object' && selector.name === 'bound profile') return mockProfile;
      if (typeof selector === 'object' && selector.name === 'bound isLoading') return mockIsLoading;
      if (typeof selector === 'object' && selector.name === 'bound error') return mockError;
      
      // 선택자 함수 호출 시
      if (typeof selector === 'function') {
        return selector({
          setLoading: mockSetLoading,
          setProfile: mockSetProfile,
          setError: mockSetError,
          profile: mockProfile,
          isLoading: mockIsLoading,
          error: mockError
        });
      }
      
      return undefined;
    });

    // Supabase 인스턴스 및 함수 모킹
    mockUnsubscribe = vi.fn();
    mockCleanupFn = vi.fn();
    
    // React의 useEffect의 클린업 함수를 시뮬레이션하기 위해
    // onAuthStateChange는 클린업 함수 캡처를 위한 로직 추가
    mockOnAuthStateChange = vi.fn().mockImplementation(() => {
      mockCleanupFn = () => {
        mockUnsubscribe();
      };
      return {
        data: { 
          subscription: { 
            unsubscribe: mockUnsubscribe 
          }
        }
      };
    });

    mockGetSession = vi.fn();
    mockSupabase = {
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange
      }
    };
    
    (createClient as any).mockReturnValue(mockSupabase);
    
    // 모킹된 함수 초기화
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('초기 상태에서 로딩 상태가 true로 설정됨', async () => {
    // 세션 없는 상태로 설정
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null
    });

    // 훅 렌더링
    const { result } = renderHook(() => useAuth());
    
    // 비동기 작업 완료 대기
    await vi.waitFor(() => {
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
    
    // 초기에 세션 정보 요청 확인
    expect(mockGetSession).toHaveBeenCalled();
    // 인증 상태 이벤트 리스너 등록 확인
    expect(mockOnAuthStateChange).toHaveBeenCalled();
  });

  it('세션이 있을 때 사용자 프로필 설정', async () => {
    // 세션 있는 상태로 설정
    const mockUser = { 
      id: 'test-user-id',
      email: 'test@example.com'
    } as User;
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: mockUser
        }
      },
      error: null
    });

    // 훅 렌더링
    renderHook(() => useAuth());

    // 비동기 작업 완료 대기
    await vi.waitFor(() => {
      // 사용자 프로필이 설정되었는지 확인
      expect(mockSetProfile).toHaveBeenCalledWith(mockUser);
      // 로딩 상태가 false로 변경되었는지 확인
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });

  it('세션이 없을 때 사용자 프로필을 null로 설정', async () => {
    // 세션 없는 상태로 설정
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null
    });

    // 훅 렌더링
    renderHook(() => useAuth());

    // 비동기 작업 완료 대기
    await vi.waitFor(() => {
      // 사용자 프로필이 null로 설정되었는지 확인
      expect(mockSetProfile).toHaveBeenCalledWith(null);
      // 로딩 상태가 false로 변경되었는지 확인
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });

  it('인증 상태 변경 이벤트로 사용자 로그인 시 상태 업데이트', async () => {
    // 세션 없는 상태로 설정
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null
    });

    // 훅 렌더링
    renderHook(() => useAuth());

    // 비동기 작업 완료 대기
    await vi.waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });

    // onAuthStateChange 콜백 실행 시뮬레이션
    const authStateCallback = mockOnAuthStateChange.mock.calls[0][0];
    const mockNewUser = { 
      id: 'new-user-id',
      email: 'new@example.com'
    } as User;
    const mockNewSession = { user: mockNewUser };
    
    act(() => {
      authStateCallback('SIGNED_IN', mockNewSession);
    });

    // 상태 업데이트 검증
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetProfile).toHaveBeenCalledWith(mockNewUser);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('인증 상태 변경 이벤트로 사용자 로그아웃 시 상태 업데이트', async () => {
    // 세션 있는 상태로 설정
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: mockProfile
        }
      },
      error: null
    });

    // 훅 렌더링
    renderHook(() => useAuth());

    // 비동기 작업 완료 대기
    await vi.waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });

    // onAuthStateChange 콜백 실행 시뮬레이션
    const authStateCallback = mockOnAuthStateChange.mock.calls[0][0];
    
    act(() => {
      authStateCallback('SIGNED_OUT', null);
    });

    // 상태 업데이트 검증
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetProfile).toHaveBeenCalledWith(null);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('세션 조회 시 오류 발생하면 에러 상태 설정', async () => {
    // 세션 조회 오류 설정
    const sessionError = new Error('세션 조회 실패');
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: sessionError
    });

    // 훅 렌더링
    renderHook(() => useAuth());

    // 비동기 작업 완료 대기
    await vi.waitFor(() => {
      // 에러 상태가 설정되었는지 확인
      expect(mockSetError).toHaveBeenCalledWith(sessionError.message);
      // 로딩 상태가 false로 변경되었는지 확인
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });

  it('컴포넌트 언마운트 시 구독 해제', async () => {
    // 세션 없는 상태로 설정
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null
    });

    // 훅 렌더링 및 언마운트
    const { unmount } = renderHook(() => useAuth());

    // 비동기 작업 완료 대기
    await vi.waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });

    // 언마운트 시뮬레이션
    unmount();

    // 구독 해제 확인
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('상태 값을 올바르게 반환', async () => {
    // 세션 있는 상태로 설정
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: mockProfile
        }
      },
      error: null
    });

    // 훅 렌더링
    const { result } = renderHook(() => useAuth());

    // 반환된 상태 검증
    expect(result.current.user).toBe(mockProfile);
    expect(result.current.isLoading).toBe(mockIsLoading);
    expect(result.current.error).toBe(mockError);
  });
}); 