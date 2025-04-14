/**
 * 파일명: src/app/auth/test/page.test.tsx
 * 목적: 인증 테스트 페이지의 기능을 테스트
 * 역할: 로그인, 로그아웃, 스토리지 테스트 등의 기능을 검증
 * 작성일: 2025-03-27
 * 수정일: 2025-04-03
 * 수정일: 2023-10-31 : NextAuth signOut을 Supabase signOut으로 대체
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AuthTestPage from './page';
import { signIn, useSession } from 'next-auth/react';
import * as authModule from '@/lib/auth';

// 테스트 타임아웃 설정
const TEST_TIMEOUT = 20000;

// 모듈 모킹
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  useSession: vi.fn()
}));

vi.mock('@/lib/auth', () => ({
  signInWithGoogle: vi.fn(),
  getCurrentUser: vi.fn().mockReturnValue({
    id: 'test-user-id',
    email: 'test@example.com',
    created_at: '2024-03-31',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    role: ''
  }),
  signOut: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('@/lib/auth-storage', () => {
  const storageData: Record<string, string> = {};

  return {
    getAuthData: vi.fn((key: string) => storageData[key] || null),
    setAuthData: vi.fn((key: string, value: string) => {
      storageData[key] = value;
      return true;
    }),
    removeAuthData: vi.fn((key: string) => {
      delete storageData[key];
      return true;
    }),
    clearAllAuthData: vi.fn(() => {
      Object.keys(storageData).forEach(key => delete storageData[key]);
      return true;
    }),
    STORAGE_KEYS: {
      CODE_VERIFIER: 'code_verifier',
      ACCESS_TOKEN: 'sb-access-token',
      REFRESH_TOKEN: 'sb-refresh-token',
      SESSION: 'sb-session',
      PROVIDER: 'auth-provider',
      USER_ID: 'auth-user-id'
    }
  };
});

describe('AuthTestPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('인증되지 않은 상태에서 페이지가 올바르게 렌더링되어야 합니다', () => {
    // 인증되지 않은 상태 모킹
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn()
    });

    render(<AuthTestPage />);

    expect(screen.getByText('Google 로그인 테스트')).toBeInTheDocument();
    expect(screen.queryByText('로그아웃 테스트')).not.toBeInTheDocument();
    expect(screen.queryByText('모든 테스트 실행')).not.toBeInTheDocument();
  });

  it('인증된 상태에서 페이지가 올바르게 렌더링되어야 합니다', () => {
    // 인증된 상태 모킹
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: {
          name: '테스트 사용자',
          email: 'test@example.com'
        },
        expires: '2024-04-30'
      },
      status: 'authenticated',
      update: vi.fn()
    });

    render(<AuthTestPage />);

    expect(screen.getByText('로그아웃 테스트')).toBeInTheDocument();
    expect(screen.getByText('모든 테스트 실행')).toBeInTheDocument();
    expect(screen.queryByText('Google 로그인 테스트')).not.toBeInTheDocument();
  });

  it('Google 로그인 버튼 클릭 시 signIn이 호출되어야 합니다', () => {
    // 인증되지 않은 상태 모킹
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn()
    });

    render(<AuthTestPage />);

    const loginButton = screen.getByText('Google 로그인 테스트');
    fireEvent.click(loginButton);

    expect(signIn).toHaveBeenCalledWith('google');
    expect(signIn).toHaveBeenCalledTimes(1);
  });

  it('로그아웃 버튼 클릭 시 signOut이 호출되어야 합니다', async () => {
    // 인증된 상태 모킹
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: {
          name: '테스트 사용자',
          email: 'test@example.com'
        },
        expires: '2024-04-30'
      },
      status: 'authenticated',
      update: vi.fn()
    });

    // window.alert 모킹
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { });

    render(<AuthTestPage />);

    const logoutButton = screen.getByText('로그아웃 테스트');
    fireEvent.click(logoutButton);

    expect(authModule.signOut).toHaveBeenCalled();
    expect(authModule.signOut).toHaveBeenCalledTimes(1);

    // 비동기 알림이 표시되는지 확인
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(alertMock).toHaveBeenCalledWith('로그아웃 성공');
  });

  it('모든 테스트 실행 버튼 클릭 시 API가 호출되어야 합니다', () => {
    // 인증된 상태 모킹
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: {
          name: '테스트 사용자',
          email: 'test@example.com'
        },
        expires: '2024-04-30'
      },
      status: 'authenticated',
      update: vi.fn()
    });

    // fetch 모킹
    const mockFetch = vi.fn().mockReturnValue({
      status: 200,
      statusText: 'OK',
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });

    global.fetch = mockFetch;

    render(<AuthTestPage />);

    const runTestsButton = screen.getByText('모든 테스트 실행');
    fireEvent.click(runTestsButton);

    expect(mockFetch).toHaveBeenCalledWith('/api/test/run-all', {
      method: 'POST'
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
}); 