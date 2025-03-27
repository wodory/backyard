/**
 * 파일명: middleware.ts
 * 목적: Supabase 인증 토큰 새로고침을 위한 미들웨어
 * 역할: 인증 토큰을 새로고침하고 브라우저와 서버 컴포넌트에 전달
 * 작성일: 2024-03-31
 */

import { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
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