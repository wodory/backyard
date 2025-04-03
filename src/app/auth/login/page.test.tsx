/**
 * 파일명: src/app/auth/login/page.test.tsx
 * 목적: 로그인 페이지의 기능 테스트
 * 역할: 로그인 UI 및 소셜 로그인 기능 검증
 * 작성일: 2024-03-31
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import LoginPage from './page';
import { signIn } from 'next-auth/react';

// 타임아웃 설정
const TEST_TIMEOUT = 10000;

// 모듈 모킹 - 간단하게 유지
vi.mock('next-auth/react', () => ({
  signIn: vi.fn()
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('로그인 페이지가 올바르게 렌더링되어야 합니다', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
    expect(screen.getByText('소셜 계정으로 간편하게 로그인하세요.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Google로 로그인' })).toBeInTheDocument();
  });

  it('로그인 버튼이 활성화된 상태로 표시되어야 합니다', () => {
    render(<LoginPage />);

    const loginButton = screen.getByRole('button', { name: 'Google로 로그인' });
    expect(loginButton).toBeEnabled();
  });

  it('Google 로그인 버튼 클릭 시 signIn이 올바른 인자와 함께 호출되어야 합니다', () => {
    render(<LoginPage />);

    const loginButton = screen.getByRole('button', { name: 'Google로 로그인' });

    act(() => {
      fireEvent.click(loginButton);
    });

    expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/' });
    expect(signIn).toHaveBeenCalledTimes(1);
  });

  it('로그인 중에는 버튼이 비활성화되고 로딩 텍스트가 표시되어야 합니다', () => {
    // 지연된 Promise 반환
    vi.mocked(signIn).mockImplementation(() => {
      return new Promise(() => { }) as any;
    });

    render(<LoginPage />);

    const loginButton = screen.getByRole('button', { name: 'Google로 로그인' });

    act(() => {
      fireEvent.click(loginButton);
    });

    // 버튼 상태 확인
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('로그인 중...')).toBeInTheDocument();
  });

  it('로그인 오류 발생 시 콘솔에 오류가 기록되어야 합니다', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    const testError = new Error('로그인 실패');

    // 콜백으로 Promise reject 처리
    vi.mocked(signIn).mockImplementationOnce(() => {
      return Promise.reject(testError) as any;
    });

    render(<LoginPage />);

    const loginButton = screen.getByRole('button', { name: 'Google로 로그인' });

    // 클릭 이벤트
    act(() => {
      fireEvent.click(loginButton);
    });

    // setState가 완료되기를 기다림
    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('로그인 오류:', testError);
    });

    consoleSpy.mockRestore();
  }, TEST_TIMEOUT);  // 타임아웃 설정

  it('로그인 시도 후 버튼이 다시 활성화되어야 합니다', async () => {
    const testError = new Error('로그인 실패');

    // Promise.reject를 반환하고 상태 변경이 발생하도록 함
    vi.mocked(signIn).mockImplementationOnce(() => {
      return Promise.reject(testError) as any;
    });

    render(<LoginPage />);

    // 초기 버튼 상태 확인
    const loginButton = screen.getByRole('button', { name: 'Google로 로그인' });
    expect(loginButton).toBeEnabled();

    // 클릭 이벤트
    act(() => {
      fireEvent.click(loginButton);
    });

    // finally 블록 실행 후 버튼 상태 확인
    await vi.waitFor(() => {
      // finally 블록에서 버튼이 다시 활성화됨
      const updatedButton = screen.getByRole('button');
      expect(updatedButton).toBeEnabled();
      expect(updatedButton).toHaveTextContent('Google로 로그인');
    });
  }, TEST_TIMEOUT);  // 타임아웃 설정
}); 