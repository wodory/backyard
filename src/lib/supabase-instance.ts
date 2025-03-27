/**
 * 파일명: supabase-instance.ts
 * 목적: 앱 전역에서 사용할 단일 Supabase 인스턴스 제공
 * 역할: 애플리케이션 시작 시 단 한 번만 초기화되는 Supabase 클라이언트 관리
 * 작성일: 2024-03-29
 */

'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../types/supabase';
import createLogger from './logger';

// 로거 생성
const logger = createLogger('SupabaseInstance');

// 브라우저 환경 확인
const isBrowser = typeof window !== 'undefined';

// 경고 메시지 비활성화 설정 (전역 레벨에서 수정)
if (isBrowser) {
  try {
    // 원본 콘솔 경고 함수 저장
    const originalWarn = console.warn;
    
    // 콘솔 경고 함수를 오버라이드하여 특정 경고만 필터링
    console.warn = function(...args) {
      // Supabase 다중 인스턴스 관련 경고 필터링
      if (args.length > 0 && typeof args[0] === 'string' && 
          args[0].includes('Multiple GoTrueClient instances detected')) {
        // 경고 무시
        logger.debug('Supabase 다중 인스턴스 경고 무시됨');
        return;
      }
      
      // 다른 경고는 정상적으로 처리
      originalWarn.apply(console, args);
    };
    
    logger.info('Supabase 경고 필터 설정 완료');
  } catch (error) {
    logger.warn('Supabase 경고 필터 설정 실패', error);
  }
}

