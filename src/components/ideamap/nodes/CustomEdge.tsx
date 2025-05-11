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
 * 수정일: 2025-05-06 : React.memo 적용하여 불필요한 리렌더링 방지
 * 수정일: 2025-04-21 : data.settings에서 설정 우선순위를 올바르게 적용하도록 수정
 * 수정일: 2025-04-21 : 설정 우선순위 순서 변경: individualSettings > globalSettings > defaultEdgeSettings > data
 * 수정일: 2025-04-21 : 코드 단순화: defaultEdgeSettings 제거, 우선순위를 individualSettings > globalSettings > props로 변경
 * 수정일: 2025-04-21 : ideamap-utils.ts의 mergeEdgeStyles 유틸리티 함수 사용하도록 개선
 * 수정일: 2025-04-21 : lint 에러 수정 - mergeEdgeStyles 호출 시 전체 EdgeProps 객체 전달
 * 수정일: 2025-04-21 : type 속성 제거 관련 린트 에러 수정
 * 수정일: 2025-04-21 : animated 속성 오류 수정 - boolean 대신 className으로만 처리
 * 수정일: 2025-05-08 : animated 속성을 엣지 테이블에서 제거하고 설정에서만 가져오도록 수정
 * 수정일: 2025-05-31 : BaseEdge에 불필요한 props 전달 제거하여 React 경고 해결
 */

import React, { useMemo } from 'react';
import { BaseEdge, EdgeProps, getBezierPath, getSmoothStepPath, getStraightPath, ConnectionLineType } from '@xyflow/react';

import { useIdeaMapSettings } from '@/hooks/useIdeaMapSettings'; // React Query 훅으로 변경
import { mergeEdgeStyles } from '@/lib/ideamap-utils';
import createLogger from '@/lib/logger';

// 모듈별 로거 생성
const logger = createLogger('CustomEdge');

// 고유 식별자 추가 - 이 컴포넌트가 정확히 어느 파일에서 로드되었는지 확인
const COMPONENT_ID = 'CustomEdge_from_nodes_directory';

/**
 * 커스텀 엣지 컴포넌트
 * - TanStack Query 훅을 사용하여 설정을 가져오는 방식으로 변경:
 *   1. 중앙 집중식 설정 소스 참조
 *   2. 서버와 클라이언트 설정의 자동 동기화
 *   3. 설정 변경 시 모든 엣지가 동일하게 업데이트됨
 * 
 * 설정 우선순위:
 * 개별값(individualSettings) > 사용자 설정값(globalSettings) > props(ReactFlow에서 전달)
 */
function CustomEdge({
  // BaseEdge에 전달하지 않을 props 명시적 분리
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  animated, // isAnimated로 대체
  selectable, // BaseEdge에 불필요
  deletable, // BaseEdge에 불필요
  sourceHandleId, // BaseEdge에 불필요
  targetHandleId, // BaseEdge에 불필요
  pathOptions, // BaseEdge에 불필요
  // 타입 정의에는 없지만 실제로 전달되는 props (as any로 타입 오류 해결)
  type, // 타입은 이미 CustomEdge로 결정됨
  style: propStyle, // edgeStyle로 대체
  className: propClassName, // animatedClassName과 병합
  // 그 외 BaseEdge에 전달 가능한 표준 SVG 속성들
  ...safeRestProps
}: EdgeProps & { type?: string, className?: string }) {
  // TanStack Query를 통해 설정 정보 가져오기
  const { ideaMapSettings, isLoading, isError } = useIdeaMapSettings();

  // 개발 환경에서만 간소화된 디버깅 로그 (중요한 엣지 정보만 로깅)
  if (process.env.NODE_ENV === 'development') {
    if (animated !== undefined) {
      logger.debug('엣지 렌더링 - 핵심 정보', {
        id: id,
        animated: animated
      });
    }
  }

  // 전체 엣지 속성 구성 (mergeEdgeStyles 함수 호출용)
  const fullEdgeProps = useMemo(() => ({
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
    animated,
    style: propStyle
  }), [id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected, animated, propStyle]);

  // mergeEdgeStyles 호출 시 ideaMapSettings가 undefined일 경우 기본값 사용
  const safeIdeaMapSettings = ideaMapSettings ?? { edge: {} };

  // edgeParams 한 번만 선언
  const edgeParams = { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition };

  // mergeEdgeStyles 호출하여 스타일 계산
  const {
    edgeStyle,
    isAnimated,
    markerEndType,
    markerSize,
    effectiveEdgeType
  } = useMemo(() => {
    // console.log('[CustomEdge] mergeEdgeStyles 입력', {
    //   fullEdgeProps,
    //   ideaMapSettings: safeIdeaMapSettings,
    //   data
    // });

    return mergeEdgeStyles(fullEdgeProps, safeIdeaMapSettings, data);
  }, [fullEdgeProps, safeIdeaMapSettings, data]);

  // edgeStyle에서 strokeWidth, edgeColor 추출 (디버깅용)
  const strokeWidth = edgeStyle.strokeWidth;
  const edgeColor = edgeStyle.stroke;

  // markerEnd를 React Flow 예제처럼 string으로 생성
  const markerEnd = useMemo(() => {
    if (markerEndType) {
      return `url(#marker-${markerEndType})`;
    }
    return undefined;
  }, [markerEndType]);

  // className 병합 (애니메이션 클래스와 전달된 className 병합)
  const animatedClassName = isAnimated ? 'edge-animated' : '';
  const mergedClassName = [animatedClassName, propClassName].filter(Boolean).join(' ');

  // edgePath 계산 (effectiveEdgeType에 따라)
  const [edgePath] = useMemo(() => {
    switch (effectiveEdgeType) {
      case 'straight':
        return getStraightPath(edgeParams);
      case 'step':
        return getSmoothStepPath({ ...edgeParams, borderRadius: 0 });
      case 'smoothstep':
        return getSmoothStepPath({ ...edgeParams, borderRadius: 10 });
      case 'simplebezier':
        return getBezierPath({ ...edgeParams, curvature: 0.25 });
      case ConnectionLineType.Bezier:
      default:
        return getBezierPath(edgeParams);
    }
  }, [effectiveEdgeType, edgeParams]);

  // BaseEdge에 전달할 최종 props
  const baseEdgeProps = {
    ...safeRestProps, // 명시적으로 제외되지 않은 안전한 props
    path: edgePath,
    style: edgeStyle,
    markerEnd,
    className: mergedClassName,
    // data 속성은 문자열로 전달
    'data-selected': selected ? 'true' : 'false',
    'data-component-id': COMPONENT_ID,
    'data-animated': isAnimated ? 'true' : 'false'
  };

  // 디버깅용 로그 (필요시 주석 해제)
  // console.log('[CustomEdge] BaseEdge 전달 props', {
  //   edgeStyle,
  //   strokeWidth,
  //   edgeColor,
  //   markerEnd,
  //   markerSize,
  //   className: mergedClassName
  // });

  return <BaseEdge {...baseEdgeProps} />;
}

// React.memo로 컴포넌트를 감싸 props가 변경되지 않으면 리렌더링 방지
export default React.memo(CustomEdge);

/**
 * mermaid 다이어그램:
 * ```mermaid
 * sequenceDiagram
 *   participant UI as CustomEdge
 *   participant Utils as ideamap-utils
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
 *   UI->>Utils: mergeEdgeStyles(props, settings, data)
 *   Utils-->>UI: 병합된 스타일 객체
 *   UI->>UI: 엣지 스타일 적용 및 렌더링
 * ```
 */ 