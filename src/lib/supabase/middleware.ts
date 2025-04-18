/**
 * 파일명: src/lib/supabase/middleware.ts
 * 목적: Supabase 인증 토큰 새로고침 처리
 * 역할: 토큰 만료 시 자동으로 새로고침하고 쿠키에 저장
 * 작성일: 2025-03-27
 * 수정일: 2025-04-14 : 파일 경로 변경 (utils/supabase → lib/supabase)
 * 수정일: 2024-04-19 : 쿠키 속성 조정 - Vercel 배포 환경 호환성 개선
 * 수정일: 2024-04-19 : code_verifier 쿠키 관련 진단 로그 추가
 */

import { NextResponse, type NextRequest } from 'next/server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'

import { Database } from '@/types/supabase'

import createLogger from '../logger'

// 로거 생성
const logger = createLogger('SupabaseMiddleware')

/**
 * updateSession: Supabase 인증 토큰 갱신 및 쿠키 업데이트
 * @param request NextRequest 객체
 * @returns NextResponse 객체
 */
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
            const value = request.cookies.get(name)?.value;
            // code_verifier 쿠키 진단 로그
            if (name.includes('code_verifier')) {
              console.log('[Middleware Cookie Get] Getting code_verifier cookie:', { 
                name, 
                value: value ? value.substring(0, 10) + '...' : 'Not Found'
              });
            }
            return value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // PKCE 인증 흐름을 위한 code_verifier 쿠키 처리
            if (name.includes('code_verifier')) {
              logger.debug('코드 검증기 쿠키 설정:', name.substring(0, 10) + '...')
              // 쿠키 수명을 10분으로 설정
              options.maxAge = 60 * 10
              
              // code_verifier 쿠키 진단 로그
              console.log('[Middleware Cookie Set] Setting code_verifier cookie:', { 
                name, 
                value: value.substring(0, 10) + '...', 
                options 
              });
            }
            
            // 프로덕션 환경에서는 secure 속성 설정
            options.secure = process.env.NODE_ENV === 'production';
            
            // 항상 sameSite='lax'와 path='/' 설정
            options.sameSite = 'lax';
            options.path = '/';
            
            // domain 속성 명시적 설정 제거 (자동 설정 사용)
            if (options.domain) {
              delete options.domain;
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
            // code_verifier 쿠키 진단 로그
            if (name.includes('code_verifier')) {
              console.log('[Middleware Cookie Remove] Removing code_verifier cookie:', { name });
            }
            
            // 프로덕션 환경에서는 secure 속성 설정
            options.secure = process.env.NODE_ENV === 'production';
            
            // 항상 sameSite='lax'와 path='/' 설정
            options.sameSite = 'lax';
            options.path = '/';
            
            // domain 속성 명시적 설정 제거 (자동 설정 사용)
            if (options.domain) {
              delete options.domain;
            }
            
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
      logger.info('미들웨어에서 세션 새로고침 성공', {
        userId: data.user.id.substring(0, 8) + '...',
        email: data.user.email ? (data.user.email.substring(0, 3) + '...') : '없음',
      })
    }
    
    return response
  } catch (error) {
    logger.error('미들웨어 세션 갱신 중 오류:', error)
    // 오류 발생 시에도 요청을 계속 진행
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
} 