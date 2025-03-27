/**
 * 파일명: session-management.test.ts
 * 목적: 세션 관리 및 복구 기능 테스트
 * 역할: 인증 컨텍스트의 세션 관리 및 복구 매커니즘 검증
 * 작성일: 2024-03-26
 */

import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals';
import { mockClientEnvironment } from '../mocks/env-mock';
import { mockLocalStorage, mockCookies } from '../mocks/storage-mock';
import { mockSupabaseBrowserClient, mockSupabaseSession } from '../mocks/supabase-mock';

// React와 관련된 모듈 모킹
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useState: jest.fn(),
    useEffect: jest.fn(),
    useContext: jest.fn(),
    createContext: jest.fn(originalReact.createContext),
  };
});

// 인증 스토리지 모듈 모킹
jest.mock('../../lib/auth-storage', () => {
  return {
    getAuthData: jest.fn(),
    setAuthData: jest.fn(),
    removeAuthData: jest.fn(),
    STORAGE_KEYS: {
      ACCESS_TOKEN: 'access_token',
      REFRESH_TOKEN: 'refresh_token',
      SESSION_EXPIRY: 'session_expiry',
      RECOVERY_ATTEMPTS: 'recovery_attempts'
    }
  };
});

// Supabase 클라이언트 모킹
jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn()
  };
});

