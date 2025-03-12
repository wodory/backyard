import { Edge, MarkerType, ConnectionLineType } from '@xyflow/react';
import { BOARD_SETTINGS_KEY } from './board-constants';

export interface BoardSettings {
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

// 기본 보드 설정
export const DEFAULT_BOARD_SETTINGS: BoardSettings = {
  // 그리드 설정
  snapToGrid: false,
  snapGrid: [15, 15],
  
  // 연결선 설정
  connectionLineType: ConnectionLineType.SmoothStep,
  markerEnd: MarkerType.Arrow,
  strokeWidth: 2,
  markerSize: 20,
  edgeColor: '#C1C1C1',
  selectedEdgeColor: '#FF0072',
  animated: false,
};

/**
 * 로컬 스토리지에서 보드 설정을 불러오는 함수
 */
export function loadBoardSettings(): BoardSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_BOARD_SETTINGS;
  }

  try {
    const savedSettings = localStorage.getItem(BOARD_SETTINGS_KEY);
    
    if (!savedSettings) {
      return DEFAULT_BOARD_SETTINGS;
    }

    // 저장된 설정 복원
    const parsedSettings = JSON.parse(savedSettings);
    
    // 기존 설정이 없는 경우 기본값으로 통합
    return {
      ...DEFAULT_BOARD_SETTINGS,
      ...parsedSettings,
    };
  } catch (error) {
    console.error('보드 설정 로드 중 오류:', error);
    return DEFAULT_BOARD_SETTINGS;
  }
}

/**
 * 보드 설정을 로컬 스토리지에 저장하는 함수
 */
export function saveBoardSettings(settings: BoardSettings): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(BOARD_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('보드 설정 저장 중 오류:', error);
    }
  }
}

/**
 * 서버 API를 통해 보드 설정을 저장하는 함수
 */
export async function saveBoardSettingsToServer(userId: string, settings: BoardSettings): Promise<boolean> {
  try {
    const response = await fetch('/api/board-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        settings,
      }),
    });

    if (!response.ok) {
      throw new Error('서버에 보드 설정을 저장하는데 실패했습니다.');
    }

    // 로컬에도 저장
    saveBoardSettings(settings);
    return true;
  } catch (error) {
    console.error('서버 보드 설정 저장 중 오류:', error);
    return false;
  }
}

/**
 * 서버 API를 통해 보드 설정을 불러오는 함수
 */
export async function loadBoardSettingsFromServer(userId: string): Promise<BoardSettings | null> {
  try {
    const response = await fetch(`/api/board-settings?userId=${encodeURIComponent(userId)}`);
    
    if (!response.ok) {
      throw new Error('서버에서 보드 설정을 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    
    if (!data.settings) {
      return null; // 설정이 없는 경우
    }

    const settings = {
      ...DEFAULT_BOARD_SETTINGS,
      ...data.settings,
    };

    // 로컬에도 저장
    saveBoardSettings(settings);
    return settings;
  } catch (error) {
    console.error('서버 보드 설정 로드 중 오류:', error);
    return null;
  }
}

/**
 * 보드 설정에 따라 엣지 스타일을 적용하는 함수
 * 모든 연결선에 설정이 즉시 반영되도록 함
 */
export function applyEdgeSettings(edges: Edge[], settings: BoardSettings): Edge[] {
  // 각 엣지에 새 설정을 적용
  return edges.map(edge => {
    // 기존 속성은 유지하면서 새로운 속성 추가
    const updatedEdge: Edge = {
      ...edge,                             // 기존 속성 유지
      id: edge.id,                         // 엣지 ID 유지
      source: edge.source,                 // 소스 노드 유지
      target: edge.target,                 // 타겟 노드 유지
      type: 'custom',                      // 커스텀 엣지 타입 사용 - 렌더링 컴포넌트 지정
      data: {
        ...(edge.data || {}),              // 기존 데이터 유지
        edgeType: settings.connectionLineType, // 연결선 타입을 data로 전달
        settings: {                        // 설정 정보 추가
          animated: settings.animated,
          connectionLineType: settings.connectionLineType,
          strokeWidth: settings.strokeWidth,
          edgeColor: settings.edgeColor,
          selectedEdgeColor: settings.selectedEdgeColor,
        }
      },
      animated: settings.animated,         // 애니메이션 설정
      
      // 스타일 객체 생성 (기존 스타일 유지하면서 새 설정으로 덮어씀)
      style: {
        ...(edge.style || {}),             // 기존 스타일 유지 (있다면)
        strokeWidth: settings.strokeWidth, // 선 굵기 설정
        stroke: edge.selected ? settings.selectedEdgeColor : settings.edgeColor, // 선 색상
      },
    };

    // 마커 설정 (화살표)
    if (settings.markerEnd) {
      updatedEdge.markerEnd = {
        type: settings.markerEnd,
        width: settings.markerSize,
        height: settings.markerSize,
        color: edge.selected ? settings.selectedEdgeColor : settings.edgeColor,
      };
    } else {
      updatedEdge.markerEnd = undefined;
    }

    return updatedEdge;
  });
} 