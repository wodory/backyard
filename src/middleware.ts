/**
 * 파일명: middleware.ts
 * 목적: Supabase 인증 토큰 새로고침을 위한 미들웨어
 * 역할: 인증 토큰을 새로고침하고 브라우저와 서버 컴포넌트에 전달
 * 작성일: 2025-03-08
 * 수정일: 2025-03-27
 * 수정일: 2024-05-08 : 인증된 사용자가 /login 페이지 접근 시 홈으로 리다이렉션하는 기능 추가
 * 수정일: 2024-05-25 : three-layer-Standard 룰 적용
 * @rule   three-layer-Standard
 * @layer  service
 * @tag    @service-msw authMiddleware
 */

import { NextRequest, NextResponse } from 'next/server'

import { createServerClient } from '@supabase/ssr'

import { updateSession } from '@/lib/supabase/middleware'
import { Database } from '@/types/supabase'

// 환경 변수 명시적 추출
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function middleware(request: NextRequest) {
  // 먼저 세션 업데이트
  const response = await updateSession(request)
  
  // 로그인 페이지 접근 체크
  const url = new URL(request.url)
  if (url.pathname === '/login') {
    // Supabase 클라이언트 생성
    const supabase = createServerClient<Database>(
      SUPABASE_URL,
      SUPABASE_KEY,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set() {
            // 미들웨어에서는 쿠키를 설정하지 않음
          },
          remove() {
            // 미들웨어에서는 쿠키를 삭제하지 않음
          },
        },
      }
    )
    
    // 현재 사용자 세션 확인
    const { data } = await supabase.auth.getSession()
    
    // 인증된 사용자가 로그인 페이지에 접근할 경우 홈으로 리다이렉션
    if (data?.session) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 