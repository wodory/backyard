/**
 * 파일명: MainToolbar.test.tsx
 * 목적: MainToolbar 컴포넌트의 기능 테스트
 * 역할: 메인 툴바의 모든 기능이 정상적으로 동작하는지 검증
 * 작성일: 2024-03-31
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MainToolbarMock } from './MainToolbarMock';
import { setupMainToolbarTests, teardownMainToolbarTests, mockActions } from './test-utils';
import '@testing-library/jest-dom';

describe('MainToolbar', () => {
    beforeEach(() => {
        setupMainToolbarTests();
    });

    afterEach(() => {
        teardownMainToolbarTests();
    });

    describe('@testcase.mdc MainToolbar 기본 기능', () => {
        it('rule: 모든 기본 버튼이 렌더링되어야 함', () => {
            render(<MainToolbarMock />);

            expect(screen.getByTitle('새 카드 추가')).toBeInTheDocument();
            expect(screen.getByTitle('수평 정렬')).toBeInTheDocument();
            expect(screen.getByTitle('수직 정렬')).toBeInTheDocument();
            expect(screen.getByTitle('자동 배치')).toBeInTheDocument();
            expect(screen.getByTitle('레이아웃 저장')).toBeInTheDocument();
        });

        it('rule: 새 카드 추가 버튼 클릭 시 모달이 열려야 함', () => {
            render(<MainToolbarMock />);

            fireEvent.click(screen.getByTitle('새 카드 추가'));
            expect(screen.getByTestId('create-card-modal')).toBeInTheDocument();
        });
    });

    describe('@testcase.mdc 카드 생성 기능', () => {
        it('rule: 모달에서 카드 생성 시 createCard 액션이 호출되어야 함', async () => {
            const { container } = render(<MainToolbarMock />);

            fireEvent.click(screen.getByTitle('새 카드 추가'));
            fireEvent.click(screen.getByTestId('create-card-button'));

            await waitFor(() => {
                expect(mockActions.createCard).toHaveBeenCalledWith({
                    title: '테스트 카드',
                    content: '테스트 내용'
                });
            }, { container });
        });

        it('rule: 카드 생성 후 모달이 닫혀야 함', async () => {
            const { container } = render(<MainToolbarMock />);

            fireEvent.click(screen.getByTitle('새 카드 추가'));
            fireEvent.click(screen.getByTestId('create-card-button'));

            await waitFor(() => {
                expect(screen.queryByTestId('create-card-modal')).not.toBeInTheDocument();
            }, { container });
        });
    });

    describe('@testcase.mdc 레이아웃 기능', () => {
        it('rule: 수평 정렬 버튼 클릭 시 horizontal 레이아웃이 적용되어야 함', () => {
            render(<MainToolbarMock />);

            fireEvent.click(screen.getByTitle('수평 정렬'));
            expect(mockActions.applyLayout).toHaveBeenCalledWith('horizontal');
        });

        it('rule: 수직 정렬 버튼 클릭 시 vertical 레이아웃이 적용되어야 함', () => {
            render(<MainToolbarMock />);

            fireEvent.click(screen.getByTitle('수직 정렬'));
            expect(mockActions.applyLayout).toHaveBeenCalledWith('vertical');
        });

        it('rule: 자동 배치 버튼 클릭 시 auto 레이아웃이 적용되어야 함', () => {
            render(<MainToolbarMock />);

            fireEvent.click(screen.getByTitle('자동 배치'));
            expect(mockActions.applyLayout).toHaveBeenCalledWith('auto');
        });

        it('rule: 레이아웃 저장 버튼 클릭 시 설정이 저장되어야 함', () => {
            render(<MainToolbarMock />);

            fireEvent.click(screen.getByTitle('레이아웃 저장'));
            expect(mockActions.updateBoardSettings).toHaveBeenCalled();
        });
    });
}); 