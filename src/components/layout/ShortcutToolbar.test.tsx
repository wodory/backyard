/**
 * 파일명: ShortcutToolbar.test.tsx
 * 목적: ShortcutToolbar 컴포넌트 테스트
 * 역할: 단축 기능 툴바의 동작을 검증하는 테스트
 * 작성일: 2024-06-05
 */

import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ShortcutToolbar } from './ShortcutToolbar';
import '@testing-library/jest-dom';
import { toast } from 'sonner';

// 비동기 작업의 안전한 완료를 위한 도우미 함수
const waitForDomChanges = () => new Promise(resolve => setTimeout(resolve, 30));

// Zustand 스토어 모킹
const mockToggleSidebar = vi.fn();

vi.mock('@/store/useAppStore', () => ({
    useAppStore: vi.fn((selector) => {
        const store = {
            toggleSidebar: mockToggleSidebar,
        };

        if (typeof selector === 'function') {
            return selector(store);
        }
        return store;
    }),
}));

// useAuth 모킹
const mockSignOut = vi.fn(() => Promise.resolve());
vi.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
        signOut: mockSignOut,
    }),
}));

// Sonner 토스트 모킹
vi.mock('sonner', () => {
    return {
        toast: {
            success: vi.fn(),
            error: vi.fn(),
        }
    };
});

describe('ShortcutToolbar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(async () => {
        // 각 테스트 후에 정리
        await waitForDomChanges(); // DOM 변경이 완료될 때까지 잠시 대기
        cleanup(); // 명시적으로 cleanup 호출
    });

    it('렌더링이 정상적으로 되어야 함', () => {
        render(<ShortcutToolbar />);

        // 사이드바 접기 버튼이 있는지 확인
        expect(screen.getByTitle('사이드바 접기')).toBeInTheDocument();

        // 로그아웃 버튼이 있는지 확인
        expect(screen.getByTitle('로그아웃')).toBeInTheDocument();
    });

    it('사이드바 접기 버튼 클릭 시 toggleSidebar 액션이 호출되어야 함', () => {
        render(<ShortcutToolbar />);

        // 사이드바 접기 버튼 클릭
        fireEvent.click(screen.getByTitle('사이드바 접기'));

        // toggleSidebar 액션이 호출되었는지 확인
        expect(mockToggleSidebar).toHaveBeenCalled();
    });

    it('로그아웃 버튼 클릭 시 signOut 함수가 호출되어야 함', async () => {
        render(<ShortcutToolbar />);

        // 로그아웃 버튼 클릭
        fireEvent.click(screen.getByTitle('로그아웃'));

        // 비동기 작업 완료 대기
        await waitForDomChanges();

        // signOut 함수가 호출되었는지 확인
        expect(mockSignOut).toHaveBeenCalled();

        // 성공 토스트가 표시되었는지 확인
        expect(toast.success).toHaveBeenCalledWith('로그아웃되었습니다.');
    });

    it('로그아웃 실패 시 에러 메시지가 표시되어야 함', async () => {
        // signOut 함수가 실패하도록 설정
        mockSignOut.mockRejectedValueOnce(new Error('로그아웃 실패'));

        render(<ShortcutToolbar />);

        // 로그아웃 버튼 클릭
        fireEvent.click(screen.getByTitle('로그아웃'));

        // 비동기 작업 완료 대기
        await waitForDomChanges();

        // 에러 토스트가 표시되었는지 확인
        expect(toast.error).toHaveBeenCalledWith('로그아웃 중 문제가 발생했습니다.');
    });
}); 