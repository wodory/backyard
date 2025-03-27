/**
 * 파일명: auth-server.ts
 * 목적: 서버 측 인증 기능 및 세션 처리
 * 역할: API 라우트에서 사용할 서버 측 인증 함수 제공
 * 작성일: 2024-03-30
 */

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Database } from '../types/supabase';

/**
 * getSupabaseServer: 서버 측 Supabase 클라이언트 생성
 * @returns Supabase 클라이언트 인스턴스
 */
export const getSupabaseServer = () => {
  const cookieStore = cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options);
          } catch (e) {
            console.error('쿠키 설정 오류:', e);
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete(name, options);
          } catch (e) {
            console.error('쿠키 삭제 오류:', e);
          }
        },
      },
    }
  );
};

/**
 * auth: 서버 컴포넌트와 API 라우트에서 사용할 인증 함수
 * @returns 현재 인증된 세션 정보
 */
export const auth = async () => {
  const supabase = getSupabaseServer();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('서버 인증 오류:', error);
    return null;
  }
};

/**
 * getCurrentUser: 현재 인증된 사용자 정보를 반환
 * @returns 현재 인증된 사용자 또는 null
 */
export const getCurrentUser = async () => {
  const supabase = getSupabaseServer();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return null;
  }
}; 