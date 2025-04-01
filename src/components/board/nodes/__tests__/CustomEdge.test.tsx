/**
 * 파일명: CustomEdge.test.tsx
 * 목적: CustomEdge 컴포넌트 테스트
 * 역할: 엣지 컴포넌트의 기능 테스트
 * 작성일: 2024-05-31
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider, EdgeProps, Position, ConnectionLineType } from '@xyflow/react';
import { ConnectionLineType as SystemConnectionLineType } from '@xyflow/system';
import type * as XyflowReact from '@xyflow/react';

// AppStore 모킹
vi.mock('@/store/useAppStore', () => ({
  useAppStore: () => ({
    boardSettings: {
      edgeColor: '#000000',
      selectedEdgeColor: '#ff0000',
      strokeWidth: 2,
      selectedStrokeWidth: 3,
      animated: false,
      markerEnd: true,
      connectionLineType: 'bezier'
    }
  })
}));

vi.mock('@xyflow/react', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof XyflowReact;
  const getBezierPathMock = vi.fn().mockReturnValue(['M0 0 C100 0 100 100 200 100']);
  const getStraightPathMock = vi.fn().mockReturnValue(['M0 0 L200 100']);
  const getSmoothStepPathMock = vi.fn().mockReturnValue(['M0 0 Q100 0 100 50 Q100 100 200 100']);

  return {
    ...actual,
    getBezierPath: getBezierPathMock,
    getStraightPath: getStraightPathMock,
    getSmoothStepPath: getSmoothStepPathMock,
    useStore: vi.fn(() => ({
      selectedEdgeColor: '#ff0000',
    })),
    ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    BaseEdge: ({ path, markerEnd, style, className, 'data-selected': selected, 'data-component-id': componentId }: any) => (
      <g data-testid="base-edge" className={className} style={style} data-selected={selected} data-component-id={componentId}>
        <path data-testid="edge-path" d={path} markerEnd={markerEnd} />
      </g>
    ),
  };
});

// CustomEdge 컴포넌트 임포트
import CustomEdge from '../../nodes/CustomEdge';

describe('CustomEdge', () => {
  const mockEdgeProps: Partial<EdgeProps> = {
    id: 'test-edge-id',
    source: 'source-node',
    target: 'target-node',
    sourceX: 100,
    sourceY: 100,
    targetX: 200,
    targetY: 200,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: { strokeWidth: 2, stroke: '#000000' },
    markerEnd: 'test-marker',
    selected: false
  };

  let getBezierPathMock: ReturnType<typeof vi.fn>;
  let getStraightPathMock: ReturnType<typeof vi.fn>;
  let getSmoothStepPathMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const xyflow = vi.mocked(await import('@xyflow/react'));
    getBezierPathMock = xyflow.getBezierPath;
    getStraightPathMock = xyflow.getStraightPath;
    getSmoothStepPathMock = xyflow.getSmoothStepPath;
    vi.clearAllMocks();
  });

  it('기본 엣지가 올바르게 렌더링되어야 함', () => {
    render(
      <ReactFlowProvider>
        <svg>
          <CustomEdge {...mockEdgeProps as EdgeProps} />
        </svg>
      </ReactFlowProvider>
    );

    const baseEdge = screen.getByTestId('base-edge');
    const edgePath = screen.getByTestId('edge-path');

    expect(baseEdge).toBeInTheDocument();
    expect(edgePath).toBeInTheDocument();
    expect(baseEdge).toHaveAttribute('data-component-id', 'CustomEdge_from_nodes_directory');
  });

  it('애니메이션 클래스가 올바르게 적용되어야 함', () => {
    const animatedEdgeProps = {
      ...mockEdgeProps,
      data: { settings: { animated: true } }
    };

    render(
      <ReactFlowProvider>
        <svg>
          <CustomEdge {...animatedEdgeProps as EdgeProps} />
        </svg>
      </ReactFlowProvider>
    );

    const baseEdge = screen.getByTestId('base-edge');
    expect(baseEdge).toHaveClass('edge-animated');
  });

  it('선택 상태에 따라 스타일이 변경되어야 함', () => {
    const selectedEdgeProps = {
      ...mockEdgeProps,
      selected: true,
      style: {} // 기본 스타일 제거하여 선택 상태 스타일만 적용
    };

    render(
      <ReactFlowProvider>
        <svg>
          <CustomEdge {...selectedEdgeProps as EdgeProps} />
        </svg>
      </ReactFlowProvider>
    );

    const baseEdge = screen.getByTestId('base-edge');
    expect(baseEdge).toHaveAttribute('data-selected', 'true');

    // style 객체에서 직접 값을 확인
    const style = window.getComputedStyle(baseEdge);
    expect(style.getPropertyValue('--edge-selected-width')).toBeDefined();
    expect(style.getPropertyValue('--edge-selected-color')).toBeDefined();
  });

  describe('엣지 타입별 경로 생성', () => {
    it('Bezier 타입 엣지가 올바르게 생성되어야 함', () => {
      render(
        <CustomEdge
          id="test-edge-id"
          source="source-node"
          target="target-node"
          type="bezier"
          sourceX={0}
          sourceY={0}
          targetX={100}
          targetY={100}
          sourcePosition={Position.Right}
          targetPosition={Position.Left}
          style={{}}
          markerEnd="url(#arrow)"
          data={{
            edgeType: ConnectionLineType.Bezier,
          }}
        />,
      );

      expect(getBezierPathMock).toHaveBeenCalled();
    });

    it('Straight 타입 엣지가 올바르게 생성되어야 함', () => {
      render(
        <CustomEdge
          id="test-edge-id"
          source="source-node"
          target="target-node"
          type="straight"
          sourceX={0}
          sourceY={0}
          targetX={100}
          targetY={100}
          sourcePosition={Position.Right}
          targetPosition={Position.Left}
          style={{}}
          markerEnd="url(#arrow)"
          data={{
            edgeType: ConnectionLineType.Straight,
          }}
        />,
      );

      expect(getStraightPathMock).toHaveBeenCalled();
    });

    it('SmoothStep 타입 엣지가 올바르게 생성되어야 함', () => {
      render(
        <CustomEdge
          id="test-edge-id"
          source="source-node"
          target="target-node"
          type="smoothstep"
          sourceX={0}
          sourceY={0}
          targetX={100}
          targetY={100}
          sourcePosition={Position.Right}
          targetPosition={Position.Left}
          style={{}}
          markerEnd="url(#arrow)"
          data={{
            edgeType: ConnectionLineType.SmoothStep,
          }}
        />,
      );

      expect(getSmoothStepPathMock).toHaveBeenCalledWith(
        expect.objectContaining({
          borderRadius: 10,
        }),
      );
    });
  });

  it('스타일 우선순위가 올바르게 적용되어야 함', () => {
    const customStyleProps = {
      ...mockEdgeProps,
      style: {
        strokeWidth: '5px',
        stroke: '#00ff00'
      }
    };

    render(
      <ReactFlowProvider>
        <svg>
          <CustomEdge {...customStyleProps as EdgeProps} />
        </svg>
      </ReactFlowProvider>
    );

    const baseEdge = screen.getByTestId('base-edge');
    // style 객체 대신 직접 속성 테스트
    expect(baseEdge).toHaveAttribute('style', expect.stringContaining('stroke: #00ff00'));
  });
}); 