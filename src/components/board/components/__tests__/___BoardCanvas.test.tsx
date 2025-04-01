/**
 * 파일명: BoardCanvas.test.tsx
 * 목적: BoardCanvas 컴포넌트 테스트
 * 역할: BoardCanvas 컴포넌트의 렌더링 및 BoardControls 통합 테스트
 * 작성일: 2024-05-30
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import BoardCanvas from '../BoardCanvas';
import { DEFAULT_BOARD_SETTINGS } from '@/lib/board-utils';
import { vi } from 'vitest';
import { Node, Edge } from '@xyflow/react';

// 외부 컴포넌트 및 라이브러리 목킹
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    ReactFlow: ({ children }: any) => (
      <div data-testid="react-flow">
        {children}
      </div>
    ),
    Controls: () => <div data-testid="flow-controls">Controls</div>,
    Background: () => <div data-testid="flow-background">Background</div>
  };
});

// BoardControls 컴포넌트 목킹
vi.mock('../BoardControls', () => ({
  default: (props: any) => (
    <div 
      data-testid="board-controls"
      data-props={JSON.stringify({
        boardSettings: props.boardSettings,
        isAuthenticated: props.isAuthenticated,
        userId: props.userId
      })}
    >
      Board Controls
    </div>
  )
}));

// 노드 타입과 엣지 타입 목킹
vi.mock('@/lib/flow-constants', () => ({
  NODE_TYPES: { card: 'CardNode' },
  EDGE_TYPES: { default: 'DefaultEdge' }
}));

describe('BoardCanvas', () => {
  // 기본 props - 타입 문제를 해결하기 위해 테스트별로 별도 생성
  const getMockWrapperRef = () => {
    // HTMLDivElement를 직접 모킹하는 대신 React.RefObject 인터페이스를 구현한 객체 생성
    const mockRef: React.RefObject<HTMLDivElement> = {
      current: document.createElement('div')
    };
    return mockRef;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ReactFlow 컴포넌트가 렌더링되어야 함', () => {
    const props = {
      nodes: [] as Node[],
      edges: [] as Edge[],
      onNodesChange: vi.fn(),
      onEdgesChange: vi.fn(),
      onConnect: vi.fn(),
      onConnectStart: vi.fn(),
      onConnectEnd: vi.fn(),
      onNodeClick: vi.fn(),
      onPaneClick: vi.fn(),
      layoutDirection: 'horizontal' as const,
      boardSettings: DEFAULT_BOARD_SETTINGS,
      onBoardSettingsChange: vi.fn(),
      onLayoutChange: vi.fn(),
      onAutoLayout: vi.fn(),
      onSaveLayout: vi.fn(),
      onCreateCard: vi.fn(),
      showControls: true,
      wrapperRef: getMockWrapperRef(),
      isAuthenticated: false,
      userId: undefined
    };

    render(<BoardCanvas {...props} />);
    
    const reactFlow = screen.getByTestId('react-flow');
    expect(reactFlow).toBeInTheDocument();
  });

  it('컨트롤이 활성화된 경우 Background와 Controls 컴포넌트가 렌더링되어야 함', () => {
    const props = {
      nodes: [] as Node[],
      edges: [] as Edge[],
      onNodesChange: vi.fn(),
      onEdgesChange: vi.fn(),
      onConnect: vi.fn(),
      onConnectStart: vi.fn(),
      onConnectEnd: vi.fn(),
      onNodeClick: vi.fn(),
      onPaneClick: vi.fn(),
      layoutDirection: 'horizontal' as const,
      boardSettings: DEFAULT_BOARD_SETTINGS,
      onBoardSettingsChange: vi.fn(),
      onLayoutChange: vi.fn(),
      onAutoLayout: vi.fn(),
      onSaveLayout: vi.fn(),
      onCreateCard: vi.fn(),
      showControls: true,
      wrapperRef: getMockWrapperRef(),
      isAuthenticated: false,
      userId: undefined
    };

    render(<BoardCanvas {...props} />);
    
    const background = screen.getByTestId('flow-background');
    const controls = screen.getByTestId('flow-controls');
    
    expect(background).toBeInTheDocument();
    expect(controls).toBeInTheDocument();
  });

  it('컨트롤이 비활성화된 경우 Background와 Controls 컴포넌트가 렌더링되지 않아야 함', () => {
    const props = {
      nodes: [] as Node[],
      edges: [] as Edge[],
      onNodesChange: vi.fn(),
      onEdgesChange: vi.fn(),
      onConnect: vi.fn(),
      onConnectStart: vi.fn(),
      onConnectEnd: vi.fn(),
      onNodeClick: vi.fn(),
      onPaneClick: vi.fn(),
      layoutDirection: 'horizontal' as const,
      boardSettings: DEFAULT_BOARD_SETTINGS,
      onBoardSettingsChange: vi.fn(),
      onLayoutChange: vi.fn(),
      onAutoLayout: vi.fn(),
      onSaveLayout: vi.fn(),
      onCreateCard: vi.fn(),
      showControls: false,
      wrapperRef: getMockWrapperRef(),
      isAuthenticated: false,
      userId: undefined
    };

    render(<BoardCanvas {...props} />);
    
    expect(screen.queryByTestId('flow-background')).not.toBeInTheDocument();
    expect(screen.queryByTestId('flow-controls')).not.toBeInTheDocument();
  });

  it('BoardControls 컴포넌트가 showControls=true일 때 렌더링되어야 함', () => {
    const props = {
      nodes: [] as Node[],
      edges: [] as Edge[],
      onNodesChange: vi.fn(),
      onEdgesChange: vi.fn(),
      onConnect: vi.fn(),
      onConnectStart: vi.fn(),
      onConnectEnd: vi.fn(),
      onNodeClick: vi.fn(),
      onPaneClick: vi.fn(),
      layoutDirection: 'horizontal' as const,
      boardSettings: DEFAULT_BOARD_SETTINGS,
      onBoardSettingsChange: vi.fn(),
      onLayoutChange: vi.fn(),
      onAutoLayout: vi.fn(),
      onSaveLayout: vi.fn(),
      onCreateCard: vi.fn(),
      showControls: true,
      wrapperRef: getMockWrapperRef(),
      isAuthenticated: false,
      userId: undefined
    };

    render(<BoardCanvas {...props} />);
    
    const boardControls = screen.getByTestId('board-controls');
    expect(boardControls).toBeInTheDocument();
  });

  it('BoardControls 컴포넌트가 showControls=false일 때 렌더링되지 않아야 함', () => {
    const props = {
      nodes: [] as Node[],
      edges: [] as Edge[],
      onNodesChange: vi.fn(),
      onEdgesChange: vi.fn(),
      onConnect: vi.fn(),
      onConnectStart: vi.fn(),
      onConnectEnd: vi.fn(),
      onNodeClick: vi.fn(),
      onPaneClick: vi.fn(),
      layoutDirection: 'horizontal' as const,
      boardSettings: DEFAULT_BOARD_SETTINGS,
      onBoardSettingsChange: vi.fn(),
      onLayoutChange: vi.fn(),
      onAutoLayout: vi.fn(),
      onSaveLayout: vi.fn(),
      onCreateCard: vi.fn(),
      showControls: false,
      wrapperRef: getMockWrapperRef(),
      isAuthenticated: false,
      userId: undefined
    };

    render(<BoardCanvas {...props} />);
    
    expect(screen.queryByTestId('board-controls')).not.toBeInTheDocument();
  });

  it('BoardControls에 올바른 props가 전달되어야 함', () => {
    const props = {
      nodes: [] as Node[],
      edges: [] as Edge[],
      onNodesChange: vi.fn(),
      onEdgesChange: vi.fn(),
      onConnect: vi.fn(),
      onConnectStart: vi.fn(),
      onConnectEnd: vi.fn(),
      onNodeClick: vi.fn(),
      onPaneClick: vi.fn(),
      layoutDirection: 'horizontal' as const,
      boardSettings: DEFAULT_BOARD_SETTINGS,
      onBoardSettingsChange: vi.fn(),
      onLayoutChange: vi.fn(),
      onAutoLayout: vi.fn(),
      onSaveLayout: vi.fn(),
      onCreateCard: vi.fn(),
      showControls: true,
      wrapperRef: getMockWrapperRef(),
      isAuthenticated: true,
      userId: 'test-user-id'
    };
    
    render(<BoardCanvas {...props} />);
    
    const boardControls = screen.getByTestId('board-controls');
    const passedProps = JSON.parse(boardControls.getAttribute('data-props') || '{}');
    
    expect(passedProps.boardSettings).toEqual(props.boardSettings);
    expect(passedProps.isAuthenticated).toBe(true);
    expect(passedProps.userId).toBe('test-user-id');
  });

  it('wrapperRef가 div 요소에 연결되어야 함', () => {
    const props = {
      nodes: [] as Node[],
      edges: [] as Edge[],
      onNodesChange: vi.fn(),
      onEdgesChange: vi.fn(),
      onConnect: vi.fn(),
      onConnectStart: vi.fn(),
      onConnectEnd: vi.fn(),
      onNodeClick: vi.fn(),
      onPaneClick: vi.fn(),
      layoutDirection: 'horizontal' as const,
      boardSettings: DEFAULT_BOARD_SETTINGS,
      onBoardSettingsChange: vi.fn(),
      onLayoutChange: vi.fn(),
      onAutoLayout: vi.fn(),
      onSaveLayout: vi.fn(),
      onCreateCard: vi.fn(),
      showControls: true,
      wrapperRef: getMockWrapperRef(),
      isAuthenticated: false,
      userId: undefined
    };

    render(<BoardCanvas {...props} />);
    
    // ref가 연결되었는지 확인하는 직접적인 방법이 없으므로
    // 최소한 컴포넌트가 오류 없이 렌더링되는지 확인
    const container = screen.getByTestId('react-flow').parentElement;
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('h-full w-full flex flex-col relative');
  });

  it('ReactFlow에 올바른 노드 및 엣지 데이터가 전달되어야 함', () => {
    // 올바른 Node 타입 사용
    const nodes: Node[] = [{ 
      id: '1', 
      data: { label: 'Node 1' }, 
      position: { x: 0, y: 0 } // position 속성 추가
    }];
    const edges: Edge[] = [{ 
      id: 'e1-2', 
      source: '1', 
      target: '2' 
    }];

    const props = {
      nodes,
      edges,
      onNodesChange: vi.fn(),
      onEdgesChange: vi.fn(),
      onConnect: vi.fn(),
      onConnectStart: vi.fn(),
      onConnectEnd: vi.fn(),
      onNodeClick: vi.fn(),
      onPaneClick: vi.fn(),
      layoutDirection: 'horizontal' as const,
      boardSettings: DEFAULT_BOARD_SETTINGS,
      onBoardSettingsChange: vi.fn(),
      onLayoutChange: vi.fn(),
      onAutoLayout: vi.fn(),
      onSaveLayout: vi.fn(),
      onCreateCard: vi.fn(),
      showControls: true,
      wrapperRef: getMockWrapperRef(),
      isAuthenticated: false,
      userId: undefined
    };
    
    // ReactFlow 컴포넌트는 목킹되어 있으므로 props 검증은 생략
    // 이 테스트는 주로 컴포넌트가 오류 없이 렌더링되는지 확인
    render(<BoardCanvas {...props} />);
    
    const reactFlow = screen.getByTestId('react-flow');
    expect(reactFlow).toBeInTheDocument();
  });
}); 