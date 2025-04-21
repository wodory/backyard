/**
 * 파일명: src/app/ReactQueryProvider.tsx
 * 목적: React Query의 QueryClient를 제공하는 컴포넌트 구현
 * 역할: Next.js App Router에서 React Query를 사용하기 위한 클라이언트 컴포넌트 제공
 * 작성일: 2024-05-18
 */
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';   // ⬅️ 추가
import React from 'react';

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = React.useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* 개발 모드에서만 DevTools 표시 */}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}
