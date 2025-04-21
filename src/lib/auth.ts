/**
 * 파일명: auth.ts
 * 목적: 사용자 인증 관련 기능 제공
 * 역할: 로그인, 회원가입, 세션 관리 등 인증 관련 유틸리티 함수 제공
 * 작성일: 2025-03-08
 * 수정일: 2025-04-09
 * 수정일: 2023-10-31 : Supabase 로그아웃 함수 개선 및 쿠키 삭제 기능 추가
 * 수정일: 2024-05-08 : signOut 함수 간소화 - @supabase/ssr 기반 세션 관리와 호환되도록 개선
 * 수정일: 2024-04-19 : sessionStorage 기반 code_verifier 관리 코드 제거 - @supabase/ssr의 쿠키 메커니즘 활용
 * 수정일: 2024-05-18 : 클라이언트 인증 유틸 정리 - 로컬 스토리지 코드 제거 및 Supabase SDK 호출로 단순화
 */

'use client';

import { User } from '@supabase/supabase-js';

import { isClient } from './environment';
import createLogger from './logger';
import { createClient } from './supabase/client';

// 모듈별 로거 생성
const logger = createLogger('Auth');

// 클라이언트 환경에서 Supabase 클라이언트 가져오기
export const getAuthClient = () => {
  if (!isClient()) {
    throw new Error('브라우저 환경에서만 사용 가능합니다.');
  }
  
  return createClient();
};

// ExtendedUser 타입 정의
export interface ExtendedUser extends User {
  dbUser?: any; // Prisma User 모델
}

/**
 * signUp: 사용자 회원가입 처리
 * @param {string} email - 이메일 주소
 * @param {string} password - 비밀번호
 * @param {string | null} name - 사용자 이름 (선택사항)
 * @returns {Promise<{user: User, authData: any}>} 사용자 정보
 */
export async function signUp(email: string, password: string, name: string | null = null) {
  try {
    // Supabase 인증으로 사용자 생성
    const client = getAuthClient();
    const { data: authData, error: authError } = await client.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('사용자 생성 실패');
    }

    // API를 통해 사용자 데이터 생성
    try {
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: authData.user.id,
          email: authData.user.email || email,
          name: name || email.split('@')[0],
        }),
      });

      if (!response.ok) {
        console.warn('사용자 DB 정보 저장 실패:', await response.text());
      }
    } catch (dbError) {
      console.error('사용자 DB 정보 API 호출 오류:', dbError);
    }

    return { user: authData.user, authData };
  } catch (error) {
    console.error('회원가입 실패:', error);
    throw error;
  }
}

/**
 * signIn: 이메일/비밀번호로 로그인
 * @param {string} email - 이메일 주소
 * @param {string} password - 비밀번호
 * @returns {Promise<any>} 로그인 결과
 */
export async function signIn(email: string, password: string) {
  try {
    const client = getAuthClient();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    logger.info('로그인 성공: Supabase 클라이언트가 세션 관리 중', {
      환경: process.env.NODE_ENV
    });

    return data;
  } catch (error) {
    logger.error('로그인 실패:', error);
    throw error;
  }
}

/**
 * signInWithGoogle: Google OAuth 로그인
 * @returns {Promise<{ success: boolean; url?: string; error?: string }>} 로그인 결과
 */
export const signInWithGoogle = async (): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    if (!isClient()) {
      throw new Error('브라우저 환경에서만 실행 가능합니다.');
    }
    
    logger.info('Google 로그인 시작');
    
    // 리디렉션 URL 설정
    const redirectUrl = `${window.location.origin}/auth/callback`;
    logger.info('리디렉션 URL 설정', { redirectUrl });
    
    // Google OAuth URL 생성
    const client = getAuthClient();
    const { data: { url }, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });
    
    if (error) {
      throw error;
    }
    
    if (!url) {
      throw new Error('OAuth URL을 가져오는데 실패했습니다.');
    }
    
    logger.info('Google OAuth URL 획득', { length: url.length });
    return { success: true, url };
    
  } catch (error) {
    logger.error('Google 로그인 실패:', error);
    return { success: false, error: '로그인 처리 중 오류가 발생했습니다.' };
  }
};

/**
 * signOut: 사용자 로그아웃
 * @returns {Promise<void>}
 */
export async function signOut(): Promise<void> {
  try {
    logger.info('로그아웃 시작');
    
    // Supabase 로그아웃 - @supabase/ssr 미들웨어가 자동으로 쿠키를 관리합니다
    const supabase = getAuthClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.error('로그아웃 실패:', error);
      throw error;
    }
    
    logger.info('로그아웃 완료 (Supabase 세션 종료)');
  } catch (error) {
    logger.error('로그아웃 중 오류 발생:', error);
    throw error;
  }
}

/**
 * getCurrentUser: 현재 로그인한 사용자 정보 조회
 * @returns {Promise<ExtendedUser | null>} 사용자 정보
 */
export async function getCurrentUser(): Promise<ExtendedUser | null> {
  try {
    const client = getAuthClient();
    const { data: { user }, error } = await client.auth.getUser();
    
    if (error) {
      logger.error('사용자 정보 가져오기 실패:', error);
      return null;
    }
    
    if (!user) {
      return null;
    }
    
    // DB에서 추가 사용자 정보 가져오기
    try {
      const response = await fetch(`/api/user/${user.id}`);
      
      if (response.ok) {
        const dbUser = await response.json();
        return { ...user, dbUser };
      }
    } catch (dbError) {
      logger.warn('DB 사용자 정보 가져오기 실패:', dbError);
    }
    
    return user;
  } catch (error) {
    logger.error('사용자 정보 조회 중 오류:', error);
    return null;
  }
}

/**
 * getSession: 현재 세션 정보 조회
 * @returns {Promise<any>} 세션 정보
 */
export async function getSession() {
  const client = getAuthClient();
  return client.auth.getSession();
}

/**
 * getUser: 현재 사용자 정보 조회 (기본 Supabase 메서드)
 * @returns {Promise<any>} 사용자 정보
 */
export async function getUser() {
  const client = getAuthClient();
  return client.auth.getUser();
}

/**
 * exchangeCodeForSession: 인증 코드를 세션으로 교환
 * @param {string} code - Google OAuth 인증 코드
 * @returns {Promise<any>} 세션 정보
 */
export const exchangeCodeForSession = async (code: string): Promise<any> => {
  // Supabase 클라이언트로 코드 교환
  const client = getAuthClient();
  const { data, error } = await client.auth.exchangeCodeForSession(code);
  
  if (error) {
    throw error;
  }
  
  return data;
}; 