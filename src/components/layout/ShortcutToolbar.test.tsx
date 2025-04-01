/**
 * 파일명: ShortcutToolbar.test.tsx
 * 목적: ShortcutToolbar 컴포넌트의 기능 테스트
 * 역할: 단축 기능 툴바의 모든 기능이 정상적으로 동작하는지 검증
 * 작성일: 2024-03-31
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ShortcutToolbarMock } from './ShortcutToolbarMock';
import { setupShortcutToolbarTests, teardownShortcutToolbarTests, mockActions, waitForDomChanges } from './test-utils';
import '@testing-library/jest-dom';

describe('ShortcutToolbar', () => {
    beforeEach(() => {
        setupShortcutToolbarTests();
    });

    afterEach(() => {
        teardownShortcutToolbarTests();
    });

    describe('@testcase.mdc ShortcutToolbar 기본 기능', () => {
        it('rule: 모든 기본 버튼이 렌더링되어야 함', () => {
            render(<ShortcutToolbarMock />);

            expect(screen.getByTitle('사이드바 접기')).toBeInTheDocument();
            expect(screen.getByTitle('로그아웃')).toBeInTheDocument();
        });

        it('rule: 사이드바 접기 버튼 클릭 시 toggleSidebar 액션이 호출되어야 함', () => {
            render(<ShortcutToolbarMock />);

            fireEvent.click(screen.getByTitle('사이드바 접기'));
            expect(mockActions.toggleSidebar).toHaveBeenCalled();
        });
    });

    describe('@testcase.mdc 로그아웃 기능', () => {
        it('rule: 로그아웃 버튼 클릭 시 signOut 함수가 호출되어야 함', async () => {
            render(<ShortcutToolbarMock />);

            await act(async () => {
                fireEvent.click(screen.getByTitle('로그아웃'));
                await waitForDomChanges();
            });

            expect(mockActions.signOut).toHaveBeenCalled();
            expect(mockActions.toast.success).toHaveBeenCalledWith('로그아웃되었습니다.');
        });

        it('rule: 로그아웃 실패 시 에러 메시지가 표시되어야 함', async () => {
            // signOut 함수가 실패하도록 설정
            mockActions.signOut.mockRejectedValueOnce(new Error('로그아웃 실패'));

            render(<ShortcutToolbarMock />);

            await act(async () => {
                fireEvent.click(screen.getByTitle('로그아웃'));
                await waitForDomChanges();
            });

            expect(mockActions.toast.error).toHaveBeenCalledWith('로그아웃 중 문제가 발생했습니다.');
        });
    });
}); 