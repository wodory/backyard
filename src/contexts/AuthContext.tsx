'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, signOut } from '@/lib/auth';
import { createBrowserClient } from '@/lib/supabase';

// 확장된 사용자 타입 정의
export interface ExtendedUser extends User {
  dbUser?: any; // Prisma User 모델
}

type AuthContextType = {
  user: ExtendedUser | null;
  userDetails: any; // Prisma User 모델 타입
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userDetails: null,
  isLoading: true,
  isAuthenticated: false,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 데이터베이스 동기화 함수
  const syncUserWithDatabase = async (supabaseUser: User) => {
    try {
      if (!supabaseUser || !supabaseUser.id || !supabaseUser.email) {
        console.warn('사용자 동기화 실패: 유효하지 않은 사용자 데이터');
        return null;
      }

      // 로컬 데이터베이스에 사용자 등록/확인
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || 
                supabaseUser.user_metadata?.name || 
                supabaseUser.email?.split('@')[0]
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.user;
      } else {
        console.error('사용자 동기화 API 오류:', await response.text());
        return null;
      }
    } catch (error) {
      console.error('사용자 데이터베이스 동기화 오류:', error);
      return null;
    }
  };

  // 인증 상태 확인
  const checkAuth = async () => {
    try {
      const userData = await getCurrentUser() as ExtendedUser | null;
      
      if (userData) {
        setUser(userData);
        setUserDetails(userData.dbUser);
      } else {
        setUser(null);
        setUserDetails(null);
      }
    } catch (error) {
      console.error('인증 상태 확인 오류:', error);
      setUser(null);
      setUserDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setUserDetails(null);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // 초기 인증 상태 확인
  useEffect(() => {
    checkAuth();

    // 브라우저 환경에서만 Supabase 클라이언트 생성
    const supabase = createBrowserClient();
    
    // Supabase 인증 이벤트 리스너
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session && session.user) {
            // 사용자가 로그인하거나 토큰이 갱신될 때 데이터베이스 동기화
            console.log('인증 상태 변경 감지: 사용자 동기화 시작');
            const dbUser = await syncUserWithDatabase(session.user);
            
            if (dbUser) {
              // 동기화된 사용자 정보로 상태 업데이트
              const extendedUser = { ...session.user, dbUser } as ExtendedUser;
              setUser(extendedUser);
              setUserDetails(dbUser);
              setIsLoading(false);
            } else {
              // 동기화 실패 시 getCurrentUser로 다시 시도
              checkAuth();
            }
          }
        } else if (event === 'SIGNED_OUT') {
          // 사용자가 로그아웃할 때
          setUser(null);
          setUserDetails(null);
        }
      }
    );

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userDetails,
        isLoading,
        isAuthenticated: !!user,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 