// AuthContext.tsx 모듈을 직접 테스트하기 위한 설정
describe('세션 관리 및 복구 테스트', () => {
  // 테스트 환경 설정
  let clientEnvironment: { restore: () => void };
  let mockStorage: ReturnType<typeof mockLocalStorage>;
  let mockCookie: ReturnType<typeof mockCookies>;
  let mockSupabase: ReturnType<typeof mockSupabaseBrowserClient>;
  
  beforeEach(() => {
    // 테스트 환경 초기화
    jest.resetModules();
    
    // 클라이언트 환경 모킹
    clientEnvironment = mockClientEnvironment();
    
    // 스토리지 모킹
    mockStorage = mockLocalStorage();
    mockCookie = mockCookies();
    
    // window 객체의 localStorage 오버라이드
    Object.defineProperty(global.window, 'localStorage', {
      value: mockStorage,
      writable: true
    });
    
    // Supabase 클라이언트 모킹
    mockSupabase = mockSupabaseBrowserClient();
    require('@supabase/supabase-js').createClient.mockReturnValue(mockSupabase);
    
    // React 훅 모킹
    const React = require('react');
    React.useState.mockImplementation((initialValue) => [initialValue, jest.fn()]);
    React.useEffect.mockImplementation((cb) => cb());
  });
  
  afterEach(() => {
    // 테스트 환경 정리
    clientEnvironment.restore();
    jest.clearAllMocks();
  });
  
  test('AuthProvider가 초기화 시 세션 복구를 시도하는지 검증', async () => {
    // AuthContext 모듈을 임포트하기 전에 auth-storage 모듈 설정
    const authStorage = require('../../lib/auth-storage');
    authStorage.getAuthData.mockImplementation((key) => {
      if (key === 'access_token') return 'test-access-token';
      if (key === 'refresh_token') return 'test-refresh-token';
      if (key === 'session_expiry') return (Date.now() + 3600 * 1000).toString();
      if (key === 'recovery_attempts') return '0';
      return null;
    });
    
    // Supabase 세션 설정
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSupabaseSession() },
      error: null
    });
    
    // AuthContext 모듈 임포트
    const AuthContextModule = await import('../../contexts/AuthContext');
    
    // AuthProvider 인스턴스 생성 (테스트 목적)
    const provider = new AuthContextModule.AuthProvider({
      children: null
    });
    
    // provider 초기화 과정 실행
    await provider.componentDidMount?.();
    
    // 세션 복구 검증
    expect(mockSupabase.auth.getSession).toHaveBeenCalled();
    expect(authStorage.getAuthData).toHaveBeenCalledWith('access_token');
    expect(authStorage.getAuthData).toHaveBeenCalledWith('refresh_token');
  });
  
  test('세션 만료 시 리프레시 토큰으로 세션을 갱신하는지 검증', async () => {
    // AuthContext 모듈을 임포트하기 전에 auth-storage 모듈 설정
    const authStorage = require('../../lib/auth-storage');
    authStorage.getAuthData.mockImplementation((key) => {
      if (key === 'access_token') return 'expired-access-token';
      if (key === 'refresh_token') return 'valid-refresh-token';
      if (key === 'session_expiry') return (Date.now() - 1000).toString(); // 만료됨
      if (key === 'recovery_attempts') return '0';
      return null;
    });
    
    // Supabase 세션 설정 - 초기에는 null 세션 (만료됨)
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    // 리프레시 성공 시뮬레이션
    mockSupabase.auth.refreshSession.mockResolvedValue({
      data: { session: mockSupabaseSession() },
      error: null
    });
    
    // AuthContext 모듈 임포트
    const AuthContextModule = await import('../../contexts/AuthContext');
    
    // AuthProvider 인스턴스 생성 (테스트 목적)
    const provider = new AuthContextModule.AuthProvider({
      children: null
    });
    
    // provider 초기화 과정 실행
    await provider.componentDidMount?.();
    
    // 세션 갱신 검증
    expect(mockSupabase.auth.refreshSession).toHaveBeenCalled();
    expect(authStorage.setAuthData).toHaveBeenCalledWith('access_token', expect.any(String));
    expect(authStorage.setAuthData).toHaveBeenCalledWith('refresh_token', expect.any(String));
    expect(authStorage.setAuthData).toHaveBeenCalledWith('session_expiry', expect.any(String));
  });
  
  test('세션 복구 시도 횟수가 제한을 초과하면 사용자를 로그아웃시키는지 검증', async () => {
    // AuthContext 모듈을 임포트하기 전에 auth-storage 모듈 설정
    const authStorage = require('../../lib/auth-storage');
    authStorage.getAuthData.mockImplementation((key) => {
      if (key === 'access_token') return 'expired-access-token';
      if (key === 'refresh_token') return 'invalid-refresh-token';
      if (key === 'session_expiry') return (Date.now() - 1000).toString(); // 만료됨
      if (key === 'recovery_attempts') return '5'; // 최대 시도 횟수 초과
      return null;
    });
    
    // Supabase 세션 설정 - 초기에는 null 세션 (만료됨)
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    // 리프레시 실패 시뮬레이션
    mockSupabase.auth.refreshSession.mockResolvedValue({
      data: { session: null },
      error: { message: '유효하지 않은 리프레시 토큰' }
    });
    
    // AuthContext 모듈 임포트
    const AuthContextModule = await import('../../contexts/AuthContext');
    
    // 로그아웃 함수 스파이
    const signOutSpy = jest.spyOn(AuthContextModule, 'signOut').mockImplementation(() => Promise.resolve());
    
    // AuthProvider 인스턴스 생성 (테스트 목적)
    const provider = new AuthContextModule.AuthProvider({
      children: null
    });
    
    // provider 초기화 과정 실행
    await provider.componentDidMount?.();
    
    // 최대 시도 횟수 초과 후 로그아웃 검증
    expect(signOutSpy).toHaveBeenCalled();
    expect(authStorage.removeAuthData).toHaveBeenCalledWith('access_token');
    expect(authStorage.removeAuthData).toHaveBeenCalledWith('refresh_token');
    expect(authStorage.removeAuthData).toHaveBeenCalledWith('session_expiry');
    expect(authStorage.removeAuthData).toHaveBeenCalledWith('recovery_attempts');
  });
  
  test('세션 복구 실패 후 재시도 횟수가 증가하는지 검증', async () => {
    // AuthContext 모듈을 임포트하기 전에 auth-storage 모듈 설정
    const authStorage = require('../../lib/auth-storage');
    authStorage.getAuthData.mockImplementation((key) => {
      if (key === 'access_token') return 'expired-access-token';
      if (key === 'refresh_token') return 'invalid-refresh-token';
      if (key === 'session_expiry') return (Date.now() - 1000).toString(); // 만료됨
      if (key === 'recovery_attempts') return '2'; // 현재 시도 횟수
      return null;
    });
    
    // Supabase 세션 설정 - 초기에는 null 세션 (만료됨)
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    // 리프레시 실패 시뮬레이션
    mockSupabase.auth.refreshSession.mockResolvedValue({
      data: { session: null },
      error: { message: '유효하지 않은 리프레시 토큰' }
    });
    
    // AuthContext 모듈 임포트
    const AuthContextModule = await import('../../contexts/AuthContext');
    
    // AuthProvider 인스턴스 생성 (테스트 목적)
    const provider = new AuthContextModule.AuthProvider({
      children: null
    });
    
    // provider 초기화 과정 실행
    await provider.componentDidMount?.();
    
    // 재시도 횟수 증가 검증
    expect(authStorage.setAuthData).toHaveBeenCalledWith('recovery_attempts', '3');
  });
  
  test('세션 복구 성공 후 재시도 횟수가 초기화되는지 검증', async () => {
    // AuthContext 모듈을 임포트하기 전에 auth-storage 모듈 설정
    const authStorage = require('../../lib/auth-storage');
    authStorage.getAuthData.mockImplementation((key) => {
      if (key === 'access_token') return 'expired-access-token';
      if (key === 'refresh_token') return 'valid-refresh-token';
      if (key === 'session_expiry') return (Date.now() - 1000).toString(); // 만료됨
      if (key === 'recovery_attempts') return '2'; // 현재 시도 횟수
      return null;
    });
    
    // Supabase 세션 설정 - 초기에는 null 세션 (만료됨)
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    // 리프레시 성공 시뮬레이션
    mockSupabase.auth.refreshSession.mockResolvedValue({
      data: { session: mockSupabaseSession() },
      error: null
    });
    
    // AuthContext 모듈 임포트
    const AuthContextModule = await import('../../contexts/AuthContext');
    
    // AuthProvider 인스턴스 생성 (테스트 목적)
    const provider = new AuthContextModule.AuthProvider({
      children: null
    });
    
    // provider 초기화 과정 실행
    await provider.componentDidMount?.();
    
    // 재시도 횟수 초기화 검증
    expect(authStorage.setAuthData).toHaveBeenCalledWith('recovery_attempts', '0');
  });
}); 