/**
 * 파일명: src/app/ReactQueryProvider.tsx
 * 목적: React Query의 QueryClient를 제공하는 컴포넌트 구현
 * 역할: Next.js App Router에서 React Query를 사용하기 위한 클라이언트 컴포넌트 제공
 * 작성일: 2024-05-18
 * 수정일: 2025-04-21 : ReactQueryDevtools 가시성 개선
 */
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = React.useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5분 
                gcTime: 1000 * 60 * 10,   // 10분
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* 개발 모드에서만 DevTools 표시 - 기본적으로 열린 상태로 시작 */}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools
                    initialIsOpen={true}
                    position="bottom"
                    buttonPosition="bottom-right"
                />
            )}
        </QueryClientProvider>
    );
}
