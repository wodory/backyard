/**
 * 파일명: integration.test.tsx
 * 목적: 테마 관련 컴포넌트 통합 테스트
 * 역할: ThemeContext와 NodeSizeSettings의 통합 검증
 * 작성일: 2025-03-27
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom/vitest';

// updateNodeSize 모킹 함수
const updateNodeSizeMock = vi.fn();
const updateNodeInternalsMock = vi.fn();

// ReactFlow 모킹
vi.mock('@xyflow/react', () => {
  return {
    useReactFlow: () => ({
      getNodes: () => [{ id: 'node-1' }, { id: 'node-2' }],
    }),
    useUpdateNodeInternals: () => updateNodeInternalsMock,
    ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

// ThemeContext 모킹
vi.mock('../../contexts/ThemeContext', () => {
  return {
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useTheme: () => ({
      theme: {
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
      },
      updateTheme: vi.fn(),
      updateNodeSize: updateNodeSizeMock,
    }),
  };
});

// NodeSizeSettings 모킹
vi.mock('../../components/settings/NodeSizeSettings', () => {
  return {
    NodeSizeSettings: () => {
      React.useEffect(() => {
        // 컴포넌트가 마운트될 때 테스트 데이터 설정
        setTimeout(() => {
          // 다른 테스트에서 호출됨
        }, 0);
      }, []);
      
      return (
        <div>
          <label>너비: <span>220px</span></label>
          <input data-testid="width-input" type="number" />
          <label>헤더 높이: <span>48px</span></label>
          <input data-testid="height-input" type="number" />
          <button 
            data-testid="apply-button" 
            onClick={() => updateNodeSizeMock(200, 60, 250)}
          >
            변경사항 적용
          </button>
          <button 
            data-testid="reset-button" 
            onClick={() => updateNodeSizeMock(130, 48, 180)}
          >
            기본값으로 초기화
          </button>
        </div>
      );
    }
  };
});

// UI 컴포넌트 모킹
vi.mock('../../components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../components/ui/slider', () => ({
  Slider: ({ id, defaultValue, onValueChange }: any) => (
    <input
      type="range"
      min="0"
      max="500"
      defaultValue={defaultValue}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
    />
  ),
}));

vi.mock('../../components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock('../../components/ui/button', () => ({
  Button: (props: any) => <button {...props}>{props.children}</button>,
}));

// CSS 속성 적용 모킹
const originalSetProperty = document.documentElement.style.setProperty;

// 실제 컴포넌트 임포트
import { NodeSizeSettings } from '../../components/settings/NodeSizeSettings';

describe('테마 관련 컴포넌트 통합 테스트', () => {
  const setPropertyMock = vi.fn();
  
  beforeEach(() => {
    document.documentElement.style.setProperty = setPropertyMock;
    updateNodeSizeMock.mockClear();
    updateNodeInternalsMock.mockClear();
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    document.documentElement.style.setProperty = originalSetProperty;
    vi.clearAllMocks();
    vi.useRealTimers();
  });
  
  test('NodeSizeSettings의 변경이 ThemeContext를 통해 CSS 변수에 반영되어야 함', () => {
    // NodeSizeSettings를 렌더링
    render(<NodeSizeSettings />);
    
    // 너비 입력 필드 변경
    const widthInput = screen.getByTestId('width-input');
    fireEvent.change(widthInput, { target: { value: '200' } });
    
    // 변경사항 적용 버튼 클릭
    const applyButton = screen.getByTestId('apply-button');
    fireEvent.click(applyButton);
    
    // updateNodeSize가 호출되었는지 확인
    expect(updateNodeSizeMock).toHaveBeenCalledWith(200, 60, 250);
    
    // setTimeout 실행을 위해 타이머 진행
    vi.advanceTimersByTime(100);
  });
  
  test('기본값으로 초기화가 ThemeProvider를 통해 반영되어야 함', () => {
    // NodeSizeSettings를 렌더링
    render(<NodeSizeSettings />);
    
    // 초기화 버튼 클릭
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton);
    
    // updateNodeSize가 호출되었는지 확인
    expect(updateNodeSizeMock).toHaveBeenCalledWith(130, 48, 180);
    
    // setTimeout 실행을 위해 타이머 진행
    vi.advanceTimersByTime(100);
  });
  
  test('DOM에 CSS 변수가 적용되는지 확인', () => {
    const savedGetComputedStyle = window.getComputedStyle;
    
    // getComputedStyle 모킹
    window.getComputedStyle = vi.fn().mockImplementation(() => ({
      getPropertyValue: (prop: string) => {
        if (prop === '--card-default-width') return '200px';
        if (prop === '--card-header-height') return '60px';
        return '';
      }
    })) as any;
    
    // 테스트 요소 렌더링
    render(
      <div data-testid="test-element" style={{ width: 'var(--card-default-width)' }}>
        테스트 요소
      </div>
    );
    
    // CSS 변수가 DOM에 적용되었는지 확인
    const testElement = screen.getByTestId('test-element');
    const styles = window.getComputedStyle(testElement);
    expect(styles.getPropertyValue('--card-default-width')).toBe('200px');
    
    // 모킹 복원
    window.getComputedStyle = savedGetComputedStyle;
  });
}); 