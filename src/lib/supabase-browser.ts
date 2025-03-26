'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../types/supabase';

let supabaseBrowserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createBrowserSupabaseClient() {
  console.log('[SupabaseBrowser][1] 클라이언트 생성 함수 호출됨', {
    환경: process.env.NODE_ENV,
    이미생성됨: !!supabaseBrowserClient,
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
    타임스탬프: new Date().toISOString()
  });
  
  // 이미 생성된 클라이언트가 있으면 재사용
  if (supabaseBrowserClient) {
    console.log('[SupabaseBrowser][2] 기존 클라이언트 재사용');
    return supabaseBrowserClient;
  }
  
  // 필수 환경 변수 확인
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[SupabaseBrowser][오류] 필수 환경 변수가 없습니다:', {
      SUPABASE_URL_존재: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY_존재: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
    throw new Error('Supabase 설정이 누락되었습니다. 환경 변수를 확인하세요.');
  }
  
  // 디버깅: 로컬 스토리지 상태 확인
  if (typeof window !== 'undefined') {
    const verifier = localStorage.getItem('supabase.auth.code_verifier');
    console.log('[SupabaseBrowser][3] 클라이언트 생성 전 로컬 스토리지 상태:', {
      code_verifier: verifier 
        ? `존재함 (길이: ${verifier.length}, 첫5글자: ${verifier.substring(0, 5)})` 
        : '없음',
      localStorage_키목록: Object.keys(localStorage),
      supabase관련_키: Object.keys(localStorage).filter(key => key.startsWith('supabase')),
      sessionStorage관련_키: Object.keys(sessionStorage).filter(key => key.startsWith('auth'))
    });
  }
  
  console.log('[SupabaseBrowser][4] 새 클라이언트 생성 시작');
  try {
    // 공식 문서에 따른 기본 설정으로 클라이언트 생성
    supabaseBrowserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          detectSessionInUrl: true,
          autoRefreshToken: true,
          storageKey: 'supabase.auth.token'
        },
        global: {
          headers: {
            'x-client-info': `@supabase/ssr-js-client`
          }
        }
      }
    );
    
    console.log('[SupabaseBrowser][5] 브라우저 클라이언트 생성 완료');
  } catch (error) {
    console.error('[SupabaseBrowser][오류] 클라이언트 생성 중 오류:', error);
    throw error;
  }
  
  // 디버깅: 클라이언트 생성 후 로컬 스토리지 상태 확인
  if (typeof window !== 'undefined') {
    const verifier = localStorage.getItem('supabase.auth.code_verifier');
    console.log('[SupabaseBrowser][6] 클라이언트 생성 후 로컬 스토리지 상태:', {
      code_verifier: verifier 
        ? `존재함 (길이: ${verifier.length}, 첫5글자: ${verifier.substring(0, 5)})` 
        : '없음',
      localStorage_변경: Object.keys(localStorage).length,
      supabase관련_키: Object.keys(localStorage).filter(key => key.startsWith('supabase'))
    });
  }
  
  return supabaseBrowserClient;
} 