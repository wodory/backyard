/**
 * 파일명: page.test.tsx
 * 목적: OAuth 콜백 페이지 컴포넌트 테스트
 * 역할: 클라이언트 측 인증 처리 UI 및 상태 관리 검증
 * 작성일: 2025-04-09
 * 수정일: 2025-04-09 : useAuthCallback 훅 사용 방식으로 테스트 리팩토링
 * 수정일: 2025-04-10 : 테스트 안정성 개선 및 타이머 모킹 수정
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import CallbackHandler from "./page";
import { useAuthCallback } from "@/hooks/useAuthCallback";

// mock 설정
const mockPush = vi.fn();

// 테스트 설정
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  })
}));

vi.mock('@/lib/logger', () => ({
  default: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  })
}));

// useAuthCallback 훅 모킹
vi.mock('@/hooks/useAuthCallback');
const mockUseAuthCallback = useAuthCallback as ReturnType<typeof vi.fn>;

// 테스트
describe("CallbackHandler 컴포넌트", () => {
  // 원래 window.location 저장
  const originalLocation = window.location;

  beforeAll(() => {
    // 테스트 시작 전 타이머 설정
    vi.useFakeTimers();
  });

  beforeEach(() => {
    vi.resetAllMocks();

    // useAuthCallback 기본 반환값 설정
    mockUseAuthCallback.mockReturnValue({
      processingState: '초기화 중',
      error: null,
      redirectUrl: null
    });

    // window.location 초기화
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'http://localhost:3000/auth/callback?code=test-code'
      }
    });

    // router.push 모킹 초기화
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  afterAll(() => {
    // 타이머 복원
    vi.useRealTimers();

    // window.location 복원
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation
    });
  });

  // 테스트 환경 확인
  it("테스트 환경이 올바르게 설정되었는지 확인", () => {
    expect(useAuthCallback).toBeDefined();
    expect(mockPush).toBeDefined();
  });

  // 기본 렌더링 테스트
  it("컴포넌트가 로딩 상태를 표시해야 함", () => {
    // 초기화 중 상태 설정
    mockUseAuthCallback.mockReturnValue({
      processingState: '초기화 중',
      error: null,
      redirectUrl: null
    });

    render(<CallbackHandler />);
    expect(screen.getByText("인증 처리 중...")).toBeInTheDocument();
    expect(screen.getByText("초기화 중")).toBeInTheDocument();
  });

  // 성공 경로 테스트
  it("훅이 성공 상태와 리다이렉션 URL을 반환하면 홈페이지로 이동해야 함", () => {
    // 성공 상태 및 리디렉션 URL 설정
    mockUseAuthCallback.mockReturnValue({
      processingState: '완료, 리디렉션 중',
      error: null,
      redirectUrl: '/'
    });

    render(<CallbackHandler />);

    // UI 상태 확인
    expect(screen.getByText("완료, 리디렉션 중")).toBeInTheDocument();

    // useEffect 실행을 위해 타이머 진행
    vi.runAllTimers();

    // 리다이렉션 확인
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  // 오류 경로 테스트
  it("훅이 오류 상태를 반환하면 오류 메시지를 표시하고 에러 페이지로 이동해야 함", () => {
    // 오류 상태 및 에러 리다이렉션 URL 설정
    mockUseAuthCallback.mockReturnValue({
      processingState: '오류 발생',
      error: '테스트 에러 발생',
      redirectUrl: '/auth/error?error=test_error'
    });

    render(<CallbackHandler />);

    // UI 상태 확인 (오류 메시지 표시 확인)
    expect(screen.getByText("오류: 테스트 에러 발생")).toBeInTheDocument();

    // useEffect 실행을 위해 타이머 진행
    vi.runAllTimers();

    // 리다이렉션 확인
    expect(mockPush).toHaveBeenCalledWith('/auth/error?error=test_error');
  });

  // 인증 코드 처리 중 상태 테스트
  it("훅이 인증 코드 처리 중 상태를 반환하면 해당 메시지를 표시해야 함", () => {
    mockUseAuthCallback.mockReturnValue({
      processingState: '인증 코드 처리 중',
      error: null,
      redirectUrl: null
    });

    render(<CallbackHandler />);

    expect(screen.getByText("인증 코드 처리 중")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  // 인증 데이터 저장 중 상태 테스트
  it("훅이 인증 데이터 저장 중 상태를 반환하면 해당 메시지를 표시해야 함", () => {
    mockUseAuthCallback.mockReturnValue({
      processingState: '인증 데이터 저장 중',
      error: null,
      redirectUrl: null
    });

    render(<CallbackHandler />);

    expect(screen.getByText("인증 데이터 저장 중")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  // 예외 발생 상태 테스트
  it("훅이 예외 발생 상태를 반환하면 오류 메시지를 표시하고 에러 페이지로 이동해야 함", () => {
    mockUseAuthCallback.mockReturnValue({
      processingState: '예외 발생',
      error: '콜백 처리 중 예외 발생',
      redirectUrl: '/auth/error?error=callback_error&error_description=인증 콜백 처리 중 오류가 발생했습니다.'
    });

    render(<CallbackHandler />);

    expect(screen.getByText("예외 발생")).toBeInTheDocument();
    expect(screen.getByText("오류: 콜백 처리 중 예외 발생")).toBeInTheDocument();

    // useEffect 실행을 위해 타이머 진행
    vi.runAllTimers();

    // 리다이렉션 확인
    expect(mockPush).toHaveBeenCalledWith('/auth/error?error=callback_error&error_description=인증 콜백 처리 중 오류가 발생했습니다.');
  });

  // 리다이렉션 없는 경우 테스트
  it("redirectUrl이 없으면 리다이렉션이 발생하지 않아야 함", () => {
    mockUseAuthCallback.mockReturnValue({
      processingState: '인증 코드 처리 중',
      error: null,
      redirectUrl: null
    });

    render(<CallbackHandler />);

    // useEffect 실행을 위해 타이머 진행
    vi.runAllTimers();

    expect(mockPush).not.toHaveBeenCalled();
  });
}); 