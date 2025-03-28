/**
 * 파일명: CustomEdge.test.tsx
 * 목적: CustomEdge 컴포넌트 테스트
 * 역할: 엣지 컴포넌트의 기능 테스트
 * 작성일: 2024-05-31
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CustomEdge from '../CustomEdge';
import { ReactFlowProvider, EdgeProps, Position } from '@xyflow/react';

// AppStore 모킹
vi.mock('@/store/useAppStore', () => ({
  useAppStore: () => ({
    boardSettings: {
      edgeColor: '#000000',
      strokeWidth: 2,
      animated: false,
      markerEnd: true,
      connectionLineType: 'bezier'
    }
  })
}));

// useUpdateNodeInternals 모킹
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    BaseEdge: ({ path, markerEnd, style, className, ...props }: any) => (
      <g data-testid="base-edge" className={className} style={style}>
        <path data-testid="edge-path" d={path} markerEnd={markerEnd} />
      </g>
    )
  };
});

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

  beforeEach(() => {
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
  });

  it('애니메이션 속성이 올바르게 적용되어야 함', () => {
    const animatedEdgeProps = {
      ...mockEdgeProps,
      animated: true
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
      selected: true
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
  });

  it('데이터로 전달된 연결선 타입이 적용되어야 함', () => {
    const edgeWithData = {
      ...mockEdgeProps,
      data: {
        edgeType: 'straight',
        settings: {
          animated: true,
          strokeWidth: 3,
          edgeColor: '#FF0000'
        }
      }
    };

    // 실제 getStraightPath가 호출되는지 스파이
    const getStraightPathSpy = vi.spyOn(require('@xyflow/react'), 'getStraightPath');

    render(
      <ReactFlowProvider>
        <svg>
          <CustomEdge {...edgeWithData as EdgeProps} />
        </svg>
      </ReactFlowProvider>
    );

    const baseEdge = screen.getByTestId('base-edge');
    expect(baseEdge).toBeInTheDocument();
    expect(getStraightPathSpy).toHaveBeenCalled();
  });
}); 