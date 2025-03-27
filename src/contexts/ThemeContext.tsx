/**
 * 파일명: ThemeContext.tsx
 * 목적: 중앙화된 테마 관리 시스템 구현
 * 역할: React Flow 노드 및 엣지 스타일링을 위한 전역 테마 컨텍스트 제공
 * 작성일: 2024-03-31
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import defaultConfig from '../config/cardBoardUiOptions.json';

export interface NodeTheme {
  width: number;
  height: number;
  maxHeight: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  selectedBorderColor: string;
  font: {
    family: string;
    titleSize: number;
    contentSize: number;
    tagsSize: number;
  };
}

export interface EdgeTheme {
  color: string;
  width: number;
  selectedColor: string;
  animated: boolean;
}

export interface HandleTheme {
  size: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}

export interface LayoutTheme {
  spacing: {
    horizontal: number;
    vertical: number;
  };
  padding: number;
}

export interface Theme {
  node: NodeTheme;
  edge: EdgeTheme;
  handle: HandleTheme;
  layout: LayoutTheme;
}

// 기본 테마 설정 - 기존 JSON 파일의 값 사용
const defaultTheme: Theme = {
  node: {
    width: defaultConfig.layout.nodeSize.width,
    height: defaultConfig.layout.nodeSize.height,
    maxHeight: defaultConfig.layout.nodeSize.maxHeight,
    backgroundColor: defaultConfig.card.backgroundColor,
    borderColor: '#C1C1C1',
    borderWidth: 1,
    borderRadius: defaultConfig.card.borderRadius,
    selectedBorderColor: '#0071e3',
    font: {
      family: 'Pretendard, sans-serif',
      titleSize: defaultConfig.card.fontSizes.title,
      contentSize: defaultConfig.card.fontSizes.content,
      tagsSize: defaultConfig.card.fontSizes.tags,
    }
  },
  edge: {
    color: defaultConfig.board.edgeColor,
    width: defaultConfig.board.strokeWidth,
    selectedColor: defaultConfig.board.selectedEdgeColor,
    animated: defaultConfig.board.animated,
  },
  handle: {
    size: defaultConfig.handles.size,
    backgroundColor: defaultConfig.handles.backgroundColor,
    borderColor: defaultConfig.handles.borderColor,
    borderWidth: defaultConfig.handles.borderWidth,
  },
  layout: {
    spacing: {
      horizontal: defaultConfig.layout.defaultSpacing.horizontal,
      vertical: defaultConfig.layout.defaultSpacing.vertical,
    },
    padding: defaultConfig.layout.defaultPadding,
  },
};

interface ThemeContextType {
  theme: Theme;
  updateTheme: (newTheme: Partial<Theme>) => void;
  updateNodeSize: (width: number, height: number, maxHeight?: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider: 애플리케이션에 테마 컨텍스트를 제공하는 컴포넌트
 * @param {ReactNode} children - 자식 컴포넌트
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  
  // 테마 업데이트 함수
  const updateTheme = (newTheme: Partial<Theme>) => {
    setTheme(prev => {
      // 깊은 병합을 수동으로 구현
      const merged = { ...prev };
      
      if (newTheme.node) merged.node = { ...prev.node, ...newTheme.node };
      if (newTheme.edge) merged.edge = { ...prev.edge, ...newTheme.edge };
      if (newTheme.handle) merged.handle = { ...prev.handle, ...newTheme.handle };
      if (newTheme.layout) merged.layout = { ...prev.layout, ...newTheme.layout };
      
      return merged;
    });
  };
  
  // 노드 크기만 간편하게 업데이트하는 함수
  const updateNodeSize = (width: number, height: number, maxHeight?: number) => {
    const nodeUpdate = { 
      node: {
        ...theme.node,
        width,
        height,
        ...(maxHeight !== undefined ? { maxHeight } : {})
      }
    };
    
    updateTheme(nodeUpdate);
  };
  
  // CSS 변수를 테마와 동기화
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    // 노드 관련 변수
    document.documentElement.style.setProperty('--card-default-width', `${theme.node.width}px`);
    document.documentElement.style.setProperty('--card-header-height', `${theme.node.height}px`);
    document.documentElement.style.setProperty('--card-max-height', `${theme.node.maxHeight}px`);
    document.documentElement.style.setProperty('--card-bg', theme.node.backgroundColor);
    document.documentElement.style.setProperty('--card-radius', `${theme.node.borderRadius}px`);
    
    // 엣지 관련 변수
    document.documentElement.style.setProperty('--edge-color', theme.edge.color);
    document.documentElement.style.setProperty('--edge-width', `${theme.edge.width}px`);
    document.documentElement.style.setProperty('--edge-selected-color', theme.edge.selectedColor);
    
    // 핸들 관련 변수
    document.documentElement.style.setProperty('--handle-size', `${theme.handle.size}px`);
    document.documentElement.style.setProperty('--handle-bg', theme.handle.backgroundColor);
    document.documentElement.style.setProperty('--handle-border', theme.handle.borderColor);
    document.documentElement.style.setProperty('--handle-border-width', `${theme.handle.borderWidth}px`);
    
    // 폰트 크기 변수
    document.documentElement.style.setProperty('--font-size-title', `${theme.node.font.titleSize}px`);
    document.documentElement.style.setProperty('--font-size-content', `${theme.node.font.contentSize}px`);
    document.documentElement.style.setProperty('--font-size-tags', `${theme.node.font.tagsSize}px`);
    
    console.log('테마 변경됨:', theme.node.width, theme.node.height);
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, updateTheme, updateNodeSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme: 테마 컨텍스트에 접근하기 위한 커스텀 훅
 * @returns {ThemeContextType} 테마 컨텍스트 객체
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 