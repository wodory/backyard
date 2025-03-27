/**
 * 파일명: auth.ts
 * 목적: 인증 관련 유틸리티 함수 제공
 * 역할: 로그인, 회원가입, 소셜 로그인 등 인증 관련 기능 구현
 * 작성일: 2024-03-30
 */

'use client';

import { getHybridSupabaseClient, isClientEnvironment } from './hybrid-supabase';
import { User } from '@supabase/supabase-js';
import { 
  getAuthData, 
  setAuthData, 
  removeAuthData, 
  clearAllAuthData, 
  STORAGE_KEYS 
} from './auth-storage';
import createLogger from './logger';
import { base64UrlEncode, stringToArrayBuffer } from './base64';
import { isClient } from './environment';

// 모듈별 로거 생성
const logger = createLogger('Auth');

// 환경에 맞는 Supabase 클라이언트 가져오기
export const getAuthClient = () => {
  if (!isClientEnvironment()) {
    throw new Error('브라우저 환경에서만 사용 가능합니다.');
  }
  
  return getHybridSupabaseClient();
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

    // 로그인 성공 시 여러 스토리지에 세션 정보 저장
    if (data.session) {
      // 액세스 토큰 저장
      setAuthData(STORAGE_KEYS.ACCESS_TOKEN, data.session.access_token, { expiry: 60 * 60 * 24 * 7 });
      
      // 리프레시 토큰 저장
      if (data.session.refresh_token) {
        setAuthData(STORAGE_KEYS.REFRESH_TOKEN, data.session.refresh_token, { expiry: 60 * 60 * 24 * 30 });
      }
      
      // 사용자 정보 저장
      if (data.session.user) {
        setAuthData(STORAGE_KEYS.USER_ID, data.session.user.id, { expiry: 60 * 60 * 24 });
        
        if (data.session.user.app_metadata?.provider) {
          setAuthData(STORAGE_KEYS.PROVIDER, data.session.user.app_metadata.provider, { expiry: 60 * 60 * 24 });
        }
      }
      
      logger.info('로그인 성공: 여러 스토리지에 인증 정보 저장됨', {
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

// Google 로그인 함수
export async function signInWithGoogle() {
  try {
    // 브라우저 환경 확인
    if (!isClientEnvironment()) {
      throw new Error('브라우저 환경에서만 실행 가능합니다.');
    }
    
    logger.info('Google 로그인 시작');
    
    // code_verifier가 이미 존재하는지 확인
    const existingVerifier = getAuthData(STORAGE_KEYS.CODE_VERIFIER);
    
    /**
     * PKCE 코드 검증기 생성 (RFC 7636 준수)
     * @returns RFC 7636 기반 안전한 코드 검증기
     */
    const generateCodeVerifier = async (): Promise<string> => {
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
    const generateCodeChallenge = async (verifier: string): Promise<string> => {
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
    
    // 새로운 code_verifier 생성
    const codeVerifier = await generateCodeVerifier();
    
    logger.info('새 code_verifier 생성됨', {
      길이: codeVerifier.length,
      첫_5글자: codeVerifier.substring(0, 5)
    });
    
    // code_verifier 저장 - 스토리지 유틸리티 사용
    setAuthData(STORAGE_KEYS.CODE_VERIFIER, codeVerifier, { expiry: 60 * 5 }); // 5분 유효
    
    // 코드 챌린지 생성 (S256 메서드 사용)
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // 원래 existingVerifier를 임시 백업 (재시도용)
    if (existingVerifier) {
      sessionStorage.setItem('auth.old_code_verifier', existingVerifier);
      sessionStorage.setItem('auth.old_code_verifier.timestamp', Date.now().toString());
    }
    
    // Supabase 클라이언트 가져오기
    const client = getAuthClient();
    
    // 환경 정보 수집
    const currentEnv = process.env.NODE_ENV || 'development';
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    // 리디렉션 URL 설정
    const getRedirectUrl = () => {
      if (typeof window === 'undefined') return '';
      
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      
      // 기본 콜백 경로
      const callbackPath = '/auth/callback';
      
      return `${protocol}//${hostname}${port}${callbackPath}`;
    };
    
    const redirectUrl = getRedirectUrl();
    logger.info('리디렉션 URL 설정', { redirectUrl });
    
    // PKCE 플로우로 Google OAuth 시작
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: false,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          // PKCE 코드 챌린지 메서드와 값 전달
          code_challenge: codeChallenge,
          code_challenge_method: 'S256'
        }
      }
    });
    
    if (error) {
      logger.error('Google OAuth 설정 오류', error);
      throw error;
    }
    
    if (!data?.url) {
      logger.error('Google OAuth URL이 반환되지 않음');
      throw new Error('인증 URL을 가져올 수 없습니다.');
    }
    
    logger.info('Google OAuth URL 획득', { length: data.url.length });
    
    // 세션 스토리지에 타임스탬프 저장 (디버깅용)
    sessionStorage.setItem('auth.oauth.start', Date.now().toString());
    sessionStorage.setItem('auth.oauth.provider', 'google');
    
    // 리디렉션
    window.location.href = data.url;
    
    // 여기까지 실행되면 리디렉션이 됨
    return { success: true };
  } catch (error) {
    logger.error('Google 로그인 오류:', error);
    throw error;
  }
}

// 로그아웃 함수
export async function signOut() {
  try {
    logger.info('로그아웃 시작');
    
    // code_verifier 백업
    const codeVerifier = getAuthData(STORAGE_KEYS.CODE_VERIFIER);
    if (codeVerifier) {
      // 이 값은 보존해야 하므로 따로 저장
      sessionStorage.setItem('auth.code_verifier.backup', codeVerifier);
    }
    
    // Supabase 로그아웃
    const client = getAuthClient();
    await client.auth.signOut();
    
    // 인증 데이터 삭제 (code_verifier 제외)
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key !== STORAGE_KEYS.CODE_VERIFIER) {
        removeAuthData(key);
      }
    });
    
    // code_verifier 복원
    if (codeVerifier) {
      setAuthData(STORAGE_KEYS.CODE_VERIFIER, codeVerifier, { expiry: 60 * 60 });
      logger.info('code_verifier 보존됨');
    }
    
    logger.info('로그아웃 완료');
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

// OAuth 2.0 설정
const OAUTH_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  redirectUri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL || '',
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  scope: 'openid email profile',
  responseType: 'code',
  grantType: 'authorization_code',
  codeVerifierLength: 64, // RFC 7636 권장 길이
  codeChallengeMethod: 'S256', // SHA-256 해시 사용
};

