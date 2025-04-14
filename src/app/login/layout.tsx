/**
 * 파일명: src/app/login/layout.tsx
 * 목적: 로그인 페이지 레이아웃
 * 역할: PublicOnlyLayout을 적용하여 이미 인증된 사용자 리디렉션
 * 작성일: 2024-05-08
 */

import { PublicOnlyLayout } from '@/components/layout/PublicOnlyLayout';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <PublicOnlyLayout>{children}</PublicOnlyLayout>;
} 