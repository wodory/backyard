/**
 * 파일명: CardNode.test.tsx
 * 목적: CardNode 컴포넌트 테스트
 * 역할: 카드 노드 컴포넌트의 기능 테스트
 * 작성일: 2024-05-31
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Node, NodeProps, ConnectionLineType, MarkerType, ReactFlowInstance } from '@xyflow/react';
import { NodeData } from './CardNode';
import type { AppState } from '@/types/app';

// _mocks 객체를 정의하여 모킹된 함수에 접근할 수 있도록 함
const _mocks = {
    selectCardMock: vi.fn(),
    addSelectedCardMock: vi.fn(),
    removeSelectedCardMock: vi.fn(),
    toggleExpandCardMock: vi.fn(),
    updateCardMock: vi.fn(),
    selectCardsMock: vi.fn(),
    toggleSelectedCardMock: vi.fn(),
    clearSelectedCardsMock: vi.fn()
};

// 테스트용 기본 상태 객체 생성
const createMockState = (): AppState => ({
    cards: [],
    isSidebarOpen: false,
    sidebarWidth: 320,
    layoutDirection: 'horizontal',
    selectedCardId: null,
    selectedCardIds: [],
    expandedCardId: null,
    isLoading: false,
    error: null,
    reactFlowInstance: null,
    boardSettings: {
        snapToGrid: false,
        snapGrid: [15, 15],
        connectionLineType: ConnectionLineType.Bezier,
        markerEnd: MarkerType.Arrow,
        strokeWidth: 2,
        markerSize: 8,
        edgeColor: '#a1a1aa',
        selectedEdgeColor: '#3b82f6',
        animated: false
    },
    selectCard: _mocks.selectCardMock,
    addSelectedCard: _mocks.addSelectedCardMock,
    removeSelectedCard: _mocks.removeSelectedCardMock,
    toggleExpandCard: _mocks.toggleExpandCardMock,
    updateCard: _mocks.updateCardMock,
    selectCards: _mocks.selectCardsMock,
    toggleSelectedCard: _mocks.toggleSelectedCardMock,
    clearSelectedCards: _mocks.clearSelectedCardsMock,
    toggleSidebar: vi.fn(),
    setSidebarWidth: vi.fn(),
    setBoardSettings: vi.fn(),
    setLayoutDirection: vi.fn(),
    setCards: vi.fn(),
    setSidebarOpen: vi.fn(),
    setReactFlowInstance: vi.fn(),
    createCard: vi.fn().mockResolvedValue({ id: '1', title: '테스트 카드' }),
    deleteCard: vi.fn().mockResolvedValue(true),
    updateBoardSettings: vi.fn().mockResolvedValue(undefined),
    applyLayout: vi.fn()
});

// 테스트용 상태 확장 함수
const createMockStateWithOverrides = (overrides: Partial<AppState>): AppState => ({
    ...createMockState(),
    ...overrides
});

// 모듈 모킹은 상단에 배치 (hoisting 문제 방지)
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

// EditCardModal 모킹
vi.mock('@/components/cards/EditCardModal', () => ({
    EditCardModal: vi.fn(({ onClose }) => (
        <div data-testid="edit-card-modal">
            <button onClick={onClose} data-testid="close-modal-button">닫기</button>
        </div>
    ))
}));

// TiptapViewer 모킹
vi.mock('@/components/editor/TiptapViewer', () => ({
    default: ({ content }: { content: string }) => <div data-testid="tiptap-viewer">{content}</div>
}));

// Zustand 액션 기반으로 모킹
vi.mock('@/store/useAppStore', () => {
    return {
        useAppStore: vi.fn((selector) => {
            const state = createMockState();
            return typeof selector === 'function' ? selector(state) : state;
        })
    };
});

// React Flow 관련 모킹
vi.mock('@xyflow/react', async () => {
    const actual = await vi.importActual('@xyflow/react');
    return {
        ...actual,
        useUpdateNodeInternals: () => vi.fn(),
        useReactFlow: () => ({
            getNode: vi.fn(),
            setNodes: vi.fn((callback) => {
                // setNodes가 호출될 때 실제로 callback을 실행하도록 함
                if (typeof callback === 'function') {
                    callback([]);
                }
            })
        }),
        Handle: ({ type, position, id, isConnectable, style }: any) => (
            <div
                data-testid={`handle-${id}`}
                data-position={position}
                data-type={type}
                style={style}
            />
        ),
        ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <div className="react-flow">{children}</div>
    };
});

// 실제 컴포넌트 임포트 (모킹이 완료된 후)
import CardNode from './CardNode';
import { useAppStore } from '@/store/useAppStore';

// 브라우저 API 모킹 함수
const mockBrowserAPIs = () => {
    // 브라우저 환경의 ResizeObserver 모킹
    class ResizeObserver {
        callback: any;

        constructor(callback: any) {
            this.callback = callback;
        }

        observe(target: Element) {
            this.callback([{ target } as any], this);
        }

        unobserve() { }

        disconnect() { }
    }

    // 브라우저 환경의 DOMMatrixReadOnly 모킹
    class DOMMatrixReadOnly {
        m22: number;
        constructor(transform: string) {
            const scale = transform?.match(/scale\(([1-9.])\)/)?.[1];
            this.m22 = scale !== undefined ? +scale : 1;
        }
    }

    // 전역 객체에 모킹된 클래스 할당
    global.ResizeObserver = ResizeObserver as any;
    (global as any).DOMMatrixReadOnly = DOMMatrixReadOnly;

    // HTMLElement의 offset 프로퍼티 모킹
    Object.defineProperties(global.HTMLElement.prototype, {
        offsetHeight: {
            get() {
                return parseFloat(this.style.height) || 1;
            },
        },
        offsetWidth: {
            get() {
                return parseFloat(this.style.width) || 1;
            },
        },
    });

    // SVGElement의 getBBox 메서드 모킹
    (global.SVGElement as any).prototype.getBBox = () => ({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
};

describe('CardNode', () => {
    // 테스트 전 React Flow 모킹 설정 적용
    beforeAll(() => {
        mockBrowserAPIs();
    });

    afterAll(() => {
        // 전역 객체 모킹 정리
        vi.restoreAllMocks();
    });

    // 노드 ID와 카드 ID를 일치시켜 테스트 문제 해결
    const TEST_ID = 'test-card-id';

    const mockNodeData: NodeData = {
        id: TEST_ID,
        title: '테스트 카드',
        content: '테스트 내용',
        tags: ['태그1', '태그2']
    };

    // 간단한 테스트용 NodeProps 객체 생성
    const mockNodeProps: Partial<NodeProps> = {
        id: TEST_ID, // ID를 일치시킴
        data: mockNodeData,
        selected: false,
        type: 'card',
        isConnectable: true,
        positionAbsoluteX: 100,
        positionAbsoluteY: 100
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('카드 노드가 올바르게 렌더링되어야 함', () => {
        render(<CardNode {...mockNodeProps as NodeProps} />);

        // 카드 제목이 표시되는지 확인
        expect(screen.getByText('테스트 카드')).toBeInTheDocument();

        // 4개의 핸들이 렌더링되는지 확인
        expect(screen.getByTestId('handle-right-source')).toBeInTheDocument();
        expect(screen.getByTestId('handle-left-target')).toBeInTheDocument();
        expect(screen.getByTestId('handle-bottom-source')).toBeInTheDocument();
        expect(screen.getByTestId('handle-top-target')).toBeInTheDocument();

        // 접기/펼치기 버튼이 있는지 확인
        expect(screen.getByRole('button', { name: /펼치기/i })).toBeInTheDocument();

        // 태그가 렌더링되지 않아야 함 (접혀있는 상태)
        expect(screen.queryByText('#태그1')).not.toBeInTheDocument();
    });

    it('카드 노드 클릭 시 selectCard 액션이 호출되어야 함', () => {
        render(<CardNode {...mockNodeProps as NodeProps} />);

        // 카드 전체 영역 찾기 (card-node 클래스 사용)
        const cardNode = screen.getByText('테스트 카드').closest('.card-node');
        expect(cardNode).toBeInTheDocument();

        // 카드 클릭
        if (cardNode) {
            fireEvent.click(cardNode);
        }

        // selectCard 액션이 카드 ID와 함께 호출되었는지 확인
        expect(_mocks.selectCardMock).toHaveBeenCalledWith(TEST_ID);
    });

    it('펼치기 버튼 클릭 시 toggleExpandCard 액션이 호출되어야 함', () => {
        render(<CardNode {...mockNodeProps as NodeProps} />);

        // 펼치기 버튼 찾기
        const expandButton = screen.getByRole('button', { name: /펼치기/i });
        expect(expandButton).toBeInTheDocument();

        // 펼치기 버튼 클릭
        fireEvent.click(expandButton);

        // toggleExpandCard 액션이 카드 ID와 함께 호출되었는지 확인
        expect(_mocks.toggleExpandCardMock).toHaveBeenCalledWith(TEST_ID);

        // 이벤트 전파가 중지되었는지 직접 확인할 수는 없지만,
        // 버튼 클릭이 카드 선택으로 이어지지 않았는지 확인하는 방법으로 대체
        expect(_mocks.selectCardMock).not.toHaveBeenCalled();
    });

    it('펼쳐진 상태일 때 접기 버튼이 표시되고 클릭 시 toggleExpandCard 액션이 호출되어야 함', () => {
        // expandedCardId를 설정하여 펼쳐진 상태로 모킹
        vi.mocked(useAppStore).mockImplementationOnce((selector) => {
            const state = createMockStateWithOverrides({
                expandedCardId: TEST_ID // 펼쳐진 상태로 설정
            });
            return typeof selector === 'function' ? selector(state) : state;
        });

        render(<CardNode {...mockNodeProps as NodeProps} />);

        // 접기 버튼이 있는지 확인 - data-expanded 속성 확인
        const toggleButton = screen.getByTestId(`toggle-expand-${TEST_ID}`);
        expect(toggleButton).toHaveAttribute('data-expanded', 'true');

        // 버튼 클릭
        fireEvent.click(toggleButton);

        // toggleExpandCard 액션이 카드 ID와 함께 호출되었는지 확인
        expect(_mocks.toggleExpandCardMock).toHaveBeenCalledWith(TEST_ID);
    });

    it('카드가 선택된 상태일 때 시각적으로 표시되어야 함', () => {
        // selectedCardIds에 카드 ID를 추가하여 선택된 상태로 모킹
        vi.mocked(useAppStore).mockImplementationOnce((selector) => {
            const state = createMockStateWithOverrides({
                selectedCardIds: [TEST_ID],
                selectedCardId: TEST_ID
            });
            return typeof selector === 'function' ? selector(state) : state;
        });

        render(<CardNode {...{ ...mockNodeProps, selected: true } as NodeProps} />);

        // 선택된 상태의 카드는 data-selected 속성으로 표시됨
        const cardNode = screen.getByText('테스트 카드').closest('.card-node');
        expect(cardNode).toHaveAttribute('data-selected', 'true');
    });

    it('카드 내용이 펼쳐진 상태일 때 내용과 태그가 표시되어야 함', () => {
        // expandedCardId를 설정하여 펼쳐진 상태로 모킹
        vi.mocked(useAppStore).mockImplementationOnce((selector) => {
            const state = createMockStateWithOverrides({
                expandedCardId: TEST_ID // 펼쳐진 상태로 설정
            });
            return typeof selector === 'function' ? selector(state) : state;
        });

        // 테스트용 노드 프롭스에 확장된 상태 추가
        const expandedNodeProps = {
            ...mockNodeProps,
            data: {
                ...mockNodeData,
                expanded: true
            }
        };

        render(<CardNode {...expandedNodeProps as NodeProps} />);

        // 카드의 확장 상태 확인
        const cardNode = screen.getByText('테스트 카드').closest('.card-node');
        expect(cardNode).toHaveAttribute('data-expanded', 'true');

        // 태그가 표시되는지 확인 (actual DOM 구조에 맞게 수정)
        // 태그는 #태그1, #태그2 형식으로 표시됨
        const tagElements = screen.getAllByText(/#태그\d/);
        expect(tagElements.length).toBeGreaterThan(0);
    });
}); 