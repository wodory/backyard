/**
 * 파일명: not-found.test.tsx
 * 목적: NotFound 컴포넌트의 기능 검증
 * 역할: 404 페이지가 올바르게 렌더링되는지 확인
 * 작성일: 2025-04-01
 */

import { render, screen } from '@testing-library/react';
import { expect, describe, it, vi } from 'vitest';
import NotFound from './not-found';

// Next.js Link 컴포넌트 모킹
vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode, href: string }) => (
        <a href={href} data-testid="link">
            {children}
        </a>
    ),
}));

describe('NotFound 컴포넌트', () => {
    it('404 텍스트가 표시되어야 함', () => {
        render(<NotFound />);
        expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('페이지를 찾을 수 없다는 메시지가 표시되어야 함', () => {
        render(<NotFound />);
        expect(screen.getByText('페이지를 찾을 수 없습니다')).toBeInTheDocument();
    });

    it('설명 텍스트가 표시되어야 함', () => {
        render(<NotFound />);
        expect(screen.getByText('요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.')).toBeInTheDocument();
    });

    it('홈으로 돌아가는 링크가 있어야 함', () => {
        render(<NotFound />);
        const link = screen.getByTestId('link');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/');
        expect(link).toHaveTextContent('홈으로 돌아가기');
    });
}); 