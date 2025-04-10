/**
 * 파일명: middleware.ts
 * 목적: Supabase 인증 토큰 새로고침 처리
 * 역할: 토큰 만료 시 자동으로 새로고침하고 쿠키에 저장
 * 작성일: 2025-03-27
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export async function updateSession(request: NextRequest) {
  try {
    // 응답 객체 생성
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Supabase 클라이언트 생성
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // PKCE 인증 흐름을 위한 code_verifier 쿠키 처리
            if (name.includes('code_verifier')) {
              console.log('코드 검증기 쿠키 설정:', name.substring(0, 10) + '...')
              // 쿠키 수명을 10분으로 설정
              options.maxAge = 60 * 10
            }
            
            // 요청 및 응답에 쿠키 설정
            request.cookies.set({
              name,
              value,
              ...options,
            })
            
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            // 요청 및 응답에서 쿠키 삭제
            request.cookies.delete(name)
            
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
            })
          },
        },
      }
    )

    // 인증된 사용자 정보 가져오기 (세션 새로고침)
    const { data } = await supabase.auth.getUser()
    
    // 디버깅용 로깅 (개인정보 보호를 위해 일부만 표시)
    if (data?.user) {
      console.log('미들웨어에서 세션 새로고침 성공', {
        userId: data.user.id.substring(0, 8) + '...',
        email: data.user.email ? (data.user.email.substring(0, 3) + '...') : '없음',
      })
    }
    
    return response
  } catch (error) {
    console.error('미들웨어 세션 갱신 중 오류:', error)
    // 오류 발생 시에도 요청을 계속 진행
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
} 