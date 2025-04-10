/**
 * 파일명: ClientLayout.tsx
 * 목적: 클라이언트 측 레이아웃과 전역 상태 관리 컴포넌트
 * 역할: 인증 상태, 토스트 메시지 등 클라이언트 컴포넌트 래핑
 * 작성일: 2025-03-27
 * 수정일: 2025-04-09
 * 수정일: ${new Date().toISOString().split('T')[0]} : 사용자 자동 생성 로직 추가
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "sonner";
import InitDatabase from "@/components/debug/InitDatabase";
import createLogger from '@/lib/logger';
import { toast } from 'sonner';

// Supabase 클라이언트 초기화 (클라이언트에서만 실행)
import { createClient } from "@/lib/supabase/client";

// 모듈별 로거 생성
const logger = createLogger('ClientLayout');

/**
 * UserSynchronizer: 사용자 정보를 데이터베이스와 동기화하는 컴포넌트
 * @returns null (렌더링 없음)
 */
function UserSynchronizer() {
  const { user } = useAuth();

  useEffect(() => {
    // 인증된 사용자 정보가 있을 때만 실행
    if (user && user.id) {
      checkAndCreateUser(user.id, user.email || '', user.user_metadata?.full_name || '');
    }
  }, [user]);

  /**
   * 사용자 존재 여부 확인 및 필요시 생성
   * @param userId - 사용자 ID
   * @param email - 사용자 이메일
   * @param name - 사용자 이름
   */
  const checkAndCreateUser = async (userId: string, email: string, name: string) => {
    try {
      logger.info('사용자 정보 확인 중', { userId });

      // 사용자 존재 여부 확인
      const userResponse = await fetch(`/api/users/${userId}`);

      if (userResponse.ok) {
        logger.info('기존 사용자 확인됨', { userId });
        return;
      }

      if (userResponse.status !== 404) {
        throw new Error('사용자 정보 확인 중 오류 발생');
      }

      // 사용자가 존재하지 않으면 새로 생성
      logger.info('사용자 정보 생성 시작', { userId, email });

      const createResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: userId,
          email,
          name: name || email.split('@')[0]
        })
      });

      if (createResponse.ok) {
        const newUser = await createResponse.json();
        logger.info('사용자 정보 생성 완료', { userId: newUser.id });
      } else {
        throw new Error('사용자 정보 생성 실패');
      }
    } catch (error) {
      logger.error('사용자 정보 동기화 실패', error);
    }
  };

  return null;
}

/**
 * ClientLayout: 클라이언트 전용 레이아웃 컴포넌트
 * @param children - 자식 컴포넌트
 * @returns 클라이언트 레이아웃 컴포넌트
 */
export function ClientLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    logger.info('클라이언트 레이아웃 마운트');

    // 브라우저 환경 확인 로깅
    if (typeof window !== 'undefined') {
      logger.info('브라우저 환경 확인');
      // localStorage 접근 여부 체크 (프라이빗 브라우징에서 예외 발생 가능)
      try {
        localStorage.setItem('client_layout_test', 'test');
        localStorage.removeItem('client_layout_test');
        logger.info('localStorage 접근 가능');

        // 저장된 사용자 ID 확인 (디버깅용)
        const userId = localStorage.getItem('user_id');
        if (userId) {
          console.log('=== 로컬 스토리지에 저장된 사용자 ID ===');
          console.log('user_id:', userId);
          console.log('==================');
        } else {
          console.log('로컬 스토리지에 user_id가 없습니다.');
        }
      } catch (error) {
        logger.warn('localStorage 접근 불가', error);
      }
    }

    return () => {
      logger.info('클라이언트 레이아웃 언마운트');
    };
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <main>
          {/* 사용자 정보 동기화 컴포넌트 */}
          <UserSynchronizer />

          {children}

          {/* DB 초기화 스크립트 */}
          <InitDatabase />
        </main>
        <Toaster position="top-center" />
      </ThemeProvider>
    </AuthProvider>
  );
} 