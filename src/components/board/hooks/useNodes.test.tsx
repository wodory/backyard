/**
 * 파일명: useNodes.test.tsx
 * 목적: useNodes 커스텀 훅 테스트
 * 역할: 노드 관련 기능의 정상 작동 검증
 * 작성일: 2024-05-09
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Node, NodeChange } from '@xyflow/react';
import { CardData } from '../types/board-types';
import { STORAGE_KEY } from '@/lib/board-constants';

// 모든 모킹은 파일 상단에 배치 (호이스팅 문제 방지)
// React Flow 모킹
vi.mock('@/tests/utils/react-flow-mock', () => ({
  mockReactFlow: vi.fn()
}));

// useAppStore 모킹
const clearSelectedCardsMock = vi.fn();
const selectCardMock = vi.fn();
const toggleSelectedCardMock = vi.fn();

vi.mock('@/store/useAppStore', () => ({
  useAppStore: (selector: ((state: any) => any) | undefined) => {
    const state = {
      selectedCardIds: ['test-node-1'],
      toggleSelectedCard: toggleSelectedCardMock,
      selectCard: selectCardMock,
      clearSelectedCards: clearSelectedCardsMock,
    };
    return selector ? selector(state) : state;
  }
}));

// toast 라이브러리 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  }
}));

// 실제 컴포넌트 및 유틸리티 임포트 (모킹 후 임포트)
import { useNodes } from './useNodes';
import { mockReactFlow } from '@/tests/utils/react-flow-mock';

describe('useNodes', () => {
  // localStorage 메서드들에 대한 스파이 설정
  const localStorageGetItemSpy = vi.spyOn(window.localStorage, 'getItem');
  const localStorageSetItemSpy = vi.spyOn(window.localStorage, 'setItem');
  const localStorageRemoveItemSpy = vi.spyOn(window.localStorage, 'removeItem');

  // 테스트 전 전역 설정
  beforeAll(() => {
    mockReactFlow();
  });

  // 각 테스트 전 초기화
  beforeEach(() => {
    // 로컬 스토리지 모의 구현 초기화
    localStorageGetItemSpy.mockClear();
    localStorageSetItemSpy.mockClear();
    localStorageRemoveItemSpy.mockClear();

    // 모든 모의 함수 초기화
    vi.clearAllMocks();
  });

  // 각 테스트 후 정리
  afterEach(() => {
    vi.resetAllMocks();
  });

  // 모든 테스트 후 정리
  afterAll(() => {
    vi.restoreAllMocks();
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
    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.stringContaining('test-node-1')
    );

    // 저장된 형식 확인
    const savedJson = localStorageSetItemSpy.mock.calls[0][1] as string;
    const savedData = JSON.parse(savedJson);
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

  it('로컬 스토리지 오류 발생 시 saveLayout이 적절히 처리되어야 함', () => {
    // 로컬 스토리지 저장 실패 모의
    localStorageSetItemSpy.mockImplementationOnce(() => {
      throw new Error('로컬 스토리지 접근 실패');
    });

    const { result } = renderHook(() => useNodes({}));

    // 테스트 노드
    const testNode = {
      id: 'test-node-1',
      position: { x: 100, y: 100 },
    } as Node<CardData>;

    // 오류가 발생해도 함수가 정상 완료되고 false를 반환해야 함
    let saveResult: boolean = false;

    act(() => {
      saveResult = result.current.saveLayout([testNode]);
    });

    // 저장 실패를 나타내는 false 반환 확인
    expect(saveResult).toBe(false);
  });
}); 