/**
 * 파일명: auth.ts
 * 목적: 사용자 인증 관련 기능 제공
 * 역할: 로그인, 회원가입, 세션 관리 등 인증 관련 유틸리티 함수 제공
 * 작성일: 2024-03-30
 */

'use client';

import { User } from '@supabase/supabase-js';
import createLogger from './logger';
import { base64UrlEncode, stringToArrayBuffer } from './base64';
import { isClient } from './environment';
import { createClient } from './supabase/client';

// 모듈별 로거 생성
const logger = createLogger('Auth');

// OAuth 설정
const OAUTH_CONFIG = {
  codeVerifierLength: 128, // PKCE 코드 검증기 길이
  codeChallengeMethod: 'S256', // SHA-256 해시 사용
};

// 스토리지 키 정의
export const STORAGE_KEYS = {
  CODE_VERIFIER: 'code_verifier', // sessionStorage에서 사용
  ACCESS_TOKEN: 'access_token',   // localStorage에서 사용
  REFRESH_TOKEN: 'refresh_token', // localStorage에서 사용
  USER_ID: 'user_id',             // localStorage에서 사용
  PROVIDER: 'provider'            // localStorage에서 사용
};

/**
 * PKCE 코드 검증기 생성 (RFC 7636 준수)
 * @returns RFC 7636 기반 안전한 코드 검증기
 */
export const generateCodeVerifier = async (): Promise<string> => {
  try {
    // PKCE 표준: 최소 43자, 최대 128자의 무작위 문자열
    // A-Z, a-z, 0-9, -, ., _, ~ 문자만 사용 가능
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    
    // Web Crypto API로 더 안전한 난수 생성
    const randomValues = new Uint8Array(96); // 96바이트 = 128자 정도로 충분
    crypto.getRandomValues(randomValues);
    
    // 무작위 바이트를 유효한 charset 문자로 변환
    const verifier = Array.from(randomValues)
      .map(byte => charset[byte % charset.length])
      .join('');
    
    // PKCE 표준에 맞는 길이 (43-128) 확인
    if (verifier.length < 43 || verifier.length > 128) {
      throw new Error(`유효하지 않은 코드 검증기 길이: ${verifier.length}`);
    }
    
    logger.debug('PKCE 코드 검증기 생성 완료', { 길이: verifier.length });
    return verifier;
  } catch (error) {
    logger.error('코드 검증기 생성 오류', error);
    throw error;
  }
};

/**
 * PKCE 코드 챌린지 생성
 * @param verifier 코드 검증기
 * @returns Base64URL 인코딩된 SHA-256 해시
 */
export const generateCodeChallenge = async (verifier: string): Promise<string> => {
  try {
    // TextEncoder를 사용하여 문자열을 바이트 배열로 변환
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    
    // SHA-256 해시 생성
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // 해시 결과를 Base64URL로 인코딩
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray));
    
    // Base64 -> Base64URL 변환 (RFC 7636)
    const base64Url = hashBase64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    logger.debug('PKCE 코드 챌린지 생성 완료', { 길이: base64Url.length });
    return base64Url;
  } catch (error) {
    logger.error('코드 챌린지 생성 오류', error);
    throw error;
  }
};

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

// 회원가입 함수
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

// 로그인 함수
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

    // 세션 정보는 Supabase 클라이언트가 자동으로 관리함
    if (data.session) {
      logger.info('로그인 성공: Supabase 클라이언트가 세션 관리 중', {
        환경: process.env.NODE_ENV
      });
    } else {
      logger.warn('로그인 성공했지만 세션 데이터가 없습니다.');
    }

    return data;
  } catch (error) {
    logger.error('로그인 실패:', error);
    throw error;
  }
}

/**
 * Google OAuth를 통한 로그인 처리
 * @returns {Promise<{ success: boolean; url?: string; error?: string }>} 로그인 결과
 */
export const signInWithGoogle = async (): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // 브라우저 환경 확인
    if (!isClient()) {
      throw new Error('브라우저 환경에서만 실행 가능합니다.');
    }
    
    logger.info('Google 로그인 시작');
    
    // code_verifier가 이미 존재하는지 확인
    const existingVerifier = sessionStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);
    
    let codeVerifier: string;
    if (existingVerifier) {
      logger.debug('기존 code_verifier 사용');
      codeVerifier = existingVerifier;
    } else {
      // 새로운 코드 검증기 생성
      codeVerifier = await generateCodeVerifier();
      logger.info('새 code_verifier 생성됨', {
        길이: codeVerifier.length,
        첫_5글자: codeVerifier.substring(0, 5)
      });
      
      // 코드 검증기를 sessionStorage에 저장
      sessionStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier);
      logger.debug('코드 검증기 저장 성공');
    }
    
    // 코드 챌린지 생성
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    logger.debug('PKCE 코드 챌린지 생성 완료', { 길이: codeChallenge.length });
    
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
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
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

// 로그아웃 함수
export async function signOut() {
  try {
    logger.info('로그아웃 시작');
    
    // 로컬 스토리지에서 인증 데이터 제거
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.PROVIDER);
    
    // Supabase 로그아웃
    const client = getAuthClient();
    const { error } = await client.auth.signOut();
    if (error) {
      throw error; // Supabase 오류 다시 던지기
    }
    
    logger.info('로그아웃 완료 (Supabase 호출)');
  } catch (error) {
    logger.error('로그아웃 중 오류 발생:', error);
    throw error;
  }
}

// 현재 사용자 가져오기
export async function getCurrentUser(): Promise<ExtendedUser | null> {
  try {
    const client = getAuthClient();
    const { data: { user }, error } = await client.auth.getUser();
    // 사용자 정보 가져오기 실패 시 로그 기록
    if (error) {
      logger.error('사용자 정보 가져오기 실패:', error);
      return null;
    }
    // 사용자 정보가 없으면 null 반환. 이 케이스가 언제 발생할까? 
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

// 세션 가져오기
export async function getSession() {
  const client = getAuthClient();
  return client.auth.getSession();
}

// 사용자 가져오기
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
  // 코드 검증기 가져오기
  const codeVerifier = sessionStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);
  
  if (!codeVerifier) {
    throw new Error('코드 검증기를 찾을 수 없습니다. 로그인 과정이 중단되었을 수 있습니다.');
  }
  
  // 사용 후에는 sessionStorage에서 제거
  sessionStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
  
  // Supabase 클라이언트로 코드 교환
  const client = getAuthClient();
  const { data, error } = await client.auth.exchangeCodeForSession(code);
  
  if (error) {
    throw error;
  }
  
  return data;
}; 