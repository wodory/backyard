/**
 * 파일명: src/app/auth/error/page.test.tsx
 * 목적: 인증 오류 페이지의 기능 테스트
 * 역할: 인증 과정에서 발생하는 오류 메시지가 올바르게 표시되는지 검증
 * 작성일: 2025-03-27
 * 수정일: 2025-03-30
 */

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import ErrorPage from './page';

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

describe('ErrorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((param: string) => {
      if (param === 'error') return 'default';
      if (param === 'error_description') return '';
      return null;
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('기본 오류 메시지를 올바르게 표시해야 합니다', () => {
    render(<ErrorPage />);
    
    expect(screen.getByRole('heading', { name: '인증 오류' })).toBeInTheDocument();
    expect(screen.getByText('인증 과정에서 오류가 발생했습니다.')).toBeInTheDocument();
  });

  it('특정 오류 유형에 대한 메시지를 올바르게 표시해야 합니다', () => {
    mockGet.mockImplementation((param: string) => {
      if (param === 'error') return 'invalid_callback';
      if (param === 'error_description') return '';
      return null;
    });

    render(<ErrorPage />);
    
    expect(screen.getByText('유효하지 않은 인증 콜백입니다.')).toBeInTheDocument();
  });

  it('오류 설명이 있을 경우 함께 표시해야 합니다', () => {
    mockGet.mockImplementation((param: string) => {
      if (param === 'error') return 'verification_failed';
      if (param === 'error_description') return '이메일 주소가 확인되지 않았습니다.';
      return null;
    });

    render(<ErrorPage />);
    
    expect(screen.getByText('이메일 인증에 실패했습니다.')).toBeInTheDocument();
    expect(screen.getByText('이메일 주소가 확인되지 않았습니다.')).toBeInTheDocument();
  });

  it('알 수 없는 오류 유형에 대해 기본 메시지를 표시해야 합니다', () => {
    mockGet.mockImplementation((param: string) => {
      if (param === 'error') return 'unknown_error';
      return null;
    });

    render(<ErrorPage />);
    
    expect(screen.getByText('인증 과정에서 오류가 발생했습니다.')).toBeInTheDocument();
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

  it('오류 발생 시 콘솔에 로그를 남겨야 합니다', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    mockGet.mockImplementation((param: string) => {
      if (param === 'error') return 'test_error';
      if (param === 'error_description') return 'Test error description';
      return null;
    });

    render(<ErrorPage />);

    expect(consoleSpy).toHaveBeenCalledWith('인증 오류:', {
      error: 'test_error',
      description: 'Test error description'
    });
  });
}); 