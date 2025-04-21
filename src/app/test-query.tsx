/**
 * 파일명: src/app/test-query.tsx
 * 목적: React Query 작동 테스트를 위한 임시 컴포넌트
 * 역할: React Query의 기본 기능 검증
 * 작성일: 2024-05-18
 */

"use client";

import { useQuery } from '@tanstack/react-query';

/**
 * TestQuery: React Query 작동 테스트 컴포넌트
 * @returns {JSX.Element} 테스트 결과를 보여주는 컴포넌트
 */
export default function TestQuery() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['test'],
        queryFn: () => Promise.resolve('React Query is working!'),
    });

    const { data: data2, isLoading: isLoading2, error: error2 } = useQuery({
        queryKey: ['test2'],
        queryFn: () => Promise.resolve('React Query is working, too!'),
    });


    if (isLoading) return <p>로딩 중...</p>;
    if (error) return <p>에러 발생: {error.message}</p>;

    return (
        <div className="p-4 border rounded">
            <h2 className="text-xl font-bold">React Query 테스트</h2>
            <p className="mt-2">결과: {data}. {data2}</p>
        </div>
    );
} 