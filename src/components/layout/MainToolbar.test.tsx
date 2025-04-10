/**
 * 파일명: MainToolbar.test.tsx
 * 목적: MainToolbar 컴포넌트 테스트
 * 역할: 레이아웃 컨트롤러 컴포넌트 유닛 테스트
 * 작성일: 2025-04-01
 * 수정일: 2025-04-08
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MainToolbar } from './MainToolbar';
import React from 'react';

// useAppStore와 mockStoreValues 선언
const mockApplyLayout = vi.fn();
const mockSaveBoardLayout = vi.fn();
const mockStoreValues = {
    applyLayout: mockApplyLayout,
    saveBoardLayout: mockSaveBoardLayout,
    layoutDirection: 'auto'
};

// useAppStore 모킹
vi.mock('@/store/useAppStore', () => ({
    useAppStore: () => mockStoreValues
}));

// CreateCardModal 모킹
vi.mock('@/components/cards/CreateCardModal', () => ({
    default: ({ customTrigger }: { customTrigger: React.ReactNode }) => (
        <div data-testid="mock-create-card-modal">
            {customTrigger}
        </div>
    )
}));

// window.location.reload 모킹
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
    value: { reload: mockReload },
    writable: true
});

describe('MainToolbar', () => {
    beforeEach(() => {
        // 각 테스트 전 모킹 초기화
        vi.clearAllMocks();
    });

    it('수평 정렬 버튼 클릭 시 applyLayout을 "horizontal" 인자와 함께 호출해야 함', async () => {
        // 사용자 이벤트 설정
        const user = userEvent.setup();

        // 컴포넌트 렌더링
        render(<MainToolbar />);

        // 수평 정렬 버튼 찾기
        const horizontalButton = screen.getByTitle('수평 정렬');

        // 버튼 클릭
        await user.click(horizontalButton);

        // applyLayout이 'horizontal' 인자와 함께 호출되었는지 확인
        expect(mockApplyLayout).toHaveBeenCalledWith('horizontal');
    });

    it('수직 정렬 버튼 클릭 시 applyLayout을 "vertical" 인자와 함께 호출해야 함', async () => {
        // 사용자 이벤트 설정
        const user = userEvent.setup();

        // 컴포넌트 렌더링
        render(<MainToolbar />);

        // 수직 정렬 버튼 찾기
        const verticalButton = screen.getByTitle('수직 정렬');

        // 버튼 클릭
        await user.click(verticalButton);

        // applyLayout이 'vertical' 인자와 함께 호출되었는지 확인
        expect(mockApplyLayout).toHaveBeenCalledWith('vertical');
    });

    it('자동 배치 버튼 클릭 시 applyLayout을 "auto" 인자와 함께 호출해야 함', async () => {
        // 사용자 이벤트 설정
        const user = userEvent.setup();

        // 컴포넌트 렌더링
        render(<MainToolbar />);

        // 자동 배치 버튼 찾기
        const autoButton = screen.getByTitle('자동 배치');

        // 버튼 클릭
        await user.click(autoButton);

        // applyLayout이 'auto' 인자와 함께 호출되었는지 확인
        expect(mockApplyLayout).toHaveBeenCalledWith('auto');
    });

    it('저장 버튼 클릭 시 saveBoardLayout을 호출해야 함', async () => {
        // 사용자 이벤트 설정
        const user = userEvent.setup();

        // 컴포넌트 렌더링
        render(<MainToolbar />);

        // 저장 버튼 찾기
        const saveButton = screen.getByTitle('레이아웃 저장');

        // 버튼 클릭
        await user.click(saveButton);

        // saveBoardLayout이 호출되었는지 확인
        expect(mockSaveBoardLayout).toHaveBeenCalled();
    });

    it('새 카드 추가 버튼이 CreateCardModal의 트리거로 사용되어야 함', async () => {
        // 컴포넌트 렌더링
        render(<MainToolbar />);

        // CreateCardModal이 렌더링되었는지 확인
        expect(screen.getByTestId('mock-create-card-modal')).toBeInTheDocument();

        // 그 내부에 '새 카드 추가' 버튼이 있는지 확인
        expect(screen.getByTitle('새 카드 추가')).toBeInTheDocument();
    });
}); 