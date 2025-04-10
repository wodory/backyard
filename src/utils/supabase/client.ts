/**
 * 파일명: client.ts
 * 목적: 클라이언트 환경에서 Supabase 클라이언트 제공
 * 역할: 클라이언트 컴포넌트에서 Supabase에 접근할 때 사용
 * 작성일: 2025-03-27
 */

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
} 