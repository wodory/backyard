/**
 * 파일명: auth-service.test.ts
 * 목적: AuthService 단위 테스트
 * 역할: 인증 서비스의 비즈니스 로직을 검증
 * 작성일: 2024-10-12
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService, type AuthResult } from './auth-service';
import * as authModule from '@/lib/auth';

// Supabase 클라이언트 목업
const mockExchangeCodeForSession = vi.fn();
const mockAuthClient = {
  auth: {
    exchangeCodeForSession: mockExchangeCodeForSession
  }
};

// authModule의 getAuthClient 함수 목업
vi.mock('@/lib/auth', () => ({
  getAuthClient: vi.fn(() => mockAuthClient),
  STORAGE_KEYS: {
    CODE_VERIFIER: 'code_verifier',
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_ID: 'user_id',
    PROVIDER: 'provider'
  }
}));

// 로컬 스토리지와 세션 스토리지 목업
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();

// 테스트 시작 전 스토리지 모킹과 후행 정리
beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
    (key: string) => localStorageMock.getItem(key)
  );
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
    (key: string, value: string) => localStorageMock.setItem(key, value)
  );
  vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => localStorageMock as any);
  vi.spyOn(window, 'sessionStorage', 'get').mockImplementation(() => sessionStorageMock as any);
  
  // 모든 스토리지 초기화
  localStorageMock.clear();
  sessionStorageMock.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

describe('AuthService', () => {
  describe('handleCallback', () => {
    it('에러 파라미터가 있을 경우 에러 상태를 반환해야 함', async () => {
      // 에러 파라미터가 있는 URL 생성
      const url = new URL('https://example.com/callback?error=access_denied&error_description=사용자가%20거부함');
      
      // AuthService.handleCallback 호출
      const result = await AuthService.handleCallback(url);
      
      // 반환된 결과 검증
      expect(result).toEqual({
        status: 'error',
        error: 'access_denied',
        errorDescription: '사용자가 거부함'
      });
      
      // exchangeCodeForSession이 호출되지 않아야 함
      expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
    });
    
    it('코드 파라미터가 없을 경우 에러 상태를 반환해야 함', async () => {
      // 코드 파라미터가 없는 URL 생성
      const url = new URL('https://example.com/callback');
      
      // AuthService.handleCallback 호출
      const result = await AuthService.handleCallback(url);
      
      // 반환된 결과 검증
      expect(result).toEqual({
        status: 'error',
        error: 'no_code',
        errorDescription: '인증 코드가 없습니다'
      });
      
      // exchangeCodeForSession이 호출되지 않아야 함
      expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
    });
    
    it('세션 교환 중 오류가 발생할 경우 에러 상태를 반환해야 함', async () => {
      // 코드 파라미터가 있는 URL 생성
      const url = new URL('https://example.com/callback?code=test_code');
      
      // 코드 검증기 설정
      sessionStorageMock.setItem('code_verifier', 'test_verifier');
      
      // exchangeCodeForSession 목업 설정 - 오류 발생
      mockExchangeCodeForSession.mockResolvedValueOnce({
        data: {},
        error: {
          message: '인증 오류',
          status: 401
        }
      });
      
      // AuthService.handleCallback 호출
      const result = await AuthService.handleCallback(url);
      
      // 반환된 결과 검증
      expect(result).toEqual({
        status: 'error',
        error: '인증 오류',
        errorDescription: '세션 교환 실패'
      });
      
      // exchangeCodeForSession이 호출되어야 함
      expect(mockExchangeCodeForSession).toHaveBeenCalledWith('test_code');
    });
    
    it('세션 교환 성공 시 성공 상태와 토큰을 반환해야 함', async () => {
      // 코드 파라미터가 있는 URL 생성
      const url = new URL('https://example.com/callback?code=test_code');
      
      // 코드 검증기 설정
      sessionStorageMock.setItem('code_verifier', 'test_verifier');
      
      // exchangeCodeForSession 목업 설정 - 성공
      mockExchangeCodeForSession.mockResolvedValueOnce({
        data: {
          session: {
            access_token: 'test_access_token',
            refresh_token: 'test_refresh_token',
            user: {
              id: 'test_user_id',
              app_metadata: {
                provider: 'google'
              }
            }
          }
        },
        error: null
      });
      
      // AuthService.handleCallback 호출
      const result = await AuthService.handleCallback(url);
      
      // 반환된 결과 검증
      expect(result).toEqual({
        status: 'success',
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
        userId: 'test_user_id',
        provider: 'google'
      });
      
      // exchangeCodeForSession이 호출되어야 함
      expect(mockExchangeCodeForSession).toHaveBeenCalledWith('test_code');
    });
  });
  
  describe('saveAuthData', () => {
    it('성공 상태가 아닌 경우 false를 반환해야 함', () => {
      // 실패 상태의 인증 결과 생성
      const result: AuthResult = {
        status: 'error',
        error: 'test_error'
      };
      
      // AuthService.saveAuthData 호출
      const saveResult = AuthService.saveAuthData(result);
      
      // 반환된 결과 검증
      expect(saveResult).toBe(false);
      
      // 로컬 스토리지에 아무것도 저장되지 않아야 함
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('user_id')).toBeNull();
      expect(localStorage.getItem('provider')).toBeNull();
    });
    
    it('성공 상태일 경우 데이터를 저장하고 true를 반환해야 함', () => {
      // 성공 상태의 인증 결과 생성
      const result: AuthResult = {
        status: 'success',
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
        userId: 'test_user_id',
        provider: 'google'
      };
      
      // AuthService.saveAuthData 호출
      const saveResult = AuthService.saveAuthData(result);
      
      // 반환된 결과 검증
      expect(saveResult).toBe(true);
      
      // 로컬 스토리지에 데이터가 저장되었는지 확인
      expect(localStorage.getItem('access_token')).toBe('test_access_token');
      expect(localStorage.getItem('refresh_token')).toBe('test_refresh_token');
      expect(localStorage.getItem('user_id')).toBe('test_user_id');
      expect(localStorage.getItem('provider')).toBe('google');
    });
  });
  
  describe('checkAuthData', () => {
    it('인증 데이터가 없을 경우 isAuthenticated가 false여야 함', () => {
      // AuthService.checkAuthData 호출
      const checkResult = AuthService.checkAuthData();
      
      // 반환된 결과 검증
      expect(checkResult).toEqual({
        isAuthenticated: false
      });
    });
    
    it('인증 데이터가 있을 경우 올바른 값을 반환해야 함', () => {
      // 로컬 스토리지에 인증 데이터 저장
      localStorage.setItem('access_token', 'test_access_token');
      localStorage.setItem('user_id', 'test_user_id');
      localStorage.setItem('provider', 'google');
      
      // AuthService.checkAuthData 호출
      const checkResult = AuthService.checkAuthData();
      
      // 반환된 결과 검증
      expect(checkResult).toEqual({
        isAuthenticated: true,
        userId: 'test_user_id',
        provider: 'google'
      });
    });
  });
  
  describe('getRedirectUrl', () => {
    it('인증 성공 시 대시보드 URL을 반환해야 함', () => {
      // 성공 상태의 인증 결과 생성
      const result: AuthResult = {
        status: 'success',
        accessToken: 'test_access_token',
        userId: 'test_user_id'
      };
      
      // getRedirectUrl 호출
      const redirectUrl = AuthService.getRedirectUrl(result);
      
      // 반환된 URL 검증
      expect(redirectUrl).toBe('/dashboard');
    });
    
    it('인증 실패 시 오류 정보와 함께 로그인 URL을 반환해야 함', () => {
      // 실패 상태의 인증 결과 생성
      const result: AuthResult = {
        status: 'error',
        error: 'invalid_request',
        errorDescription: '잘못된 요청입니다'
      };
      
      // getRedirectUrl 호출
      const redirectUrl = AuthService.getRedirectUrl(result);
      
      // URL 인코딩된 결과를 검증 - URLSearchParams가 한글을 퍼센트 인코딩함
      expect(redirectUrl).toBe('/login?error=invalid_request&error_description=%EC%9E%98%EB%AA%BB%EB%90%9C+%EC%9A%94%EC%B2%AD%EC%9E%85%EB%8B%88%EB%8B%A4');
    });
    
    it('오류 설명이 없는 경우 오류 코드만 포함된 URL을 반환해야 함', () => {
      // 실패 상태의 인증 결과 생성 (오류 설명 없음)
      const result: AuthResult = {
        status: 'error',
        error: 'server_error'
      };
      
      // getRedirectUrl 호출
      const redirectUrl = AuthService.getRedirectUrl(result);
      
      // 반환된 URL 검증
      expect(redirectUrl).toBe('/login?error=server_error');
    });
    
    it('오류 정보가 없는 경우 단순 로그인 URL을 반환해야 함', () => {
      // 실패 상태의 인증 결과 생성 (오류 정보 없음)
      const result: AuthResult = {
        status: 'error'
      };
      
      // getRedirectUrl 호출
      const redirectUrl = AuthService.getRedirectUrl(result);
      
      // 반환된 URL 검증
      expect(redirectUrl).toBe('/login');
    });
  });
}); 