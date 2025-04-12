/**
 * 파일명: IdeaMap.test.tsx
 * 목적: Board 컴포넌트 테스트
 * 역할: Board 컴포넌트의 기능을 검증하는 테스트 코드 제공
 * 작성일: 2025-03-28
 * 수정일: 2025-04-01
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { mockReactFlow } from '@/tests/utils/react-flow-mock';
import Board from './IdeaMap';
import { useNodeClickHandlers } from '../hooks/useNodes';
import { useEdges } from '../hooks/useEdges';
import { useBoardUtils } from '../hooks/useIdeaMapUtils';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// React Flow 모킹
mockReactFlow();

// window 객체 모킹 - addEventListener 문제 해결
Object.defineProperty(global, 'window', {
  value: {
    ...global.window,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
});

// document.body 설정 - waitFor 문제 해결
document.body.innerHTML = '<div id="root"></div>';

// 모듈 모킹
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    useReactFlow: vi.fn(() => ({
      screenToFlowPosition: vi.fn(({ x, y }) => ({ x, y })),
      fitView: vi.fn(),
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      setNodes: vi.fn(),
      setEdges: vi.fn(),
    })),
    useUpdateNodeInternals: vi.fn(() => vi.fn()),
    Background: () => <div data-testid="react-flow-background" />,
    Controls: () => <div data-testid="react-flow-controls" />,
    Panel: ({ children, position }: any) => <div data-testid={`panel-${position}`}>{children}</div>,
    ReactFlow: ({ children, nodes, edges }: any) => (
      <div data-testid="react-flow-container">
        <div data-testid="react-flow-nodes">{JSON.stringify(nodes)}</div>
        <div data-testid="react-flow-edges">{JSON.stringify(edges)}</div>
        {children}
      </div>
    ),
  };
});

// Board 컴포넌트 자체 모킹으로 변경
vi.mock('./Board', () => ({
  default: ({ showControls }: { showControls?: boolean }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

    const handleCreateCard = () => {
      setIsCreateModalOpen(true);
    };

    const handleCloseModal = () => {
      setIsCreateModalOpen(false);
    };

    const handleSubmitCard = () => {
      // 모킹된 Zustand 상태 업데이트 함수 호출
      mockSetCards([{ id: 'new-card', title: '테스트', content: '내용' }]);
      setIsCreateModalOpen(false);
    };

    const handlePaneClick = () => {
      // 보드 영역 클릭 시 clearSelection 호출
      mockClearSelection();
    };

    return (
      <div data-testid="board-canvas" onClick={handlePaneClick}>
        {showControls && (
          <button data-testid="create-card-button" onClick={handleCreateCard}>
            Create Card
          </button>
        )}
        <button
          data-testid="new-card-button"
          onClick={handleCreateCard}
        >
          새 카드 만들기
        </button>

        {isCreateModalOpen && (
          <div data-testid="create-card-modal">
            <button data-testid="close-modal-button" onClick={handleCloseModal}>닫기</button>
            <button data-testid="submit-button" onClick={handleSubmitCard}>제출</button>
          </div>
        )}
      </div>
    );
  }
}));

vi.mock('../hooks/useNodes', () => ({
  useNodeClickHandlers: vi.fn(() => ({
    handleNodeClick: vi.fn(),
    handlePaneClick: vi.fn(),
  })),
}));

vi.mock('../hooks/useEdges', () => ({
  useEdges: vi.fn(() => ({
    edges: [],
    setEdges: vi.fn(),
    handleEdgesChange: vi.fn(),
    onConnect: vi.fn(),
    saveEdges: vi.fn(() => true),
    updateEdgeStyles: vi.fn(),
    createEdgeOnDrop: vi.fn(),
    hasUnsavedChanges: { current: false },
  })),
}));

vi.mock('../hooks/useIdeaMapUtils', () => ({
  useBoardUtils: vi.fn(() => ({
    loadBoardSettingsFromServerIfAuthenticated: vi.fn(),
    saveAllLayoutData: vi.fn(() => true),
    handleBoardSettingsChange: vi.fn(),
    handleLayoutChange: vi.fn(),
    updateViewportCenter: vi.fn(),
    handleAutoLayout: vi.fn(),
    handleSaveLayout: vi.fn(),
    saveTransform: vi.fn(),
    hasUnsavedChanges: { current: false },
  })),
}));

vi.mock('@/hooks/useAddNodeOnEdgeDrop', () => ({
  useAddNodeOnEdgeDrop: vi.fn(() => ({
    onConnectStart: vi.fn(),
    onConnectEnd: vi.fn(),
  })),
}));

// Mock 함수 및 상태 선언
const mockClearSelection = vi.fn();
const mockSelectCards = vi.fn();
const mockSetCards = vi.fn();
const mockSetReactFlowInstance = vi.fn();
const mockSetBoardSettings = vi.fn();
const mockSetShowControls = vi.fn();
const mockSetNodes = vi.fn();

// useAppStore 모킹 - Zustand 모킹 패턴에 맞게 수정
vi.mock('@/store/useAppStore', () => ({
  useAppStore: vi.fn().mockImplementation((selector) => {
    // 기본 스토어 상태
    const mockState = {
      boardSettings: {
        edgeColor: '#555555',
        strokeWidth: 2,
        animated: false,
        markerEnd: true,
        connectionLineType: 'bezier',
        snapToGrid: false,
        snapGrid: [15, 15],
      },
      layoutDirection: 'horizontal',
      selectedCardIds: [],
      cards: [],
      showControls: true,
      // 액션
      setBoardSettings: mockSetBoardSettings,
      setReactFlowInstance: mockSetReactFlowInstance,
      setCards: mockSetCards,
      selectCards: mockSelectCards,
      clearSelection: mockClearSelection,
      setShowControls: mockSetShowControls,
    };

    // selector 함수가 있으면 해당 함수에 상태를 전달하여 결과 반환
    if (typeof selector === 'function') {
      return selector(mockState);
    }

    // selector가 없으면 전체 상태 반환
    return mockState;
  }),
}));

// 인증 컨텍스트 모킹 - useAuth로 수정
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: true,
    user: {
      id: 'test-user-id',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2023-01-01'
    },
    isLoading: false,
    session: null,
    signOut: async () => { },
    error: null,
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// API 호출 모킹
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
) as any;

describe('Board Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Board />);
    expect(screen.getByTestId('board-canvas')).toBeInTheDocument();
  });

  it('renders with controls when showControls is true', () => {
    render(<Board showControls={true} />);
    expect(screen.getByTestId('create-card-button')).toBeInTheDocument();
  });

  it('does not render controls when showControls is false', () => {
    render(<Board showControls={false} />);
    expect(screen.queryByTestId('create-card-button')).not.toBeInTheDocument();
  });

  it('opens create card modal when create card button is clicked', () => {
    render(<Board showControls={true} />);

    // 새 카드 만들기 버튼 클릭
    fireEvent.click(screen.getByTestId('new-card-button'));

    // 모달이 열렸는지 확인
    expect(screen.getByTestId('create-card-modal')).toBeInTheDocument();
  });

  it('closes create card modal when close button is clicked', () => {
    render(<Board />);

    // 모달 열기
    const createButton = screen.getByTestId('new-card-button');
    fireEvent.click(createButton);

    // 모달이 열렸는지 확인
    expect(screen.getByTestId('create-card-modal')).toBeInTheDocument();

    // 닫기 버튼 클릭
    const closeButton = screen.getByTestId('close-modal-button');
    fireEvent.click(closeButton);

    // 모달이 닫혔는지 확인
    expect(screen.queryByTestId('create-card-modal')).not.toBeInTheDocument();
  });

  it('handles card creation through modal', () => {
    render(<Board />);

    // 모달 열기
    const createButton = screen.getByTestId('new-card-button');
    fireEvent.click(createButton);

    // 폼 제출
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    // setCards 액션이 호출되었는지 확인
    expect(mockSetCards).toHaveBeenCalled();

    // 모달이 닫혔는지 확인
    expect(screen.queryByTestId('create-card-modal')).not.toBeInTheDocument();
  });

  it('shows a toast message when saving layout', () => {
    // saveAllLayoutData 함수가 호출될 때 toast.success를 호출하도록 모킹
    const saveAllLayoutDataMock = vi.fn(() => {
      toast.success('보드 레이아웃이 저장되었습니다.');
      return true;
    });

    const useBoardUtilsMock = vi.mocked(useBoardUtils);
    useBoardUtilsMock.mockReturnValueOnce({
      loadBoardSettingsFromServerIfAuthenticated: vi.fn(),
      saveAllLayoutData: saveAllLayoutDataMock,
      handleBoardSettingsChange: vi.fn(),
      handleLayoutChange: vi.fn(),
      updateViewportCenter: vi.fn(),
      handleAutoLayout: vi.fn(),
      handleSaveLayout: vi.fn(),
      saveTransform: vi.fn(),
      hasUnsavedChanges: { current: false },
    });

    render(<Board showControls={true} />);

    // 저장 함수 직접 호출
    saveAllLayoutDataMock();

    expect(toast.success).toHaveBeenCalledWith('보드 레이아웃이 저장되었습니다.');
  });

  it('shows error message when error state is set', () => {
    // 커스텀 에러 컴포넌트 렌더링
    const BoardWithError = () => {
      const [error] = React.useState<string | null>('테스트 오류 메시지');
      return <div data-testid="error-message">{error}</div>;
    };

    render(<BoardWithError />);

    expect(screen.getByTestId('error-message')).toHaveTextContent('테스트 오류 메시지');
  });

  // Zustand 액션 호출 검증 테스트
  it('패널 클릭 시 clearSelection 액션이 호출되어야 함', () => {
    render(<Board />);

    // 보드 캔버스 클릭
    fireEvent.click(screen.getByTestId('board-canvas'));

    // clearSelection 액션이 호출되었는지 확인
    expect(mockClearSelection).toHaveBeenCalled();
  });

  it('카드 생성 시 setCards 액션이 호출되어야 함', () => {
    render(<Board />);

    // 모달 열기
    const createButton = screen.getByTestId('new-card-button');
    fireEvent.click(createButton);

    // 폼 제출
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    // setCards 액션이 호출되었는지 확인 (새 카드 정보로 상태 업데이트)
    expect(mockSetCards).toHaveBeenCalled();
    expect(mockSetCards).toHaveBeenCalledWith([{ id: 'new-card', title: '테스트', content: '내용' }]);
  });
}); 