/**
 * generateCodeVerifier: 안전한 랜덤 문자열(코드 검증기) 생성
 * @returns {string} RFC 7636에 부합하는 코드 검증기
 */
export const generateCodeVerifier = (): string => {
  if (!isClient()) {
    throw new Error('코드 검증기는 클라이언트 환경에서만 생성할 수 있습니다.');
  }

  // 랜덤 바이트 생성
  const buffer = new Uint8Array(OAUTH_CONFIG.codeVerifierLength);
  crypto.getRandomValues(buffer);
  
  // RFC 7636 권장 문자셋으로 변환 (A-Z, a-z, 0-9, -, ., _, ~)
  return Array.from(buffer)
    .map(byte => {
      // 알파벳 대소문자(52) + 숫자(10) + 특수문자(4) = 66개 문자
      const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
      return charSet[byte % charSet.length];
    })
    .join('');
};

/**
 * generateCodeChallenge: 코드 검증기로부터 코드 챌린지 생성
 * @param {string} codeVerifier - 코드 검증기
 * @returns {Promise<string>} URL 안전한 Base64로 인코딩된 코드 챌린지
 */
export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  if (!isClient()) {
    throw new Error('코드 챌린지는 클라이언트 환경에서만 생성할 수 있습니다.');
  }
  
  // 코드 검증기를 ArrayBuffer로 변환
  const verifierBuffer = stringToArrayBuffer(codeVerifier);
  
  // SHA-256 해시 생성 - Uint8Array로 변환하여 타입 문제 해결
  const hashBuffer = await crypto.subtle.digest('SHA-256', new Uint8Array(verifierBuffer));
  
  // Base64Url 인코딩
  return base64UrlEncode(hashBuffer);
};

