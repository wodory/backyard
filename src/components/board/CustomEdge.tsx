import React, { useMemo } from 'react';
import { BaseEdge, EdgeProps, getBezierPath, getSmoothStepPath, getStraightPath, ConnectionLineType } from 'reactflow';
import { loadBoardSettings } from '@/lib/board-utils';

// 확장된 엣지 Props 인터페이스
interface CustomEdgeProps extends EdgeProps {
  type?: string;
  animated?: boolean;
  data?: {
    edgeType?: ConnectionLineType;
    settings?: any;
  };
}

/**
 * 커스텀 엣지 컴포넌트
 * - ReactFlow의 기본 동작을 최대한 활용하고, 최소한의 조정만 적용
 */
function CustomEdge({ 
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  type,
  animated,
  data,
  ...restProps
}: CustomEdgeProps) {
  // 보드 설정 불러오기 - 기본값으로만 사용하고 props를 우선시
  const boardSettings = useMemo(() => loadBoardSettings(), []);

  // 엣지 연결 좌표 계산 (useMemo로 최적화)
  const edgeParams = useMemo(() => ({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  }), [sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition]);

  // 엣지 타입 결정: data.edgeType > type prop > 기본값
  const effectiveEdgeType = useMemo(() => {
    // data.edgeType이 있으면 우선 사용
    if (data?.edgeType) {
      return data.edgeType;
    }
    // 없으면 type prop 사용 (기본값은 'bezier')
    return type || 'bezier';
  }, [data, type]);

  // 엣지 패스 계산 (연결선 타입에 따라)
  const [edgePath] = useMemo(() => {
    console.log(`엣지 ${id}의 타입: ${effectiveEdgeType}`);
    
    // 타입에 따라 적절한 경로 생성 함수 사용
    switch (effectiveEdgeType) {
      case ConnectionLineType.Straight:
        return getStraightPath(edgeParams);
      case ConnectionLineType.Step:
        return getSmoothStepPath({
          ...edgeParams,
          borderRadius: 0, // 직각
        });
      case ConnectionLineType.SmoothStep:
        return getSmoothStepPath({
          ...edgeParams,
          borderRadius: 10, // 부드러운 모서리
        });
      case ConnectionLineType.SimpleBezier:
        return getBezierPath({
          ...edgeParams,
          curvature: 0.25,
        });
      case ConnectionLineType.Bezier:
      default:
        return getBezierPath(edgeParams);
    }
  }, [effectiveEdgeType, edgeParams, id]);

  // 실제 애니메이션 여부는 보드 설정과 컴포넌트 prop 결합
  const isAnimated = animated !== undefined ? animated : boardSettings.animated;

  // 스타일 적용 우선순위 변경 - props로 전달된 style을 우선시
  const edgeStyle = useMemo(() => {
    // 1. 기본 스타일 (보드 설정에서 가져옴)
    const baseStyle = {
      strokeWidth: boardSettings.strokeWidth,
      stroke: selected 
        ? boardSettings.selectedEdgeColor 
        : boardSettings.edgeColor,
      transition: 'stroke 0.2s, stroke-width 0.2s',
    };

    // 2. 애니메이션 스타일
    const animationStyle = isAnimated ? {
      strokeDasharray: 5,
      strokeDashoffset: 0,
      animation: 'dashdraw 0.5s linear infinite',
    } : {};

    // 3. 선택 상태에 따른 스타일
    const selectedStyle = selected ? {
      strokeWidth: (style.strokeWidth as number || boardSettings.strokeWidth) + 1,
      stroke: style.stroke || boardSettings.selectedEdgeColor,
    } : {};

    // 4. 스타일 병합 (props의 style이 가장 우선)
    return {
      ...baseStyle,
      ...animationStyle,
      ...selectedStyle,
      ...style, // props의 style을 마지막에 적용하여 우선시
    };
  }, [style, selected, boardSettings, isAnimated]);

  return (
    <BaseEdge 
      path={edgePath} 
      markerEnd={markerEnd} 
      style={edgeStyle}
      data-selected={selected ? 'true' : 'false'}
      {...restProps}
    />
  );
}

export default CustomEdge; 