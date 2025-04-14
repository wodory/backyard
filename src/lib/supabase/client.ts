/**
 * 파일명: src/lib/supabase/client.ts
 * 목적: 클라이언트 환경에서 Supabase 클라이언트 제공
 * 역할: 클라이언트 컴포넌트에서 Supabase에 접근할 때 사용
 * 작성일: 2025-04-09
 * 수정일: 2024-05-08 : auth 옵션 블럭 제거하여 @supabase/ssr 표준 준수
 */

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import createLogger from '../logger'

// 로거 생성
const logger = createLogger('SupabaseClient')

/**
 * createClient: 클라이언트 환경에서 Supabase 클라이언트 생성
 * @returns Supabase 클라이언트 인스턴스
 */
export function createClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
    if (!supabaseUrl || !supabaseKey) {
      logger.error('Supabase 환경 변수가 설정되지 않았습니다')
      throw new Error('Supabase 환경 변수가 설정되지 않았습니다')
    }
  
    // auth 옵션 없이 호출하여 미들웨어 기반 세션 관리 사용
    return createBrowserClient<Database>(
      supabaseUrl,
      supabaseKey
    )
  } catch (error) {
    logger.error('클라이언트 Supabase 클라이언트 생성 실패', error)
    throw error
  }
} 