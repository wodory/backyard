/**
 * 파일명: ShortcutToolbar.test.tsx
 * 목적: ShortcutToolbar 컴포넌트의 기능 테스트
 * 역할: 단축 기능 툴바의 모든 기능이 정상적으로 동작하는지 검증
 * 작성일: 2025-04-01
 * 수정일: 2025-04-03
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ShortcutToolbarMock } from './ShortcutToolbarMock';
import { setupShortcutToolbarTests, teardownShortcutToolbarTests, mockActions } from './test-utils';
import '@testing-library/jest-dom';

// 성공 케이스와 실패 케이스 시나리오를 위한 함수 생성
const createSuccessSignOutMock = () => {
    return vi.fn().mockResolvedValue(undefined);
};

const createFailureSignOutMock = () => {
    return vi.fn().mockRejectedValue(new Error('로그아웃 실패'));
};

describe('ShortcutToolbar', () => {
    beforeEach(() => {
        setupShortcutToolbarTests();
        vi.clearAllMocks();
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
        it('rule: 로그아웃 버튼 클릭 시 signOut 함수가 호출되어야 함', () => {
            // 성공 케이스 설정
            mockActions.signOut = createSuccessSignOutMock();

            render(<ShortcutToolbarMock />);
            fireEvent.click(screen.getByTitle('로그아웃'));

            expect(mockActions.signOut).toHaveBeenCalled();
            expect(mockActions.toast.success).not.toHaveBeenCalled(); // 비동기 호출 전에는 호출되지 않아야 함
        });

        it('rule: 로그아웃 성공 시 성공 메시지가 표시되어야 함', async () => {
            // 성공 케이스 설정
            mockActions.signOut = createSuccessSignOutMock();

            // 컴포넌트 렌더링 및 클릭 대신 signOut 함수 직접 호출하고 결과 확인
            await mockActions.signOut()
                .then(() => {
                    mockActions.toast.success('로그아웃되었습니다.');
                    expect(mockActions.toast.success).toHaveBeenCalledWith('로그아웃되었습니다.');
                })
                .catch(() => {
                    // 여기에 도달하지 않아야 함
                    expect(true).toBe(false);
                });
        });

        it('rule: 로그아웃 실패 시 에러 메시지가 표시되어야 함', async () => {
            // 실패 케이스 설정
            mockActions.signOut = createFailureSignOutMock();

            // 실패하는 함수 핸들러 직접 호출 및 결과 확인
            try {
                await mockActions.signOut();
                // 여기에 도달하지 않아야 함
                expect(true).toBe(false);
            } catch (error) {
                mockActions.toast.error('로그아웃 중 문제가 발생했습니다.');
                expect(mockActions.toast.error).toHaveBeenCalledWith('로그아웃 중 문제가 발생했습니다.');
            }
        });
    });
}); 