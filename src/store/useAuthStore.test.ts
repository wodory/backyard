/**
 * 파일명: src/store/useAuthStore.test.ts
 * 목적: useAuthStore의 기능 테스트
 * 역할: Zustand 기반 인증 스토어의 상태 관리와 액션을 검증
 * 작성일: 2025-04-09
 * 수정일: 2025-04-24 : useAuthStore 리팩토링에 맞춰 테스트 업데이트
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
import { User } from '@supabase/supabase-js';

import createLogger from '@/lib/logger';

import { 
  useAuthStore, 
  selectIsAuthenticated, 
  selectUserId,
  selectUserEmail,
  selectIsLoading, 
  selectError 
} from './useAuthStore';

// 모킹된 로거 인스턴스 가져오기
const mockLoggerInstance = vi.mocked(createLogger('AuthStore'));

// 테스트 사용자 데이터
const mockUser: User = {
  id: 'user-123',
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

describe('useAuthStore', () => {
  // 각 테스트 전에 스토어 초기화
  beforeEach(() => {
    // 스토어 초기화
    useAuthStore.setState({
      profile: null,
      isLoading: true,
      error: null
    });
    // 로거 모킹 초기화
    vi.clearAllMocks();
  });

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정되어야 함', () => {
      const state = useAuthStore.getState();
      
      expect(state.profile).toBeNull();
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('액션', () => {
    it('setProfile이 사용자 프로필을 올바르게 설정해야 함', () => {
      const { setProfile } = useAuthStore.getState();
      
      setProfile(mockUser);
      
      const newState = useAuthStore.getState();
      expect(newState.profile).toBe(mockUser);
      expect(mockLoggerInstance.info).toHaveBeenCalledWith('사용자 프로필 설정', expect.objectContaining({
        hasUser: true,
        userId: mockUser.id
      }));
    });

    it('setProfile에 null이 전달되면 프로필을 초기화해야 함', () => {
      const { setProfile } = useAuthStore.getState();
      
      // 먼저 값 설정
      setProfile(mockUser);
      
      // 로그 모킹 초기화
      vi.clearAllMocks();
      
      // null로 초기화
      setProfile(null);
      
      const newState = useAuthStore.getState();
      expect(newState.profile).toBeNull();
      expect(mockLoggerInstance.info).toHaveBeenCalledWith('사용자 프로필 설정', expect.objectContaining({
        hasUser: false,
        userId: undefined
      }));
    });

    it('setLoading이 로딩 상태를 올바르게 설정해야 함', () => {
      const { setLoading } = useAuthStore.getState();
      
      setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
      
      setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it('setError가 오류 상태를 올바르게 설정해야 함', () => {
      const { setError } = useAuthStore.getState();
      const errorMessage = '인증 실패';
      
      setError(errorMessage);
      expect(useAuthStore.getState().error).toBe(errorMessage);
      expect(mockLoggerInstance.error).toHaveBeenCalledWith('인증 오류 설정', errorMessage);
      
      vi.clearAllMocks();
      
      setError(null);
      expect(useAuthStore.getState().error).toBeNull();
      expect(mockLoggerInstance.debug).toHaveBeenCalledWith('인증 오류 초기화');
    });
  });

  describe('선택기 (Selectors)', () => {
    it('selectIsAuthenticated가 인증 상태를 올바르게 반환해야 함', () => {
      const { setProfile } = useAuthStore.getState();
      
      // 초기 상태 - 인증되지 않음
      expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false);
      
      // 사용자 설정 후 - 인증됨
      setProfile(mockUser);
      expect(selectIsAuthenticated(useAuthStore.getState())).toBe(true);
      
      // 사용자 제거 후 - 인증되지 않음
      setProfile(null);
      expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false);
    });

    it('selectUserId가 사용자 ID를 올바르게 반환해야 함', () => {
      const { setProfile } = useAuthStore.getState();
      
      // 초기 상태
      expect(selectUserId(useAuthStore.getState())).toBeUndefined();
      
      // 사용자 설정 후
      setProfile(mockUser);
      expect(selectUserId(useAuthStore.getState())).toBe(mockUser.id);
    });
    
    it('selectUserEmail이 사용자 이메일을 올바르게 반환해야 함', () => {
      const { setProfile } = useAuthStore.getState();
      
      // 초기 상태
      expect(selectUserEmail(useAuthStore.getState())).toBeUndefined();
      
      // 사용자 설정 후
      setProfile(mockUser);
      expect(selectUserEmail(useAuthStore.getState())).toBe(mockUser.email);
    });
    
    it('selectIsLoading이 로딩 상태를 올바르게 반환해야 함', () => {
      const { setLoading } = useAuthStore.getState();
      
      // 초기 상태
      expect(selectIsLoading(useAuthStore.getState())).toBe(true);
      
      // 로딩 상태 변경 후
      setLoading(false);
      expect(selectIsLoading(useAuthStore.getState())).toBe(false);
    });
    
    it('selectError가 오류 상태를 올바르게 반환해야 함', () => {
      const { setError } = useAuthStore.getState();
      const errorMessage = '네트워크 오류';
      
      // 초기 상태
      expect(selectError(useAuthStore.getState())).toBeNull();
      
      // 오류 설정 후
      setError(errorMessage);
      expect(selectError(useAuthStore.getState())).toBe(errorMessage);
    });
  });
}); 