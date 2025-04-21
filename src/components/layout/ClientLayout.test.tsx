/**
 * 파일명: src/components/layout/ClientLayout.test.tsx
 * 목적: ClientLayout 컴포넌트 단위 테스트
 * 역할: 클라이언트 레이아웃 컴포넌트의 렌더링 및 동작 검증
 * 작성일: 2024-05-13
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// 모킹 함수들을 모듈 스코프 외부에 선언할 수 없음 (호이스팅 문제)
// vi.mock이 호이스팅되어 모듈 스코프에서 생성된 변수를 참조할 수 없음

// 모든 vi.mock 정의를 파일 상단에 배치
vi.mock('@/lib/logger', () => {
    // 내부에서 모킹 함수 생성
    const mockInfo = vi.fn();
    const mockDebug = vi.fn();
    const mockWarn = vi.fn();
    const mockError = vi.fn();

    // 모듈 전체에서 사용할 수 있도록 함수를 전역 객체에 연결
    // @ts-ignore
    global._loggerMocks = {
        mockInfo, mockDebug, mockWarn, mockError
    };

    return {
        default: vi.fn().mockImplementation(() => ({
            info: mockInfo,
            debug: mockDebug,
            warn: mockWarn,
            error: mockError
        }))
    };
});

vi.mock('@/hooks/useAuth', () => ({
    useAuth: vi.fn(() => ({
        user: null,
        isLoading: false,
        error: null
    }))
}));

vi.mock('@/store/useAuthStore', () => ({
    useAuthStore: vi.fn((selector) => {
        if (typeof selector === 'function') {
            return selector({
                userId: null,
                isLoading: false,
                error: null
            });
        }
        return null;
    })
}));

vi.mock('@/contexts/ThemeContext', () => ({
    ThemeProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="theme-provider">{children}</div>
    )
}));

vi.mock('@/components/debug/InitDatabase', () => ({
    default: () => <div data-testid="init-database">InitDatabase Mock</div>
}));

vi.mock('sonner', () => ({
    Toaster: () => <div data-testid="toaster">Toaster Mock</div>
}));

// 만든 후 임포트
import { ClientLayout } from './ClientLayout';

// 테스트에서 사용할 모킹 함수 참조
// @ts-ignore
const { mockInfo, mockDebug, mockWarn, mockError } = global._loggerMocks;

describe('ClientLayout 컴포넌트', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // window 모킹
        vi.stubGlobal('localStorage', {
            setItem: vi.fn(),
            removeItem: vi.fn(),
            getItem: vi.fn()
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('자식 컴포넌트를 올바르게 렌더링해야 함', () => {
        render(
            <ClientLayout>
                <div data-testid="test-child">Test Content</div>
            </ClientLayout>
        );

        // 자식 컴포넌트가 렌더링되었는지 확인
        expect(screen.getByTestId('test-child')).toBeInTheDocument();
        expect(screen.getByTestId('test-child')).toHaveTextContent('Test Content');

        // 필수 컴포넌트가 렌더링되었는지 확인
        expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
        expect(screen.getByTestId('init-database')).toBeInTheDocument();
        expect(screen.getByTestId('toaster')).toBeInTheDocument();

        // 기본 로깅은 항상 호출되어야 함
        expect(mockInfo).toHaveBeenCalledWith('클라이언트 레이아웃 마운트');
    });

    it('인증 상태가 null인 경우도 정상적으로 렌더링되어야 함', () => {
        // useAuth 훅이 null user 반환하도록 설정 (기본 설정)

        render(
            <ClientLayout>
                <div>Test Content</div>
            </ClientLayout>
        );

        // 기본 컴포넌트가 렌더링되었는지 확인
        expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
        expect(mockInfo).toHaveBeenCalledWith('클라이언트 레이아웃 마운트');
    });

    it('localStorage에 접근할 수 없는 경우에도 오류 없이 렌더링되어야 함', () => {
        // localStorage.setItem이 예외를 던지도록 설정
        const mockSetItem = vi.fn().mockImplementation(() => {
            throw new Error('localStorage is not available');
        });

        // localStorage 모킹 재설정
        vi.stubGlobal('localStorage', {
            setItem: mockSetItem,
            removeItem: vi.fn(),
            getItem: vi.fn()
        });

        render(
            <ClientLayout>
                <div>Test Content</div>
            </ClientLayout>
        );

        // 컴포넌트가 예외 없이 렌더링되어야 함
        expect(screen.getByTestId('theme-provider')).toBeInTheDocument();

        // info는 항상 호출됨
        expect(mockInfo).toHaveBeenCalledWith('클라이언트 레이아웃 마운트');

        // localStorage 오류 발생 시 warn이 호출되어야 함
        expect(mockWarn).toHaveBeenCalledWith('localStorage 접근 불가', expect.any(Error));
    });

    it('개발 환경에서 인증 상태를 로깅해야 함', () => {
        // 환경 변수 모킹 (개발 환경으로 설정)
        const originalNodeEnv = process.env.NODE_ENV;
        vi.stubEnv('NODE_ENV', 'development');

        render(
            <ClientLayout>
                <div>Test Content</div>
            </ClientLayout>
        );

        // info는 항상 호출됨
        expect(mockInfo).toHaveBeenCalled();

        // 개발 환경에서는 인증 상태가 debug로 로깅됨
        expect(mockDebug).toHaveBeenCalledWith('인증 상태:', expect.any(Object));

        // 환경 변수 복원
        vi.stubEnv('NODE_ENV', originalNodeEnv);
    });
}); 