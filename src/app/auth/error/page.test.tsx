/**
 * 파일명: page.test.tsx
 * 목적: 인증 오류 페이지의 기능 테스트
 * 역할: 인증 과정에서 발생하는 오류 메시지가 올바르게 표시되는지 검증
 * 작성일: 2024-03-26
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import ErrorPage from './page';

// 모킹 데이터를 저장할 변수
let mockSearchParams = {
  error: 'default',
  error_description: ''
};

// next/navigation의 useSearchParams 모킹
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => ({
    get: vi.fn((param: string) => {
      if (param === 'error') return mockSearchParams.error;
      if (param === 'error_description') return mockSearchParams.error_description;
      return null;
    })
  }))
}));

describe('ErrorPage', () => {
  beforeEach(() => {
    // 각 테스트 전에 모킹 데이터 초기화
    mockSearchParams = {
      error: 'default',
      error_description: ''
    };
    // 콘솔 에러 메시지 무시
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('기본 오류 메시지를 표시', () => {
    render(<ErrorPage />);
    expect(screen.getByText('인증 과정에서 오류가 발생했습니다.')).toBeInTheDocument();
  });

  it('특정 오류 유형에 대한 메시지를 표시', () => {
    mockSearchParams.error = 'invalid_callback';
    render(<ErrorPage />);
    expect(screen.getByText('유효하지 않은 인증 콜백입니다.')).toBeInTheDocument();
  });

  it('오류 설명이 있을 경우 함께 표시', () => {
    mockSearchParams = {
      error: 'verification_failed',
      error_description: '이메일 주소가 확인되지 않았습니다.'
    };
    render(<ErrorPage />);
    expect(screen.getByText('이메일 인증에 실패했습니다.')).toBeInTheDocument();
    expect(screen.getByText('이메일 주소가 확인되지 않았습니다.')).toBeInTheDocument();
  });
}); 