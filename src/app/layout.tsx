/**
 * 파일명: src/app/layout.tsx
 * 목적: 앱의 기본 레이아웃 구조 정의
 * 역할: 전체 페이지 구조와 공통 UI 요소 제공
 * 작성일: 2025-02-27
 * 수정일: 2025-03-28
 * 수정일: 2024-05-08 : 메타데이터 추가
 * 수정일: 2024-05-28 : import 순서 정렬
 * 수정일: 2024-05-18 : ReactQueryProvider 추가
 */

import "@/app/globals.css";
import "@xyflow/react/dist/style.css";

import { Metadata } from "next";

import { ClientLayout } from "@/components/layout/ClientLayout";
import { ReactQueryProvider } from "@/app/ReactQueryProvider";

export const metadata: Metadata = {
  title: "Backyard - 생각을 관리하는 새로운 방법",
  description: "아이디어를 시각적으로 구성하고 관리하는 직관적인 도구",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased" suppressHydrationWarning>
        <ReactQueryProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
