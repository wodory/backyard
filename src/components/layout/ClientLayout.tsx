/**
 * 파일명: ClientLayout.tsx
 * 목적: 클라이언트 측 레이아웃과 전역 상태 관리 컴포넌트
 * 역할: 인증 상태, 토스트 메시지 등 클라이언트 컴포넌트 래핑
 * 작성일: 2024-03-30
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { InitDatabase } from "@/components/InitDatabase";
import createLogger from '@/lib/logger';

// Supabase 싱글톤 인스턴스 초기화 (클라이언트에서만 실행)
import "@/lib/supabase-instance";

// 모듈별 로거 생성
const logger = createLogger('ClientLayout');

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
      <main>
        {children}
        
        {/* DB 초기화 스크립트 */}
        <InitDatabase />
      </main>
      <Toaster position="top-center" />
    </AuthProvider>
  );
} 