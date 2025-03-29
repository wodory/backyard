/**
 * 파일명: auth-service.test.ts
 * 목적: AuthService 단위 테스트
 * 역할: 인증 서비스의 비즈니스 로직을 검증
 * 작성일: 2024-10-12
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from './auth-service';
import { getAuthClient } from '@/lib/auth';
import { getAuthDataAsync, setAuthData, getAuthData, STORAGE_KEYS } from '@/lib/auth-storage';

// 모듈 모킹
vi.mock('@/lib/auth', () => ({
  getAuthClient: vi.fn()
}));

vi.mock('@/lib/auth-storage', () => ({
  getAuthDataAsync: vi.fn(),
  setAuthData: vi.fn(),
  getAuthData: vi.fn(),
  STORAGE_KEYS: {
    CODE_VERIFIER: 'code_verifier',
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    SESSION: 'session',
    PROVIDER: 'provider',
    USER_ID: 'user_id'
  }
}));

// 로거 모킹
vi.mock('@/lib/logger', () => {
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };

  return {
    default: vi.fn(() => mockLogger)
  };
});

describe('AuthService', () => {
  let mockExchangeCodeForSession: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Supabase 클라이언트 모킹
    mockExchangeCodeForSession = vi.fn();
    vi.mocked(getAuthClient).mockReturnValue({
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession
      }
    } as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('handleCallback', () => {
    it('인증 코드가 없을 때 에러 결과를 반환해야 합니다', async () => {
      // 코드 없는 URL 생성
      const url = new URL('http://localhost:3000/auth/callback');
      
      // 함수 호출
      const result = await AuthService.handleCallback(url);
      
      // 결과 확인
      expect(result.status).toBe('error');
      expect(result.error).toBe('no_code');
      expect(result.errorDescription).toBe('인증 코드가 없습니다');
    });
    
    it('에러 파라미터가 있을 때 에러 결과를 반환해야 합니다', async () => {
      // 에러 파라미터 있는 URL 생성
      const url = new URL('http://localhost:3000/auth/callback?error=access_denied&error_description=User%20cancelled');
      
      // 함수 호출
      const result = await AuthService.handleCallback(url);
      
      // 결과 확인
      expect(result.status).toBe('error');
      expect(result.error).toBe('access_denied');
      expect(result.errorDescription).toBe('User cancelled');
    });

    it('인증 코드 교환 성공 시 성공 결과를 반환해야 합니다', async () => {
      // 유효한 코드 URL 생성
      const url = new URL('http://localhost:3000/auth/callback?code=valid_code');
      
      // 코드 검증기 모킹
      vi.mocked(getAuthDataAsync).mockResolvedValue('test_verifier');
      
      // 세션 교환 성공 모킹
      mockExchangeCodeForSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'test_access_token',
            refresh_token: 'test_refresh_token',
            user: {
              id: 'test_user_id',
              app_metadata: { provider: 'google' }
            }
          }
        },
        error: null
      });
      
      // 함수 호출
      const result = await AuthService.handleCallback(url);
      
      // 결과 확인
      expect(result.status).toBe('success');
      expect(result.accessToken).toBe('test_access_token');
      expect(result.refreshToken).toBe('test_refresh_token');
      expect(result.userId).toBe('test_user_id');
      expect(result.provider).toBe('google');
      
      // API 호출 확인
      expect(mockExchangeCodeForSession).toHaveBeenCalledWith('valid_code');
    });

    it('인증 코드 교환 실패 시 에러 결과를 반환해야 합니다', async () => {
      // 유효한 코드 URL 생성
      const url = new URL('http://localhost:3000/auth/callback?code=invalid_code');
      
      // 코드 검증기 모킹
      vi.mocked(getAuthDataAsync).mockResolvedValue('test_verifier');
      
      // 세션 교환 실패 모킹
      mockExchangeCodeForSession.mockResolvedValue({
        data: { session: null },
        error: { message: '인증 실패', status: 400 }
      });
      
      // 함수 호출
      const result = await AuthService.handleCallback(url);
      
      // 결과 확인
      expect(result.status).toBe('error');
      expect(result.error).toBe('인증 실패');
      
      // API 호출 확인
      expect(mockExchangeCodeForSession).toHaveBeenCalledWith('invalid_code');
    });

    it('예외 발생 시 에러 결과를 반환해야 합니다', async () => {
      // 유효한 코드 URL 생성
      const url = new URL('http://localhost:3000/auth/callback?code=test_code');
      
      // 예외 발생 모킹
      mockExchangeCodeForSession.mockRejectedValue(new Error('네트워크 오류'));
      
      // 함수 호출
      const result = await AuthService.handleCallback(url);
      
      // 결과 확인
      expect(result.status).toBe('error');
      expect(result.error).toBe('unexpected_error');
      expect(result.errorDescription).toBe('네트워크 오류');
    });
  });

  describe('saveAuthData', () => {
    it('성공 결과를 저장하고 true를 반환해야 합니다', () => {
      // 성공 결과 생성
      const result = {
        status: 'success' as const,
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
        userId: 'test_user_id',
        provider: 'google'
      };
      
      // setAuthData 성공 모킹
      vi.mocked(setAuthData).mockReturnValue(true);
      
      // 함수 호출
      const success = AuthService.saveAuthData(result);
      
      // 결과 확인
      expect(success).toBe(true);
      expect(setAuthData).toHaveBeenCalledWith(
        STORAGE_KEYS.ACCESS_TOKEN,
        'test_access_token',
        expect.any(Object)
      );
      expect(setAuthData).toHaveBeenCalledWith(
        STORAGE_KEYS.REFRESH_TOKEN,
        'test_refresh_token',
        expect.any(Object)
      );
      expect(setAuthData).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_ID,
        'test_user_id',
        expect.any(Object)
      );
      expect(setAuthData).toHaveBeenCalledWith(
        STORAGE_KEYS.PROVIDER,
        'google',
        expect.any(Object)
      );
    });

    it('에러 결과에 대해 false를 반환해야 합니다', () => {
      // 에러 결과 생성
      const result = {
        status: 'error' as const,
        error: 'test_error'
      };
      
      // 함수 호출
      const success = AuthService.saveAuthData(result);
      
      // 결과 확인
      expect(success).toBe(false);
      expect(setAuthData).not.toHaveBeenCalled();
    });

    it('저장 중 예외 발생 시 false를 반환해야 합니다', () => {
      // 성공 결과 생성
      const result = {
        status: 'success' as const,
        accessToken: 'test_access_token'
      };
      
      // setAuthData 예외 모킹
      vi.mocked(setAuthData).mockImplementation(() => {
        throw new Error('저장 오류');
      });
      
      // 함수 호출
      const success = AuthService.saveAuthData(result);
      
      // 결과 확인
      expect(success).toBe(false);
    });
  });

  describe('checkAuthData', () => {
    it('인증된 상태를 올바르게 반환해야 합니다', () => {
      // 인증 데이터 모킹
      vi.mocked(getAuthData).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.ACCESS_TOKEN) return 'test_token';
        if (key === STORAGE_KEYS.USER_ID) return 'test_user';
        if (key === STORAGE_KEYS.PROVIDER) return 'google';
        return null;
      });
      
      // 함수 호출
      const authState = AuthService.checkAuthData();
      
      // 결과 확인
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.userId).toBe('test_user');
      expect(authState.provider).toBe('google');
    });

    it('비인증 상태를 올바르게 반환해야 합니다', () => {
      // 인증 데이터 모킹 (토큰 없음)
      vi.mocked(getAuthData).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.ACCESS_TOKEN) return null;
        return null;
      });
      
      // 함수 호출
      const authState = AuthService.checkAuthData();
      
      // 결과 확인
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.userId).toBeUndefined();
      expect(authState.provider).toBeUndefined();
    });

    it('예외 발생 시 비인증 상태를 반환해야 합니다', () => {
      // getAuthData 예외 모킹
      vi.mocked(getAuthData).mockImplementation(() => {
        throw new Error('데이터 접근 오류');
      });
      
      // 함수 호출
      const authState = AuthService.checkAuthData();
      
      // 결과 확인
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.userId).toBeUndefined();
      expect(authState.provider).toBeUndefined();
    });
  });
}); 