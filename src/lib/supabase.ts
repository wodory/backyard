/**
 * 파일명: supabase.ts
 * 목적: Supabase 클라이언트 관리
 * 역할: 서버 및 브라우저 환경에서 사용할 Supabase 클라이언트 제공
 * 작성일: 2024-03-29
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import createLogger from './logger';

// 로거 생성
const logger = createLogger('Supabase');

// 브라우저 환경에서는 전역 인스턴스 사용
import { getSupabaseInstance } from './supabase-instance';

// 서버 측 인스턴스 관리
let serverClientInstance: ReturnType<typeof createClient<Database>> | null = null;

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * createSupabaseClient: 서버 환경에서 Supabase 클라이언트 생성
 * @returns 서버용 Supabase 클라이언트
 */
export const createSupabaseClient = () => {
  if (typeof window !== 'undefined') {
    logger.warn('서버 환경을 위한 함수를 브라우저 환경에서 호출했습니다.');
  }
  
  // 이미 생성된 인스턴스가 있으면 재사용
  if (serverClientInstance) {
    return serverClientInstance;
  }
  
  // 정적 렌더링 및 개발 환경을 위한 안전한 클라이언트 생성
  if (!supabaseUrl || !supabaseKey) {
    logger.warn('Supabase 환경 변수가 설정되지 않았습니다');
    
    // 빌드 타임 및 배포 시 오류 방지를 위한 더미 클라이언트
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOAuth: () => Promise.resolve({ data: {}, error: null }),
      },
      from: () => ({ select: () => ({ data: [], error: null }) }),
    } as any;
  }
  
  try {
    logger.info('서버용 Supabase 클라이언트 생성');
    serverClientInstance = createClient<Database>(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          flowType: 'pkce',
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    );
    
    return serverClientInstance;
  } catch (error) {
    logger.error('Supabase 서버 클라이언트 생성 실패', error);
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any;
  }
};

/**
 * createBrowserClient: 브라우저 환경에서 Supabase 클라이언트 가져오기
 * @returns 브라우저용 Supabase 클라이언트
 * @deprecated getSupabaseInstance 함수를 사용하세요
 */
export const createBrowserClient = () => {
  // 브라우저 환경이 아니면 더미 클라이언트 반환
  if (typeof window === 'undefined') {
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any;
  }
  
  try {
    // 타입 호환성을 위해 any 타입으로 반환
    // 전역 싱글톤 인스턴스 사용
    logger.info('전역 Supabase 인스턴스 접근');
    return getSupabaseInstance() as any;
  } catch (error) {
    logger.error('Supabase 브라우저 클라이언트 접근 실패', error);
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any;
  }
};

/**
 * createSafeClient: 환경에 맞는 Supabase 클라이언트 생성
 * @returns 현재 환경에 적합한 Supabase 클라이언트
 */
const createSafeClient = () => {
  try {
    if (typeof window === 'undefined') {
      return createSupabaseClient();
    } else {
      return createBrowserClient();
    }
  } catch (error) {
    logger.error('Supabase 클라이언트 생성 실패', error);
    // 빌드 타임 에러 방지를 위한 더미 클라이언트
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any;
  }
};

// 기본 클라이언트 생성
const supabase = createSafeClient();
export default supabase; 