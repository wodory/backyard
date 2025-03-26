'use client';

import { createBrowserClient } from './supabase';
import { deleteCookie } from 'cookies-next';
import { User } from '@supabase/supabase-js';

// 브라우저 환경에서 사용할 Supabase 클라이언트 생성 함수
export const getBrowserClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('브라우저 환경에서만 사용 가능합니다.');
  }
  
  // createBrowserSupabaseClient 대신 createBrowserClient 사용
  return createBrowserClient();
};

// ExtendedUser 타입 정의
export interface ExtendedUser extends User {
  dbUser?: any; // Prisma User 모델
}

// 회원가입 함수
export async function signUp(email: string, password: string, name: string | null = null) {
  try {
    // Supabase 인증으로 사용자 생성
    const client = getBrowserClient();
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
    const client = getBrowserClient();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // 로그인 성공 시 쿠키에 세션 정보 저장
    if (data.session) {
      // 현재 호스트 가져오기
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      const isLocalhost = host === 'localhost' || host === '127.0.0.1';
      
      // Secure 속성은 HTTPS에서만 설정
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
      
      // SameSite 설정 - 프로덕션에서는 Strict 또는 Lax
      // 리다이렉트가 많으면 Lax가 권장됨
      const sameSite = 'lax'; // 크로스 사이트 요청에도 쿠키 전송 허용
      
      // 도메인 설정 (로컬호스트가 아닌 경우에만)
      let domain = '';
      if (!isLocalhost) {
        // 서브도메인 포함하기 위해 최상위 도메인만 설정
        const hostParts = host.split('.');
        if (hostParts.length > 1) {
          // vercel.app 또는 yoursite.com 형태일 경우
          domain = hostParts.slice(-2).join('.');
        } else {
          domain = host;
        }
      }
      
      const domainStr = domain ? `domain=.${domain}; ` : ''; 
      const secureStr = isSecure ? 'Secure; ' : '';
      
      // 액세스 토큰 저장
      document.cookie = `sb-access-token=${data.session.access_token}; ${domainStr} path=/; max-age=${60 * 60 * 24 * 7}; SameSite=${sameSite}; ${secureStr}`;
      
      // 리프레시 토큰 저장
      if (data.session.refresh_token) {
        document.cookie = `sb-refresh-token=${data.session.refresh_token}; ${domainStr} path=/; max-age=${60 * 60 * 24 * 30}; SameSite=${sameSite}; ${secureStr}`;
      }
      
      // localStorage에도 백업 (fallback)
      try {
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        }));
      } catch (err) {
        console.warn('로컬 스토리지 저장 실패:', err);
      }
      
      console.log('로그인 성공: 쿠키에 토큰 저장됨', {
        환경: process.env.NODE_ENV,
        호스트: host,
        도메인설정: domain || '없음',
        보안설정: isSecure ? 'HTTPS' : 'HTTP',
        SameSite: sameSite
      });
    } else {
      console.warn('로그인 성공했지만 세션 데이터가 없습니다.');
    }

    return data;
  } catch (error) {
    console.error('로그인 실패:', error);
    throw error;
  }
}

