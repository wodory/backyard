/**
 * 파일명: hybrid-supabase.ts
 * 목적: 서버와 클라이언트 환경 모두에서 동작하는 Supabase 클라이언트 제공
 * 역할: 환경에 따라 적절한 Supabase 클라이언트 인스턴스 생성
 * 작성일: 2024-03-30
 */

import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '../types/supabase';
import createLogger from './logger';

// 로거 생성
const logger = createLogger('HybridSupabase');

// 환경 타입 정의
type Environment = 'server' | 'client' | 'unknown';

// 현재 실행 환경 감지
function detectEnvironment(): Environment {
  // 초기값은 알 수 없음으로 설정
  let environment: Environment = 'unknown';
  
  // 브라우저 환경인지 확인
  const isBrowser = typeof window !== 'undefined';
  
  // Node.js 환경인지 확인
  const isNode = typeof process !== 'undefined' && 
    process.versions != null && 
    process.versions.node != null;
  
  // 환경 판별
  if (isBrowser) {
    environment = 'client';
  } else if (isNode) {
    environment = 'server';
  }
  
  return environment;
}

// 환경 감지
const environment = detectEnvironment();
logger.debug(`감지된 환경: ${environment}`);

// 서버 전용 Supabase 클라이언트 생성 함수
function createServerSupabaseClient() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('서버 환경에서 Supabase 환경 변수가 설정되지 않았습니다');
    }
    
    // 서버 전용 클라이언트 생성 (쿠키 접근 없음)
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: { 'x-client-info': 'hybrid-supabase-server-client' }
        }
      }
    );
  } catch (error) {
    logger.error('서버 Supabase 클라이언트 생성 실패', error);
    throw error;
  }
}

// 클라이언트 전용 Supabase 인스턴스 (싱글톤)
let clientSupabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

// 클라이언트 전용 Supabase 클라이언트 생성 함수
function createClientSupabaseClient() {
  try {
    // 이미 생성된 인스턴스가 있으면 재사용
    if (clientSupabaseInstance) {
      return clientSupabaseInstance;
    }
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('클라이언트 환경에서 Supabase 환경 변수가 설정되지 않았습니다');
    }
    
    // 클라이언트 인스턴스 생성
    clientSupabaseInstance = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          detectSessionInUrl: true,
          autoRefreshToken: true,
          storageKey: 'supabase.auth.token',
          flowType: 'pkce',
        },
        global: {
          headers: { 'x-client-info': 'hybrid-supabase-browser-client' }
        }
      }
    );
    
    return clientSupabaseInstance;
  } catch (error) {
    logger.error('클라이언트 Supabase 클라이언트 생성 실패', error);
    throw error;
  }
}

/**
 * getHybridSupabaseClient: 현재 환경에 맞는 Supabase 클라이언트를 반환
 * 서버, 클라이언트 환경 모두에서 안전하게 사용 가능
 * @returns 환경에 적합한 Supabase 클라이언트
 */
export function getHybridSupabaseClient() {
  try {
    if (environment === 'client') {
      return createClientSupabaseClient();
    } else if (environment === 'server') {
      return createServerSupabaseClient();
    } else {
      // 환경을 감지할 수 없는 경우 기본값으로 서버 클라이언트 반환
      logger.warn('알 수 없는 환경에서 Supabase 클라이언트 요청, 서버 클라이언트 반환');
      return createServerSupabaseClient();
    }
  } catch (error) {
    logger.error('하이브리드 Supabase 클라이언트 생성 실패', error);
    throw error;
  }
}

/**
 * 환경이 서버인지 클라이언트인지 확인
 * @returns 현재 환경이 서버인지 여부
 */
export function isServerEnvironment(): boolean {
  return environment === 'server';
}

/**
 * 환경이 클라이언트인지 확인
 * @returns 현재 환경이 클라이언트인지 여부
 */
export function isClientEnvironment(): boolean {
  return environment === 'client';
} 