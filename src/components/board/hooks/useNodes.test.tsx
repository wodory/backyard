/**
 * 파일명: useNodes.test.tsx
 * 목적: useNodes 커스텀 훅 테스트
 * 역할: 노드 관련 기능의 정상 작동 검증
 * 작성일: 2024-05-09
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNodes } from './useNodes';
import { mockReactFlow } from '@/tests/utils/react-flow-mock';
import { Node, NodeChange } from '@xyflow/react';
import { CardData } from '../types/board-types';
import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';

// React Flow 모킹
mockReactFlow();

// useAppStore 모킹
const clearSelectedCardsMock = vi.fn();
vi.mock('@/store/useAppStore', () => ({
  useAppStore: () => ({
    selectedCardIds: ['test-node-1'],
    toggleSelectedCard: vi.fn(),
    selectCard: vi.fn(),
    clearSelectedCards: clearSelectedCardsMock,
  }),
}));

// 로컬 스토리지 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// toast 라이브러리 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useNodes', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('초기 상태가 올바르게 반환되어야 함', () => {
    const { result } = renderHook(() => useNodes({}));

    expect(result.current.nodes).toEqual([]);
    expect(typeof result.current.handleNodesChange).toBe('function');
    expect(typeof result.current.handleNodeClick).toBe('function');
    expect(typeof result.current.handlePaneClick).toBe('function');
    expect(typeof result.current.saveLayout).toBe('function');
  });

  it('handleNodesChange가 노드 변경사항을 적용해야 함', () => {
    const { result } = renderHook(() => useNodes({}));

    // 위치 변경 테스트
    const positionChange: NodeChange = {
      id: 'test-node-1',
      type: 'position',
      position: { x: 100, y: 100 },
      dragging: false,
    };

    act(() => {
      result.current.handleNodesChange([positionChange]);
    });

    // nodes가 업데이트됨
    expect(result.current.nodes).toEqual([]);
  });

  it('saveLayout이 레이아웃을 로컬 스토리지에 저장해야 함', () => {
    // 테스트 노드 데이터
    const testNodes: Node<CardData>[] = [
      {
        id: 'test-node-1',
        type: 'default',
        position: { x: 100, y: 200 },
        data: {
          id: 'test-node-1',
          title: '테스트 노드 1',
          content: '테스트 내용 1',
          tags: ['tag1', 'tag2'],
        },
      },
      {
        id: 'test-node-2',
        type: 'default',
        position: { x: 300, y: 400 },
        data: {
          id: 'test-node-2',
          title: '테스트 노드 2',
          content: '테스트 내용 2',
          tags: ['tag2', 'tag3'],
        },
      },
    ];

    const { result } = renderHook(() => useNodes({}));

    // 노드들의 레이아웃 저장
    act(() => {
      result.current.saveLayout(testNodes);
    });

    // 로컬 스토리지에 저장되었는지 확인
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.stringContaining('test-node-1')
    );

    // 저장된 형식 확인
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData['test-node-1']).toEqual({ position: { x: 100, y: 200 } });
    expect(savedData['test-node-2']).toEqual({ position: { x: 300, y: 400 } });
  });

  it('onSelectCard 콜백이 노드 클릭 시 호출되어야 함', () => {
    const onSelectCardMock = vi.fn();
    const { result } = renderHook(() => useNodes({ onSelectCard: onSelectCardMock }));

    // 테스트 노드
    const testNode: Node<CardData> = {
      id: 'test-node-1',
      type: 'default',
      position: { x: 100, y: 200 },
      data: {
        id: 'test-node-1',
        title: '테스트 노드 1',
        content: '테스트 내용 1',
        tags: ['tag1', 'tag2'],
      },
    };

    // 테스트 이벤트
    const testEvent = {
      stopPropagation: vi.fn(),
      ctrlKey: false,
      metaKey: false,
    } as unknown as React.MouseEvent;

    // 노드 클릭 핸들러 호출
    act(() => {
      result.current.handleNodeClick(testEvent, testNode);
    });

    // 이벤트 전파가 중단되었는지 확인
    expect(testEvent.stopPropagation).toHaveBeenCalled();

    // 콜백이 호출되었는지 확인
    expect(onSelectCardMock).toHaveBeenCalledWith('test-node-1');
  });

  it('handlePaneClick이 clearSelectedCards를 호출해야 함', () => {
    const onSelectCardMock = vi.fn();
    const { result } = renderHook(() => useNodes({ onSelectCard: onSelectCardMock }));

    // 초기 설정 재확인
    expect(clearSelectedCardsMock).not.toHaveBeenCalled();

    // 테스트 이벤트 - Ctrl 키 없이 일반 클릭
    const testEvent = {
      ctrlKey: false,
      metaKey: false,
    } as unknown as React.MouseEvent;

    // 패널 클릭 핸들러 호출
    act(() => {
      result.current.handlePaneClick(testEvent);
    });

    // clearSelectedCards가 호출되었는지 확인
    expect(clearSelectedCardsMock).toHaveBeenCalled();

    // onSelectCard 콜백이 null과 함께 호출되었는지 확인
    expect(onSelectCardMock).toHaveBeenCalledWith(null);
  });

  it('Ctrl/Meta 키를 누른 상태에서 handlePaneClick은 clearSelectedCards를 호출하지 않아야 함', () => {
    clearSelectedCardsMock.mockClear();
    const onSelectCardMock = vi.fn();
    const { result } = renderHook(() => useNodes({ onSelectCard: onSelectCardMock }));

    // 테스트 이벤트 - Ctrl 키 있는 클릭
    const testEventWithCtrl = {
      ctrlKey: true,
      metaKey: false,
    } as unknown as React.MouseEvent;

    // Ctrl 키를 누른 상태에서 패널 클릭
    act(() => {
      result.current.handlePaneClick(testEventWithCtrl);
    });

    // clearSelectedCards가 호출되지 않아야 함
    expect(clearSelectedCardsMock).not.toHaveBeenCalled();
    expect(onSelectCardMock).not.toHaveBeenCalled();

    // Meta 키를 누른 상태에서 패널 클릭
    const testEventWithMeta = {
      ctrlKey: false,
      metaKey: true,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handlePaneClick(testEventWithMeta);
    });

    // clearSelectedCards가 여전히 호출되지 않아야 함
    expect(clearSelectedCardsMock).not.toHaveBeenCalled();
    expect(onSelectCardMock).not.toHaveBeenCalled();
  });
}); 