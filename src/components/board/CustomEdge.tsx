import React, { useMemo } from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';

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
}: EdgeProps) {
  // 엣지 연결 좌표를 useMemo로 계산하여 재렌더링을 최소화
  const edgeParams = useMemo(() => ({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  }), [sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition]);

  // 기본 베지어 패스 계산 (ReactFlow의 내장 함수 사용)
  const [edgePath] = getBezierPath(edgeParams);

  // 기본 스타일 + 커스텀 스타일 적용
  const edgeStyle = useMemo(() => ({
    strokeWidth: 2,
    stroke: '#C1C1C1',
    ...style,
  }), [style]);

  return (
    <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
  );
}

export default CustomEdge; 