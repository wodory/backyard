/**
 * 파일명: additional-mocks.ts
 * 목적: 테스트에 필요한 추가 모킹 함수 제공
 * 역할: 기존 모킹에 포함되지 않았거나 락된 모듈을 모킹
 * 작성일: 2025-03-27
 * 수정일: 2025-04-05 : 린터 오류 수정 - Function 타입을 구체적인 함수 시그니처로 변경 및 사용되지 않는 변수 제거
 */

import { vi } from 'vitest';

/**
 * mockEnvironment: 환경 감지 관련 함수 모킹
 * @returns 모킹된 환경 감지 유틸리티
 */
export const mockEnvironment = () => {
  const mock = {
    isClient: vi.fn().mockReturnValue(true),
    isServer: vi.fn().mockReturnValue(false),
    executeOnClient: vi.fn((fn: () => void) => fn?.()),
    executeOnServer: vi.fn(),
    toggleEnvironment: (isClientEnvironment: boolean) => {
      mock.isClient.mockReturnValue(isClientEnvironment);
      mock.isServer.mockReturnValue(!isClientEnvironment);
      
      if (isClientEnvironment) {
        mock.executeOnClient.mockImplementation((fn: () => void) => fn?.());
        mock.executeOnServer.mockImplementation(() => {});
      } else {
        mock.executeOnClient.mockImplementation(() => {});
        mock.executeOnServer.mockImplementation((fn: () => void) => fn?.());
      }
    }
  };
  
  return mock;
};

/**
 * mockAuth: 인증 관련 함수 모킹
 * @returns 모킹된 인증 유틸리티
 */
export const mockAuth = () => {
  return {
    generateCodeVerifier: vi.fn().mockReturnValue('test-code-verifier'),
    generateCodeChallenge: vi.fn().mockResolvedValue('test-code-challenge'),
    googleLogin: vi.fn().mockImplementation(() => {
      // URL 업데이트 모킹
      window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?code_challenge=test-code-challenge&code_challenge_method=S256';
      return Promise.resolve();
    }),
    exchangeCodeForSession: vi.fn().mockResolvedValue({
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      expires_in: 3600
    })
  };
};

/**
 * mockBase64: Base64 인코딩 유틸리티 모킹
 * @returns 모킹된 Base64 유틸리티
 */
export const mockBase64 = () => {
  return {
    base64UrlEncode: vi.fn().mockReturnValue('test-base64url-encoded-string')
  };
};

/**
 * mockMiddleware: Next.js 미들웨어 모킹
 * @returns 모킹된 미들웨어 함수
 */
export const mockMiddleware = () => {
  return {
    middleware: vi.fn().mockImplementation(async () => {
      // 기본 응답은 "next" (접근 허용)
      return { type: 'next' };
    })
  };
};

/**
 * mockNextResponse: Next.js Response 객체 모킹
 * @returns 모킹된 NextResponse 객체
 */
export const mockNextResponse = () => {
  return {
    NextResponse: {
      next: vi.fn(() => ({ type: 'next' })),
      redirect: vi.fn((url) => ({ type: 'redirect', url })),
    }
  };
};

/**
 * mockAuthContext: 인증 컨텍스트 모킹
 * @returns 모킹된 인증 컨텍스트
 */
export const mockAuthContext = () => {
  return {
    AuthProvider: class AuthProvider {
      constructor(props: any) {
        this.props = props;
      }
      props: any;
      componentDidMount = vi.fn().mockResolvedValue(null);
    },
    signOut: vi.fn().mockResolvedValue(null),
    useUser: vi.fn().mockReturnValue({ id: 'test-user-id' })
  };
}; 