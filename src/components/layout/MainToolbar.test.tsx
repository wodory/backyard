/**
 * 파일명: MainToolbar.test.tsx
 * 목적: MainToolbar 컴포넌트 테스트
 * 역할: 카드 생성 및 레이아웃 적용 기능을 검증하는 테스트
 * 작성일: 2024-06-05
 */

import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MainToolbar } from './MainToolbar';
import '@testing-library/jest-dom';
import { toast } from 'sonner';

// 비동기 작업의 안전한 완료를 위한 도우미 함수
const waitForDomChanges = () => new Promise(resolve => setTimeout(resolve, 50));

// Zustand 스토어 모킹
const mockApplyLayout = vi.fn();
const mockCreateCard = vi.fn(() => Promise.resolve({ id: 'new-card-id' }));
const mockUpdateBoardSettings = vi.fn(() => Promise.resolve());

vi.mock('@/store/useAppStore', () => ({
    useAppStore: vi.fn((selector) => {
        const store = {
            applyLayout: mockApplyLayout,
            createCard: mockCreateCard,
            updateBoardSettings: mockUpdateBoardSettings,
        };

        if (typeof selector === 'function') {
            return selector(store);
        }
        return store;
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

// SimpleCreateCardModal 상태를 추적하기 위한 변수
let modalIsOpen = false;
let onCloseCallback: (() => void) | null = null;

// SimpleCreateCardModal 모킹
vi.mock('@/components/cards/SimpleCreateCardModal', () => ({
    SimpleCreateCardModal: ({ isOpen, onClose, onCardCreated }: any) => {
        // 모달 상태를 전역 변수에 저장
        modalIsOpen = isOpen;
        onCloseCallback = onClose;

        return isOpen ? (
            <div data-testid="create-card-modal">
                <button data-testid="close-modal-button" onClick={onClose}>닫기</button>
                <button
                    data-testid="create-card-button"
                    onClick={() => {
                        onCardCreated({ title: '테스트 카드', content: '테스트 내용' });
                        // 카드 생성 후 onClose도 명시적으로 호출
                        if (onClose) onClose();
                    }}
                >
                    카드 생성
                </button>
            </div>
        ) : null;
    },
}));

describe('MainToolbar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // 각 테스트 전에 모달 상태 초기화
        modalIsOpen = false;
        onCloseCallback = null;
    });

    afterEach(async () => {
        // 각 테스트 후에 정리
        await waitForDomChanges(); // DOM 변경이 완료될 때까지 잠시 대기
        cleanup(); // 명시적으로 cleanup 호출
    });

    it('렌더링이 정상적으로 되어야 함', () => {
        render(<MainToolbar />);

        // 새 카드 추가 버튼이 있는지 확인
        expect(screen.getByTitle('새 카드 추가')).toBeInTheDocument();

        // 수평 정렬 버튼이 있는지 확인
        expect(screen.getByTitle('수평 정렬')).toBeInTheDocument();

        // 수직 정렬 버튼이 있는지 확인
        expect(screen.getByTitle('수직 정렬')).toBeInTheDocument();

        // 자동 배치 버튼이 있는지 확인
        expect(screen.getByTitle('자동 배치')).toBeInTheDocument();

        // 레이아웃 저장 버튼이 있는지 확인
        expect(screen.getByTitle('레이아웃 저장')).toBeInTheDocument();
    });

    it('새 카드 추가 버튼 클릭 시 모달이 열려야 함', async () => {
        render(<MainToolbar />);

        // 모달이 처음에는 닫혀있어야 함
        expect(screen.queryByTestId('create-card-modal')).not.toBeInTheDocument();

        // 새 카드 추가 버튼 클릭
        fireEvent.click(screen.getByTitle('새 카드 추가'));

        // DOM 변경이 완료될 때까지 기다림
        await waitForDomChanges();

        // 모달이 열려야 함
        expect(screen.getByTestId('create-card-modal')).toBeInTheDocument();
    });

    it('카드 생성 후 모달이 닫히고 성공 메시지가 표시되어야 함', async () => {
        const { rerender } = render(<MainToolbar />);

        // 새 카드 추가 버튼 클릭해서 모달 열기
        fireEvent.click(screen.getByTitle('새 카드 추가'));
        await waitForDomChanges();

        // 모달이 열렸는지 확인
        expect(screen.getByTestId('create-card-modal')).toBeInTheDocument();

        // 모달 내부의 카드 생성 버튼 클릭
        act(() => {
            fireEvent.click(screen.getByTestId('create-card-button'));
        });

        // 비동기 처리 대기
        await waitForDomChanges();

        // 모달 상태가 변경되었으므로 컴포넌트 다시 렌더링
        rerender(<MainToolbar />);

        // createCard 액션이 호출되었는지 확인
        expect(mockCreateCard).toHaveBeenCalledWith({ title: '테스트 카드', content: '테스트 내용' });

        // 성공 토스트가 표시되었는지 확인
        expect(toast.success).toHaveBeenCalledWith('카드가 생성되었습니다');

        // 모달이 닫혔는지 확인
        expect(modalIsOpen).toBe(false);
    });

    it('수평 정렬 버튼 클릭 시 applyLayout 액션이 horizontal 인자와 함께 호출되어야 함', () => {
        render(<MainToolbar />);

        // 수평 정렬 버튼 클릭
        fireEvent.click(screen.getByTitle('수평 정렬'));

        // applyLayout 액션이 'horizontal' 인자와 함께 호출되었는지 확인
        expect(mockApplyLayout).toHaveBeenCalledWith('horizontal');
    });

    it('수직 정렬 버튼 클릭 시 applyLayout 액션이 vertical 인자와 함께 호출되어야 함', () => {
        render(<MainToolbar />);

        // 수직 정렬 버튼 클릭
        fireEvent.click(screen.getByTitle('수직 정렬'));

        // applyLayout 액션이 'vertical' 인자와 함께 호출되었는지 확인
        expect(mockApplyLayout).toHaveBeenCalledWith('vertical');
    });

    it('자동 배치 버튼 클릭 시 applyLayout 액션이 auto 인자와 함께 호출되어야 함', () => {
        render(<MainToolbar />);

        // 자동 배치 버튼 클릭
        fireEvent.click(screen.getByTitle('자동 배치'));

        // applyLayout 액션이 'auto' 인자와 함께 호출되었는지 확인
        expect(mockApplyLayout).toHaveBeenCalledWith('auto');
    });

    it('레이아웃 저장 버튼 클릭 시, updateBoardSettings 액션이 호출되어야 함', async () => {
        render(<MainToolbar />);

        // 레이아웃 저장 버튼 클릭
        fireEvent.click(screen.getByTitle('레이아웃 저장'));
        await waitForDomChanges();

        // updateBoardSettings 액션이 빈 객체와 함께 호출되었는지 확인
        expect(mockUpdateBoardSettings).toHaveBeenCalledWith({});

        // 성공 토스트가 표시되었는지 확인
        expect(toast.success).toHaveBeenCalledWith('레이아웃이 저장되었습니다');
    });

    it('카드 생성 실패 시 에러 메시지가 표시되어야 함', async () => {
        // createCard 액션이 실패하도록 설정
        mockCreateCard.mockRejectedValueOnce(new Error('카드 생성 실패'));

        render(<MainToolbar />);

        // 새 카드 추가 버튼 클릭해서 모달 열기
        fireEvent.click(screen.getByTitle('새 카드 추가'));
        await waitForDomChanges();

        // 모달 내부의 카드 생성 버튼 클릭
        act(() => {
            fireEvent.click(screen.getByTestId('create-card-button'));
        });

        // 비동기 처리 대기
        await waitForDomChanges();

        // 에러 토스트가 표시되었는지 확인
        expect(toast.error).toHaveBeenCalledWith('카드 생성에 실패했습니다');
    });
}); 