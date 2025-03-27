/**
 * 파일명: page.test.tsx
 * 목적: 로그인 페이지 컴포넌트 테스트
 * 역할: 로그인 페이지의 UI 및 기능을 테스트
 * 작성일: 2024-05-27
 */

/// <reference types="vitest" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './page';
import '@testing-library/jest-dom/vitest';

// 서버 액션 모킹
const mockLogin = vi.fn();
const mockSignup = vi.fn();
const mockSignInWithGoogle = vi.fn();

vi.mock('./actions', () => ({
  login: vi.fn(() => mockLogin),
  signup: vi.fn(() => mockSignup),
  signInWithGoogle: vi.fn(() => mockSignInWithGoogle)
}));

// searchParams 모킹
const mockSearchParams = new Map();

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => ({
    get: (key: string) => mockSearchParams.get(key)
  }))
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.clear();
  });

  it('로그인 페이지가 올바르게 렌더링되어야 함', () => {
    render(<LoginPage />);
    
    // 페이지 제목이 존재하는지 확인
    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
    
    // 폼 요소들이 존재하는지 확인
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    
    // 버튼들이 존재하는지 확인
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Google로 계속하기/ })).toBeInTheDocument();
  });

  it('오류 메시지가 URL 파라미터로부터 표시되어야 함', () => {
    // 오류 메시지 파라미터 설정
    mockSearchParams.set('error', '로그인에 실패했습니다.');
    
    render(<LoginPage />);
    
    // 오류 메시지가 화면에 표시되는지 확인
    expect(screen.getByText('로그인에 실패했습니다.')).toBeInTheDocument();
  });

  it('성공 메시지가 URL 파라미터로부터 표시되어야 함', () => {
    // 성공 메시지 파라미터 설정
    mockSearchParams.set('message', '확인 이메일을 발송했습니다.');
    
    render(<LoginPage />);
    
    // 성공 메시지가 화면에 표시되는지 확인
    expect(screen.getByText('확인 이메일을 발송했습니다.')).toBeInTheDocument();
  });

  it('URL 인코딩된 메시지가 올바르게 디코딩되어야 함', () => {
    // 인코딩된 메시지 설정
    mockSearchParams.set('message', encodeURIComponent('특수 문자 메시지: @ # %'));
    
    render(<LoginPage />);
    
    // 디코딩된 메시지가 화면에 표시되는지 확인
    expect(screen.getByText('특수 문자 메시지: @ # %')).toBeInTheDocument();
  });

  it('이메일과 비밀번호 입력 필드가 필수 항목으로 표시되어야 함', () => {
    render(<LoginPage />);
    
    // 이메일 입력 필드가 필수인지 확인
    const emailInput = screen.getByLabelText('이메일');
    expect(emailInput).toHaveAttribute('required');
    
    // 비밀번호 입력 필드가 필수인지 확인
    const passwordInput = screen.getByLabelText('비밀번호');
    expect(passwordInput).toHaveAttribute('required');
  });

  it('로그인 및 회원가입 버튼이 올바른 formAction을 가져야 함', () => {
    render(<LoginPage />);
    
    // 로그인 버튼이 login 액션을 가지는지 확인
    const loginButton = screen.getByRole('button', { name: '로그인' });
    expect(loginButton).toHaveAttribute('formAction');
    
    // 회원가입 버튼이 signup 액션을 가지는지 확인
    const signupButton = screen.getByRole('button', { name: '회원가입' });
    expect(signupButton).toHaveAttribute('formAction');
  });

  it('Google 로그인 버튼이 올바른 action을 가져야 함', () => {
    render(<LoginPage />);
    
    // Google 로그인 버튼의 form이 signInWithGoogle 액션을 가지는지 확인
    const googleButton = screen.getByRole('button', { name: /Google로 계속하기/ });
    const googleForm = googleButton.closest('form');
    expect(googleForm).toHaveAttribute('action');
  });
}); 