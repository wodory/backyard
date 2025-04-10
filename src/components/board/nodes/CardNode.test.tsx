/**
 * 파일명: CardNode.test.tsx
 * 목적: CardNode 컴포넌트 테스트
 * 역할: 카드 노드 컴포넌트의 기능 테스트
 * 작성일: 2025-04-01
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactFlowProvider, Node, NodeProps } from '@xyflow/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DEFAULT_BOARD_SETTINGS } from '@/lib/board-utils';

// TiptapViewer 모킹
vi.mock('@/components/editor/TiptapViewer', () => ({
    default: ({ content }: { content: string }) => (
        <div data-testid="tiptap-viewer">{content}</div>
    )
}));

// EditCardModal 모킹
vi.mock('@/components/cards/EditCardModal', () => ({
    EditCardModal: vi.fn(({ onClose }) => (
        <div data-testid="edit-card-modal">
            <button onClick={onClose} data-testid="close-modal-button">닫기</button>
        </div>
    ))
}));

// ThemeContext 모킹
vi.mock('@/contexts/ThemeContext', () => ({
    useTheme: () => ({
        theme: {
            node: {
                width: 200,
                height: 30,
                maxHeight: 200,
                backgroundColor: '#ffffff',
                borderWidth: 1,
                borderColor: '#e2e8f0',
                selectedBorderColor: '#3b82f6',
                borderRadius: 6,
                font: {
                    titleSize: 14,
                    contentSize: 12,
                    tagsSize: 10
                }
            },
            handle: {
                size: 8,
                backgroundColor: '#ffffff',
                borderColor: '#888888',
                borderWidth: 1
            },
            edge: {
                color: '#a1a1aa'
            }
        }
    }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// AppStore 모킹
vi.mock('@/store/useAppStore', () => ({
    useAppStore: vi.fn((selector) => selector({
        // 선택 관련 상태
        selectedCardIds: [],
        selectedCardId: null,
        expandedCardId: null,

        // 선택 관련 액션
        selectCard: vi.fn(),
        selectCards: vi.fn(),
        addSelectedCard: vi.fn(),
        removeSelectedCard: vi.fn(),
        toggleSelectedCard: vi.fn(),
        clearSelectedCards: vi.fn(),
        toggleExpandCard: vi.fn(),

        // 카드 데이터 상태
        cards: [],
        setCards: vi.fn(),
        updateCard: vi.fn(),

        // 사이드바 상태
        isSidebarOpen: false,
        setSidebarOpen: vi.fn(),
        toggleSidebar: vi.fn(),

        // 레이아웃 옵션
        layoutDirection: 'auto' as const,
        setLayoutDirection: vi.fn(),

        // 사이드바 너비
        sidebarWidth: 300,
        setSidebarWidth: vi.fn(),

        // 보드 설정
        boardSettings: DEFAULT_BOARD_SETTINGS,
        setBoardSettings: vi.fn(),
        updateBoardSettings: vi.fn(),

        // 로딩 상태
        isLoading: false,
        setLoading: vi.fn(),

        // 에러 상태
        error: null,
        setError: vi.fn(),
        clearError: vi.fn(),

        // React Flow 인스턴스
        reactFlowInstance: null,
        setReactFlowInstance: vi.fn(),
    }))
}));

// 나머지 모듈 import
import CardNode from './CardNode';
import { NodeData } from './CardNode';
import * as useAppStoreModule from '@/store/useAppStore';

// 테스트 데이터 설정
const mockNodeData: NodeData = {
    id: 'test-node-id',
    title: '테스트 제목',
    content: '테스트 내용',
    tags: ['태그1', '태그2'],
    color: '#ffffff',
};

const mockNodeProps = {
    id: 'test-node-id',
    type: 'card',
    data: mockNodeData,
    selected: false,
    dragging: false,
    zIndex: 1,
    selectable: true,
    deletable: true,
    draggable: true,
    isConnectable: true,
    positionAbsoluteX: 100,
    positionAbsoluteY: 100,
} as NodeProps;

// 모의 함수 설정
const selectCardMockFn = vi.fn();
const toggleExpandCardMockFn = vi.fn();

describe('CardNode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('펼치기 버튼 클릭 시 카드가 확장되어야 함', async () => {
        vi.spyOn(useAppStoreModule, 'useAppStore').mockImplementation((selector) => selector({
            // 선택 관련 상태
            selectedCardIds: [],
            selectedCardId: null,
            expandedCardId: 'test-node-id',

            // 선택 관련 액션
            selectCard: selectCardMockFn,
            selectCards: vi.fn(),
            addSelectedCard: vi.fn(),
            removeSelectedCard: vi.fn(),
            toggleSelectedCard: vi.fn(),
            clearSelectedCards: vi.fn(),
            toggleExpandCard: toggleExpandCardMockFn,

            // 카드 데이터 상태
            cards: [],
            setCards: vi.fn(),
            updateCard: vi.fn(),

            // 사이드바 상태
            isSidebarOpen: false,
            setSidebarOpen: vi.fn(),
            toggleSidebar: vi.fn(),

            // 레이아웃 옵션
            layoutDirection: 'auto' as const,
            setLayoutDirection: vi.fn(),

            // 사이드바 너비
            sidebarWidth: 300,
            setSidebarWidth: vi.fn(),

            // 보드 설정
            boardSettings: DEFAULT_BOARD_SETTINGS,
            setBoardSettings: vi.fn(),
            updateBoardSettings: vi.fn(),

            // 로딩 상태
            isLoading: false,
            setLoading: vi.fn(),

            // 에러 상태
            error: null,
            setError: vi.fn(),
            clearError: vi.fn(),

            // React Flow 인스턴스
            reactFlowInstance: null,
            setReactFlowInstance: vi.fn(),
        }));

        const { container } = render(
            <ThemeProvider>
                <ReactFlowProvider>
                    <CardNode {...mockNodeProps as NodeProps} />
                </ReactFlowProvider>
            </ThemeProvider>
        );

        // 펼치기 버튼 클릭
        const expandButton = screen.getByTestId('toggle-expand-test-node-id');
        fireEvent.click(expandButton);

        // 컨텐츠가 보여야 함
        expect(screen.getByTestId('tiptap-viewer')).toBeInTheDocument();
        expect(screen.getByText('테스트 내용')).toBeInTheDocument();

        // 태그 확인
        expect(screen.getByText('#태그1')).toBeInTheDocument();
        expect(screen.getByText('#태그2')).toBeInTheDocument();

        // toggleExpandCard 함수가 호출되었는지 확인
        expect(toggleExpandCardMockFn).toHaveBeenCalledWith('test-node-id');
    });

    it('확장 토글 버튼 클릭 시 이벤트 전파가 중지되고 toggleExpandCard 함수가 호출되어야 함', () => {
        vi.spyOn(useAppStoreModule, 'useAppStore').mockImplementation((selector) => selector({
            // 선택 관련 상태
            selectedCardIds: [],
            selectedCardId: null,
            expandedCardId: null,

            // 선택 관련 액션
            selectCard: selectCardMockFn,
            selectCards: vi.fn(),
            addSelectedCard: vi.fn(),
            removeSelectedCard: vi.fn(),
            toggleSelectedCard: vi.fn(),
            clearSelectedCards: vi.fn(),
            toggleExpandCard: toggleExpandCardMockFn,

            // 카드 데이터 상태
            cards: [],
            setCards: vi.fn(),
            updateCard: vi.fn(),

            // 사이드바 상태
            isSidebarOpen: false,
            setSidebarOpen: vi.fn(),
            toggleSidebar: vi.fn(),

            // 레이아웃 옵션
            layoutDirection: 'auto' as const,
            setLayoutDirection: vi.fn(),

            // 사이드바 너비
            sidebarWidth: 300,
            setSidebarWidth: vi.fn(),

            // 보드 설정
            boardSettings: DEFAULT_BOARD_SETTINGS,
            setBoardSettings: vi.fn(),
            updateBoardSettings: vi.fn(),

            // 로딩 상태
            isLoading: false,
            setLoading: vi.fn(),

            // 에러 상태
            error: null,
            setError: vi.fn(),
            clearError: vi.fn(),

            // React Flow 인스턴스
            reactFlowInstance: null,
            setReactFlowInstance: vi.fn(),
        }));

        render(
            <ThemeProvider>
                <ReactFlowProvider>
                    <CardNode {...mockNodeProps as NodeProps} />
                </ReactFlowProvider>
            </ThemeProvider>
        );

        // 확장 토글 버튼 찾기
        const toggleButton = screen.getByTestId('toggle-expand-test-node-id');
        expect(toggleButton).toBeInTheDocument();

        // 이벤트 객체 생성
        const mockEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true
        });

        // 이벤트 전파 중지를 테스트하기 위한 설정
        Object.defineProperty(mockEvent, 'stopPropagation', {
            value: vi.fn()
        });

        // 토글 버튼 클릭
        fireEvent(toggleButton, mockEvent);

        // stopPropagation이 호출되었는지 확인
        expect(mockEvent.stopPropagation).toHaveBeenCalled();

        // toggleExpandCard 함수가 올바른 ID로 호출되었는지 확인
        expect(toggleExpandCardMockFn).toHaveBeenCalledWith('test-node-id');
    });

    it('expandedCardId 상태에 따라 카드 내용 표시 여부가 달라져야 함', () => {
        vi.spyOn(useAppStoreModule, 'useAppStore').mockImplementation((selector) => selector({
            // 선택 관련 상태
            selectedCardIds: [],
            selectedCardId: null,
            expandedCardId: 'test-node-id', // 확장 상태

            // 선택 관련 액션
            selectCard: selectCardMockFn,
            selectCards: vi.fn(),
            addSelectedCard: vi.fn(),
            removeSelectedCard: vi.fn(),
            toggleSelectedCard: vi.fn(),
            clearSelectedCards: vi.fn(),
            toggleExpandCard: toggleExpandCardMockFn,

            // 카드 데이터 상태
            cards: [],
            setCards: vi.fn(),
            updateCard: vi.fn(),

            // 사이드바 상태
            isSidebarOpen: false,
            setSidebarOpen: vi.fn(),
            toggleSidebar: vi.fn(),

            // 레이아웃 옵션
            layoutDirection: 'auto' as const,
            setLayoutDirection: vi.fn(),

            // 사이드바 너비
            sidebarWidth: 300,
            setSidebarWidth: vi.fn(),

            // 보드 설정
            boardSettings: DEFAULT_BOARD_SETTINGS,
            setBoardSettings: vi.fn(),
            updateBoardSettings: vi.fn(),

            // 로딩 상태
            isLoading: false,
            setLoading: vi.fn(),

            // 에러 상태
            error: null,
            setError: vi.fn(),
            clearError: vi.fn(),

            // React Flow 인스턴스
            reactFlowInstance: null,
            setReactFlowInstance: vi.fn(),
        }));

        render(
            <ThemeProvider>
                <ReactFlowProvider>
                    <CardNode {...mockNodeProps as NodeProps} />
                </ReactFlowProvider>
            </ThemeProvider>
        );

        // 카드가 확장되어 내용이 표시되는지 확인
        expect(screen.getByTestId('tiptap-viewer')).toBeInTheDocument();
        expect(screen.getByText('테스트 내용')).toBeInTheDocument();
    });
}); 