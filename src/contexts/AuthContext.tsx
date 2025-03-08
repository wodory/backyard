'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, signOut } from '@/lib/auth';
import { createBrowserClient } from '@/lib/supabase';

type AuthContextType = {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 인증 상태 확인
  const checkAuth = async () => {
    try {
      const userData = await getCurrentUser();
      
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
          // 사용자가 로그인하거나 토큰이 갱신될 때
          checkAuth();
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