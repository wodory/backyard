/**
 * 파일명: BoardCanvas.test.tsx
 * 목적: BoardCanvas 컴포넌트 테스트
 * 역할: BoardCanvas 컴포넌트의 렌더링과 기능을 테스트
 * 작성일: 2024-03-27
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { mockReactFlow } from '@/tests/utils/react-flow-mock';
import BoardCanvas from './BoardCanvas';
import { MarkerType, ConnectionLineType } from '@xyflow/react';
import { BoardSettings } from '@/lib/board-utils';
import { ReactNode } from 'react';
import { Node, Edge } from '@xyflow/react';

// React Flow 모킹
mockReactFlow();

// 모듈 모킹
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    Panel: ({
      children,
      className,
      position = 'top-right',
      ...props
    }: {
      children: ReactNode;
      className?: string;
      position?: string;
      [key: string]: any;
    }) => (
      <div data-testid={`panel-${position}`} className={className} {...props}>
        {children}
      </div>
    ),
    ReactFlow: ({ children, ...props }: { children?: ReactNode;[key: string]: any }) => (
      <div className="react-flow" data-testid="react-flow-container">
        <div data-testid="react-flow-nodes">
          {JSON.stringify(props.nodes)}
        </div>
        <div data-testid="react-flow-edges">
          {JSON.stringify(props.edges)}
        </div>
        {children}
      </div>
    ),
    Background: () => <div data-testid="react-flow-background" />,
    Controls: () => <div data-testid="react-flow-controls" />,
    MarkerType: {
      ArrowClosed: 'arrowclosed'
    },
    ConnectionLineType: {
      Bezier: 'bezier',
      Straight: 'straight',
      Step: 'step',
      SmoothStep: 'smoothstep',
    }
  };
});

// BoardSettingsControl 제거 3/29
// vi.mock('@/components/board/BoardSettingsControl', () => ({
//   default: ({ settings, onSettingsChange }: { settings: any; onSettingsChange: (settings: any) => void }) => (
//     <div data-testid="board-settings-control">
//       <button 
//         data-testid="toggle-animation-button" 
//         onClick={() => onSettingsChange({ ...settings, animated: !settings.animated })}
//       >
//         Toggle Animation
//       </button>
//     </div>
//   ),
// }));

vi.mock('@/components/board/LayoutControls', () => ({
  default: ({ onSaveLayout, onLayoutChange, onAutoLayout }: any) => (
    <div data-testid="layout-controls">
      <button data-testid="save-layout-button" onClick={onSaveLayout}>
        Save Layout
      </button>
      <button data-testid="layout-horizontal-button" onClick={() => onLayoutChange('horizontal')}>
        Horizontal
      </button>
      <button data-testid="auto-layout-button" onClick={onAutoLayout}>
        Auto Layout
      </button>
    </div>
  ),
}));

vi.mock('@/components/cards/CreateCardButton', () => ({
  default: ({ onCardCreated, onClose }: any) => (
    <div data-testid="create-card-button-container">
      <button data-testid="create-card-button" onClick={onClose}>
        Create Card
      </button>
    </div>
  ),
}));

vi.mock('@/components/debug/DevTools', () => ({
  default: () => <div data-testid="dev-tools">Dev Tools</div>,
}));

// BoardControls 컴포넌트 모킹 코드 제거 (3/29 주석 처리됨)

describe('BoardCanvas Component', () => {
  const snapGrid: [number, number] = [15, 15];
  const defaultProps = {
    nodes: [{ id: 'node1', data: { label: 'Node 1' }, position: { x: 0, y: 0 }, type: 'default' }] as Node[],
    edges: [{ id: 'edge1', source: 'node1', target: 'node2' }] as Edge[],
    onNodesChange: vi.fn(),
    onEdgesChange: vi.fn(),
    onConnect: vi.fn(),
    onConnectStart: vi.fn(),
    onConnectEnd: vi.fn(),
    onNodeClick: vi.fn(),
    onPaneClick: vi.fn(),
    layoutDirection: 'horizontal' as const,
    boardSettings: {
      snapToGrid: true,
      snapGrid,
      connectionLineType: ConnectionLineType.Bezier,
      animated: false,
      strokeWidth: 2,
      edgeColor: '#000000',
      selectedEdgeColor: '#0000ff',
      markerEnd: MarkerType.ArrowClosed,
      markerSize: 8
    },
    onBoardSettingsChange: vi.fn(),
    onLayoutChange: vi.fn(),
    onAutoLayout: vi.fn(),
    onSaveLayout: vi.fn(),
    onCreateCard: vi.fn(),
    wrapperRef: React.createRef<HTMLDivElement>(),
    isAuthenticated: true,
    userId: 'test-user'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<BoardCanvas {...defaultProps} />);
    expect(screen.getByTestId('react-flow-container')).toBeInTheDocument();
  });

  it('renders with controls when showControls is true', () => {
    render(<BoardCanvas {...defaultProps} showControls={true} />);

    // 기본 ReactFlow 컴포넌트 확인
    expect(screen.getByTestId('react-flow-container')).toBeInTheDocument();
    expect(screen.getByTestId('react-flow-background')).toBeInTheDocument();
    expect(screen.getByTestId('react-flow-controls')).toBeInTheDocument();

    // 참고: BoardControls 컴포넌트는 현재 구현에서 주석 처리되어 사용되지 않음
  });

  it('does not render controls when showControls is false', () => {
    render(<BoardCanvas {...defaultProps} showControls={false} />);

    // 기본 ReactFlow 컴포넌트는 있어야 함
    expect(screen.getByTestId('react-flow-container')).toBeInTheDocument();

    // 컨트롤 컴포넌트들은 없어야 함
    expect(screen.queryByTestId('react-flow-background')).not.toBeInTheDocument();
    expect(screen.queryByTestId('react-flow-controls')).not.toBeInTheDocument();
  });

  it('passes correct props to ReactFlow', () => {
    render(<BoardCanvas {...defaultProps} />);

    // 노드와 엣지 데이터 확인
    const nodesContainer = screen.getByTestId('react-flow-nodes');
    const edgesContainer = screen.getByTestId('react-flow-edges');

    expect(JSON.parse(nodesContainer.textContent || '')).toEqual(defaultProps.nodes);
    expect(JSON.parse(edgesContainer.textContent || '')).toEqual(defaultProps.edges);
  });

  // 참고: 'renders controls with correct components' 테스트는 BoardControls 컴포넌트가
  // 주석 처리되어 사용되지 않으므로 제거함
}); 