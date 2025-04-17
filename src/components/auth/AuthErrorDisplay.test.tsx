/**
 * 파일명: src/components/auth/AuthErrorDisplay.test.tsx
 * 목적: AuthErrorDisplay 컴포넌트 테스트
 * 역할: 인증 오류 정보 표시 컴포넌트의 기능 검증
 * 작성일: 2024-09-28
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import AuthErrorDisplay from './AuthErrorDisplay';

// 모킹 설정
const mockGet = vi.fn();

vi.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: mockGet
    })
}));

describe('AuthErrorDisplay', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => { });
        mockGet.mockImplementation((param: string) => {
            if (param === 'error') return 'default';
            if (param === 'error_description') return '';
            return null;
        });
    });

    it('기본 오류 메시지를 올바르게 표시해야 합니다', () => {
        render(<AuthErrorDisplay />);
        expect(screen.getByText('인증 과정에서 오류가 발생했습니다.')).toBeInTheDocument();
    });

    it('특정 오류 유형에 대한 메시지를 올바르게 표시해야 합니다', () => {
        mockGet.mockImplementation((param: string) => {
            if (param === 'error') return 'invalid_callback';
            if (param === 'error_description') return '';
            return null;
        });

        render(<AuthErrorDisplay />);
        expect(screen.getByText('유효하지 않은 인증 콜백입니다.')).toBeInTheDocument();
    });

    it('오류 설명이 있을 경우 함께 표시해야 합니다', () => {
        mockGet.mockImplementation((param: string) => {
            if (param === 'error') return 'verification_failed';
            if (param === 'error_description') return '이메일 주소가 확인되지 않았습니다.';
            return null;
        });

        render(<AuthErrorDisplay />);
        expect(screen.getByText('이메일 인증에 실패했습니다.')).toBeInTheDocument();
        expect(screen.getByText('이메일 주소가 확인되지 않았습니다.')).toBeInTheDocument();
    });

    it('알 수 없는 오류 유형에 대해 기본 메시지를 표시해야 합니다', () => {
        mockGet.mockImplementation((param: string) => {
            if (param === 'error') return 'unknown_error';
            return null;
        });

        render(<AuthErrorDisplay />);
        expect(screen.getByText('인증 과정에서 오류가 발생했습니다.')).toBeInTheDocument();
    });

    it('로그인 페이지로 돌아가기 링크가 올바르게 작동해야 합니다', async () => {
        render(<AuthErrorDisplay />);
        const loginLink = screen.getByRole('link', { name: '로그인 페이지로 돌아가기' });
        expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('홈으로 돌아가기 링크가 올바르게 작동해야 합니다', async () => {
        render(<AuthErrorDisplay />);
        const homeLink = screen.getByRole('link', { name: '홈으로 돌아가기' });
        expect(homeLink).toHaveAttribute('href', '/');
    });

    it('오류 발생 시 콘솔에 로그를 남겨야 합니다', () => {
        const consoleSpy = vi.spyOn(console, 'error');
        mockGet.mockImplementation((param: string) => {
            if (param === 'error') return 'test_error';
            if (param === 'error_description') return 'Test error description';
            return null;
        });

        render(<AuthErrorDisplay />);

        expect(consoleSpy).toHaveBeenCalledWith('인증 오류:', {
            error: 'test_error',
            description: 'Test error description'
        });
    });
}); 