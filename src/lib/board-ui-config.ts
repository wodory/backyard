import { MarkerType, ConnectionLineType } from '@xyflow/react';
import defaultConfig from '../config/cardBoardUiOptions.json';

// 카드 보드 UI 설정 타입 정의
export interface BoardUIConfig {
  autoSaveIntervalMinutes: number;
  board: {
    snapToGrid: boolean;
    snapGrid: number[];
    connectionLineType: string;
    markerEnd: string | null;
    strokeWidth: number;
    markerSize: number;
    edgeColor: string;
    animated: boolean;
    selectedEdgeColor: string;
  };
  card: {
    defaultWidth: number;
    backgroundColor: string;
    borderRadius: number;
    tagBackgroundColor: string;
    fontSizes?: {
      default: number;
      title: number;
      content: number;
      tags: number;
    };
  };
  handles: {
    size: number;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  };
  layout: {
    defaultPadding: number;
    defaultSpacing: {
      horizontal: number;
      vertical: number;
    };
    nodeSize?: {
      width: number;
      height: number;
      maxHeight?: number;
    };
    graphSettings?: {
      nodesep: number;
      ranksep: number;
      edgesep: number;
    };
  };
}

// 기본 설정값 (타입 변환 포함)
export const DEFAULT_UI_CONFIG: BoardUIConfig = {
  ...defaultConfig as BoardUIConfig,
  board: {
    ...defaultConfig.board,
    connectionLineType: defaultConfig.board.connectionLineType as ConnectionLineType,
    markerEnd: defaultConfig.board.markerEnd as MarkerType,
    selectedEdgeColor: '#000000',
    snapGrid: defaultConfig.board.snapGrid as number[],
  }
};

/**
 * 기본 설정을 불러오는 함수
 * - 기본값을 불러오지 못할 경우 하드코딩된 대체 기본값을 사용
 */
export function loadDefaultBoardUIConfig(): BoardUIConfig {
  try {
    return DEFAULT_UI_CONFIG;
  } catch (error) {
    console.error('기본 UI 설정을 불러오는데 실패했습니다. 하드코딩된 대체 기본값을 사용합니다:', error);
    
    // 대체 기본값 (하드코딩된 fallback)
    return {
      autoSaveIntervalMinutes: 1,
      board: {
        snapToGrid: false,
        snapGrid: [15, 15],
        connectionLineType: 'bezier' as ConnectionLineType,
        markerEnd: 'arrowclosed' as MarkerType,
        strokeWidth: 2,
        markerSize: 20,
        edgeColor: '#C1C1C1',
        animated: false,
        selectedEdgeColor: '#000000'
      },
      card: {
        defaultWidth: 280,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        tagBackgroundColor: '#F2F2F2'
      },
      handles: {
        size: 10,
        backgroundColor: '#555555',
        borderColor: '#FFFFFF',
        borderWidth: 1
      },
      layout: {
        defaultPadding: 20,
        defaultSpacing: {
          horizontal: 30,
          vertical: 30
        },
        nodeSize: {
          width: 280,
          height: 40
        },
        graphSettings: {
          nodesep: 30,
          ranksep: 30,
          edgesep: 10
        }
      }
    };
  }
}

/**
 * 보드 설정 인터페이스에 필요한 기본값을 추출하는 함수
 */
export function extractBoardSettings(config: BoardUIConfig) {
  return {
    snapToGrid: config.board.snapToGrid,
    snapGrid: config.board.snapGrid,
    connectionLineType: config.board.connectionLineType as ConnectionLineType,
    markerEnd: config.board.markerEnd as MarkerType,
    strokeWidth: config.board.strokeWidth,
    markerSize: config.board.markerSize,
  };
}

/**
 * 레이아웃 설정을 추출하는 함수
 */
export function extractLayoutSettings(config: BoardUIConfig) {
  const layoutConfig = config.layout;
  return {
    defaultPadding: layoutConfig.defaultPadding,
    spacing: layoutConfig.defaultSpacing,
    nodeSize: layoutConfig.nodeSize || { width: 280, height: 40 },
    graphSettings: layoutConfig.graphSettings || {
      nodesep: 30,
      ranksep: 30,
      edgesep: 10
    }
  };
} 