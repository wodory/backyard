'use client';

import { createBrowserClient } from './supabase';
import { deleteCookie } from 'cookies-next';

// 브라우저 환경에서 사용할 Supabase 클라이언트 생성 함수
export const getBrowserClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('브라우저 환경에서만 사용 가능합니다.');
  }
  return createBrowserClient();
};

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
  
  // 현재 URL 가져오기
  const origin = window.location.origin;
  const redirectTo = `${origin}/auth/callback`;
  
  console.log('Google 로그인 시작, 리디렉션 URL:', redirectTo);
  
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        // 필요한 경우 Google OAuth 추가 Scope 지정
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
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
export async function getCurrentUser() {
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
        // API 호출을 통해 사용자 정보 가져오기
        const response = await fetch(`/api/user/${session.user.id}`);
        
        if (response.ok) {
          const userData = await response.json();
          return {
            ...session.user,
            dbUser: userData.user,
          };
        } else {
          // API 호출 실패 시 기본 사용자 정보만 반환
          console.warn('사용자 DB 정보 가져오기 실패');
          
          // 로그인은 이미 되었으므로 기본 사용자 정보 구성
          return {
            ...session.user,
            dbUser: {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || 
                    (session.user.email ? session.user.email.split('@')[0] : '사용자'),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          };
        }
      } catch (apiError) {
        console.error('사용자 DB 정보 API 호출 오류:', apiError);
        
        // API 호출 오류가 있어도 인증은 성공했으므로 기본 정보 반환
        return {
          ...session.user,
          dbUser: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || 
                  (session.user.email ? session.user.email.split('@')[0] : '사용자'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        };
      }
    }
    
    // 서버 환경일 경우에만 실행 (import 구문이 실행되지 않아 오류 방지)
    if (typeof window === 'undefined') {
      // 동적으로 prisma import
      const { default: prisma } = await import('./prisma');
      
      // Prisma로 추가 사용자 정보 가져오기
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      
      return {
        ...session.user,
        dbUser: user,
      };
    }
    
    // 기본 반환
    return {
      ...session.user,
      dbUser: null,
    };
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
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