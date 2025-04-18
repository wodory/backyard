/**
 * 파일명: src/app/page.tsx
 * 목적: 앱의 메인 진입점(루트 페이지) 구성
 * 역할: 사용자 인증 상태를 서버 사이드에서 확인하고 인증되지 않은 경우 로그인 페이지로 리디렉션
 * 작성일: 2024-04-22
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-server';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default async function Home() {
  const session = await auth(); // 세션 확인

  if (!session) { // 세션 없으면 로그인 페이지로 리디렉션
    redirect('/login');
  }

  // 세션 있으면 대시보드 렌더링
  return <DashboardLayout />;
}
