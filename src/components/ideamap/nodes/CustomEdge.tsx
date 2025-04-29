/**
 * 파일명: CustomEdge.tsx
 * 목적: React Flow에서 사용할 커스텀 엣지 컴포넌트
 * 역할: 노드 간 연결선을 시각화하는 컴포넌트
 * 작성일: 2025-03-08
 * 수정일: 2025-03-31
 * 수정일: 2023-10-27 : 사용하지 않는 import/변수 제거 및 any 타입 개선
 * 수정일: 2025-04-30 : useAppStore에서 useIdeaMapStore로 변경하여 설정 직접 참조 방식으로 수정 (Task 3.2)
 * 수정일: 2025-04-30 : 로깅 최적화 및 렌더링 성능 개선을 위한 useMemo 사용 확대 (Task 3.2)
 * 수정일: 2025-04-30 : 스토어 설정값을 직접 참조하여 엣지 스타일(색상, 굵기) 적용
 */

import React, { useMemo } from 'react';

import { BaseEdge, EdgeProps, getBezierPath, getSmoothStepPath, getStraightPath, ConnectionLineType } from '@xyflow/react';

import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import createLogger from '@/lib/logger';

// 모듈별 로거 생성
const logger = createLogger('CustomEdge');

// 고유 식별자 추가 - 이 컴포넌트가 정확히 어느 파일에서 로드되었는지 확인
const COMPONENT_ID = 'CustomEdge_from_nodes_directory';

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
 * - Zustand 스토어에서 직접 설정을 참조하여 다음과 같은 이점이 있습니다:
 *   1. props 드릴링 제거: 설정을 컴포넌트 트리를 통해 전달할 필요 없음
 *   2. 일관된 스타일: 모든 엣지가 동일한 중앙 집중식 설정 소스 참조
 *   3. 실시간 업데이트: 설정 변경 시 모든 엣지가 자동으로 업데이트
 */
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
  // Zustand 스토어에서 ideaMapSettings 직접 가져오기 (Task 3.2)
  const ideaMapSettings = useIdeaMapStore(state => state.ideaMapSettings);

  // 개발 환경에서만 디버깅 로그
  if (process.env.NODE_ENV === 'development') {
    logger.debug('엣지 렌더링', {
      id: restProps.id,
      source: restProps.source,
      target: restProps.target,
      settings: ideaMapSettings
    });
  }

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
  const isAnimated = useMemo(() =>
    animated !== undefined ? animated : effectiveSettings.animated,
    [animated, effectiveSettings.animated]);

  // 스타일 적용 우선순위 변경 - props로 전달된 style을 우선시
  const edgeStyle = useMemo(() => {
    // 1. 기본 스타일 (보드 설정에서 가져옴)
    const baseStyle = {
      strokeWidth: effectiveSettings.strokeWidth, // CSS 변수 대신 스토어 값 사용
      stroke: effectiveSettings.edgeColor,        // CSS 변수 대신 스토어 값 사용
      transition: 'stroke 0.2s, stroke-width 0.2s',
    };

    // 2. 선택 상태에 따른 스타일
    const selectedStyle = selected ? {
      // 선택 시 굵기를 약간 더 굵게 할 수 있음 (선택 사항)
      // strokeWidth: effectiveSettings.strokeWidth * 1.5,
      stroke: effectiveSettings.selectedEdgeColor, // 선택된 엣지 색상 사용
    } : {};

    // 3. 스타일 병합 (props의 style이 가장 우선)
    return {
      ...baseStyle,
      ...selectedStyle,
      ...style, // props의 style을 마지막에 적용하여 우선시
    };
  }, [style, selected, effectiveSettings]); // effectiveSettings 의존성 추가

  // clean props - 불필요한 prop 제거
  const cleanProps = useMemo(() => {
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
  }, [restProps]);

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={edgeStyle}
      className={isAnimated ? 'edge-animated' : ''}
      data-selected={selected ? 'true' : 'false'}
      data-component-id={COMPONENT_ID}
      {...cleanProps}
    />
  );
}

export default CustomEdge; 