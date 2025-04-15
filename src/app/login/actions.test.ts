/**
 * 파일명: actions.test.ts
 * 목적: 로그인 관련 서버 액션 테스트
 * 역할: 로그인/회원가입 함수의 동작을 검증
 * 작성일: 2025-03-27
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { login, signup, signInWithGoogle } from './actions';

// 모킹 객체 생성
const mocks = vi.hoisted(() => ({
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signInWithOAuth: vi.fn()
  },
  redirectFn: vi.fn((url) => ({ redirectUrl: url }))
}));

// Supabase와 Next.js 모듈 모킹
vi.mock('@/utils/supabase/server', () => ({
  createClient: () => ({
    auth: mocks.auth
  })
}));

vi.mock('next/navigation', () => ({
  redirect: mocks.redirectFn
}));

// process.env 모킹
const originalEnv = process.env;

describe('인증 액션 테스트', () => {
  let formData: FormData;
  
  beforeEach(() => {
    // FormData 초기화
    formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');
    
    // 콘솔 에러 모킹
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // process.env 모킹
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_APP_URL: 'https://example.com'
    };
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    process.env = originalEnv;
  });
  
  describe('login()', () => {
    it('로그인 성공 시 홈페이지로 리다이렉트 해야 함', async () => {
      // 성공 응답 모킹
      mocks.auth.signInWithPassword.mockResolvedValue({ error: null });
      
      // 로그인 함수 호출
      await login(formData);
      
      // 인증 함수가 올바른 인자로 호출되었는지 확인
      expect(mocks.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      
      // 성공 시 홈페이지로 리다이렉트되는지 확인
      expect(mocks.redirectFn).toHaveBeenCalledWith('/');
    });
    
    it('로그인 실패 시 오류 메시지와 함께 로그인 페이지로 리다이렉트 해야 함', async () => {
      // 오류 응답 모킹
      const mockError = { message: '이메일 또는 비밀번호가 잘못되었습니다.' };
      mocks.auth.signInWithPassword.mockResolvedValue({ error: mockError });
      
      // 로그인 함수 호출
      await login(formData);
      
      // 오류 시 로그인 페이지로 리다이렉트되는지 확인
      expect(mocks.redirectFn).toHaveBeenCalledWith(
        `/login?error=${encodeURIComponent(mockError.message)}`
      );
    });
  });
  
  describe('signup()', () => {
    it('회원가입 성공 시 성공 메시지와 함께 로그인 페이지로 리다이렉트 해야 함', async () => {
      // 성공 응답 모킹
      mocks.auth.signUp.mockResolvedValue({ error: null });
      
      // 회원가입 함수 호출
      await signup(formData);
      
      // 인증 함수가 올바른 인자로 호출되었는지 확인
      expect(mocks.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'https://example.com/auth/callback'
        }
      });
      
      // 성공 시 메시지와 함께 로그인 페이지로 리다이렉트되는지 확인
      expect(mocks.redirectFn).toHaveBeenCalledWith(
        '/login?message=확인 이메일을 발송했습니다. 이메일을 확인해주세요.'
      );
    });
    
    it('회원가입 실패 시 오류 메시지와 함께 로그인 페이지로 리다이렉트 해야 함', async () => {
      // 오류 응답 모킹
      const mockError = { message: '이미 사용 중인 이메일입니다.' };
      mocks.auth.signUp.mockResolvedValue({ error: mockError });
      
      // 회원가입 함수 호출
      await signup(formData);
      
      // 오류 시 로그인 페이지로 리다이렉트되는지 확인
      expect(mocks.redirectFn).toHaveBeenCalledWith(
        `/login?error=${encodeURIComponent(mockError.message)}`
      );
    });
    
    it('NEXT_PUBLIC_APP_URL이 없을 때 기본값으로 localhost:3000을 사용해야 함', async () => {
      // NEXT_PUBLIC_APP_URL 제거
      process.env.NEXT_PUBLIC_APP_URL = undefined;
      
      // 성공 응답 모킹
      mocks.auth.signUp.mockResolvedValue({ error: null });
      
      // 회원가입 함수 호출
      await signup(formData);
      
      // 기본 URL이 사용되는지 확인
      expect(mocks.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback'
        }
      });
    });
  });
  
  describe('signInWithGoogle()', () => {
    it('구글 로그인 성공 시 반환된 URL로 리다이렉트 해야 함', async () => {
      // 성공 응답 모킹
      const mockUrl = 'https://accounts.google.com/o/oauth2/auth?...';
      mocks.auth.signInWithOAuth.mockResolvedValue({
        data: { url: mockUrl },
        error: null
      });
      
      // 구글 로그인 함수 호출
      await signInWithGoogle();
      
      // OAuth 함수가 올바른 인자로 호출되었는지 확인
      expect(mocks.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'https://example.com/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      // 반환된 URL로 리다이렉트되는지 확인
      expect(mocks.redirectFn).toHaveBeenCalledWith(mockUrl);
    });
    
    it('구글 로그인 실패 시 오류 메시지와 함께 로그인 페이지로 리다이렉트 해야 함', async () => {
      // 오류 응답 모킹
      const mockError = { message: '인증 요청 실패' };
      mocks.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: mockError
      });
      
      // 구글 로그인 함수 호출
      await signInWithGoogle();
      
      // 오류 시 로그인 페이지로 리다이렉트되는지 확인
      expect(mocks.redirectFn).toHaveBeenCalledWith(
        `/login?error=${encodeURIComponent(mockError.message)}`
      );
    });
    
    it('URL이 없는 경우 홈페이지로 리다이렉트 해야 함', async () => {
      // URL이 없는 성공 응답 모킹
      mocks.auth.signInWithOAuth.mockResolvedValue({
        data: { url: null },
        error: null
      });
      
      // 구글 로그인 함수 호출
      await signInWithGoogle();
      
      // 홈페이지로 리다이렉트되는지 확인
      expect(mocks.redirectFn).toHaveBeenCalledWith('/');
    });
  });
}); 