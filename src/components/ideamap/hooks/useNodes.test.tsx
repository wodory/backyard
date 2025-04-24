/**
 * 파일명: useNodes.test.tsx
 * 목적: useNodeClickHandlers 커스텀 훅 테스트
 * 역할: 노드 클릭 핸들러 기능의 정상 작동 검증
 * 작성일: 2025-03-28
 * 수정일: 2025-04-11
 * 수정일: 2025-04-21 : 참조 경로 수정 (board-types -> ideamap-types)
 */

import { renderHook, act } from '@testing-library/react';
import { Node } from '@xyflow/react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';


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
  useAppStore: vi.fn(() => ({
    selectedCardIds: ['test-node-1'],
    toggleSelectedCard: toggleSelectedCardMock,
    selectCard: selectCardMock,
    clearSelectedCards: clearSelectedCardsMock,
  }))
}));

// 토스트 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}));

// 실제 컴포넌트 및 유틸리티 임포트 (모킹 후 임포트)
import { mockReactFlow } from '@/tests/utils/react-flow-mock';

import { useNodeClickHandlers } from './useNodes';
import { CardData } from '../types/ideamap-types';

describe('useNodeClickHandlers', () => {
  // 테스트 전 전역 설정
  beforeAll(() => {
    mockReactFlow();
  });

  // 각 테스트 전 초기화
  beforeEach(() => {
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
    const { result } = renderHook(() => useNodeClickHandlers({}));

    expect(typeof result.current.handleNodeClick).toBe('function');
    expect(typeof result.current.handlePaneClick).toBe('function');
  });

  it('노드 클릭 시 handleNodeClick이 selectCard를 호출해야 함', () => {
    const onSelectCardMock = vi.fn();
    const { result } = renderHook(() => useNodeClickHandlers({ onSelectCard: onSelectCardMock }));

    // 테스트 노드 - 아직 선택되지 않은 노드를 사용
    const testNode: Node<CardData> = {
      id: 'test-node-2', // 선택되지 않은 새 노드 ID
      type: 'default',
      position: { x: 100, y: 200 },
      data: {
        id: 'test-node-2',
        title: '테스트 노드 2',
        content: '테스트 내용 2',
        tags: ['tag1', 'tag2'],
      },
    };

    // 테스트 이벤트
    const testEvent = {
      stopPropagation: vi.fn(),
      ctrlKey: false,
      metaKey: false,
      detail: 1 // 단일 클릭
    } as unknown as React.MouseEvent;

    // 노드 클릭 핸들러 호출
    act(() => {
      result.current.handleNodeClick(testEvent, testNode);
    });

    // 이벤트 전파가 중단되었는지 확인
    expect(testEvent.stopPropagation).toHaveBeenCalled();

    // selectCard가 호출되었는지 확인 (새 노드 ID로)
    expect(selectCardMock).toHaveBeenCalledWith('test-node-2');

    // 콜백이 호출되었는지 확인
    expect(onSelectCardMock).toHaveBeenCalledWith('test-node-2');
  });

  it('Ctrl 키와 함께 노드 클릭 시 toggleSelectedCard를 호출해야 함', () => {
    const onSelectCardMock = vi.fn();
    const { result } = renderHook(() => useNodeClickHandlers({ onSelectCard: onSelectCardMock }));

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

    // 테스트 이벤트 (Ctrl 키 사용)
    const testEvent = {
      stopPropagation: vi.fn(),
      ctrlKey: true,
      metaKey: false,
      detail: 1 // 단일 클릭
    } as unknown as React.MouseEvent;

    // 노드 클릭 핸들러 호출
    act(() => {
      result.current.handleNodeClick(testEvent, testNode);
    });

    // toggleSelectedCard가 호출되었는지 확인
    expect(toggleSelectedCardMock).toHaveBeenCalledWith('test-node-1');
  });

  it('노드 더블 클릭 시 onNodeDoubleClick 콜백이 호출되어야 함', () => {
    const onNodeDoubleClickMock = vi.fn();
    const { result } = renderHook(() => useNodeClickHandlers({ onNodeDoubleClick: onNodeDoubleClickMock }));

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

    // 테스트 이벤트 (더블 클릭)
    const testEvent = {
      stopPropagation: vi.fn(),
      ctrlKey: false,
      metaKey: false,
      detail: 2 // 더블 클릭
    } as unknown as React.MouseEvent;

    // 노드 클릭 핸들러 호출
    act(() => {
      result.current.handleNodeClick(testEvent, testNode);
    });

    // onNodeDoubleClick 콜백이 호출되었는지 확인
    expect(onNodeDoubleClickMock).toHaveBeenCalledWith(testNode);

    // 일반 클릭 관련 액션은 호출되지 않아야 함
    expect(selectCardMock).not.toHaveBeenCalled();
    expect(toggleSelectedCardMock).not.toHaveBeenCalled();
  });

  it('handlePaneClick이 clearSelectedCards를 호출해야 함', () => {
    const onSelectCardMock = vi.fn();
    const { result } = renderHook(() => useNodeClickHandlers({ onSelectCard: onSelectCardMock }));

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

  it('Ctrl 키와 함께 패널 클릭 시 clearSelectedCards를 호출하지 않아야 함', () => {
    const { result } = renderHook(() => useNodeClickHandlers({}));

    // 테스트 이벤트 - Ctrl 키와 함께 클릭
    const testEvent = {
      ctrlKey: true,
      metaKey: false,
    } as unknown as React.MouseEvent;

    // 패널 클릭 핸들러 호출
    act(() => {
      result.current.handlePaneClick(testEvent);
    });

    // clearSelectedCards가 호출되지 않아야 함
    expect(clearSelectedCardsMock).not.toHaveBeenCalled();
  });

  it('Mac에서 메타 키와 함께 노드 클릭 시 toggleSelectedCard를 호출해야 함', () => {
    const onSelectCardMock = vi.fn();
    const { result } = renderHook(() => useNodeClickHandlers({ onSelectCard: onSelectCardMock }));

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

    // 테스트 이벤트 (메타키(Mac의 Command) 사용)
    const testEvent = {
      stopPropagation: vi.fn(),
      ctrlKey: false,
      metaKey: true,
      detail: 1 // 단일 클릭
    } as unknown as React.MouseEvent;

    // 노드 클릭 핸들러 호출
    act(() => {
      result.current.handleNodeClick(testEvent, testNode);
    });

    // toggleSelectedCard가 호출되었는지 확인
    expect(toggleSelectedCardMock).toHaveBeenCalledWith('test-node-1');
  });

  it('onNodeDoubleClick이 제공되지 않았을 때 더블 클릭 시 기본 동작만 수행해야 함', () => {
    // onNodeDoubleClick을 제공하지 않음
    const { result } = renderHook(() => useNodeClickHandlers({}));

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

    // 테스트 이벤트 (더블 클릭)
    const testEvent = {
      stopPropagation: vi.fn(),
      ctrlKey: false,
      metaKey: false,
      detail: 2 // 더블 클릭
    } as unknown as React.MouseEvent;

    // 노드 클릭 핸들러 호출
    act(() => {
      result.current.handleNodeClick(testEvent, testNode);
    });

    // 이벤트 전파가 중단되었는지 확인
    expect(testEvent.stopPropagation).toHaveBeenCalled();

    // selectCard와 toggleSelectedCard가 호출되지 않아야 함 (더블 클릭 처리됨)
    expect(selectCardMock).not.toHaveBeenCalled();
    expect(toggleSelectedCardMock).not.toHaveBeenCalled();
  });

  it('패널 클릭 시 onSelectCard가 제공되지 않아도 clearSelectedCards는 호출되어야 함', () => {
    // onSelectCard를 제공하지 않음
    const { result } = renderHook(() => useNodeClickHandlers({}));

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
  });

  it('Mac에서 메타 키와 함께 패널 클릭 시 clearSelectedCards를 호출하지 않아야 함', () => {
    const { result } = renderHook(() => useNodeClickHandlers({}));

    // 테스트 이벤트 - 메타 키(Mac의 Command)와 함께 클릭
    const testEvent = {
      ctrlKey: false,
      metaKey: true,
    } as unknown as React.MouseEvent;

    // 패널 클릭 핸들러 호출
    act(() => {
      result.current.handlePaneClick(testEvent);
    });

    // clearSelectedCards가 호출되지 않아야 함
    expect(clearSelectedCardsMock).not.toHaveBeenCalled();
  });

  it('노드 객체가 undefined인 경우 handleNodeClick은 오류없이 처리되어야 함', () => {
    const onSelectCardMock = vi.fn();
    const { result } = renderHook(() => useNodeClickHandlers({ onSelectCard: onSelectCardMock }));

    // 테스트 이벤트
    const testEvent = {
      stopPropagation: vi.fn(),
      ctrlKey: false,
      metaKey: false,
      detail: 1 // 단일 클릭
    } as unknown as React.MouseEvent;

    // undefined 노드로 노드 클릭 핸들러 호출
    act(() => {
      // @ts-ignore - 의도적으로 잘못된 타입 전달
      result.current.handleNodeClick(testEvent, undefined);
    });

    // 이벤트 전파는 여전히 중단되어야 함
    expect(testEvent.stopPropagation).toHaveBeenCalled();

    // selectCard는 호출되지 않아야 함 (early return으로 인해)
    expect(selectCardMock).not.toHaveBeenCalled();
    expect(toggleSelectedCardMock).not.toHaveBeenCalled();
    expect(onSelectCardMock).not.toHaveBeenCalled();
  });
}); 