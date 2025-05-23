/**
 * 파일명: src/lib/supabase/server.ts
 * 목적: 서버 환경에서 Supabase 클라이언트 제공
 * 역할: 서버 컴포넌트, 서버 액션, 라우트 핸들러에서 Supabase에 접근할 때 사용
 * 작성일: 2025-04-09
 * 수정일: 2024-04-19 : 쿠키 속성 조정 - Vercel 배포 환경 호환성 개선
 * 수정일: 2024-04-19 : code_verifier 쿠키 관련 진단 로그 추가
 */

import { cookies } from 'next/headers'

import { createServerClient, type CookieOptions } from '@supabase/ssr'

import { Database } from '@/types/supabase'

import createLogger from '../logger'

// 로거 생성
const logger = createLogger('SupabaseServer')

/**
 * createClient: 서버 환경에서 Supabase 클라이언트 생성
 * @returns Supabase 클라이언트 인스턴스
 */
export async function createClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
    if (!supabaseUrl || !supabaseKey) {
      logger.error('Supabase 환경 변수가 설정되지 않았습니다')
      throw new Error('Supabase 환경 변수가 설정되지 않았습니다')
    }
  
    return createServerClient<Database>(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          async get(name: string) {
            const cookieStore = await cookies()
            const value = cookieStore.get(name)?.value;
            // code_verifier 쿠키 진단 로그
            if (name.includes('code_verifier')) {
              console.log('[Server Cookie Get] Getting code_verifier cookie:', { 
                name, 
                value: value ? value.substring(0, 10) + '...' : 'Not Found' 
              });
            }
            return value;
          },
          async set(name: string, value: string, options: CookieOptions) {
            try {
              const cookieStore = await cookies()
              // PKCE 인증 흐름을 위한 code_verifier 쿠키 처리
              if (name.includes('code_verifier')) {
                logger.debug('서버: 코드 검증기 쿠키 설정:', name.substring(0, 12) + '...')
                // 쿠키 수명을 10분으로 설정
                options.maxAge = 60 * 10
                
                // code_verifier 쿠키 진단 로그
                console.log('[Server Cookie Set] Setting code_verifier cookie:', { 
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
              
              cookieStore.set(name, value, options)
            } catch (error) {
              logger.error('서버: 쿠키 설정 중 오류:', error)
            }
          },
          async remove(name: string, options: CookieOptions) {
            try {
              const cookieStore = await cookies()
              
              // code_verifier 쿠키 진단 로그
              if (name.includes('code_verifier')) {
                console.log('[Server Cookie Remove] Removing code_verifier cookie:', { name });
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
              
              cookieStore.delete({ name, ...options })
            } catch (error) {
              logger.error('서버: 쿠키 삭제 중 오류:', error)
            }
          },
        },
      }
    )
  } catch (error) {
    logger.error('서버 Supabase 클라이언트 생성 실패', error)
    throw error
  }
} 