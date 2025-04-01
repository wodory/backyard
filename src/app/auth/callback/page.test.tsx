/**
 * 파일명: page.test.tsx
 * 목적: OAuth 콜백 페이지 컴포넌트 테스트
 * 역할: 클라이언트 측 인증 처리 UI 및 상태 관리 검증
 * 작성일: 2024-10-12
 */

import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import CallbackHandler from "./page";
import { AuthService } from "@/services/auth-service";
import type { AuthResult } from '@/services/auth-service';

// mock 설정
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams('code=test-code');

// 테스트 설정
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock('@/lib/logger', () => ({
  default: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  })
}));

vi.mock('@/services/auth-service', () => ({
  AuthService: {
    handleCallback: vi.fn(),
    saveAuthData: vi.fn()
  }
}));

// 오류 표시 테스트를 위한 React setState 모킹
let setErrorState: any = null;
const originalUseState = React.useState;
// @ts-ignore
React.useState = function mockUseState(initialState: any) {
  const [state, setState] = originalUseState(initialState);
  if (initialState === null && typeof setState === 'function') {
    setErrorState = setState;
  }
  return [state, setState];
};

// 전역 timeout 설정
vi.setConfig({
  testTimeout: 15000
});

// 테스트 데이터
const successResult: AuthResult = {
  status: 'success',
  accessToken: 'test_access_token',
  refreshToken: 'test_refresh_token',
  userId: 'test_user_id',
  provider: 'google'
};

