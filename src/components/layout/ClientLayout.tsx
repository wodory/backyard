/**
 * 파일명: ClientLayout.tsx
 * 목적: 클라이언트 측 레이아웃과 전역 상태 관리 컴포넌트
 * 역할: 인증 상태, 토스트 메시지 등 클라이언트 컴포넌트 래핑
 * 작성일: 2025-03-27
 * 수정일: 2025-04-09
 * 수정일: 2024-05-13 : AuthProvider 제거하고 useAuth 훅 사용으로 변경
 * 수정일: 2025-04-21 : ThemeProvider 제거하고 useAppStore의 themeSlice 사용으로 변경
 * 수정일: 2025-04-29 : 초기 프로젝트 로딩 및 activeProjectId 설정 로직 추가
 * 수정일: 2025-04-29 : Provider 패턴 적용 - 인증 및 프로젝트 데이터가 로드된 후 자식 컴포넌트 렌더링
 */

'use client';

import { ReactNode, useEffect, useState } from 'react';

import { Toaster } from "sonner";

import InitDatabase from "@/components/debug/InitDatabase";
import { useAuth } from '@/hooks/useAuth';
import createLogger from '@/lib/logger';
import { useAuthStore, selectUserId } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';

// 모듈별 로거 생성
const logger = createLogger('ClientLayout');

/**
 * 로딩 화면 컴포넌트
 */
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">앱 초기화 중...</p>
      </div>
    </div>
  );
}

/**
 * 에러 화면 컴포넌트
 */
function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center p-6 bg-red-50 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-semibold text-red-800 mb-2">초기화 오류</h2>
        <p className="text-red-600">{message}</p>
      </div>
    </div>
  );
}

/**
 * ClientLayout: 클라이언트 전용 레이아웃 컴포넌트
 * @param children - 자식 컴포넌트
 * @returns 클라이언트 레이아웃 컴포넌트
 */
export function ClientLayout({ children }: { children: ReactNode }) {
  // 초기화 상태 관리
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Supabase 인증 상태 구독
  const { user, isLoading: isAuthLoading, error: authError } = useAuth();

  // Zustand 스토어에서 사용자 ID 가져오기
  const userId = useAuthStore(selectUserId);

  // AppStore에서 프로젝트 관련 상태 및 액션 가져오기
  const fetchProjects = useAppStore(state => state.fetchProjects);
  const projects = useAppStore(state => state.projects);
  const activeProjectId = useAppStore(state => state.activeProjectId);
  const isAppLoading = useAppStore(state => state.isLoading);

  // 프로젝트 로드 여부 확인
  const projectsLoaded = projects.length > 0 && activeProjectId !== null;

  // 전체 로딩 상태 계산
  const isLoading = isAuthLoading || isAppLoading || (!isInitialized && !initError);

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
        setInitError('브라우저 로컬 스토리지에 접근할 수 없습니다. 시크릿 모드를 종료하거나 브라우저 설정을 확인해주세요.');
        return;
      }
    }

    // 개발 환경에서 인증 상태 콘솔 출력 (디버깅용)
    if (process.env.NODE_ENV === 'development') {
      logger.debug('인증 상태:', { userId, isAuthLoading, authError: authError?.message });
    }

    // 인증 완료, 사용자 존재, 프로젝트 미로드 상태일 때만 프로젝트 로드
    if (!isAuthLoading && userId && !projectsLoaded && !isAppLoading) {
      logger.info(`[ClientLayout] 사용자 인증 완료 (ID: ${userId}). 프로젝트 로딩 시작...`);

      fetchProjects()
        .then(() => {
          logger.info('[ClientLayout] 프로젝트 로드 완료.');
          setIsInitialized(true);
        })
        .catch(err => {
          logger.error('[ClientLayout] 초기 프로젝트 로딩 실패:', err);
          setInitError('프로젝트 데이터를 불러오는 중 오류가 발생했습니다.');
        });
    }
    // 이미 프로젝트가 로드된 경우
    else if (projectsLoaded) {
      logger.debug('[ClientLayout] 프로젝트가 이미 로드되어 있습니다. activeProjectId:', activeProjectId);
      setIsInitialized(true);
    }
    // 인증이 완료되었으나 사용자가 없는 경우 (로그아웃 상태)
    else if (!isAuthLoading && !userId) {
      logger.debug('[ClientLayout] 사용자가 인증되지 않았습니다. 로그인이 필요합니다.');
      // 로그인 페이지인 경우 초기화 완료로 간주
      setIsInitialized(true);
    }

    return () => {
      logger.info('클라이언트 레이아웃 언마운트');
    };
  }, [userId, isAuthLoading, authError, projectsLoaded, fetchProjects, activeProjectId, isAppLoading]);

  // 초기화 중 오류 발생 시 에러 화면 표시
  if (initError) {
    return <ErrorScreen message={initError} />;
  }

  // 인증 에러 발생 시 에러 화면 표시
  if (authError) {
    return <ErrorScreen message={`인증 중 오류가 발생했습니다: ${authError.message}`} />;
  }

  // 로딩 중일 때 로딩 화면 표시
  if (isLoading) {
    return <LoadingScreen />;
  }

  // 로그인 필요 상태인데 로그인하지 않은 경우
  // (로그인 페이지 자체는 children으로 들어오므로 여기서는 처리하지 않음)

  // 프로젝트가 필요한 페이지는 각 페이지에서 activeProjectId 체크 필요
  // (이는 각 페이지 컴포넌트에서 구현해야 함)

  // 모든 초기화가 완료된 경우 자식 컴포넌트 렌더링
  return (
    <main>
      {/* Three layer는 엣지 리펙토링 이후 프로젝트 리펙토링에서 적용할 예정 */}
      {children}

      {/* DB 초기화 스크립트 */}
      <InitDatabase />
      <Toaster position="top-center" />
    </main>
  );
} 