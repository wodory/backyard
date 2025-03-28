/**
 * 파일명: BoardCanvas.test.tsx
 * 목적: BoardCanvas 컴포넌트 테스트
 * 역할: BoardCanvas 컴포넌트의 기능을 검증하는 테스트 코드 제공
 * 작성일: 2024-05-27
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { mockReactFlow } from '@/tests/utils/react-flow-mock';
import BoardCanvas from './BoardCanvas';
import { MarkerType, ConnectionLineType } from '@xyflow/react';

// React Flow 모킹
mockReactFlow();

// 모듈 모킹
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
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
    MarkerType: {
      ArrowClosed: 'arrow',
    },
    ConnectionLineType: {
      Bezier: 'bezier',
      Straight: 'straight',
      Step: 'step',
      SmoothStep: 'smoothstep',
    }
  };
});

vi.mock('@/components/board/BoardSettingsControl', () => ({
  default: ({ settings, onSettingsChange }: { settings: any; onSettingsChange: (settings: any) => void }) => (
    <div data-testid="board-settings-control">
      <button 
        data-testid="toggle-animation-button" 
        onClick={() => onSettingsChange({ ...settings, animated: !settings.animated })}
      >
        Toggle Animation
      </button>
    </div>
  ),
}));

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
    <button data-testid="create-card-button" onClick={onClose}>
      Create Card
    </button>
  ),
}));

vi.mock('@/components/debug/DevTools', () => ({
  default: () => <div data-testid="dev-tools">Dev Tools</div>,
}));

// 테스트용 모의 props
const mockProps = {
  nodes: [{ id: 'node1', data: { label: 'Node 1' }, position: { x: 0, y: 0 }, type: 'default' }],
  edges: [{ id: 'edge1', source: 'node1', target: 'node2' }],
  onNodesChange: vi.fn(),
  onEdgesChange: vi.fn(),
  onConnect: vi.fn(),
  onConnectStart: vi.fn(),
  onConnectEnd: vi.fn(),
  onNodeClick: vi.fn(),
  onPaneClick: vi.fn(),
  layoutDirection: 'horizontal' as 'horizontal' | 'vertical',
  boardSettings: {
    edgeColor: '#555555',
    strokeWidth: 2,
    animated: false,
    markerEnd: MarkerType.ArrowClosed,
    connectionLineType: ConnectionLineType.Bezier,
    snapToGrid: false,
    snapGrid: [15, 15] as [number, number],
    markerSize: 10,
    selectedEdgeColor: '#0000ff',
  },
  onBoardSettingsChange: vi.fn(),
  onLayoutChange: vi.fn(),
  onAutoLayout: vi.fn(),
  onSaveLayout: vi.fn(),
  onCreateCard: vi.fn(),
  showControls: true,
  wrapperRef: React.createRef<HTMLDivElement>(),
  className: 'test-class',
  isAuthenticated: true,
  userId: 'test-user-id',
};

describe('BoardCanvas Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<BoardCanvas {...(mockProps as any)} />);
    expect(screen.getByTestId('react-flow-container')).toBeInTheDocument();
  });

  it('renders with controls when showControls is true', () => {
    render(<BoardCanvas {...(mockProps as any)} showControls={true} />);
    expect(screen.getByTestId('react-flow-background')).toBeInTheDocument();
    expect(screen.getByTestId('react-flow-controls')).toBeInTheDocument();
    expect(screen.getByTestId('panel-top-right')).toBeInTheDocument();
  });

  it('does not render controls when showControls is false', () => {
    render(<BoardCanvas {...(mockProps as any)} showControls={false} />);
    expect(screen.queryByTestId('react-flow-background')).not.toBeInTheDocument();
    expect(screen.queryByTestId('react-flow-controls')).not.toBeInTheDocument();
    expect(screen.queryByTestId('panel-top-right')).not.toBeInTheDocument();
  });

  it('passes correct props to ReactFlow', () => {
    render(<BoardCanvas {...(mockProps as any)} />);
    
    // ReactFlow에 노드와 엣지가 전달되었는지 확인
    const nodesContainer = screen.getByTestId('react-flow-nodes');
    const edgesContainer = screen.getByTestId('react-flow-edges');
    
    expect(nodesContainer).toHaveTextContent('node1');
    expect(edgesContainer).toHaveTextContent('edge1');
  });

  it('renders controls with correct components', () => {
    render(<BoardCanvas {...(mockProps as any)} />);
    
    expect(screen.getByTestId('board-settings-control')).toBeInTheDocument();
    expect(screen.getByTestId('layout-controls')).toBeInTheDocument();
    expect(screen.getByTestId('create-card-button')).toBeInTheDocument();
  });
}); 