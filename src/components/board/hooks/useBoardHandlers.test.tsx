/**
 * 파일명: useBoardHandlers.test.tsx
 * 목적: 보드 핸들러 훅의 기능 테스트
 * 역할: 선택, 드래그 앤 드롭, 카드 생성 핸들러 테스트
 * 작성일: 2025-03-28
 * 수정일: 2025-04-01
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { Node, Edge } from '@xyflow/react';
import { useBoardHandlers } from './useBoardHandlers';
import { CardData } from '../types/board-types';
import { useAppStore } from '@/store/useAppStore';
import {
  createTestNode,
  createDragEvent,
  createMouseEvent,
  mockReactFlow
} from '@/tests/test-utils';

// Zustand 스토어 모킹
const mockSelectCards = vi.fn();
vi.mock('@/store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      selectedCardIds: [],
      selectCards: mockSelectCards,
    };
    return selector ? selector(state) : state;
  }),
}));

describe('useBoardHandlers', () => {
  // 테스트 데이터 준비
  const testNodes = [
    createTestNode('card1'),
    createTestNode('card2'),
  ];

  // HTMLDivElement 생성
  const divElement = document.createElement('div');
  Object.defineProperties(divElement, {
    getBoundingClientRect: {
      value: () => ({
        left: 0,
        top: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600,
      }),
    },
  });

  const mockProps = {
    saveLayout: vi.fn().mockReturnValue(true),
    nodes: testNodes,
    setNodes: vi.fn(),
    reactFlowWrapper: { current: divElement } as React.RefObject<HTMLDivElement>,
    reactFlowInstance: mockReactFlow,
    fetchCards: vi.fn().mockResolvedValue({ nodes: [], edges: [] }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('선택 핸들러', () => {
    it('노드가 선택되면 선택된 카드 ID를 업데이트한다', () => {
      const { result } = renderHook(() => useBoardHandlers(mockProps));

      act(() => {
        result.current.handleSelectionChange({ nodes: [testNodes[0]], edges: [] });
      });

      expect(mockSelectCards).toHaveBeenCalledWith(['card1']);
    });

    it('여러 노드가 선택되면 모든 선택된 카드 ID를 업데이트한다', () => {
      const { result } = renderHook(() => useBoardHandlers(mockProps));

      act(() => {
        result.current.handleSelectionChange({ nodes: testNodes, edges: [] });
      });

      expect(mockSelectCards).toHaveBeenCalledWith(['card1', 'card2']);
    });

    it('선택이 해제되면 빈 배열로 업데이트한다', () => {
      const { result } = renderHook(() => useBoardHandlers(mockProps));

      act(() => {
        result.current.handleSelectionChange({ nodes: [], edges: [] });
      });

      expect(mockSelectCards).toHaveBeenCalledWith([]);
    });
  });

  describe('드래그 앤 드롭 핸들러', () => {
    it('드래그 오버 시 기본 동작을 방지한다', () => {
      const { result } = renderHook(() => useBoardHandlers(mockProps));
      const mockEvent = createDragEvent();

      act(() => {
        result.current.onDragOver(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.dataTransfer.dropEffect).toBe('move');
    });

    it('유효하지 않은 JSON 데이터를 드롭하면 무시한다', () => {
      const { result } = renderHook(() => useBoardHandlers(mockProps));
      const mockEvent = createDragEvent('invalid json');

      act(() => {
        result.current.onDrop(mockEvent);
      });

      expect(mockProps.setNodes).not.toHaveBeenCalled();
    });

    it('드롭된 카드 데이터로 새 노드를 생성한다', () => {
      const { result } = renderHook(() => useBoardHandlers(mockProps));
      const cardData = { id: 'new-card', title: '새 카드', content: '내용' };
      const mockEvent = createDragEvent(cardData);

      act(() => {
        result.current.onDrop(mockEvent);
      });

      expect(mockProps.setNodes).toHaveBeenCalled();
    });
  });

  describe('카드 생성 핸들러', () => {
    it('엣지 드롭 시 새 카드를 생성하고 연결한다', () => {
      const { result } = renderHook(() => useBoardHandlers(mockProps));
      const cardData = { id: 'new-card', title: '새 카드', content: '내용' };
      const position = { x: 200, y: 200 };

      act(() => {
        result.current.handleEdgeDropCardCreated(cardData, position, 'node1', 'target');
      });

      expect(mockProps.setNodes).toHaveBeenCalled();
    });

    it('타겟 핸들 타입이 사용되면 올바르게 연결한다', () => {
      const { result } = renderHook(() => useBoardHandlers(mockProps));
      const cardData = { id: 'new-card', title: '새 카드', content: '내용' };
      const position = { x: 200, y: 200 };

      act(() => {
        result.current.handleEdgeDropCardCreated(cardData, position, 'node1', 'target');
      });

      expect(mockProps.setNodes).toHaveBeenCalled();
    });
  });
}); 