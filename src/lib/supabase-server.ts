/**
 * 파일명: supabase-server.ts
 * 목적: 서버 컴포넌트에서 Supabase 클라이언트 접근
 * 역할: 서버 측 Supabase 인스턴스 생성 및 관리
 * 작성일: 2025-03-08
 * 수정일: 2025-03-27
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '../types/supabase';

/**
 * createServerSupabaseClient: 서버 컴포넌트에서 사용할 Supabase 클라이언트 생성
 * 각 요청마다 새로운 인스턴스 생성 (서버 컴포넌트에서는 싱글톤 패턴 사용 불가)
 * @returns 서버용 Supabase 클라이언트
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Next.js App Router에서는 쿠키를 직접 설정할 수 없으므로
          // 이 함수는 클라이언트로의 응답에 포함될 때만 동작합니다
        },
        remove(name: string, options: any) {
          // 마찬가지로 클라이언트로의 응답에 포함될 때만 동작
        },
      },
    }
  );
}

/**
 * getServerSession: 서버 컴포넌트에서 현재 세션 조회
 * @returns Supabase 세션 또는 null
 */
export async function getServerSession() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('서버 세션 조회 중 오류:', error);
    return null;
  }
} 