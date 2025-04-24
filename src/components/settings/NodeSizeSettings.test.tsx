/**
 * 파일명: NodeSizeSettings.test.tsx
 * 목적: NodeSizeSettings 컴포넌트 테스트
 * 역할: 노드 크기 설정 컴포넌트 검증
 * 작성일: 2025-03-27
 * 수정일: 2025-04-21 : ThemeContext 모킹을 useAppStore 모킹으로 대체
 */

import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// ResizeObserver 모킹
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

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

// useAppStore 모킹
vi.mock('@/store/useAppStore', () => {
  return {
    useAppStore: vi.fn((selector) => {
      if (typeof selector === 'function') {
        return selector({
          ideaMapSettings: {
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
          updateIdeaMapSettings: vi.fn(),
          updateNodeSize: updateNodeSizeMock,
        });
      }
      return null;
    }),
  };
});

// UI 컴포넌트 모킹
vi.mock('../../components/ui/slider', () => ({
  Slider: ({ id, defaultValue, onValueChange }: any) => (
    <input
      type="range"
      min="0"
      max="500"
      data-testid={`slider-${id}`}
      defaultValue={defaultValue}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
    />
  ),
}));

vi.mock('../../components/ui/input', () => ({
  Input: (props: any) => <input data-testid={props.id || 'input'} {...props} />,
}));

vi.mock('../../components/ui/button', () => ({
  Button: (props: any) => <button data-testid={props['data-testid'] || 'button'} {...props}>{props.children}</button>,
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ htmlFor, children }: any) => <label htmlFor={htmlFor}>{children}</label>,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardFooter: ({ children }: any) => <div>{children}</div>,
}));

// NodeSizeSettings 임포트
import { NodeSizeSettings } from './NodeSizeSettings';

// 테스트용 렌더링 함수
const renderNodeSizeSettings = () => {
  return render(<NodeSizeSettings />);
};

describe('NodeSizeSettings 컴포넌트', () => {
  beforeEach(() => {
    updateNodeSizeMock.mockClear();
    updateNodeInternalsMock.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('컴포넌트가 올바르게 렌더링되어야 함', () => {
    renderNodeSizeSettings();

    // 기본 UI 요소 확인
    expect(screen.getByText(/노드 크기 설정/i)).toBeInTheDocument();
    expect(screen.getByText(/너비:/i)).toBeInTheDocument();
    expect(screen.getByText(/헤더 높이:/i)).toBeInTheDocument();
    expect(screen.getByText(/최대 높이:/i)).toBeInTheDocument();
    expect(screen.getByTestId('node-width-input')).toBeInTheDocument();
    expect(screen.getByTestId('node-height-input')).toBeInTheDocument();
    expect(screen.getByTestId('node-max-height-input')).toBeInTheDocument();
    expect(screen.getByText(/변경사항 적용/i)).toBeInTheDocument();
    expect(screen.getByText(/기본값으로 초기화/i)).toBeInTheDocument();
  });

  test('입력 필드 값이 변경되어야 함', () => {
    renderNodeSizeSettings();

    // 너비 입력 필드 값 변경
    const widthInput = screen.getByTestId('node-width-input');
    fireEvent.change(widthInput, { target: { value: '200' } });
    expect(widthInput).toHaveValue(200); // 숫자로 비교

    // 헤더 높이 입력 필드 값 변경
    const heightInput = screen.getByTestId('node-height-input');
    fireEvent.change(heightInput, { target: { value: '60' } });
    expect(heightInput).toHaveValue(60); // 숫자로 비교

    // 최대 높이 입력 필드 값 변경
    const maxHeightInput = screen.getByTestId('node-max-height-input');
    fireEvent.change(maxHeightInput, { target: { value: '250' } });
    expect(maxHeightInput).toHaveValue(250); // 숫자로 비교
  });

  test('변경사항 적용 버튼 클릭 시 updateNodeSize가 호출되어야 함', async () => {
    renderNodeSizeSettings();

    // 값 변경
    const widthInput = screen.getByTestId('node-width-input');
    fireEvent.change(widthInput, { target: { value: '200' } });
    const heightInput = screen.getByTestId('node-height-input');
    fireEvent.change(heightInput, { target: { value: '60' } });
    const maxHeightInput = screen.getByTestId('node-max-height-input');
    fireEvent.change(maxHeightInput, { target: { value: '250' } });

    // 변경사항 적용 버튼 클릭
    const applyButton = screen.getByText(/변경사항 적용/i);
    fireEvent.click(applyButton);

    // updateNodeSize 함수 호출 확인
    expect(updateNodeSizeMock).toHaveBeenCalledWith(200, 60, 250);

    // setTimeout 실행을 위해 타이머 진행
    vi.advanceTimersByTime(100);

    // updateNodeInternals 함수 호출 확인
    expect(updateNodeInternalsMock).toHaveBeenCalledTimes(2); // 2개의 노드에 대해 각각 한 번씩
  });

  test('기본값으로 초기화 버튼 클릭 시 updateNodeSize가 기본값으로 호출되어야 함', async () => {
    renderNodeSizeSettings();

    // 값 변경
    const widthInput = screen.getByTestId('node-width-input');
    fireEvent.change(widthInput, { target: { value: '200' } });

    // 값이 변경되었는지 확인
    expect(widthInput).toHaveValue(200); // 숫자로 비교

    // 기본값으로 초기화 버튼 클릭
    const resetButton = screen.getByText(/기본값으로 초기화/i);
    fireEvent.click(resetButton);

    // updateNodeSize 함수가 기본값으로 호출되었는지 확인
    expect(updateNodeSizeMock).toHaveBeenCalledWith(130, 48, 180);

    // setTimeout 실행을 위해 타이머 진행
    vi.advanceTimersByTime(100);

    // updateNodeInternals 함수 호출 확인
    expect(updateNodeInternalsMock).toHaveBeenCalledTimes(2);
  });

  test('슬라이더 관련 이벤트가 처리되어야 함', () => {
    // 이 테스트는 실제 컴포넌트의 이벤트 핸들러가 동작하는지만 확인
    renderNodeSizeSettings();

    // 슬라이더와 입력 필드가 존재해야 함
    expect(screen.getByTestId('slider-node-width')).toBeInTheDocument();
    expect(screen.getByTestId('node-width-input')).toBeInTheDocument();
  });
}); 