'use client';

import { createBrowserClient } from './supabase';
import { deleteCookie } from 'cookies-next';
import { User } from '@supabase/supabase-js';

// 브라우저 환경에서 사용할 Supabase 클라이언트 생성 함수
export const getBrowserClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('브라우저 환경에서만 사용 가능합니다.');
  }
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
      document.cookie = `sb-access-token=${data.session.access_token}; ${domainStr}path=/; max-age=${60 * 60 * 24 * 7}; SameSite=${sameSite}; ${secureStr}`;
      
      // 리프레시 토큰 저장
      if (data.session.refresh_token) {
        document.cookie = `sb-refresh-token=${data.session.refresh_token}; ${domainStr}path=/; max-age=${60 * 60 * 24 * 30}; SameSite=${sameSite}; ${secureStr}`;
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
  const supabase = getBrowserClient();
  
  // 환경 변수에서 리디렉션 URL 가져오기
  // 프로덕션에서는 환경 변수를 사용하고, 로컬에서는 현재 호스트 기반으로 URL 생성
  const baseUrl = typeof window !== 'undefined' && process.env.NODE_ENV === 'development'
    ? `${window.location.protocol}//${window.location.host}`
    : process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL;
    
  const redirectTo = `${baseUrl}/auth/callback`;
  
  console.log('Google 로그인 시작, 리디렉션 URL:', redirectTo);
  
  try {
    // 쿠키 정리 - 간소화하고 표준 방식으로 변경
    localStorage.removeItem('supabase.auth.token');
    
    // 기존 Supabase 인증 쿠키 삭제
    document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;`;
    document.cookie = `sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;`;
    
    console.log('인증 쿠키 및 로컬 스토리지 정리 완료');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        skipBrowserRedirect: false,
      },
    });
    
    if (error) {
      console.error('Google OAuth 초기화 오류:', error);
      throw error;
    }
    
    console.log('Google OAuth 시작됨, 리디렉션 URL:', data.url);
    
    // 명시적 리디렉션 수행
    window.location.href = data.url;
    return data;
  } catch (error) {
    console.error('Google 로그인 오류:', error);
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
    const { data: { session }, error } = await client.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    if (!session) {
      return null;
    }
    
    // 브라우저 환경에서는 API를 통해 사용자 정보 가져오기
    if (typeof window !== 'undefined') {
      try {
        // 타임아웃 설정
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
        
        // API 호출을 통해 사용자 정보 가져오기
        let response = await fetch(`/api/user/${session.user.id}`, {
          signal: controller.signal
        }).catch(error => {
          console.error('사용자 정보 가져오기 오류:', error);
          return null;
        });
        
        clearTimeout(timeoutId);
        
        // fetch 요청 자체가 실패한 경우
        if (!response) {
          console.log('API 요청 실패, 기본 사용자 정보 반환');
          return {
            ...session.user,
            dbUser: {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || 
                    session.user.user_metadata?.name || 
                    (session.user.email ? session.user.email.split('@')[0] : '사용자'),
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
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || 
                     session.user.user_metadata?.name || 
                     (session.user.email ? session.user.email.split('@')[0] : '사용자')
              }),
              signal: syncController.signal
            });
            
            clearTimeout(syncTimeoutId);
            
            if (registerResponse.ok) {
              const userData = await registerResponse.json();
              return {
                ...session.user,
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
            ...session.user,
            dbUser: data.user
          } as ExtendedUser;
        }
      } catch (fetchError) {
        console.error('사용자 정보 API 호출 오류:', fetchError);
      }
    }
    
    // API 요청 실패 시 Supabase 사용자 정보만 반환
    console.log('기본 사용자 정보 반환');
    return session.user as ExtendedUser;
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