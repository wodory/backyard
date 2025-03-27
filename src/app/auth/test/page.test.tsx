/**
 * 파일명: src/app/auth/test/page.test.tsx
 * 목적: 인증 테스트 페이지의 기능을 테스트
 * 역할: 로그인, 로그아웃, 스토리지 테스트 등의 기능을 검증
 * 작성일: 2024-03-22
 */

// 참고: vi.mock은 자동으로 파일 최상단으로 호이스팅됨
vi.mock('@/lib/auth', () => ({
  signInWithGoogle: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue({
    id: 'test-user-id',
    email: 'test@example.com',
    created_at: '2024-03-22',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    role: ''
  }),
  signOut: vi.fn()
}));

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            expires_in: 3600,
            expires_at: 1234567890,
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              created_at: '2024-03-22',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              role: ''
            },
            token_type: 'bearer'
          }
        },
        error: null
      }),
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            created_at: '2024-03-22',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            role: ''
          }
        },
        error: null
      }),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn()
    }
  }))
}));

vi.mock('@/lib/hybrid-supabase', () => ({
  getHybridSupabaseClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            expires_in: 3600,
            expires_at: 1234567890,
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              created_at: '2024-03-22',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              role: ''
            },
            token_type: 'bearer'
          }
        },
        error: null
      }),
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            created_at: '2024-03-22',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            role: ''
          }
        },
        error: null
      })
    }
  }))
}));

vi.mock('@/lib/auth-storage', () => {
  // 클로저 내부 변수로 storageData 정의
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

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi, describe, it, beforeEach } from 'vitest';
import AuthTestPage from './page';
import { User } from '@supabase/supabase-js';

// 모의 함수 참조 가져오기
const auth = vi.mocked(await import('@/lib/auth'), true);

// 브라우저 환경 모킹을 위한 beforeEach hook
beforeEach(() => {
  // IndexedDB 모킹
  Object.defineProperty(window, 'indexedDB', {
    value: {
      open: vi.fn().mockReturnValue({
        result: {
          createObjectStore: vi.fn(),
          transaction: vi.fn().mockReturnValue({
            objectStore: vi.fn().mockReturnValue({
              put: vi.fn(),
              get: vi.fn(),
              delete: vi.fn()
            })
          })
        },
        onsuccess: null,
        onupgradeneeded: null,
        onerror: null
      }),
      deleteDatabase: vi.fn(),
      databases: vi.fn(),
      cmp: vi.fn()
    },
    writable: true
  });
  
  // localStorage 및 sessionStorage 모킹
  const mockStorage = {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(() => null)
  };
  
  Object.defineProperty(window, 'localStorage', { value: mockStorage });
  Object.defineProperty(window, 'sessionStorage', { value: mockStorage });
  
  // Cookie 모킹
  Object.defineProperty(document, 'cookie', { writable: true, value: '' });
  
  // 위치 모킹
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:3000/auth/test',
      pathname: '/auth/test',
      search: '',
      hash: '',
      assign: vi.fn(),
      replace: vi.fn()
    },
    writable: true
  });
  
  vi.clearAllMocks();
});

describe('AuthTestPage', () => {
  beforeEach(() => {
    render(<AuthTestPage />);
  });

  it('로그인한 상태에서 페이지 렌더링', async () => {
    await waitFor(() => {
      const userPanel = screen.getByRole('tabpanel', { name: '사용자 정보' });
      expect(userPanel).toBeInTheDocument();
      expect(userPanel).toHaveTextContent(/test@example\.com/);
    });
  });

  it('Google 로그인 버튼 클릭', async () => {
    const loginButton = screen.getByRole('button', { name: /Google 로그인 테스트/ });
    await fireEvent.click(loginButton);
    expect(auth.signInWithGoogle).toHaveBeenCalled();
  });

  it('로그아웃 버튼 클릭', async () => {
    // 로그인 상태가 아닐 경우 버튼이 비활성화됨
    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /로그아웃 테스트/ });
      expect(logoutButton).toBeInTheDocument();
    });
    
    const logoutButton = screen.getByRole('button', { name: /로그아웃 테스트/ });
    // 비활성화되어 있지 않은지 확인
    expect(logoutButton).not.toBeDisabled();
    await fireEvent.click(logoutButton);
    expect(auth.signOut).toHaveBeenCalled();
  });

  it('모든 테스트 실행 버튼 클릭', async () => {
    // 버튼 상태가 변경되기 전에 찾기
    const runAllButton = await screen.findByRole('button', { name: /(모든 테스트 실행|테스트 중...)/ });
    
    // 버튼이 '테스트 중...' 상태가 아닌지 확인
    if (!runAllButton.textContent?.includes('테스트 중...')) {
      await fireEvent.click(runAllButton);
      
      // 클릭 후 버튼이 '테스트 중...' 상태로 변경되었는지 확인
      await waitFor(() => {
        expect(runAllButton).toHaveTextContent('테스트 중...');
        expect(runAllButton).toBeDisabled();
      });
    } else {
      // 이미 '테스트 중...' 상태면 비활성화 확인만
      expect(runAllButton).toBeDisabled();
    }
  });
}); 