// Google 로그인 함수
export async function signInWithGoogle() {
  try {
    // 브라우저 환경 확인
    if (typeof window === 'undefined') {
      throw new Error('브라우저 환경에서만 실행 가능합니다.');
    }
    
    console.log('[Auth][1] Google 로그인 시작 - 환경 정보:', {
      환경: process.env.NODE_ENV,
      window_location: window.location.href,
      user_agent: navigator.userAgent
    });
    
    // 브라우저 클라이언트 생성
    const supabase = getBrowserClient();
    console.log('[Auth][2] Supabase 클라이언트 생성됨');
    
    // 환경 변수 기반 리디렉션 URL 설정
    let redirectTo;
    if (process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL) {
      // 슬래시로 끝나는 경우 처리
      const baseUrl = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL.endsWith('/')
        ? process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL.slice(0, -1)
        : process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL;
      
      redirectTo = `${baseUrl}/auth/callback`;
      console.log('[Auth][3] 환경 변수에서 리디렉션 URL 설정:', {
        원본_환경변수: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL,
        정규화된_URL: baseUrl,
        최종_리디렉션URL: redirectTo
      });
    } else {
      redirectTo = `${window.location.origin}/auth/callback`;
      console.log('[Auth][3] 환경 변수 없음, 현재 오리진에서 리디렉션 URL 설정:', {
        오리진: window.location.origin,
        최종_리디렉션URL: redirectTo
      });
    }
    
    // 디버깅: 로그인 시도 전 로컬 스토리지 상태 확인
    const beforeVerifier = localStorage.getItem('supabase.auth.code_verifier');
    console.log('[Auth][4] 로그인 전 code_verifier 상태:', {
      존재여부: beforeVerifier ? '존재함' : '없음',
      길이: beforeVerifier?.length || 0,
      첫_5글자: beforeVerifier ? beforeVerifier.substring(0, 5) : '없음',
      마지막_5글자: beforeVerifier ? beforeVerifier.substring(beforeVerifier.length - 5) : '없음'
    });
    
    // localStorage 상태 전체 확인
    console.log('[Auth][5] localStorage 키 목록:', {
      supabase관련: Object.keys(localStorage).filter(key => key.startsWith('supabase')),
      전체키: Object.keys(localStorage)
    });
    
    // 백업 저장 시 타임스탬프 추가 (유효성 확인용)
    if (beforeVerifier) {
      sessionStorage.setItem('auth.code_verifier.backup', beforeVerifier);
      sessionStorage.setItem('auth.code_verifier.timestamp', Date.now().toString());
      console.log('[Auth][6] code_verifier 백업 완료');
      
      // 백업 확인
      const backupCheck = sessionStorage.getItem('auth.code_verifier.backup');
      console.log('[Auth][6-1] 백업 확인:', {
        백업성공여부: backupCheck === beforeVerifier,
        백업길이: backupCheck?.length || 0
      });
    }
    
    // OAuth 로그인 파라미터 구성
    const oauthParams = {
      provider: 'google' as const,
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          // 브라우저 캐시 방지용 파라미터 추가
          nonce: Math.random().toString(36).substring(2)
        }
      }
    };
    
    console.log('[Auth][7] OAuth 파라미터 구성 완료:', {
      provider: oauthParams.provider,
      redirectTo: oauthParams.options.redirectTo,
      queryParams: oauthParams.options.queryParams
    });
    
    // OAuth 로그인 시작 (Supabase가 PKCE 흐름을 자동으로 처리)
    console.log('[Auth][8] signInWithOAuth 호출 시작...');
    const { data, error } = await supabase.auth.signInWithOAuth(oauthParams);
    
    if (error) {
      console.error('[Auth][9] Google OAuth 초기화 오류:', {
        에러코드: error.code,
        에러메시지: error.message,
        상태코드: error.status
      });
      throw error;
    }
    
    if (!data?.url) {
      console.error('[Auth][10] OAuth URL이 생성되지 않았습니다.');
      throw new Error('인증 URL을 생성할 수 없습니다.');
    }
    
    console.log('[Auth][11] OAuth URL 생성 성공:', {
      url_시작부분: data.url.substring(0, 50) + '...',
      url_길이: data.url.length
    });
    
    // 디버깅: 로그인 시도 후 로컬 스토리지 상태 확인
    const afterVerifier = localStorage.getItem('supabase.auth.code_verifier');
    console.log('[Auth][12] 로그인 후 code_verifier 상태:', {
      존재여부: afterVerifier ? '존재함' : '없음',
      길이: afterVerifier?.length || 0,
      첫_5글자: afterVerifier ? afterVerifier.substring(0, 5) : '없음',
      마지막_5글자: afterVerifier ? afterVerifier.substring(afterVerifier.length - 5) : '없음',
      변경여부: beforeVerifier !== afterVerifier ? '변경됨' : '동일함'
    });
    
    // 리디렉션 직전 다시 백업
    if (afterVerifier) {
      sessionStorage.setItem('auth.code_verifier.backup', afterVerifier);
      sessionStorage.setItem('auth.code_verifier.timestamp', Date.now().toString());
      console.log('[Auth][13] code_verifier 다시 백업 완료');
      
      // localStorage 상태 전체 확인
      console.log('[Auth][13-1] 리디렉션 직전 localStorage 키 목록:', {
        supabase관련: Object.keys(localStorage).filter(key => key.startsWith('supabase')),
        sessionStorage관련: Object.keys(sessionStorage)
      });
    }
    
    // URL로 리디렉션
    console.log('[Auth][14] OAuth URL로 리디렉션 직전. 이후 callback 페이지로 이동됩니다.');
    window.location.href = data.url;
    
    return data;
  } catch (error) {
    console.error('[Auth][오류] Google 로그인 오류:', error);
    throw error;
  }
}

