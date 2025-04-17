/**
 * 파일명: CustomEdge.tsx
 * 목적: React Flow에서 사용할 커스텀 엣지 컴포넌트
 * 역할: 노드 간 연결선을 시각화하는 컴포넌트
 * 작성일: 2025-03-08
 * 수정일: 2025-03-31
 * 수정일: 2023-10-27 : 사용하지 않는 import/변수 제거 및 any 타입 개선
 */

import React, { useMemo } from 'react';

import { BaseEdge, EdgeProps, getBezierPath, getSmoothStepPath, getStraightPath, ConnectionLineType } from '@xyflow/react';

import { useAppStore } from '@/store/useAppStore';

// 고유 식별자 추가 - 이 컴포넌트가 정확히 어느 파일에서 로드되었는지 확인
const COMPONENT_ID = 'CustomEdge_from_nodes_directory';

// 디버깅용 로그 - 순환 참조 방지를 위해 EDGE_TYPES 접근 제거
console.log(`[${COMPONENT_ID}] 모듈이 로드됨 - 경로: @/components/board/nodes/CustomEdge`);

// 확장된 엣지 Props 인터페이스
interface CustomEdgeProps extends EdgeProps {
  type?: string;
  animated?: boolean;
  data?: {
    edgeType?: ConnectionLineType;
    settings?: Record<string, unknown>;
  };
}

/**
 * 커스텀 엣지 컴포넌트
 * - ReactFlow의 기본 동작을 최대한 활용하고, 최소한의 조정만 적용
 */
// 컴포넌트 사용 시점 디버깅
console.log('[CustomEdge] 컴포넌트 정의 전: 함수 형태의 컴포넌트 생성');

function CustomEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  animated,
  data,
  ...restProps
}: CustomEdgeProps) {
  // Zustand 스토어에서 ideaMapSettings 가져오기
  const { ideaMapSettings } = useAppStore();

  // 글로벌 설정과 로컬 설정 결합
  const effectiveSettings = useMemo(() => {
    // 로컬 설정이 있으면 우선적으로 사용, 없으면 글로벌 설정 사용
    const localSettings = data?.settings;
    return localSettings ? { ...ideaMapSettings, ...localSettings } : ideaMapSettings;
  }, [ideaMapSettings, data?.settings]);

  // 엣지 연결 좌표 계산 (useMemo로 최적화)
  const edgeParams = useMemo(() => ({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  }), [sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition]);

  // 엣지 타입 결정: data.edgeType > ideaMapSettings.connectionLineType > 기본값
  const effectiveEdgeType = useMemo(() => {
    // data.edgeType이 있으면 우선 사용
    if (data?.edgeType) {
      return data.edgeType;
    }
    // 글로벌 설정의 connectionLineType 사용
    return effectiveSettings.connectionLineType || 'bezier';
  }, [data?.edgeType, effectiveSettings.connectionLineType]);

  // 엣지 패스 계산 (연결선 타입에 따라)
  const [edgePath] = useMemo(() => {
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
  }, [effectiveEdgeType, edgeParams]);

  // 실제 애니메이션 여부는 보드 설정과 컴포넌트 prop 결합
  const isAnimated = animated !== undefined ? animated : effectiveSettings.animated;

  // 스타일 적용 우선순위 변경 - props로 전달된 style을 우선시
  const edgeStyle = useMemo(() => {
    // 1. 기본 스타일 (보드 설정에서 가져옴)
    const baseStyle = {
      strokeWidth: `var(--edge-width)`,
      stroke: selected
        ? `var(--edge-selected-color)`
        : `var(--edge-color)`,
      transition: 'stroke 0.2s, stroke-width 0.2s',
    };

    // 2. 선택 상태에 따른 스타일
    const selectedStyle = selected ? {
      strokeWidth: `var(--edge-selected-width)`,
      stroke: `var(--edge-selected-color)`,
    } : {};

    // 3. 스타일 병합 (props의 style이 가장 우선)
    return {
      ...baseStyle,
      ...selectedStyle,
      ...style, // props의 style을 마지막에 적용하여 우선시
    };
  }, [style, selected]);

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={edgeStyle}
      className={isAnimated ? 'edge-animated' : ''}
      data-selected={selected ? 'true' : 'false'}
      data-component-id={COMPONENT_ID}
      {...(() => {
        // restProps에서 DOM 요소에 전달되지 않아야 할 속성들 제거
        const {
          selectable,
          deletable,
          sourceHandleId,
          targetHandleId,
          pathOptions,
          source,
          target,
          id,
          type,
          ...cleanProps
        } = restProps;
        return cleanProps;
      })()}
    />
  );
}

export default CustomEdge; 