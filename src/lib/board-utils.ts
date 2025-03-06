import { Edge, MarkerType, ConnectionLineType } from 'reactflow';
import { BOARD_SETTINGS_KEY } from './board-constants';

export interface BoardSettings {
  snapToGrid: boolean;
  snapGrid: [number, number];
  connectionLineType: ConnectionLineType;
  markerEnd: MarkerType | null;
}

// 기본 보드 설정
export const DEFAULT_BOARD_SETTINGS: BoardSettings = {
  snapToGrid: false,
  snapGrid: [15, 15],
  connectionLineType: ConnectionLineType.SmoothStep,
  markerEnd: MarkerType.Arrow,
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
    
    return JSON.parse(savedSettings);
  } catch (error) {
    console.error('보드 설정 불러오기 실패:', error);
    return DEFAULT_BOARD_SETTINGS;
  }
}

/**
 * 보드 설정을 로컬 스토리지에 저장하는 함수
 */
export function saveBoardSettings(settings: BoardSettings): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(BOARD_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('보드 설정 저장 실패:', error);
  }
}

/**
 * 보드 설정에 따라 엣지 스타일을 적용하는 함수
 */
export function applyEdgeSettings(edges: Edge[], settings: BoardSettings): Edge[] {
  return edges.map(edge => ({
    ...edge,
    type: settings.connectionLineType,
    markerEnd: settings.markerEnd ? {
      type: settings.markerEnd,
      width: 20,
      height: 20,
    } : undefined,
  }));
} 