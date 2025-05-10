/**
 * 파일명: src/lib/ideamap-utils.ts
 * 목적: 아이디어맵 관련 유틸리티 함수 모음
 * 역할: 아이디어맵 설정 관리 및 스타일 적용 유틸리티 제공
 * 작성일: 2024-05-22
 * 수정일: 2024-05-29 : API URL 환경 변수를 사용하도록 수정
 * 수정일: 2025-04-21 : uiOptions.json 구조 변경에 맞게 DEFAULT_SETTINGS 수정
 * 수정일: 2025-04-21 : lint 에러 수정 - snapGrid 타입 단언 추가
 * 수정일: 2025-04-21 : 가독성 개선을 위한 상수 추출
 * 수정일: 2025-04-21 : 엣지 설정 적용 로직 개선 및 우선순위 명확화
 * 수정일: 2025-04-21 : 스타일 우선순위 처리를 위한 유틸리티 함수 추가
 * 수정일: 2025-04-21 : lint 에러 수정 - CSSProperties 타입 임포트 및 타입 오류 수정
 * 수정일: 2025-04-21 : 마커 타입 관련 에러 해결을 위해 any 타입 사용
 * 수정일: 2025-04-21 : 진단용 로그 추가 및 createLogger import
 */

import { Edge, MarkerType, ConnectionLineType, EdgeProps, EdgeMarker } from '@xyflow/react';
import { CSSProperties } from 'react';

import defaultConfig from '@/config/uiOptions.json';
import { SETTINGS_STORAGE_KEY } from './ideamap-constants';
import createLogger from './logger';

// API URL 가져오기
const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  return apiUrl;
};

// 로거 생성
const logger = createLogger('ideamap-utils');

// 설정 상수 정의 - 가독성 개선
const ideamapSettings = defaultConfig.DEFAULT_SETTINGS.ideamap;

export interface Settings {
  // 그리드 설정
  snapToGrid: boolean;
  snapGrid: [number, number];
  
  // 연결선 설정
  connectionLineType: ConnectionLineType;
  markerEnd: MarkerType | null;
  strokeWidth: number;
  markerSize: number;
  edgeColor: string;
  selectedEdgeColor: string;
  animated: boolean;
}

// 기본 설정 - uiOptions.json에서 가져옴
export const DEFAULT_SETTINGS: Settings = {
  // 그리드 설정
  snapToGrid: ideamapSettings.snapToGrid,
  snapGrid: ideamapSettings.snapGrid as [number, number],
  
  // 연결선 설정
  connectionLineType: ideamapSettings.edge.connectionLineType as ConnectionLineType,
  markerEnd: ideamapSettings.edge.markerEnd as MarkerType,
  strokeWidth: ideamapSettings.edge.strokeWidth,
  markerSize: ideamapSettings.edge.markerSize,
  edgeColor: ideamapSettings.edge.edgeColor,
  selectedEdgeColor: ideamapSettings.edge.selectedEdgeColor,
  animated: ideamapSettings.edge.animated,
};

/**
 * 로컬 스토리지에서 설정을 불러오는 함수
 */
export function loadSettings(): Settings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    
    if (!savedSettings) {
      return DEFAULT_SETTINGS;
    }

    // 저장된 설정 복원
    const parsedSettings = JSON.parse(savedSettings);
    
    // 기존 설정이 없는 경우 기본값으로 통합
    return {
      ...DEFAULT_SETTINGS,
      ...parsedSettings,
    };
  } catch (error) {
    console.error('설정 로드 중 오류:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * 설정을 로컬 스토리지에 저장하는 함수
 */
export function saveSettings(settings: Settings): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('설정 저장 중 오류:', error);
    }
  }
}

/**
 * 서버 API를 통해 설정을 저장하는 함수
 */
export const saveSettingsToServer = async (settings: Settings, userId: string): Promise<boolean> => {
  try {
    if (!userId) {
      console.warn('[saveSettingsToServer] 사용자 ID 없음, 설정 저장 스킵');
      return false;
    }

    console.log('[saveSettingsToServer] 서버에 설정 저장 시작', { settings, userId });
    
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ settings, userId }),
    });

    if (!response.ok) {
      throw new Error('서버에 설정을 저장하는데 실패했습니다.');
    }

    // 로컬에도 저장
    saveSettings(settings);
    return true;
  } catch (error) {
    console.error('서버 설정 저장 중 오류:', error);
    return false;
  }
}

