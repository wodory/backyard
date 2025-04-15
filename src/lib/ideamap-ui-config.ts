import { MarkerType, ConnectionLineType } from '@xyflow/react';
import { I } from 'vitest/dist/chunks/reporters.d.CfRkRKN2.js';

import defaultConfig from '../config/uiOptions.json';

// 카드 보드 UI 설정 타입 정의
export interface IdeaMapUIConfig {
  autoSaveIntervalMinutes: number;
  ideaMap: {
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

// CSS 변수에서 값을 가져오는 함수 (클라이언트 사이드에서만 작동)
export function getCssVariable(name: string, fallback: string): string {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }
  return fallback;
}

// CSS 변수에서 숫자 값을 가져오는 함수
export function getCssVariableAsNumber(name: string, fallback: number): number {
  if (typeof window !== 'undefined') {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (value) {
      // px 단위 제거 및 숫자로 변환
      const numericValue = parseFloat(value.replace('px', '').replace('rem', ''));
      return isNaN(numericValue) ? fallback : numericValue;
    }
  }
  return fallback;
}

// 기본 설정값 (타입 변환 포함)
export const DEFAULT_UI_CONFIG: IdeaMapUIConfig = {
  ...defaultConfig as IdeaMapUIConfig,
  ideaMap: {
    ...defaultConfig.ideaMap,
    connectionLineType: defaultConfig.ideaMap.connectionLineType as ConnectionLineType,
    markerEnd: defaultConfig.ideaMap.markerEnd as MarkerType,
    selectedEdgeColor: '#000000',
    snapGrid: defaultConfig.ideaMap.snapGrid as number[],
  }
};

/**
 * 기본 설정을 불러오는 함수
 * - 기본값을 불러오지 못할 경우 하드코딩된 대체 기본값을 사용
 * - CSS 변수가 정의되어 있으면 CSS 변수 값을 우선 사용
 */
export function loadDefaultIdeaMapUIConfig(): IdeaMapUIConfig {
  try {
    const isClient = typeof window !== 'undefined';

    // 기본 설정 가져오기
    const baseConfig = DEFAULT_UI_CONFIG;

    // 클라이언트 사이드에서만 CSS 변수 적용
    if (isClient) {
      return {
        ...baseConfig,
        ideaMap: {
          ...baseConfig.ideaMap,
          edgeColor: getCssVariable('--edge-color', baseConfig.ideaMap.edgeColor),
          selectedEdgeColor: getCssVariable('--edge-selected-color', baseConfig.ideaMap.selectedEdgeColor),
          strokeWidth: getCssVariableAsNumber('--edge-width', baseConfig.ideaMap.strokeWidth),
        },
        card: {
          ...baseConfig.card,
          defaultWidth: getCssVariableAsNumber('--card-default-width', baseConfig.card.defaultWidth),
          backgroundColor: getCssVariable('--card-bg', baseConfig.card.backgroundColor),
          borderRadius: getCssVariableAsNumber('--card-radius', baseConfig.card.borderRadius),
          fontSizes: {
            default: getCssVariableAsNumber('--font-size-title', baseConfig.card.fontSizes?.default || 16),
            title: getCssVariableAsNumber('--font-size-title', baseConfig.card.fontSizes?.title || 16),
            content: getCssVariableAsNumber('--font-size-content', baseConfig.card.fontSizes?.content || 14),
            tags: getCssVariableAsNumber('--font-size-tags', baseConfig.card.fontSizes?.tags || 12),
          }
        },
        handles: {
          ...baseConfig.handles,
          size: getCssVariableAsNumber('--handle-size', baseConfig.handles.size),
          backgroundColor: getCssVariable('--handle-bg', baseConfig.handles.backgroundColor),
          borderColor: getCssVariable('--handle-border', baseConfig.handles.borderColor),
          borderWidth: getCssVariableAsNumber('--handle-border-width', baseConfig.handles.borderWidth),
        },
        layout: {
          ...baseConfig.layout,
          nodeSize: {
            width: getCssVariableAsNumber('--card-default-width', baseConfig.layout.nodeSize?.width || 130),
            height: getCssVariableAsNumber('--card-header-height', baseConfig.layout.nodeSize?.height || 48),
            maxHeight: getCssVariableAsNumber('--card-max-height', baseConfig.layout.nodeSize?.maxHeight || 180),
          }
        }
      };
    }

    return baseConfig;
  } catch (error) {
    console.error('기본 UI 설정을 불러오는데 실패했습니다. 하드코딩된 대체 기본값을 사용합니다:', error);
    
    // 대체 기본값 (하드코딩된 fallback)
    return {
      autoSaveIntervalMinutes: 1,
      ideaMap: {
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
        defaultWidth: 130,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        tagBackgroundColor: '#F2F2F2',
        fontSizes: {
          default: 16,
          title: 16,
          content: 14,
          tags: 12
        }
      },
      handles: {
        size: 10,
        backgroundColor: '#FFFFFF',
        borderColor: '#C1C1C1',
        borderWidth: 2
      },
      layout: {
        defaultPadding: 20,
        defaultSpacing: {
          horizontal: 30,
          vertical: 30
        },
        nodeSize: {
          width: 130,
          height: 48,
          maxHeight: 180
        },
        graphSettings: {
          nodesep: 60,
          ranksep: 60,
          edgesep: 40
        }
      }
    };
  }
}

/**
 * 보드 설정 인터페이스에 필요한 기본값을 추출하는 함수
 */
export function extractIdeaMapSettings(config: IdeaMapUIConfig) {
  return {
    snapToGrid: config.ideaMap.snapToGrid,
    snapGrid: config.ideaMap.snapGrid,
    connectionLineType: config.ideaMap.connectionLineType as ConnectionLineType,
    markerEnd: config.ideaMap.markerEnd as MarkerType,
    strokeWidth: config.ideaMap.strokeWidth,
    markerSize: config.ideaMap.markerSize,
    edgeColor: config.ideaMap.edgeColor,
    selectedEdgeColor: config.ideaMap.selectedEdgeColor,
    animated: config.ideaMap.animated
  };
}

/**
 * 레이아웃 설정을 추출하는 함수
 */
export function extractLayoutSettings(config: IdeaMapUIConfig) {
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