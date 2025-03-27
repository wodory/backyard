/**
 * 파일명: layout.tsx
 * 목적: 앱의 기본 레이아웃 구조 정의
 * 역할: 전체 페이지 구조와 공통 UI 요소 제공
 * 작성일: 2024-03-30
 */

import { ClientLayout } from "@/components/layout/ClientLayout";
import "@/app/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased" suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