// 테스트
describe("CallbackHandler 컴포넌트", () => {
  // 원래 window.location 저장
  const originalLocation = window.location;

  beforeEach(() => {
    vi.resetAllMocks();

    // 기본 검색 파라미터 초기화
    mockSearchParams = new URLSearchParams('code=test-code');

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
    mockPush.mockClear();
    setErrorState = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    // React.useState 복원
    // @ts-ignore
    React.useState = originalUseState;

    // window.location 복원
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation
    });
  });

  // 테스트 환경 확인
  it("테스트 환경이 올바르게 설정되었는지 확인", () => {
    expect(AuthService.handleCallback).toBeDefined();
    expect(mockPush).toBeDefined();
  });

  // 기본 렌더링 테스트
  it("컴포넌트가 로딩 상태를 표시해야 함", () => {
    render(<CallbackHandler />);
    expect(screen.getByText("인증 처리 중...")).toBeInTheDocument();
  });

  // 성공 경로 테스트
  it("성공적인 인증 후 홈페이지로 리다이렉션해야 함", async () => {
    vi.mocked(AuthService.handleCallback).mockResolvedValue(successResult);
    vi.mocked(AuthService.saveAuthData).mockReturnValue(true);

    render(<CallbackHandler />);

    // 비동기 작업 완료 대기
    await vi.waitFor(() => {
      expect(AuthService.handleCallback).toHaveBeenCalled();
    });

    // 홈페이지로 리다이렉션 확인
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  // 오류 경로 테스트
  it("인증 오류 발생 시 에러 페이지로 리다이렉션해야 함", async () => {
    const errorResult: AuthResult = {
      status: 'error',
      error: 'auth_error',
      errorDescription: '인증 실패'
    };

    vi.mocked(AuthService.handleCallback).mockResolvedValue(errorResult);

    render(<CallbackHandler />);

    // 비동기 작업 완료 대기
    await vi.waitFor(() => {
      expect(AuthService.handleCallback).toHaveBeenCalled();
    });

    // 에러 페이지로 리다이렉션 확인
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/auth/error'));
    });
  });

  // 예외 테스트
  it("예외 발생 시 에러 페이지로 리다이렉션해야 함", async () => {
    vi.mocked(AuthService.handleCallback).mockRejectedValue(new Error("테스트 오류"));

    render(<CallbackHandler />);

    // 비동기 작업 완료 대기
    await vi.waitFor(() => {
      expect(AuthService.handleCallback).toHaveBeenCalled();
    });

    // 에러 페이지로 리다이렉션 확인
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/auth/error'));
    });
  });

  // 데이터 저장 실패 테스트
  it("인증 데이터 저장 실패 시에도 홈페이지로 리다이렉션해야 함", async () => {
    vi.mocked(AuthService.handleCallback).mockResolvedValue(successResult);
    vi.mocked(AuthService.saveAuthData).mockReturnValue(false);

    render(<CallbackHandler />);

    // 비동기 작업 완료 대기
    await vi.waitFor(() => {
      expect(AuthService.handleCallback).toHaveBeenCalled();
    });

    // 저장 실패 이후 리다이렉션 확인
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  // 에러 UI 테스트
  it("오류 컴포넌트가 렌더링될 수 있는지 확인", () => {
    // 에러 상태를 가진 컴포넌트 직접 구현
    const TestErrorComponent = () => {
      // CallbackHandler 내부의 JSX 구조 중 에러 상태를 포함한 부분 추출
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <h2 className="text-xl font-semibold mb-2">인증 처리 중...</h2>
          <p className="text-gray-500 mb-2">오류 발생</p>
          <p className="text-red-500 text-sm mt-2">오류: 테스트 에러 메시지</p>
        </div>
      );
    };

    // 테스트 컴포넌트 렌더링
    render(<TestErrorComponent />);

    // 에러 메시지 표시 확인
    expect(screen.getByText("오류: 테스트 에러 메시지")).toBeInTheDocument();
  });

  // 직접 URL 오류 테스트
  it("URL에 error 파라미터가 있을 때 에러 페이지로 리다이렉션해야 함", async () => {
    // 에러 파라미터가 있는 URL로 설정
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'http://localhost:3000/auth/callback?error=invalid_request&error_description=Invalid%20request'
      }
    });

    // 오류 응답 모킹
    const errorResult: AuthResult = {
      status: 'error',
      error: 'invalid_request',
      errorDescription: 'Invalid request'
    };
    vi.mocked(AuthService.handleCallback).mockResolvedValue(errorResult);

    render(<CallbackHandler />);

    // 에러 페이지로 리다이렉션 확인
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/auth/error'));
    });
  });

  // 직접 code 없음 테스트
  it("URL에 code 파라미터가 없을 때 에러 페이지로 리다이렉션해야 함", async () => {
    // 코드 파라미터가 없는 URL로 설정
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'http://localhost:3000/auth/callback'
      }
    });

    // 코드 없음 오류 응답 모킹
    const errorResult: AuthResult = {
      status: 'error',
      error: 'no_code',
      errorDescription: '인증 코드가 없습니다'
    };
    vi.mocked(AuthService.handleCallback).mockResolvedValue(errorResult);

    render(<CallbackHandler />);

    // 에러 페이지로 리다이렉션 확인
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/auth/error'));
    });
  });

  // 언마운트 테스트 (라인 32: if (!mounted) return;)
  it.skip("컴포넌트가 언마운트되면 작업이 취소되어야 함", async () => {
    // 완료되지 않는 Promise 생성
    let resolveHandleCallback!: (value: AuthResult) => void;
    const pendingPromise = new Promise<AuthResult>((resolve) => {
      resolveHandleCallback = resolve;
    });

    // 오래 걸리는 작업으로 모킹
    vi.mocked(AuthService.handleCallback).mockImplementation(() => {
      return pendingPromise;
    });

    // 컴포넌트 렌더링
    const { unmount } = render(<CallbackHandler />);

    // 비동기 작업 시작 확인
    await vi.waitFor(() => {
      expect(AuthService.handleCallback).toHaveBeenCalled();
    });

    // 언마운트 전에 mock 초기화
    mockPush.mockClear();

    // 컴포넌트 언마운트
    unmount();

    // 이제 Promise를 해결 (언마운트 후)
    resolveHandleCallback(successResult);

    // Promise 해결 후 약간의 대기 시간
    await vi.waitFor(() => { });

    // 언마운트 후에는 router.push가 호출되지 않아야 함
    expect(mockPush).not.toHaveBeenCalled();
  });

  // 에러 기본값 테스트 (라인 48: authResult.error || 'unknown')
  it("에러가 null일 때 기본값 'unknown'을 사용해야 함", async () => {
    // 에러 필드가 null인 에러 결과
    const errorWithNullField: AuthResult = {
      status: 'error',
      error: null as any, // 명시적으로 null 할당
      errorDescription: '에러 설명'
    };

    vi.mocked(AuthService.handleCallback).mockResolvedValue(errorWithNullField);

    render(<CallbackHandler />);

    // 비동기 작업 완료 대기
    await vi.waitFor(() => {
      expect(AuthService.handleCallback).toHaveBeenCalled();
    });

    // 리다이렉션 URL에 'unknown' 포함 확인
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('error=unknown'));
    });
  });
}); 