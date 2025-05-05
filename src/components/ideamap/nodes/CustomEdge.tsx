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
 * 수정일: 2025-05-21 : Three-Layer-Standard 준수를 위한 리팩토링 - useIdeaMapSettings 훅 사용
 * 수정일: 2025-05-23 : userId를 useAuthStore에서 직접 가져오도록 수정
 */

import React, { useMemo } from 'react';

import { BaseEdge, EdgeProps, getBezierPath, getSmoothStepPath, getStraightPath, ConnectionLineType } from '@xyflow/react';

import { useIdeaMapSettings } from '@/hooks/useIdeaMapSettings'; // React Query 훅으로 변경
import { useAppStore, selectActiveProject } from '@/store/useAppStore';
import { useAuthStore, selectUserId } from '@/store/useAuthStore';
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
 * - TanStack Query 훅을 사용하여 설정을 가져오는 방식으로 변경:
 *   1. 중앙 집중식 설정 소스 참조
 *   2. 서버와 클라이언트 설정의 자동 동기화
 *   3. 설정 변경 시 모든 엣지가 동일하게 업데이트됨
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
  // 인증된 사용자 ID 가져오기 (useAuthStore에서 직접)
  const userId = useAuthStore(selectUserId);

  // TanStack Query를 통해 설정 정보 가져오기
  const { data: ideaMapSettings, isLoading, isError, error } = useIdeaMapSettings(userId);

  // 개발 환경에서만 디버깅 로그
  if (process.env.NODE_ENV === 'development') {
    logger.debug('엣지 렌더링', {
      id: restProps.id,
      source: restProps.source,
      target: restProps.target,
      settings: ideaMapSettings
    });
  }

  // 기본 설정값 (설정을 가져오지 못했을 때 사용)
  const defaultSettings = useMemo(() => ({
    strokeWidth: 2,
    edgeColor: '#C1C1C1',
    selectedEdgeColor: '#FF0072',
    connectionLineType: 'bezier',
    animated: false,
    markerEnd: null
  }), []);

  // 유효한 설정 (서버에서 가져온 설정 또는 기본값)
  const effectiveSettings = useMemo(() => {
    // 로딩 중이거나 에러 발생 시 기본값 사용
    if (isLoading || isError || !ideaMapSettings) {
      if (isError && process.env.NODE_ENV === 'development') {
        console.warn("CustomEdge: 설정 로드 중 오류 발생, 기본값 사용:", error);
      }
      return defaultSettings;
    }
    return ideaMapSettings;
  }, [ideaMapSettings, isLoading, isError, error, defaultSettings]);

  // 글로벌 설정과 로컬 설정 결합
  const effectiveConfig = useMemo(() => {
    // 로컬 설정이 있으면 우선적으로 사용, 없으면 글로벌 설정 사용
    const localSettings = data?.settings;
    return localSettings ? { ...effectiveSettings, ...localSettings } : effectiveSettings;
  }, [effectiveSettings, data?.settings]);

  // 엣지 연결 좌표 계산 (useMemo로 최적화)
  const edgeParams = useMemo(() => ({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  }), [sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition]);

  // 엣지 타입 결정: data.edgeType > effectiveConfig.connectionLineType > 기본값
  const effectiveEdgeType = useMemo(() => {
    // data.edgeType이 있으면 우선 사용
    if (data?.edgeType) {
      return data.edgeType;
    }
    // 글로벌 설정의 connectionLineType 사용
    return effectiveConfig.connectionLineType || 'bezier';
  }, [data?.edgeType, effectiveConfig.connectionLineType]);

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
    animated !== undefined ? animated : effectiveConfig.animated,
    [animated, effectiveConfig.animated]);

  // 스타일 적용 우선순위 변경 - props로 전달된 style을 우선시
  const edgeStyle = useMemo(() => {
    // 1. 기본 스타일 (설정에서 가져옴)
    const baseStyle = {
      strokeWidth: effectiveConfig.strokeWidth, // 스토어 값 사용
      stroke: effectiveConfig.edgeColor,        // 스토어 값 사용
      transition: 'stroke 0.2s, stroke-width 0.2s',
    };

    // 2. 선택 상태에 따른 스타일
    const selectedStyle = selected ? {
      // 선택 시 굵기를 약간 더 굵게 할 수 있음 (선택 사항)
      // strokeWidth: effectiveConfig.strokeWidth * 1.5,
      stroke: effectiveConfig.selectedEdgeColor, // 선택된 엣지 색상 사용
    } : {};

    // 3. 스타일 병합 (props의 style이 가장 우선)
    return {
      ...baseStyle,
      ...selectedStyle,
      ...style, // props의 style을 마지막에 적용하여 우선시
    };
  }, [style, selected, effectiveConfig]); // effectiveConfig 의존성 추가

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

  // 설정 로딩 중에는 기본 스타일로 표시
  if (isLoading) {
    // 기본 스타일로 엣지 그리기
    return (
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...edgeStyle, opacity: 0.5 }}
        className={isAnimated ? 'edge-animated' : ''}
        data-selected={selected ? 'true' : 'false'}
        data-component-id={COMPONENT_ID}
        {...cleanProps}
      />
    );
  }

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

/**
 * mermaid 다이어그램:
 * ```mermaid
 * sequenceDiagram
 *   participant UI as CustomEdge
 *   participant TQ as useIdeaMapSettings
 *   participant Service as settingsService
 *   participant API as /api/settings
 *   participant DB as 데이터베이스
 * 
 *   UI->>+TQ: useIdeaMapSettings(userId)
 *   TQ->>+Service: fetchSettings(userId)
 *   Service->>+API: GET /api/settings
 *   API->>+DB: 설정 조회
 *   DB-->>-API: 설정 데이터 반환
 *   API-->>-Service: 설정 데이터 응답
 *   Service-->>-TQ: 설정 데이터 반환
 *   TQ-->>-UI: 설정 데이터 반환
 *   UI->>UI: 엣지 스타일 계산 및 렌더링
 * ```
 */ 