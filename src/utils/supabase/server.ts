/**
 * 파일명: server.ts
 * 목적: 서버 환경에서 Supabase 클라이언트 제공
 * 역할: 서버 컴포넌트, 서버 액션, 라우트 핸들러에서 Supabase에 접근할 때 사용
 * 작성일: 2025-03-27
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export async function createClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies()
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies()
            // PKCE 인증 흐름을 위한 code_verifier 쿠키 처리
            if (name.includes('code_verifier')) {
              console.log('서버: 코드 검증기 쿠키 설정:', name.substring(0, 12) + '...')
              // 쿠키 수명을 10분으로 설정
              options.maxAge = 60 * 10
            }
            
            cookieStore.set(name, value, options)
          } catch (error) {
            console.error('서버: 쿠키 설정 중 오류:', error)
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies()
            cookieStore.delete({ name, ...options })
          } catch (error) {
            console.error('서버: 쿠키 삭제 중 오류:', error)
          }
        },
      },
    }
  )
} 