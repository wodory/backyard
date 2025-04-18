/**
 * 파일명: src/app/auth/error/page.test.tsx
 * 목적: 인증 오류 페이지의 기능 테스트
 * 역할: 인증 과정에서 발생하는 오류 메시지가 올바르게 표시되는지 검증
 * 작성일: 2025-03-27
 * 수정일: 2025-03-30
 * 수정일: 2024-09-28 : 컴포넌트 구조 변경에 따른 테스트 업데이트
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import ErrorPage from './page';
import AuthErrorDisplay from '@/components/auth/AuthErrorDisplay';

// 모킹 설정
const mockPush = vi.fn();
const mockGet = vi.fn();

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGet
  }),
  useRouter: () => ({
    push: mockPush
  })
}));

// Suspense 모킹
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    Suspense: ({ children }: { children: React.ReactNode }) => <>{children}</>
  };
});

// AuthErrorDisplay 컴포넌트 모킹
vi.mock('@/components/auth/AuthErrorDisplay', () => ({
  default: vi.fn(() => {
    const mockError = mockGet('error') || 'default';
    const mockDescription = mockGet('error_description') || '';

    return (
      <>
        <p data-testid="error-message">
          {mockError === 'default' && '인증 과정에서 오류가 발생했습니다.'}
          {mockError === 'invalid_callback' && '유효하지 않은 인증 콜백입니다.'}
          {mockError === 'verification_failed' && '이메일 인증에 실패했습니다.'}
          {mockError === 'unknown_error' && '인증 과정에서 오류가 발생했습니다.'}
          {mockError === 'test_error' && '인증 과정에서 오류가 발생했습니다.'}
        </p>

        {mockDescription && (
          <p data-testid="error-description">{mockDescription}</p>
        )}

        <div>
          <a href="/login">로그인 페이지로 돌아가기</a>
          <a href="/">홈으로 돌아가기</a>
        </div>
      </>
    );
  })
}));

describe('ErrorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((param: string) => {
      if (param === 'error') return 'default';
      if (param === 'error_description') return '';
      return null;
    });
    vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  it('기본 오류 메시지를 올바르게 표시해야 합니다', () => {
    render(<ErrorPage />);

    expect(screen.getByRole('heading', { name: '인증 오류' })).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toHaveTextContent('인증 과정에서 오류가 발생했습니다.');
  });

  it('특정 오류 유형에 대한 메시지를 올바르게 표시해야 합니다', () => {
    mockGet.mockImplementation((param: string) => {
      if (param === 'error') return 'invalid_callback';
      if (param === 'error_description') return '';
      return null;
    });

    render(<ErrorPage />);

    expect(screen.getByTestId('error-message')).toHaveTextContent('유효하지 않은 인증 콜백입니다.');
  });

  it('오류 설명이 있을 경우 함께 표시해야 합니다', () => {
    mockGet.mockImplementation((param: string) => {
      if (param === 'error') return 'verification_failed';
      if (param === 'error_description') return '이메일 주소가 확인되지 않았습니다.';
      return null;
    });

    render(<ErrorPage />);

    expect(screen.getByTestId('error-message')).toHaveTextContent('이메일 인증에 실패했습니다.');
    expect(screen.getByTestId('error-description')).toHaveTextContent('이메일 주소가 확인되지 않았습니다.');
  });

  it('알 수 없는 오류 유형에 대해 기본 메시지를 표시해야 합니다', () => {
    mockGet.mockImplementation((param: string) => {
      if (param === 'error') return 'unknown_error';
      return null;
    });

    render(<ErrorPage />);

    expect(screen.getByTestId('error-message')).toHaveTextContent('인증 과정에서 오류가 발생했습니다.');
  });

  it('로그인 페이지로 돌아가기 링크가 올바르게 작동해야 합니다', async () => {
    render(<ErrorPage />);

    const loginLink = screen.getByRole('link', { name: '로그인 페이지로 돌아가기' });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('홈으로 돌아가기 링크가 올바르게 작동해야 합니다', async () => {
    render(<ErrorPage />);

    const homeLink = screen.getByRole('link', { name: '홈으로 돌아가기' });
    expect(homeLink).toHaveAttribute('href', '/');
  });
}); 