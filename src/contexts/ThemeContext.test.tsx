/**
 * 파일명: ThemeContext.test.tsx
 * 목적: ThemeContext 및 ThemeProvider 테스트
 * 역할: 테마 관련 기능 검증
 * 작성일: 2024-04-01
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeContext';

// 기본 테마 세팅 (실제 defaultTheme과 일치)
const defaultTheme = {
  node: {
    width: 220,
    height: 48,
    maxHeight: 180,
    backgroundColor: '#ffffff',
    borderColor: '#C1C1C1',
    borderWidth: 1,
    borderRadius: 8,
    selectedBorderColor: '#0071e3',
    font: {
      family: 'Pretendard, sans-serif',
      titleSize: 14,
      contentSize: 12,
      tagsSize: 10,
    }
  },
  edge: {
    color: '#C1C1C1',
    width: 1,
    selectedColor: '#0071e3',
    animated: false,
  },
  handle: {
    size: 8,
    backgroundColor: '#ffffff',
    borderColor: '#555555',
    borderWidth: 1,
  },
  layout: {
    spacing: {
      horizontal: 30,
      vertical: 30,
    },
    padding: 20,
  },
};

// ResizeObserver 모킹
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// CSS 속성 적용 모킹
const originalSetProperty = document.documentElement.style.setProperty;

describe('ThemeContext', () => {
  const setPropertyMock = vi.fn();
  
  beforeEach(() => {
    document.documentElement.style.setProperty = setPropertyMock;
    setPropertyMock.mockClear();
  });
  
  afterEach(() => {
    document.documentElement.style.setProperty = originalSetProperty;
    vi.clearAllMocks();
  });
  
  test('ThemeProvider가 자식 컴포넌트를 렌더링해야 함', () => {
    const { getByText } = render(
      <ThemeProvider>
        <div>테스트 자식</div>
      </ThemeProvider>
    );
    
    expect(getByText('테스트 자식')).toBeInTheDocument();
  });
  
  test('ThemeProvider가 초기화되면 기본 테마 값이 설정되어야 함', () => {
    render(
      <ThemeProvider>
        <div>자식 컴포넌트</div>
      </ThemeProvider>
    );
    
    // 노드 스타일링에 관한 CSS 변수들이 설정되었는지 확인
    expect(setPropertyMock).toHaveBeenCalledWith('--card-default-width', `${defaultTheme.node.width}px`);
    expect(setPropertyMock).toHaveBeenCalledWith('--card-header-height', `${defaultTheme.node.height}px`);
    expect(setPropertyMock).toHaveBeenCalledWith('--card-max-height', `${defaultTheme.node.maxHeight}px`);
    expect(setPropertyMock).toHaveBeenCalledWith('--card-bg-color', defaultTheme.node.backgroundColor);
    expect(setPropertyMock).toHaveBeenCalledWith('--card-border-color', defaultTheme.node.borderColor);
    expect(setPropertyMock).toHaveBeenCalledWith('--card-border-width', `${defaultTheme.node.borderWidth}px`);
    expect(setPropertyMock).toHaveBeenCalledWith('--card-border-radius', `${defaultTheme.node.borderRadius}px`);
    expect(setPropertyMock).toHaveBeenCalledWith('--card-selected-border-color', defaultTheme.node.selectedBorderColor);
    
    // 엣지 스타일링에 관한 CSS 변수들이 설정되었는지 확인
    expect(setPropertyMock).toHaveBeenCalledWith('--edge-color', defaultTheme.edge.color);
    expect(setPropertyMock).toHaveBeenCalledWith('--edge-width', `${defaultTheme.edge.width}px`);
    expect(setPropertyMock).toHaveBeenCalledWith('--edge-selected-color', defaultTheme.edge.selectedColor);
    
    // 핸들 스타일링에 관한 CSS 변수들이 설정되었는지 확인
    expect(setPropertyMock).toHaveBeenCalledWith('--handle-size', `${defaultTheme.handle.size}px`);
    expect(setPropertyMock).toHaveBeenCalledWith('--handle-bg-color', defaultTheme.handle.backgroundColor);
    expect(setPropertyMock).toHaveBeenCalledWith('--handle-border-color', defaultTheme.handle.borderColor);
    expect(setPropertyMock).toHaveBeenCalledWith('--handle-border-width', `${defaultTheme.handle.borderWidth}px`);
    
    // 폰트 관련 CSS 변수들이 설정되었는지 확인
    expect(setPropertyMock).toHaveBeenCalledWith('--font-family', defaultTheme.node.font.family);
    expect(setPropertyMock).toHaveBeenCalledWith('--font-title-size', `${defaultTheme.node.font.titleSize}px`);
    expect(setPropertyMock).toHaveBeenCalledWith('--font-content-size', `${defaultTheme.node.font.contentSize}px`);
    expect(setPropertyMock).toHaveBeenCalledWith('--font-tags-size', `${defaultTheme.node.font.tagsSize}px`);
    
    // 레이아웃 관련 CSS 변수들이 설정되었는지 확인
    expect(setPropertyMock).toHaveBeenCalledWith('--layout-h-spacing', `${defaultTheme.layout.spacing.horizontal}px`);
    expect(setPropertyMock).toHaveBeenCalledWith('--layout-v-spacing', `${defaultTheme.layout.spacing.vertical}px`);
    expect(setPropertyMock).toHaveBeenCalledWith('--layout-padding', `${defaultTheme.layout.padding}px`);
  });
  
  test('updateNodeSize 함수가 적절히 CSS 변수를 업데이트해야 함', () => {
    // ThemeContext를 사용하는 테스트 컴포넌트
    const TestComponent = () => {
      const { updateNodeSize } = useTheme();
      
      React.useEffect(() => {
        updateNodeSize(300, 60, 240);
      }, [updateNodeSize]);
      
      return <div>테스트 컴포넌트</div>;
    };
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // CSS 변수들이 업데이트되었는지 확인
    expect(setPropertyMock).toHaveBeenCalledWith('--card-default-width', '300px');
    expect(setPropertyMock).toHaveBeenCalledWith('--card-header-height', '60px');
    expect(setPropertyMock).toHaveBeenCalledWith('--card-max-height', '240px');
  });
  
  test('updateTheme 함수가 적절히 테마를 업데이트해야 함', () => {
    // ThemeContext를 사용하는 테스트 컴포넌트
    const TestComponent = () => {
      const { updateTheme } = useTheme();
      
      React.useEffect(() => {
        updateTheme({
          node: {
            ...defaultTheme.node,
            backgroundColor: '#f0f0f0',
            borderColor: '#333333',
          }
        });
      }, [updateTheme]);
      
      return <div>테스트 컴포넌트</div>;
    };
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // CSS 변수들이 업데이트되었는지 확인
    expect(setPropertyMock).toHaveBeenCalledWith('--card-bg-color', '#f0f0f0');
    expect(setPropertyMock).toHaveBeenCalledWith('--card-border-color', '#333333');
  });
}); 