// 전역 변수로 인스턴스 관리 (브라우저 환경에서만)
// @ts-ignore - 전역 객체에 커스텀 속성 추가
if (isBrowser && !window.__SUPABASE_SINGLETON_CLIENT) {
  logger.info('전역 Supabase 인스턴스 초기화');
  
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase 환경 변수가 설정되지 않았습니다');
    }
    
    // 클라이언트 생성 및 전역 변수에 할당
    // @ts-ignore - 전역 객체에 커스텀 속성 추가
    window.__SUPABASE_SINGLETON_CLIENT = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          detectSessionInUrl: true,
          autoRefreshToken: true,
          storageKey: 'supabase.auth.token',
          flowType: 'pkce',
          // Supabase SSR은 PKCE 저장소로 localStorage를 사용하지만
          // 여기서는 직접 커스텀 스토리지 구현을 제공할 수 없음
          // 대신 auth.auth.ts에서 직접 코드 방식으로 구현
        },
        global: {
          headers: { 'x-client-info': '@supabase/ssr-js-client' }
        }
      }
    );
    
    // 스토리지 관련 함수를 window 객체에 추가
    // 이 함수들은 auth.ts에서 호출됨
    try {
      /**
       * 여러 스토리지에서 인증 데이터 조회
       */
      // @ts-ignore - 전역 객체에 커스텀 속성 추가
      window.__SUPABASE_AUTH_GET_ITEM = (key: string): string | null => {
        try {
          // 1. localStorage에서 확인 (기본)
          const value = localStorage.getItem(key);
          if (value) {
            logger.debug('AUTH: localStorage에서 값 찾음', { key });
            return value;
          }
          
          // 2. localStorage에 없는 경우 쿠키에서 확인
          if (key === 'code_verifier') {
            const cookieName = 'auth_code_verifier';
            const cookieValue = getCookieValue(cookieName);
            if (cookieValue) {
              logger.debug('AUTH: 쿠키에서 값 찾음', { key, cookieName });
              // localStorage에도 동기화
              localStorage.setItem(key, cookieValue);
              return cookieValue;
            }
          }
          
          // 3. 전역 변수에서 확인
          if (key === 'code_verifier') {
            // @ts-ignore - 전역 객체에 커스텀 속성 접근
            const globalVerifier = window.__SUPABASE_AUTH_CODE_VERIFIER;
            if (globalVerifier) {
              logger.debug('AUTH: 전역 변수에서 값 찾음', { key });
              return globalVerifier as string;
            }
          }
          
          // 4. sessionStorage에서 확인
          const sessionValue = sessionStorage.getItem(`auth.${key}.backup`) || 
                              sessionStorage.getItem(`auth.${key}.emergency`);
          if (sessionValue) {
            logger.debug('AUTH: sessionStorage에서 값 찾음', { key });
            return sessionValue;
          }
          
          logger.debug('AUTH: 값을 찾을 수 없음', { key });
          return null;
        } catch (error) {
          logger.error('AUTH getItem 에러', { key, error });
          return null;
        }
      };
      
      /**
       * 여러 스토리지에 인증 데이터 저장
       */
      // @ts-ignore - 전역 객체에 커스텀 속성 추가
      window.__SUPABASE_AUTH_SET_ITEM = (key: string, value: string): void => {
        try {
          // localStorage에 저장 (기본)
          localStorage.setItem(key, value);
          
          // 백업 스토리지에도 저장
          if (key === 'code_verifier') {
            // 쿠키에 저장
            document.cookie = `auth_code_verifier=${encodeURIComponent(value)};path=/;max-age=900;SameSite=None${window.location.protocol === 'https:' ? ';Secure' : ''}`;
            
            // 세션 스토리지에 저장
            sessionStorage.setItem(`auth.${key}.backup`, value);
            
            // 전역 변수에 저장
            // @ts-ignore - 전역 객체에 커스텀 속성 추가
            window.__SUPABASE_AUTH_CODE_VERIFIER = value;
            
            logger.debug('AUTH: 여러 저장소에 값 저장됨', { key });
          }
        } catch (error) {
          logger.error('AUTH setItem 에러', { key, error });
        }
      };
      
      /**
       * 여러 스토리지에서 인증 데이터 제거
       */
      // @ts-ignore - 전역 객체에 커스텀 속성 추가
      window.__SUPABASE_AUTH_REMOVE_ITEM = (key: string): void => {
        try {
          // 모든 저장소에서 제거
          localStorage.removeItem(key);
          
          if (key === 'code_verifier') {
            // 쿠키에서 제거
            document.cookie = 'auth_code_verifier=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            
            // 세션 스토리지에서 제거
            sessionStorage.removeItem(`auth.${key}.backup`);
            sessionStorage.removeItem(`auth.${key}.emergency`);
            
            // 전역 변수에서 제거
            try {
              // @ts-ignore - 전역 객체에서 커스텀 속성 제거
              delete window.__SUPABASE_AUTH_CODE_VERIFIER;
            } catch {
              // 오류 무시
            }
            
            logger.debug('AUTH: 여러 저장소에서 값 제거됨', { key });
          }
        } catch (error) {
          logger.error('AUTH removeItem 에러', { key, error });
        }
      };
      
      logger.info('인증 스토리지 헬퍼 설정 완료');
    } catch (error) {
      logger.warn('인증 스토리지 헬퍼 설정 실패', error);
    }
    
    logger.info('전역 Supabase 인스턴스 생성 완료');
  } catch (error) {
    logger.error('전역 Supabase 인스턴스 초기화 실패', error);
    throw error;
  }
}

// 쿠키 값 가져오기 유틸 함수
function getCookieValue(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  } catch (error) {
    logger.error('쿠키 값 가져오기 실패', { name, error });
    return null;
  }
}

/**
 * getSupabaseInstance: 앱 전역에서 사용할 단일 Supabase 인스턴스 반환
 * @returns 전역 Supabase 클라이언트 인스턴스
 */
export function getSupabaseInstance() {
  if (!isBrowser) {
    throw new Error('브라우저 환경에서만 사용 가능합니다');
  }
  
  // @ts-ignore - 전역 객체에서 커스텀 속성 읽기
  if (!window.__SUPABASE_SINGLETON_CLIENT) {
    logger.error('Supabase 인스턴스가 초기화되지 않았습니다');
    throw new Error('Supabase 인스턴스를 찾을 수 없습니다');
  }
  
  // @ts-ignore - 전역 객체에서 커스텀 속성 읽기
  return window.__SUPABASE_SINGLETON_CLIENT as ReturnType<typeof createBrowserClient<Database>>;
} 