/**
 * 서버 API를 통해 설정을 불러오는 함수
 */
export const loadSettingsFromServer = async (userId: string): Promise<Settings | null> => {
  try {
    if (!userId) {
      console.warn('[loadSettingsFromServer] 사용자 ID 없음, 설정 로드 스킵');
      return null;
    }

    console.log('[loadSettingsFromServer] 서버에서 설정 로드 시작', { userId });
    
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/settings?userId=${encodeURIComponent(userId)}`);
    
    if (!response.ok) {
      throw new Error('서버에서 설정을 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    
    if (!data.settings) {
      // 낙관적 업데이트 구현 후, 기본값을 로컬 스토리지에 저장하고 바로 DB에도 저장하는 로직 구현 (추가 예정)
      // TODO: 처음 사용자의 경우 기본 설정값을 바로 DB에 저장하여 이후 요청 시 불필요한 처리 방지
      return null; // 설정이 없는 경우
    }

    const settings = {
      ...DEFAULT_SETTINGS,
      ...data.settings,
    };

    // 로컬에도 저장
    saveSettings(settings);
    return settings;
  } catch (error) {
    console.error('서버 설정 로드 중 오류:', error);
    return null;
  }
}

/**
 * 서버 API를 통해 설정을 부분 업데이트하는 함수
 */
export async function updateSettingsOnServer(userId: string, partialSettings: Partial<Settings>): Promise<boolean> {
  try {
    // 요청 데이터 깊은 복사 및 문자열 변환 확인
    // markerEnd 값이 null인 경우 명시적으로 null로 처리
    const safeSettings = JSON.parse(JSON.stringify(partialSettings));
    
    console.log('설정 업데이트 요청:', {
      userId,
      settings: safeSettings
    });
    
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        settings: safeSettings,
      }),
    });

    // 응답 정보 로깅
    console.log('응답 상태:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '응답 파싱 실패' }));
      console.error('응답 오류 데이터:', errorData);
      throw new Error(
        errorData.details || errorData.error || '설정을 부분 업데이트하는 데 실패했습니다.'
      );
    }

    // 성공적인 응답 처리
    const responseData = await response.json();
    console.log('업데이트 성공 응답:', responseData);

    // 로컬 설정도 업데이트 (기존 설정과 병합)
    const currentSettings = loadSettings();
    const updatedSettings = {
      ...currentSettings,
      ...safeSettings,
    };
    
    // 로컬 스토리지에 저장
    saveSettings(updatedSettings);
    console.log('로컬 설정 업데이트 완료:', updatedSettings);
    
    return true;
  } catch (error) {
    console.error('서버 설정 부분 업데이트 중 오류:', error);
    // 로컬 저장소에만 저장 (서버 저장 실패시 임시 대안)
    try {
      const currentSettings = loadSettings();
      saveSettings({
        ...currentSettings,
        ...partialSettings,
      });
      console.log('서버 저장 실패, 로컬에만 저장됨');
    } catch (localError) {
      console.error('로컬 설정 저장 중 오류:', localError);
    }
    return false;
  }
}

/**
 * applyStylePriority - 스타일 우선순위에 따라 속성값을 결정하는 유틸리티 함수
 * 
 * @param baseProp - ReactFlow에서 전달되는 기본 속성 (props)
 * @param globalSettings - 사용자 설정값 (TanStack Query의 useIdeaMapSettings에서 가져옴)
 * @param individualSettings - 개별 요소 설정값 (개별 노드/엣지 데이터에서 추출)
 * @param defaultValue - 기본값 (속성이 없을 경우 사용할 값)
 * @returns 우선순위에 따라 결정된 속성값
 * 
 * 우선순위: 개별값 > 사용자 설정값 > props > 기본값
 */
export function applyStylePriority<T>(
  baseProp: T | undefined,
  globalSettings: T | undefined,
  individualSettings: T | undefined,
  defaultValue: T
): T {
  // undefined 체크를 통해 null값은 유효한 설정으로 간주
  if (individualSettings !== undefined) return individualSettings;
  if (globalSettings !== undefined) return globalSettings;
  if (baseProp !== undefined) return baseProp;
  return defaultValue;
}

/**
 * mergeEdgeStyles - 엣지 스타일을 우선순위에 따라 병합하는 함수
 * 
 * @param props - ReactFlow에서 전달된 엣지 속성
 * @param globalSettings - 사용자 설정값 (TanStack Query에서 가져온 전역 설정)
 * @param data - 엣지에 저장된 사용자 정의 데이터 (개별 설정 포함)
 * @returns 병합된 스타일 객체와 효과적인 설정값들
 */
export function mergeEdgeStyles(
  props: EdgeProps,
  globalSettings: { edge: Record<string, any> },
  data?: { settings?: Record<string, any> }
): {
  edgeStyle: CSSProperties;
  effectiveEdgeType: ConnectionLineType;
  isAnimated: boolean;
  markerEndType: MarkerType | null;
  markerSize: number;
} {
  // 개별 엣지 설정 (아직 미구현 - 향후 확장 가능)
  const individualSettings = data?.settings || {};
  
  // 선택 상태
  const selected = props.selected;

  // 엣지 타입 결정 - props.data.edgeType 사용
  const propsEdgeType = props.data?.edgeType as ConnectionLineType | undefined;
  
  const effectiveEdgeType = applyStylePriority<ConnectionLineType>(
    propsEdgeType,
    globalSettings.edge.connectionLineType as ConnectionLineType,
    individualSettings.connectionLineType as ConnectionLineType,
    ConnectionLineType.Bezier
  );

  // 애니메이션 여부 결정 - 직접 설정값을 확인
  const propsAnimated = props.animated as boolean | undefined;
  const globalAnimated = globalSettings.edge.animated as boolean | undefined; 
  const individualAnimated = individualSettings.animated as boolean | undefined;
  
  // isAnimated 결정 로직 - 우선순위 명확하게 설정
  const isAnimated = individualAnimated !== undefined ? individualAnimated : 
                     globalAnimated !== undefined ? globalAnimated :
                     propsAnimated !== undefined ? propsAnimated : 
                     false;

  // 애니메이션 설정 변경이 있는 경우에만 로깅 (많은 로그 제거)
  const animatedChanged = props.animated !== isAnimated;
  if (animatedChanged) {
    logger.debug('animated 속성 변경 감지:', {
      엣지ID: props.id,
      기존값: props.animated,
      새값: isAnimated
    });
  }
  
  // 마커 타입 결정
  const markerEndType = applyStylePriority<MarkerType | null>(
    (props.markerEnd as any)?.type as MarkerType,
    globalSettings.edge.markerEnd as MarkerType,
    individualSettings.markerEnd as MarkerType,
    null
  );

  // 마커 크기 결정
  const markerSize = applyStylePriority<number>(
    (props.markerEnd as any)?.width as number,
    globalSettings.edge.markerSize,
    individualSettings.markerSize,
    20 // 기본 마커 크기
  );
  
  // 선 두께 결정
  const strokeWidth = applyStylePriority<number>(
    props.style?.strokeWidth as number,
    globalSettings.edge.strokeWidth,
    individualSettings.strokeWidth,
    2
  );
  
  // 색상 결정 (선택 여부에 따라 다름)
  const edgeColor = selected 
    ? applyStylePriority<string>(
        props.style?.stroke as string,
        globalSettings.edge.selectedEdgeColor,
        individualSettings.selectedEdgeColor,
        '#FF0072'
      )
    : applyStylePriority<string>(
        props.style?.stroke as string,
        globalSettings.edge.edgeColor,
        individualSettings.edgeColor,
        '#C1C1C1'
      );
      
  // 최종 스타일 객체 생성
  const edgeStyle: CSSProperties = {
    strokeWidth,
    stroke: edgeColor,
    transition: 'stroke 0.2s, stroke-width 0.2s',
  };

  // 디버깅을 위한 로깅 추가
  logger.debug('엣지 스타일 계산 결과:', {
    엣지ID: props.id,
    선택상태: selected,
    색상: edgeColor,
    선두께: strokeWidth,
    마커타입: markerEndType,
    마커크기: markerSize,
    애니메이션: isAnimated
  });
  
  return {
    edgeStyle,
    effectiveEdgeType,
    isAnimated,
    markerEndType,
    markerSize
  };
}

/**
 * 설정에 따라 엣지 스타일을 적용하는 함수
 * 모든 연결선에 설정이 즉시 반영되도록 함
 * 
 * 설정 우선순위:
 * 개별값 > 사용자 설정값 > props > 기본값
 */
export function applyIdeaMapEdgeSettings(edges: Edge[], settings: { edge: Record<string, any> }): Edge[] {
  // 진단용 로그 추가: 설정 값 확인 (간결하게 수정)
  logger.debug('엣지 스타일 업데이트 시작', {
    엣지수: edges.length,
    애니메이션설정: settings.edge.animated
  });
  
  // 각 엣지에 새 설정을 적용
  const updatedEdges = edges.map(edge => {
    // animated 속성 값을 직접 추출
    const currentAnimated = 'animated' in edge ? edge.animated : false;
    
    // 설정값 (새로운 animated 값) 추출
    const settingsAnimated = settings.edge.animated;
    
    // animated 값이 변경되었는지 확인 (변경된 경우만 로그)
    const animatedChanged = currentAnimated !== settingsAnimated;
    if (animatedChanged) {
      logger.debug(`엣지 ${edge.id}의 animated 속성 변경:`, {
        이전값: currentAnimated,
        새값: settingsAnimated
      });
    }
    
    // ReactFlow props 형태로 변환하여 mergeEdgeStyles에 전달
    // @ts-ignore - 타입 호환성 이슈 제거
    const edgeProps: EdgeProps = {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      style: edge.style,
      selected: edge.selected,
      animated: currentAnimated, // 현재 animated 값 전달
      data: edge.data
    };
    
    // 스타일 병합 유틸리티 사용
    const { edgeStyle, effectiveEdgeType, isAnimated, markerEndType, markerSize } = 
      mergeEdgeStyles(edgeProps, settings, edge.data);
    
    // 업데이트된 엣지 생성
    const updatedEdge: Edge = {
      ...edge,
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'custom',
      // animated 속성은 항상 설정에서 가져온 값으로 설정
      animated: isAnimated,
      style: edgeStyle,
      data: {
        ...edge.data,
        edgeType: effectiveEdgeType,
        settings: {
          ...(edge.data?.settings || {}),
          // 현재 적용된 설정 값들을 data.settings에 저장
          // 이는 CustomEdge가 렌더링 시 이 값들을 참조할 수 있게 함
          animated: isAnimated,
          connectionLineType: effectiveEdgeType,
          edgeColor: settings.edge.edgeColor,
          selectedEdgeColor: settings.edge.selectedEdgeColor,
          strokeWidth: edgeStyle.strokeWidth,
          markerEnd: markerEndType,
          markerSize: markerSize
        }
      }
    };
    
    // 마커 설정 - 타입 호환성 이슈로 임시로 any 타입 사용
    if (markerEndType) {
      // @ts-ignore - 마커 타입 호환성 이슈. 추후 타입 정의 개선 필요
      updatedEdge.markerEnd = {
        type: markerEndType,
        width: markerSize,
        height: markerSize,
        color: edgeStyle.stroke
      };
    } else {
      updatedEdge.markerEnd = undefined;
    }
    
    return updatedEdge;
  });
  
  // 처리 완료된 첫 번째 엣지 확인 (변경사항이 있는 경우만 로그)
  if (updatedEdges.length > 0 && edges.length > 0) {
    const firstOrig = edges[0];
    const firstUpdated = updatedEdges[0];
    
    // 먼저 animated 속성 비교
    const origAnimated = 'animated' in firstOrig ? firstOrig.animated : false;
    const updatedAnimated = firstUpdated.animated;
    
    // 변경이 있는 경우만 로깅
    if (origAnimated !== updatedAnimated) {
      logger.debug('엣지 애니메이션 상태 변경:', {
        엣지ID: firstOrig.id,
        이전값: origAnimated,
        새값: updatedAnimated
      });
    }
  }
  
  return updatedEdges;
} 