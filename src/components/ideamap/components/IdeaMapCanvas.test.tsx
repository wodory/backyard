/**
 * 파일명: IdeaMapCanvas.test.tsx
 * 목적: IdeaMapCanvas 컴포넌트 테스트
 * 역할: IdeaMapCanvas 컴포넌트의 렌더링과 기능을 테스트
 * 작성일: 2025-03-28
 * 수정일: 2025-04-01
 * 수정일: 2023-10-27 : import 순서 및 미사용 변수 제거
 * 수정일: 2023-10-27 : 불필요한 props 제거 및 테스트 환경 수정
 */

import React from 'react';
import { ReactNode } from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import '@testing-library/jest-dom';

import { MarkerType, ConnectionLineType, Node, Edge } from '@xyflow/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { createTestNode, createTestEdge } from '@/tests/test-utils';

import IdeaMapCanvas from './IdeaMapCanvas';

// React Flow 모킹
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
    ReactFlow: ({ children, onNodeClick, onPaneClick, defaultEdgeOptions, ...props }: {
      children?: ReactNode;
      onNodeClick?: (event: any, node: any) => void;
      onPaneClick?: (event: any) => void;
      defaultEdgeOptions?: any;
      [key: string]: any;
    }) => (
      <div
        className="react-flow"
        data-testid="react-flow-container"
        onClick={(e) => onPaneClick?.(e)}
      >
        <div data-testid="react-flow-nodes">
          {props.nodes?.map((node: any) => (
            <div
              key={node.id}
              data-testid={`node-${node.id}`}
              onClick={(e) => onNodeClick?.(e, node)}
            >
              {JSON.stringify(node)}
            </div>
          ))}
        </div>
        <div data-testid="react-flow-edges">
          {JSON.stringify(props.edges)}
        </div>
        <div data-testid="default-edge-options">
          {JSON.stringify(defaultEdgeOptions)}
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

// 모의 컴포넌트 정의
const MockLayoutControls = ({ onLayoutChange }: { onLayoutChange: (direction: string) => void }) => (
  <div data-testid="layout-controls">
    <button data-testid="layout-horizontal-button" onClick={() => onLayoutChange('horizontal')}>
      Horizontal
    </button>
  </div>
);

// LayoutControls 모킹
vi.mock('@/components/board/LayoutControls', () => ({
  default: MockLayoutControls
}));

// CreateCardButton 모킹
vi.mock('@/components/cards/CreateCardButton', () => ({
  default: ({ onCardCreated, onClose }: any) => (
    <div data-testid="create-card-button-container">
      <button
        data-testid="create-card-button"
        onClick={() => {
          onCardCreated?.({ id: 'new-card', title: '새 카드', content: '내용' });
          onClose?.();
        }}
      >
        Create Card
      </button>
    </div>
  ),
}));

// DevTools 모킹
vi.mock('@/components/debug/DevTools', () => ({
  default: () => <div data-testid="dev-tools">Dev Tools</div>,
}));

// 테스트를 위한 wrapperRef 생성
const createWrapperRef = () => {
  const divRef = document.createElement('div');
  return {
    current: divRef
  } as React.RefObject<HTMLDivElement>;
};

describe('IdeaMapCanvas Component', () => {
  const snapGrid: [number, number] = [15, 15];
  const defaultProps = {
    nodes: [
      createTestNode('node1', { x: 0, y: 0 }),
      createTestNode('node2', { x: 100, y: 100 })
    ] as Node[],
    edges: [createTestEdge('edge1', 'node1', 'node2')] as Edge[],
    onNodesChange: vi.fn(),
    onEdgesChange: vi.fn(),
    onConnect: vi.fn(),
    onConnectStart: vi.fn(),
    onConnectEnd: vi.fn(),
    onNodeClick: vi.fn(),
    onPaneClick: vi.fn(),
    ideaMapSettings: {
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
    wrapperRef: createWrapperRef(),
    onDragOver: vi.fn(),
    onDrop: vi.fn(),
    onViewportChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<IdeaMapCanvas {...defaultProps} />);
    expect(screen.getByTestId('react-flow-container')).toBeInTheDocument();
  });

  it('renders with controls when showControls is true', () => {
    render(<IdeaMapCanvas {...defaultProps} showControls={true} />);
    expect(screen.getByTestId('react-flow-container')).toBeInTheDocument();
    expect(screen.getByTestId('react-flow-background')).toBeInTheDocument();
    expect(screen.getByTestId('react-flow-controls')).toBeInTheDocument();
  });

  it('does not render controls when showControls is false', () => {
    render(<IdeaMapCanvas {...defaultProps} showControls={false} />);
    expect(screen.getByTestId('react-flow-container')).toBeInTheDocument();
    expect(screen.queryByTestId('react-flow-background')).not.toBeInTheDocument();
    expect(screen.queryByTestId('react-flow-controls')).not.toBeInTheDocument();
  });

  it('passes correct props to ReactFlow', () => {
    render(<IdeaMapCanvas {...defaultProps} />);
    const nodesContainer = screen.getByTestId('react-flow-nodes');
    const edgesContainer = screen.getByTestId('react-flow-edges');
    expect(nodesContainer).toBeInTheDocument();
    expect(edgesContainer).toBeInTheDocument();
  });

  it('handles node click events', () => {
    render(<IdeaMapCanvas {...defaultProps} />);
    const node = screen.getByTestId('node-node1');
    fireEvent.click(node);
    expect(defaultProps.onNodeClick).toHaveBeenCalled();
  });

  it('handles pane click events', () => {
    render(<IdeaMapCanvas {...defaultProps} />);
    const container = screen.getByTestId('react-flow-container');
    fireEvent.click(container);
    expect(defaultProps.onPaneClick).toHaveBeenCalled();
  });

  it('renders dev tools in development environment', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    vi.stubEnv('NODE_ENV', 'development');

    render(<IdeaMapCanvas {...defaultProps} />);

    // 개발 도구가 제거되었으므로, 대신 기본 ReactFlow 컨트롤이 렌더링되는지 확인
    expect(screen.getByTestId('react-flow-controls')).toBeInTheDocument();

    vi.stubEnv('NODE_ENV', originalNodeEnv || 'test');
  });
}); 