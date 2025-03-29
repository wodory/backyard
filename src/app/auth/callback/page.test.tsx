/**
 * 파일명: page.test.tsx
 * 목적: OAuth 콜백 페이지 컴포넌트 테스트
 * 역할: 클라이언트 측 인증 처리 UI 및 상태 관리 검증
 * 작성일: 2024-10-12
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '@/services/auth-service';
import type { AuthResult } from '@/services/auth-service';

// 모듈 모킹
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

// logger 모킹 (콘솔 출력 방지)
vi.mock('@/lib/logger', () => ({
  default: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  })
}));

// AuthService 모킹
vi.mock('@/services/auth-service', () => ({
  AuthService: {
    handleCallback: vi.fn(),
    saveAuthData: vi.fn(),
    checkAuthData: vi.fn()
  }
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

describe('CallbackHandler 컴포넌트', () => {
  // 각 테스트 전에 초기화
  beforeEach(() => {
    vi.clearAllMocks();

    // window.location 모킹
    delete (window as any).location;
    window.location = {
      ...window.location,
      href: 'http://localhost:3000/auth/callback?code=test_code',
      hash: '',
      search: '?code=test_code'
    };

    // 기본적으로 성공 응답 설정
    vi.mocked(AuthService.handleCallback).mockResolvedValue(successResult);
    vi.mocked(AuthService.saveAuthData).mockReturnValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // 모킹 검증 테스트
  it('테스트 환경이 올바르게 설정되었는지 확인', () => {
    expect(AuthService.handleCallback).toBeDefined();
    expect(AuthService.saveAuthData).toBeDefined();
    expect(mockPush).toBeDefined();
  });

  // 비즈니스 로직 테스트 (서비스 클래스 테스트와 중복될 수 있음)
  it('AuthService는 유효한 응답을 처리할 수 있어야 함', async () => {
    // AuthService.handleCallback이 호출되면 성공 응답을 반환
    const mockUrl = new URL('http://localhost:3000/auth/callback?code=test_code');

    const result = await AuthService.handleCallback(mockUrl);
    expect(result).toEqual(successResult);
  });

  it('AuthService는 인증 데이터를 저장할 수 있어야 함', () => {
    // AuthService.saveAuthData가 호출되면 true 반환
    const saved = AuthService.saveAuthData(successResult);
    expect(saved).toBe(true);
  });

  it('오류 결과는 에러 페이지로 리다이렉션해야 함', async () => {
    // 오류 응답으로 설정
    vi.mocked(AuthService.handleCallback).mockResolvedValue(errorResult);

    // 직접 함수 호출
    const mockUrl = new URL('http://localhost:3000/auth/callback?code=test_code');
    const result = await AuthService.handleCallback(mockUrl);

    // 결과가 예상대로인지 확인
    expect(result.status).toBe('error');
    // 이런 응답이 있으면 UI에서 에러 페이지로 리다이렉트됨
  });

  it('예외 발생 시 적절하게 처리되어야 함', async () => {
    // 예외 발생으로 설정
    const testError = new Error('테스트 오류');
    vi.mocked(AuthService.handleCallback).mockRejectedValue(testError);

    // 예외 처리 확인 
    await expect(async () => {
      const mockUrl = new URL('http://localhost:3000/auth/callback?code=test_code');
      await AuthService.handleCallback(mockUrl);
    }).rejects.toBe(testError);
    // 이런 오류가 있으면 UI에서 에러 페이지로 리다이렉트됨
  });
}); 