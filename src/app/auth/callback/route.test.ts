/**
 * 파일명: route.test.ts
 * 목적: OAuth 콜백 처리 라우트 테스트
 * 역할: 인증 콜백의 다양한 시나리오 테스트
 * 작성일: 2024-03-31
 */

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// 모의 객체 생성
const mocks = vi.hoisted(() => {
  return {
    supabaseClient: {
      auth: {
        exchangeCodeForSession: vi.fn()
      }
    },
    createClient: vi.fn()
  }
})

// Supabase 클라이언트 모킹
vi.mock('@/utils/supabase/server', () => ({
  createClient: () => mocks.supabaseClient
}))

// next/server 모킹
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server') as any
  return {
    ...actual,
    NextResponse: {
      redirect: vi.fn((url) => ({ url }))
    }
  }
})

describe('OAuth Callback Route Handler', () => {
  let request: NextRequest

  beforeEach(() => {
    vi.clearAllMocks()
    request = new NextRequest(new URL('http://localhost:3000/auth/callback?code=test_code'))
  })

  it('성공적으로 인증 코드를 교환하고 홈으로 리다이렉트', async () => {
    // 성공 시나리오 설정
    mocks.supabaseClient.auth.exchangeCodeForSession.mockResolvedValueOnce({ error: null })

    // GET 핸들러 임포트 및 실행
    const { GET } = await import('./route')
    const response = await GET(request)

    // 검증
    expect(mocks.supabaseClient.auth.exchangeCodeForSession).toHaveBeenCalledWith('test_code')
    expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('/', request.url))
  })

  it('인증 코드가 없을 경우 에러 페이지로 리다이렉트', async () => {
    // 코드가 없는 요청 생성
    request = new NextRequest(new URL('http://localhost:3000/auth/callback'))

    // GET 핸들러 임포트 및 실행
    const { GET } = await import('./route')
    const response = await GET(request)

    // 검증
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL('/login?error=인증 코드를 찾을 수 없습니다', request.url)
    )
  })

  it('인증 코드 교환 중 오류 발생 시 에러 페이지로 리다이렉트', async () => {
    // 오류 시나리오 설정
    const mockError = { message: '인증 실패' }
    mocks.supabaseClient.auth.exchangeCodeForSession.mockResolvedValueOnce({ error: mockError })

    // GET 핸들러 임포트 및 실행
    const { GET } = await import('./route')
    const response = await GET(request)

    // 검증
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL(`/login?error=${encodeURIComponent(mockError.message)}`, request.url)
    )
  })
}) 