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
  const baseUrl = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL;
  const redirectTo = `${baseUrl}/auth/callback`;
  
  console.log('Google 로그인 시작, 리디렉션 URL:', redirectTo);
  
  try {
    // 쿠키 정리 먼저 수행 (이전 상태 제거)
    localStorage.removeItem('supabase.auth.token');
    document.cookie.split(';').forEach(c => {
      const cookieName = c.split('=')[0].trim();
      if (cookieName.startsWith('sb-')) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        console.log(`쿠키 삭제: ${cookieName}`);
      }
    });
    
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