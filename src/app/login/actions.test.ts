/**
 * 파일명: src/app/login/actions.test.ts
 * 목적: 로그인 및 회원가입 서버 액션 테스트
 * 역할: 로그인, 회원가입, 소셜 로그인 서버 액션의 동작 검증
 * 작성일: 2025-03-29
 * 수정일: 2025-04-24 : 새로운 액션 함수명 및 시그니처에 맞게 테스트 업데이트
 * 수정일: 2024-05-19 : Google OAuth 서버 함수 모킹으로 변경
 * 수정일: 2024-05-19 : Google OAuth 함수 모킹 경로 변경 (auth/server → auth-server)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loginAction, signupAction, googleSignInAction } from './actions'
import { signIn } from '@/lib/auth'
import { serverSignInWithGoogle } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import createLogger from '@/lib/logger'

// Next.js의 redirect를 모킹
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

// 로그인, 회원가입 함수 모킹
vi.mock('@/lib/auth', () => ({
  signIn: vi.fn(),
}))

// 서버용 Google OAuth 함수 모킹
vi.mock('@/lib/auth-server', () => ({
  serverSignInWithGoogle: vi.fn(),
}))

// 로거 모킹
vi.mock('@/lib/logger', () => ({
  default: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  })),
}))

describe('Login Actions', () => {
  let formData: FormData

  beforeEach(() => {
    formData = new FormData()
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('loginAction()', () => {
    it('이메일이나 비밀번호가 제공되지 않으면 오류 메시지와 함께 로그인 페이지로 리디렉션해야 한다', async () => {
      // 테스트 준비: 비어있는 formData
      
      // 테스트 실행
      await loginAction(formData)
      
      // 결과 검증
      expect(redirect).toHaveBeenCalledWith('/login?error=Missing+credentials')
    })

    it('로그인 성공 시 홈페이지로 리디렉션해야 한다', async () => {
      // 테스트 준비
      formData.append('email', 'user@example.com')
      formData.append('password', 'password123')
      
      const mockSignInResponse = { /* 성공 응답 객체 */}
      ;(signIn as any).mockResolvedValue(mockSignInResponse)
      
      // 테스트 실행
      await loginAction(formData)
      
      // 결과 검증
      expect(signIn).toHaveBeenCalledWith('user@example.com', 'password123')
      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('로그인 실패 시 오류 메시지와 함께 로그인 페이지로 리디렉션해야 한다', async () => {
      // 테스트 준비
      formData.append('email', 'user@example.com')
      formData.append('password', 'wrong-password')
      
      const error = new Error('Invalid credentials')
      ;(signIn as any).mockRejectedValue(error)
      
      // 테스트 실행
      await loginAction(formData)
      
      // 결과 검증
      expect(signIn).toHaveBeenCalledWith('user@example.com', 'wrong-password')
      expect(redirect).toHaveBeenCalledWith('/login?error=Invalid%20credentials')
    })
  })

  describe('signupAction()', () => {
    it('필수 필드가 누락되면 오류 메시지와 함께 회원가입 페이지로 리디렉션해야 한다', async () => {
      // 테스트 준비: 일부 필드 누락
      formData.append('email', 'newuser@example.com')
      // 비밀번호와 이름 필드 누락
      
      // 테스트 실행
      await signupAction(formData)
      
      // 결과 검증
      expect(redirect).toHaveBeenCalledWith('/signup?error=Missing+required+fields')
    })

    // 회원가입 성공 및 실패 테스트 케이스는 회원가입 로직 구현 시 추가
  })

  describe('googleSignInAction()', () => {
    it('Google 로그인이 성공하면 OAuth URL을 반환해야 한다', async () => {
      // 테스트 준비
      const mockOAuthUrl = 'https://accounts.google.com/oauth/v2/auth?...'
      ;(serverSignInWithGoogle as any).mockResolvedValue({
        success: true,
        url: mockOAuthUrl,
      })
      
      // 테스트 실행
      const result = await googleSignInAction()
      
      // 결과 검증
      expect(serverSignInWithGoogle).toHaveBeenCalled()
      expect(result).toEqual({ url: mockOAuthUrl })
    })

    it('Google 로그인 실패 시 오류 메시지와 함께 로그인 페이지로 리디렉션해야 한다', async () => {
      // 테스트 준비
      const errorMessage = 'Google OAuth 실패'
      ;(serverSignInWithGoogle as any).mockResolvedValue({
        success: false,
        error: errorMessage,
      })
      
      // 테스트 실행
      await googleSignInAction()
      
      // 결과 검증
      expect(serverSignInWithGoogle).toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith(`/login?error=${encodeURIComponent(errorMessage)}`)
    })

    it('예외 발생 시 오류 객체를 반환해야 한다', async () => {
      // 테스트 준비
      const error = new Error('네트워크 오류')
      ;(serverSignInWithGoogle as any).mockRejectedValue(error)
      
      // 테스트 실행
      const result = await googleSignInAction()
      
      // 결과 검증
      expect(serverSignInWithGoogle).toHaveBeenCalled()
      expect(result).toEqual({ error: '네트워크 오류' })
    })
  })
}) 