/**
 * 파일명: src/hooks/useAuthCallback.test.ts
 * 목적: useAuthCallback 훅 단위 테스트
 * 역할: 인증 콜백 처리 훅의 동작 검증
 * 작성일: 2023-04-10
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuthCallback } from './useAuthCallback';
import { AuthService } from '@/services/auth-service';
import type { AuthResult } from '@/services/auth-service';
import { useRouter } from 'next/navigation';

// 모킹 설정
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/services/auth-service');
vi.mock('@/lib/logger', () => ({ 
  default: () => ({ 
    info: vi.fn(), 
    error: vi.fn(), 
    warn: vi.fn() 
  }) 
}));

// 테스트 데이터
const successResult: AuthResult = {
  status: 'success',
  accessToken: 'test_access_token',
  refreshToken: 'test_refresh_token',
  userId: 'test_user_id',
  provider: 'google'
};

const errorResult: AuthResult = {
  status: 'error',
  error: 'auth_error',
  errorDescription: '인증 실패'
};

describe('useAuthCallback', () => {
  // 원래 window.location 저장
  const originalLocation = window.location;

  beforeEach(() => {
    vi.resetAllMocks();

    // window.location 초기화
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'http://localhost:3000/auth/callback?code=test-code'
      }
    });

    // 모킹된 함수 재설정
    vi.mocked(AuthService.handleCallback).mockResolvedValue(successResult);
    vi.mocked(AuthService.saveAuthData).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // 초기 상태 테스트
  it('훅이 초기 상태를 올바르게 설정해야 함', () => {
    const { result } = renderHook(() => useAuthCallback());

    expect(result.current.processingState).toBe('초기화 중');
    expect(result.current.error).toBeNull();
    expect(result.current.redirectUrl).toBeNull();
  });

  // 성공 케이스 테스트
  it('인증 성공 시 최종 상태가 올바르게 설정되어야 함', async () => {
    vi.mocked(AuthService.handleCallback).mockResolvedValueOnce(successResult);
    vi.mocked(AuthService.saveAuthData).mockReturnValueOnce(true);

    const { result } = renderHook(() => useAuthCallback());

    // 비동기 작업 완료 기다리기
    await waitFor(() => {
      expect(result.current.processingState).toBe('완료, 리디렉션 중');
      expect(result.current.error).toBeNull();
      expect(result.current.redirectUrl).toBe('/');
    });

    expect(AuthService.handleCallback).toHaveBeenCalled();
    expect(AuthService.saveAuthData).toHaveBeenCalledWith(successResult);
  });

  // 인증 오류 케이스 테스트
  it('인증 오류 발생 시 최종 상태가 올바르게 설정되어야 함', async () => {
    vi.mocked(AuthService.handleCallback).mockResolvedValueOnce(errorResult);

    const { result } = renderHook(() => useAuthCallback());

    // 비동기 작업 완료 기다리기
    await waitFor(() => {
      expect(result.current.processingState).toBe('오류 발생');
      expect(result.current.error).toBe(`${errorResult.error}: ${errorResult.errorDescription}`);
      expect(result.current.redirectUrl).toBe(`/auth/error?error=${encodeURIComponent(errorResult.error || 'unknown')}&error_description=${encodeURIComponent(errorResult.errorDescription || '')}`);
    });

    expect(AuthService.handleCallback).toHaveBeenCalled();
    expect(AuthService.saveAuthData).not.toHaveBeenCalled();
  });

  // 데이터 저장 실패 케이스 테스트
  it('인증 데이터 저장 실패 시 최종 상태가 올바르게 설정되어야 함', async () => {
    vi.mocked(AuthService.handleCallback).mockResolvedValueOnce(successResult);
    vi.mocked(AuthService.saveAuthData).mockReturnValueOnce(false);

    const { result } = renderHook(() => useAuthCallback());

    // 비동기 작업 완료 기다리기
    await waitFor(() => {
      expect(result.current.processingState).toBe('완료, 리디렉션 중');
      expect(result.current.error).toBe('인증 데이터를 저장하지 못했습니다');
      expect(result.current.redirectUrl).toBe('/');
    });

    expect(AuthService.handleCallback).toHaveBeenCalled();
    expect(AuthService.saveAuthData).toHaveBeenCalledWith(successResult);
  });

  // 예외 발생 케이스 테스트
  it('예외 발생 시 최종 상태가 올바르게 설정되어야 함', async () => {
    const testError = new Error("테스트 오류");
    vi.mocked(AuthService.handleCallback).mockRejectedValueOnce(testError);

    const { result } = renderHook(() => useAuthCallback());

    // 비동기 작업 완료 기다리기
    await waitFor(() => {
      expect(result.current.processingState).toBe('예외 발생');
      expect(result.current.error).toBe('콜백 처리 중 예외 발생');
      expect(result.current.redirectUrl).toBe('/auth/error?error=callback_error&error_description=인증 콜백 처리 중 오류가 발생했습니다.');
    });

    expect(AuthService.handleCallback).toHaveBeenCalled();
  });

  // 인증 코드 없음 케이스 테스트
  it('URL에 인증 코드가 없을 때 올바르게 처리되어야 함', async () => {
    // 코드 파라미터가 없는 URL로 설정
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'http://localhost:3000/auth/callback'
      }
    });

    const noCodeResult: AuthResult = {
      status: 'error',
      error: 'no_code',
      errorDescription: '인증 코드가 없습니다'
    };

    vi.mocked(AuthService.handleCallback).mockResolvedValueOnce(noCodeResult);

    const { result } = renderHook(() => useAuthCallback());

    // 비동기 작업 완료 기다리기
    await waitFor(() => {
      expect(result.current.processingState).toBe('오류 발생');
      expect(result.current.error).toBe(`${noCodeResult.error}: ${noCodeResult.errorDescription}`);
      expect(result.current.redirectUrl).toContain('/auth/error');
    });

    expect(AuthService.handleCallback).toHaveBeenCalled();
  });
}); 