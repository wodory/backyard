/**
 * 파일명: src/app/test-react-query/page.tsx
 * 목적: React Query Provider 설정 테스트 
 * 역할: ReactQueryProvider가 제대로 적용되었는지 확인하는 테스트 페이지
 * 작성일: 2024-05-18
 */

import TestQuery from '../test-query';

/**
 * TestReactQueryPage: React Query 테스트 페이지
 * @returns {JSX.Element} 테스트 페이지 컴포넌트
 */
export default function TestReactQueryPage() {
    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">React Query 테스트 페이지</h1>
            <TestQuery />
        </div>
    );
} 