/**
 * googleLogin: Google OAuth 로그인 시작
 * @returns {Promise<void>}
 */
export const googleLogin = async (): Promise<void> => {
  if (!isClient()) {
    throw new Error('Google 로그인은 클라이언트 환경에서만 시작할 수 있습니다.');
  }
  
  // 코드 검증기 생성 및 로컬 스토리지에 저장
  const codeVerifier = generateCodeVerifier();
  setAuthData(STORAGE_KEYS.CODE_VERIFIER, codeVerifier);
  
  // 코드 검증기로부터 코드 챌린지 생성
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Google OAuth 로그인 URL 생성
  const authParams = new URLSearchParams({
    client_id: OAUTH_CONFIG.clientId,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    response_type: OAUTH_CONFIG.responseType,
    scope: OAUTH_CONFIG.scope,
    code_challenge: codeChallenge,
    code_challenge_method: OAUTH_CONFIG.codeChallengeMethod,
    // 추가 옵션
    prompt: 'select_account', // 항상 계정 선택 화면 표시
    access_type: 'offline', // 리프레시 토큰 요청
    state: crypto.randomUUID(), // CSRF 방지용 상태값
  });
  
  // Google 로그인 페이지로 리디렉션
  window.location.href = `${OAUTH_CONFIG.authEndpoint}?${authParams.toString()}`;
};

/**
 * exchangeCodeForSession: 인증 코드를 세션으로 교환
 * @param {string} code - Google OAuth 인증 코드
 * @returns {Promise<any>} 세션 정보
 */
export const exchangeCodeForSession = async (code: string): Promise<any> => {
  // 코드 검증기 가져오기
  const codeVerifier = getAuthData(STORAGE_KEYS.CODE_VERIFIER);
  
  if (!codeVerifier) {
    throw new Error('코드 검증기를 찾을 수 없습니다. 로그인 과정이 중단되었을 수 있습니다.');
  }
  
  // 토큰 교환 요청
  const tokenParams = new URLSearchParams({
    client_id: OAUTH_CONFIG.clientId,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    grant_type: OAUTH_CONFIG.grantType,
    code,
    code_verifier: codeVerifier
  });
  
  // 요청 전송
  const response = await fetch(OAUTH_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: tokenParams.toString()
  });
  
  // 응답 처리
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`토큰 교환 실패: ${errorData.error || response.statusText}`);
  }
  
  // 세션 정보 파싱
  const sessionData = await response.json();
  
  // 코드 검증기 제거 (1회용)
  removeAuthData(STORAGE_KEYS.CODE_VERIFIER);
  
  // 세션 정보 반환
  return sessionData;
};

/**
 * validateSession: 현재 세션이 유효한지 확인
 * @returns {boolean} 세션 유효 여부
 */
export const validateSession = (): boolean => {
  // 액세스 토큰 확인
  const accessToken = getAuthData(STORAGE_KEYS.ACCESS_TOKEN);
  if (!accessToken) return false;
  
  // 세션 만료 시간 확인
  const expiryTime = getAuthData(STORAGE_KEYS.SESSION);
  if (!expiryTime) return false;
  
  // 현재 시간과 비교
  const expiry = parseInt(expiryTime, 10);
  const currentTime = Date.now();
  
  return currentTime < expiry;
}; 