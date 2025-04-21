/**
 * 파일명: src/app/auth/callback/route.ts
 * 목적: OAuth 콜백 처리
 * 역할: OAuth 인증 완료 후 사용자를 적절한 페이지로 리다이렉트
 * 작성일: 2025-03-27
 * 수정일: 2025-04-05 : 로그 메시지 강화 및 추가
 * 수정일: 2025-04-21 : OAuth 콜백 처리 간소화 및 Supabase 헬퍼 활용
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.redirect(new URL('/auth/error', request.url))
} 