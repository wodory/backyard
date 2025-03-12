'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../types/supabase';

let supabaseBrowserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createBrowserSupabaseClient() {
  // 이미 생성된 클라이언트가 있으면 재사용
  if (supabaseBrowserClient) {
    return supabaseBrowserClient;
  }
  
  // 디버깅: 로컬 스토리지 상태 확인
  if (typeof window !== 'undefined') {
    const verifier = localStorage.getItem('supabase.auth.code_verifier');
    console.log('[Supabase] 클라이언트 생성 전 code_verifier 상태:', 
      verifier ? `존재함 (길이: ${verifier.length})` : '없음');
    
    // 로컬 스토리지의 모든 키 출력 (디버깅용)
    console.log('[Supabase] 로컬 스토리지 키:', 
      Object.keys(localStorage).filter(key => key.startsWith('supabase')));
  }
  
  // 공식 문서에 따른 기본 설정으로 클라이언트 생성
  supabaseBrowserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true
      }
    }
  );
  
  console.log('[Supabase] 브라우저 클라이언트 생성 완료');
  
  // 디버깅: 클라이언트 생성 후 로컬 스토리지 상태 확인
  if (typeof window !== 'undefined') {
    const verifier = localStorage.getItem('supabase.auth.code_verifier');
    console.log('[Supabase] 클라이언트 생성 후 code_verifier 상태:', 
      verifier ? `존재함 (길이: ${verifier.length})` : '없음');
  }
  
  return supabaseBrowserClient;
} 