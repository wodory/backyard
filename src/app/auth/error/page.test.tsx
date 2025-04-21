/**
 * 파일명: src/app/auth/error/page.test.tsx
 * 목적: 인증 오류 페이지의 기능 테스트
 * 역할: 인증 과정에서 발생하는 오류 메시지가 올바르게 표시되는지 검증
 * 작성일: 2025-03-27
 * 수정일: 2025-03-30
 * 수정일: 2024-09-28 : 컴포넌트 구조 변경에 따른 테스트 업데이트
 * 수정일: 2025-04-21 : 직접 useSearchParams를 사용하는 방식으로 테스트 업데이트
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import ErrorPage from './page';

// 모킹 설정
const mockGet = vi.fn();

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGet
  })
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}));

describe('ErrorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('기본 오류 메시지를 올바르게 표시해야 합니다', () => {
    mockGet.mockImplementation(() => null);
    render(<ErrorPage />);

    expect(screen.getByRole('heading', { name: '인증 오류' })).toBeInTheDocument();
    expect(screen.getByText(/인증 도중 오류가 발생했습니다:/)).toHaveTextContent('인증 도중 오류가 발생했습니다: Unknown error');
  });

  it('URL에서 전달된 오류 메시지를 표시해야 합니다', () => {
    mockGet.mockImplementation(() => 'Access Denied');
    render(<ErrorPage />);

    expect(screen.getByText(/인증 도중 오류가 발생했습니다:/)).toHaveTextContent('인증 도중 오류가 발생했습니다: Access Denied');
  });

  it('로그인 페이지로 돌아가기 링크가 올바르게 작동해야 합니다', async () => {
    mockGet.mockImplementation(() => null);
    render(<ErrorPage />);

    const loginLink = screen.getByRole('link', { name: '로그인 페이지로 돌아가기' });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('홈으로 돌아가기 링크가 올바르게 작동해야 합니다', async () => {
    mockGet.mockImplementation(() => null);
    render(<ErrorPage />);

    const homeLink = screen.getByRole('link', { name: '홈으로 돌아가기' });
    expect(homeLink).toHaveAttribute('href', '/');
  });
}); 