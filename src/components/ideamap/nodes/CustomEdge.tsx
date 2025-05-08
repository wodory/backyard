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
 */

import React, { useMemo } from 'react';
import { BaseEdge, EdgeProps, getBezierPath, getSmoothStepPath, getStraightPath } from '@xyflow/react';

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
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  ...restProps
}: EdgeProps) {
  // TanStack Query를 통해 설정 정보 가져오기
  const { ideaMapSettings, isLoading, isError } = useIdeaMapSettings();

  // 개발 환경에서만 디버깅 로그
  if (process.env.NODE_ENV === 'development') {
    logger.debug('엣지 렌더링', {
      id: restProps.id,
      source: restProps.source,
      target: restProps.target,
      reactflow_current_data: restProps.data?.settings, // 개별 엣지 설정
      globalSettings: ideaMapSettings // 전역 설정(사용자 설정/기본값)
    });
  }

  // 엣지 연결 좌표 계산 (useMemo로 최적화)
  const edgeParams = useMemo(() => ({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  }), [sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition]);

  // 전체 엣지 속성 구성 (mergeEdgeStyles 함수 호출용)
  const fullEdgeProps = useMemo(() => ({
    ...restProps,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition
  }), [restProps, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);

  // 통합 스타일 유틸리티 사용
  const { edgeStyle, effectiveEdgeType, isAnimated } = useMemo(() => {
    if (isLoading || isError || !ideaMapSettings) {
      // 로딩 중이거나 에러 시 기본 스타일 반환
      return {
        edgeStyle: {
          strokeWidth: 2,
          stroke: restProps.selected ? '#FF0072' : '#C1C1C1',
          transition: 'stroke 0.2s, stroke-width 0.2s'
        },
        effectiveEdgeType: 'bezier',
        isAnimated: false,
        markerEndType: null
      };
    }

    // 전체 엣지 속성을 포함하여 스타일 병합 유틸리티 사용
    return mergeEdgeStyles(fullEdgeProps, ideaMapSettings, restProps.data);
  }, [fullEdgeProps, ideaMapSettings, isLoading, isError, restProps.data, restProps.selected]);

  // 엣지 패스 계산 (연결선 타입에 따라)
  const [edgePath] = useMemo(() => {
    // 타입에 따라 적절한 경로 생성 함수 사용
    switch (effectiveEdgeType) {
      case 'straight':
        return getStraightPath(edgeParams);
      case 'step':
        return getSmoothStepPath({
          ...edgeParams,
          borderRadius: 0, // 직각
        });
      case 'smoothstep':
        return getSmoothStepPath({
          ...edgeParams,
          borderRadius: 10, // 부드러운 모서리
        });
      case 'simplebezier':
        return getBezierPath({
          ...edgeParams,
          curvature: 0.25,
        });
      case 'bezier':
      default:
        return getBezierPath(edgeParams);
    }
  }, [effectiveEdgeType, edgeParams]);

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
      animated,
      ...cleanProps
    } = restProps;
    return cleanProps;
  }, [restProps]);

  // 애니메이션 CSS 클래스 결정
  const animatedClassName = useMemo(() => {
    return isAnimated ? 'edge-animated' : '';
  }, [isAnimated]);

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={restProps.markerEnd}
      style={edgeStyle}
      className={animatedClassName}
      data-selected={restProps.selected ? 'true' : 'false'}
      data-component-id={COMPONENT_ID}
      data-animated={isAnimated ? 'true' : 'false'}
      {...cleanProps}
    />
  );
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