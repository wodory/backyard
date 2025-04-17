/**
 * 파일명: src/store/useAuthStore.test.ts
 * 목적: useAuthStore의 기능 테스트
 * 역할: Zustand 기반 인증 스토어의 상태 관리와 액션을 검증
 * 작성일: 2025-04-09
 */

import { vi } from 'vitest';
// 로거 모킹 - 파일 상단에 위치해야 함
vi.mock('@/lib/logger', () => {
  // 모킹된 로거 인스턴스 생성
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
  
  // createLogger 팩토리 함수 모킹
  return {
    default: vi.fn(() => mockLogger)
  };
});

import { beforeEach, describe, expect, it } from 'vitest';

import createLogger from '@/lib/logger';

import { 
  useAuthStore, 
  selectIsAuthenticated, 
  selectUserId, 
  selectProvider, 
  selectAuthTokens, 
  selectCodeVerifier, 
  selectIsLoading, 
  selectError 
} from './useAuthStore';

// 모킹된 로거 인스턴스 가져오기
const mockLoggerInstance = vi.mocked(createLogger('AuthStore'));

// 스토어 초기화 헬퍼 함수
const resetStore = () => {
  const { clearAuth } = useAuthStore.getState();
  clearAuth();
};

describe('useAuthStore', () => {
  // 각 테스트 전에 스토어 초기화
  beforeEach(() => {
    resetStore();
    // localStorage 모킹 초기화
    localStorage.clear();
    // 로거 모킹 초기화
    vi.clearAllMocks();
  });

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정되어야 함', () => {
      const state = useAuthStore.getState();
      
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.userId).toBeNull();
      expect(state.provider).toBeNull();
      expect(state.codeVerifier).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('액션', () => {
    it('setTokens가 토큰을 올바르게 설정해야 함', () => {
      const { setTokens } = useAuthStore.getState();
      
      setTokens('access-token-123', 'refresh-token-456');
      
      const newState = useAuthStore.getState();
      expect(newState.accessToken).toBe('access-token-123');
      expect(newState.refreshToken).toBe('refresh-token-456');
      expect(mockLoggerInstance.info).toHaveBeenCalledWith('인증 토큰 설정', expect.objectContaining({
        hasAccessToken: true,
        hasRefreshToken: true
      }));
    });

    it('setUser가 사용자 정보를 올바르게 설정해야 함', () => {
      const { setUser } = useAuthStore.getState();
      
      setUser('user-123', 'google');
      
      const newState = useAuthStore.getState();
      expect(newState.userId).toBe('user-123');
      expect(newState.provider).toBe('google');
      expect(mockLoggerInstance.info).toHaveBeenCalledWith('사용자 정보 설정', expect.objectContaining({
        hasUserId: true,
        provider: 'google'
      }));
    });

    it('setCodeVerifier가 PKCE 코드 검증기를 올바르게 설정해야 함', () => {
      const { setCodeVerifier } = useAuthStore.getState();
      const verifier = 'code-verifier-string-123';
      
      setCodeVerifier(verifier);
      
      const newState = useAuthStore.getState();
      expect(newState.codeVerifier).toBe(verifier);
      expect(mockLoggerInstance.debug).toHaveBeenCalledWith('PKCE 코드 검증기 설정', expect.objectContaining({
        length: verifier.length,
        firstChars: expect.any(String)
      }));
    });

    it('setCodeVerifier가 null이 전달되면 코드 검증기를 초기화해야 함', () => {
      const { setCodeVerifier } = useAuthStore.getState();
      
      // 먼저 값 설정
      setCodeVerifier('test-verifier');
      
      // 로그 모킹 초기화
      vi.clearAllMocks();
      
      // null로 초기화
      setCodeVerifier(null);
      
      const newState = useAuthStore.getState();
      expect(newState.codeVerifier).toBeNull();
      expect(mockLoggerInstance.debug).toHaveBeenCalledWith('PKCE 코드 검증기 초기화');
    });

    it('clearAuth가 인증 상태를 올바르게 초기화해야 함', () => {
      const { setTokens, setUser, clearAuth } = useAuthStore.getState();
      
      // 먼저 값 설정
      setTokens('access-token', 'refresh-token');
      setUser('user-123', 'github');
      
      // mockCalls 초기화
      vi.clearAllMocks();
      
      // 상태 지우기
      clearAuth();
      
      const newState = useAuthStore.getState();
      expect(newState.accessToken).toBeNull();
      expect(newState.refreshToken).toBeNull();
      expect(newState.userId).toBeNull();
      expect(newState.provider).toBeNull();
      expect(mockLoggerInstance.info).toHaveBeenCalledWith('인증 상태 초기화');
    });

    it('removeCodeVerifier가 코드 검증기만 지워야 함', () => {
      const { setCodeVerifier, setTokens, removeCodeVerifier } = useAuthStore.getState();
      
      // 값 설정
      setCodeVerifier('verifier-123');
      setTokens('token', null);
      
      // mockCalls 초기화
      vi.clearAllMocks();
      
      // 코드 검증기만 지우기
      removeCodeVerifier();
      
      const newState = useAuthStore.getState();
      expect(newState.codeVerifier).toBeNull();
      expect(newState.accessToken).toBe('token'); // 이 값은 유지됨
      expect(mockLoggerInstance.debug).toHaveBeenCalledWith('PKCE 코드 검증기 제거');
    });

    it('setLoading이 로딩 상태를 올바르게 설정해야 함', () => {
      const { setLoading } = useAuthStore.getState();
      
      setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
      
      setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('setError가 오류 상태를 올바르게 설정해야 함', () => {
      const { setError } = useAuthStore.getState();
      const error = new Error('인증 실패');
      
      setError(error);
      expect(useAuthStore.getState().error).toBe(error);
      expect(mockLoggerInstance.error).toHaveBeenCalledWith('인증 오류 설정', error);
      
      vi.clearAllMocks();
      
      setError(null);
      expect(useAuthStore.getState().error).toBeNull();
      expect(mockLoggerInstance.debug).toHaveBeenCalledWith('인증 오류 초기화');
    });
  });

  describe('선택기 (Selectors)', () => {
    it('selectIsAuthenticated가 인증 상태를 올바르게 반환해야 함', () => {
      const { setTokens } = useAuthStore.getState();
      
      // 초기 상태 - 인증되지 않음
      expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false);
      
      // 토큰 설정 후 - 인증됨
      setTokens('token', null);
      expect(selectIsAuthenticated(useAuthStore.getState())).toBe(true);
      
      // 토큰 제거 후 - 인증되지 않음
      setTokens(null, null);
      expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false);
    });

    it('selectUserId가 사용자 ID를 올바르게 반환해야 함', () => {
      const { setUser } = useAuthStore.getState();
      
      // 초기 상태
      expect(selectUserId(useAuthStore.getState())).toBeNull();
      
      // 사용자 설정 후
      setUser('user-456');
      expect(selectUserId(useAuthStore.getState())).toBe('user-456');
    });
    
    it('selectProvider가 인증 제공자를 올바르게 반환해야 함', () => {
      const { setUser } = useAuthStore.getState();
      
      // 초기 상태
      expect(selectProvider(useAuthStore.getState())).toBeNull();
      
      // 사용자 정보 설정 후
      setUser('user-id', 'github');
      expect(selectProvider(useAuthStore.getState())).toBe('github');
    });
    
    it('selectAuthTokens가 인증 토큰을 올바르게 반환해야 함', () => {
      const { setTokens } = useAuthStore.getState();
      
      // 초기 상태
      expect(selectAuthTokens(useAuthStore.getState())).toEqual({
        accessToken: null,
        refreshToken: null
      });
      
      // 토큰 설정 후
      setTokens('access123', 'refresh456');
      expect(selectAuthTokens(useAuthStore.getState())).toEqual({
        accessToken: 'access123',
        refreshToken: 'refresh456'
      });
    });
    
    it('selectCodeVerifier가 PKCE 코드 검증기를 올바르게 반환해야 함', () => {
      const { setCodeVerifier } = useAuthStore.getState();
      
      // 초기 상태
      expect(selectCodeVerifier(useAuthStore.getState())).toBeNull();
      
      // 코드 검증기 설정 후
      const verifier = 'code-verifier-test';
      setCodeVerifier(verifier);
      expect(selectCodeVerifier(useAuthStore.getState())).toBe(verifier);
    });
    
    it('selectIsLoading이 로딩 상태를 올바르게 반환해야 함', () => {
      const { setLoading } = useAuthStore.getState();
      
      // 초기 상태
      expect(selectIsLoading(useAuthStore.getState())).toBe(false);
      
      // 로딩 상태 설정 후
      setLoading(true);
      expect(selectIsLoading(useAuthStore.getState())).toBe(true);
    });
    
    it('selectError가 오류 상태를 올바르게 반환해야 함', () => {
      const { setError } = useAuthStore.getState();
      
      // 초기 상태
      expect(selectError(useAuthStore.getState())).toBeNull();
      
      // 오류 설정 후
      const error = new Error('테스트 오류');
      setError(error);
      expect(selectError(useAuthStore.getState())).toBe(error);
    });
  });

  describe('지속성 (Persistence)', () => {
    it('인증 상태가 localStorage에 저장되어야 함', () => {
      const { setTokens, setUser } = useAuthStore.getState();
      
      setTokens('persist-token', 'persist-refresh');
      setUser('persist-user', 'persist-provider');
      
      // localStorage에 저장된 값 확인
      const storedData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      expect(storedData.state.accessToken).toBe('persist-token');
      expect(storedData.state.refreshToken).toBe('persist-refresh');
      expect(storedData.state.userId).toBe('persist-user');
      expect(storedData.state.provider).toBe('persist-provider');
    });

    it('일시적인 상태는 localStorage에 저장되지 않아야 함', () => {
      const { setCodeVerifier, setLoading, setError } = useAuthStore.getState();
      
      setCodeVerifier('temp-verifier');
      setLoading(true);
      setError(new Error('temp-error'));
      
      // localStorage에 저장된 값 확인
      const storedData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      expect(storedData.state.codeVerifier).toBeUndefined();
      expect(storedData.state.isLoading).toBeUndefined();
      expect(storedData.state.error).toBeUndefined();
    });
  });
}); 