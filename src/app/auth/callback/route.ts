/**
 * 파일명: route.ts
 * 목적: OAuth 콜백 처리
 * 역할: OAuth 인증 완료 후 사용자를 적절한 페이지로 리다이렉트
 * 작성일: 2024-03-31
 */

import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // URL에서 인증 코드 추출
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    
    // 디버깅용 로그
    if (code) {
      console.log('인증 콜백에서 코드 감지됨', {
        code_length: code.length,
        origin: requestUrl.origin,
      })
    } else {
      console.warn('인증 콜백에서 코드를 찾을 수 없음')
      return NextResponse.redirect(new URL('/login?error=인증 코드를 찾을 수 없습니다', request.url))
    }
    
    // 리다이렉트 대상 경로 (기본값: 홈)
    const next = '/'
    
    // 서버 클라이언트 생성
    const supabase = await createClient()
    
    // PKCE 인증 흐름 완료 (코드 → 토큰 교환)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('인증 코드 교환 오류:', error.message)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
      )
    }
    
    // 인증 성공 시 리다이렉트
    console.log('인증 성공, 리다이렉트:', next)
    return NextResponse.redirect(new URL(next, request.url))
  } catch (error: any) {
    console.error('인증 콜백 처리 중 예외 발생:', error)
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url)
    )
  }
} 