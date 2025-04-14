/**
 * 파일명: src/app/api/auth/status/route.test.ts
 * 목적: 인증 상태 API 엔드포인트 테스트
 * 역할: 로그인 상태에 따른 API 응답 검증
 * 작성일: 2025-04-13
 * 수정일: 2025-04-14 : supabase 클라이언트 모킹 방식 수정 및 실제 API 구현에 맞게 테스트 수정
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'
import { GET } from '@/app/api/auth/status/route'

// Supabase 클라이언트 모킹
const mockSupabaseAuth = {
  getUser: vi.fn()
}

vi.mock('@/utils/supabase/server', () => ({
  createClient: () => ({
    auth: mockSupabaseAuth
  })
}))

// NextResponse 모킹
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn().mockImplementation((data, options) => {
        return {
          json: () => data,
          status: options?.status || 200
        }
      })
    }
  }
})

describe('인증 상태 API 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('사용자가 로그인한 경우 loggedIn: true와 사용자 정보를 반환해야 합니다', async () => {
    // 로그인된 사용자 모킹
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      app_metadata: { provider: 'google' },
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2023-01-01T00:00:00Z'
    }
    
    mockSupabaseAuth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    })
    
    // API 요청
    const response = await GET()
    
    // 응답 확인
    expect(response.status).toBe(200)
    
    // NextResponse.json이 호출되었는지 확인
    expect(NextResponse.json).toHaveBeenCalledWith({
      loggedIn: true,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        provider: mockUser.app_metadata.provider
      }
    })
  })

  it('사용자가 로그아웃한 경우 loggedIn: false를 반환해야 합니다', async () => {
    // 로그아웃 상태 모킹
    mockSupabaseAuth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null
    })
    
    // API 요청
    const response = await GET()
    
    // 응답 확인
    expect(response.status).toBe(200)
    
    // NextResponse.json이 호출되었는지 확인
    expect(NextResponse.json).toHaveBeenCalledWith({
      loggedIn: false,
      user: null
    })
  })

  it('인증 시스템에 오류가 발생한 경우 적절한 오류 응답을 반환해야 합니다', async () => {
    // 오류 상태 모킹
    const mockError = { message: '인증 서비스 오류' }
    mockSupabaseAuth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: mockError
    })
    
    // API 요청
    const response = await GET()
    
    // 응답 확인
    expect(response.status).toBe(200)
    
    // NextResponse.json이 호출되었는지 확인
    expect(NextResponse.json).toHaveBeenCalledWith({
      loggedIn: false,
      error: mockError.message
    })
  })
  
  it('예외가 발생한 경우 500 상태 코드와 오류 메시지를 반환해야 합니다', async () => {
    // 예외 발생 모킹
    mockSupabaseAuth.getUser.mockRejectedValueOnce(new Error('예상치 못한 오류'))
    
    // API 요청
    const response = await GET()
    
    // 응답 확인
    expect(response.status).toBe(500)
    
    // NextResponse.json이 호출되었는지 확인
    expect(NextResponse.json).toHaveBeenCalledWith(
      { 
        loggedIn: false, 
        error: '인증 상태 확인 중 오류가 발생했습니다' 
      }, 
      { status: 500 }
    )
  })
}) 