// 로그아웃 함수
export async function signOut() {
  const supabase = getBrowserClient();
  
  // Supabase 로그아웃
  const { error } = await supabase.auth.signOut();
  
  // 쿠키 삭제 (미들웨어가 사용하는 쿠키)
  deleteCookie('sb-access-token');
  deleteCookie('sb-refresh-token');
  
  if (error) {
    console.error('로그아웃 처리 중 오류:', error);
    throw error;
  }
  
  return true;
}

// 현재 사용자 정보 가져오기
export async function getCurrentUser(): Promise<ExtendedUser | null> {
  try {
    const client = getBrowserClient();
    const { data, error } = await client.auth.getSession();
    
    if (error) {
      console.error('세션 가져오기 오류:', error.message);
      return null;
    }
    
    const session = data.session;
    
    if (!session) {
      console.log('세션 없음, 로그인되지 않음');
      return null;
    }
    
    const user = session.user;
    
    if (!user) {
      console.error('세션에 사용자 정보 없음');
      return null;
    }
    
    console.log('세션 사용자 정보 확인:', {
      id: user.id,
      email: user.email,
      auth_provider: user.app_metadata?.provider
    });
    
    // 브라우저 환경에서는 API를 통해 사용자 정보 가져오기
    if (typeof window !== 'undefined') {
      try {
        // 타임아웃 설정
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
        
        // API 호출을 통해 사용자 정보 가져오기
        let response = await fetch(`/api/user/${user.id}`, {
          signal: controller.signal,
          // 인증 헤더 추가
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }).catch(error => {
          console.error('사용자 정보 가져오기 오류:', error);
          return null;
        });
        
        clearTimeout(timeoutId);
        
        // fetch 요청 자체가 실패한 경우
        if (!response) {
          console.log('API 요청 실패, 기본 사용자 정보 반환');
          return {
            ...user,
            dbUser: {
              id: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || 
                    user.user_metadata?.name || 
                    (user.email ? user.email.split('@')[0] : '사용자'),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          } as ExtendedUser;
        }
        
        // 사용자를 찾을 수 없는 경우, 로컬 데이터베이스에 동기화 시도
        if (!response.ok && response.status === 404) {
          console.log('사용자를 찾을 수 없어 데이터베이스에 동기화를 시도합니다.');
          
          const syncController = new AbortController();
          const syncTimeoutId = setTimeout(() => syncController.abort(), 5000);
          
          try {
            // 사용자 동기화 시도
            const registerResponse = await fetch('/api/user/register', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     (user.email ? user.email.split('@')[0] : '사용자')
              }),
              signal: syncController.signal
            });
            
            clearTimeout(syncTimeoutId);
            
            if (registerResponse.ok) {
              const userData = await registerResponse.json();
              return {
                ...user,
                dbUser: userData.user
              } as ExtendedUser;
            }
          } catch (syncError) {
            clearTimeout(syncTimeoutId);
            console.error('사용자 동기화 오류:', syncError);
          }
        } else if (response.ok) {
          const data = await response.json();
          return {
            ...user,
            dbUser: data.user
          } as ExtendedUser;
        }
      } catch (fetchError) {
        console.error('사용자 정보 API 호출 오류:', fetchError);
      }
    }
    
    // API 요청 실패 시 Supabase 사용자 정보만 반환
    console.log('기본 사용자 정보 반환');
    return user as ExtendedUser;
  } catch (error) {
    console.error('사용자 정보 가져오기 오류:', error);
    return null;
  }
}

// 이메일/비밀번호 로그인
export async function signInWithEmail(email: string, password: string) {
  const supabase = getBrowserClient();
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

// 이메일/비밀번호 가입
export async function signUpWithEmail(email: string, password: string) {
  const supabase = getBrowserClient();
  return supabase.auth.signUp({
    email,
    password,
  });
}

// 현재 사용자 세션 가져오기
export async function getSession() {
  const supabase = getBrowserClient();
  return supabase.auth.getSession();
}

// 사용자 정보 가져오기
export async function getUser() {
  const supabase = getBrowserClient();
  const { data } = await supabase.auth.getUser();
  return data?.user;
} 