/**
 * 파일명: useIdeaMapHandlers.test.tsx
 * 목적: 아이디어맵 핸들러 훅의 기능 테스트
 * 역할: 선택, 드래그 앤 드롭, 카드 생성 핸들러 테스트
 * 작성일: 2025-03-28
 * 수정일: 2025-04-11
 */

import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { Node, Edge } from '@xyflow/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { useAppStore } from '@/store/useAppStore';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import {
  createTestNode,
  createDragEvent,
  createMouseEvent,
  mockReactFlow
} from '@/tests/test-utils';

import { useIdeaMapHandlers } from './useIdeaMapHandlers';
import { CardData } from '../types/ideamap-types';

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

// useIdeaMapStore 모킹
const mockAddNodeAtPosition = vi.fn().mockResolvedValue({ id: 'new-node', data: { title: '새 노드' } });
const mockAddCardAtCenterPosition = vi.fn().mockResolvedValue({ id: 'new-card', data: { title: '새 카드' } });
const mockCreateEdgeAndNodeOnDrop = vi.fn().mockResolvedValue({ id: 'edge-node', data: { title: '연결 노드' } });

vi.mock('@/store/useIdeaMapStore', () => ({
  useIdeaMapStore: vi.fn((selector) => {
    const state = {
      addNodeAtPosition: mockAddNodeAtPosition,
      addCardAtCenterPosition: mockAddCardAtCenterPosition,
      createEdgeAndNodeOnDrop: mockCreateEdgeAndNodeOnDrop,
    };
    return selector ? selector(state) : state;
  }),
}));

describe('useIdeaMapHandlers', () => {
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
    reactFlowWrapper: { current: divElement } as React.RefObject<HTMLDivElement>,
    reactFlowInstance: mockReactFlow,
    fetchCards: vi.fn().mockResolvedValue({ nodes: [], edges: [] }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // setTimeout 모킹
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('선택 핸들러', () => {
    it('노드가 선택되면 선택된 카드 ID를 업데이트한다', () => {
      const { result } = renderHook(() => useIdeaMapHandlers(mockProps));

      act(() => {
        result.current.handleSelectionChange({ nodes: [testNodes[0]], edges: [] });
      });

      expect(mockSelectCards).toHaveBeenCalledWith(['card1']);
    });

    it('여러 노드가 선택되면 모든 선택된 카드 ID를 업데이트한다', () => {
      const { result } = renderHook(() => useIdeaMapHandlers(mockProps));

      act(() => {
        result.current.handleSelectionChange({ nodes: testNodes, edges: [] });
      });

      expect(mockSelectCards).toHaveBeenCalledWith(['card1', 'card2']);
    });

    it('선택이 해제되면 빈 배열로 업데이트한다', () => {
      const { result } = renderHook(() => useIdeaMapHandlers(mockProps));

      act(() => {
        result.current.handleSelectionChange({ nodes: [], edges: [] });
      });

      expect(mockSelectCards).toHaveBeenCalledWith([]);
    });
  });

  describe('드래그 앤 드롭 핸들러', () => {
    it('드래그 오버 시 기본 동작을 방지한다', () => {
      const { result } = renderHook(() => useIdeaMapHandlers(mockProps));
      const mockEvent = createDragEvent();

      act(() => {
        result.current.onDragOver(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.dataTransfer.dropEffect).toBe('move');
    });

    it('유효한 카드 데이터를 드롭하면 addNodeAtPosition 액션을 호출한다', async () => {
      const { result } = renderHook(() => useIdeaMapHandlers(mockProps));
      const cardData = { id: 'new-card', title: '새 카드', content: '내용' };
      const mockEvent = createDragEvent(cardData);

      await act(async () => {
        await result.current.onDrop(mockEvent);
      });

      expect(mockAddNodeAtPosition).toHaveBeenCalledWith('card', expect.any(Object), cardData);
    });

    it('ReactFlow 래퍼가 없으면 addNodeAtPosition 액션을 호출하지 않는다', async () => {
      const { result } = renderHook(() => useIdeaMapHandlers({
        ...mockProps,
        reactFlowWrapper: { current: null } as any
      }));

      const cardData = { id: 'new-card' };
      const mockEvent = createDragEvent(cardData);

      await act(async () => {
        await result.current.onDrop(mockEvent);
      });

      expect(mockAddNodeAtPosition).not.toHaveBeenCalled();
    });
  });

  describe('카드 생성 핸들러', () => {
    it('새 카드를 생성하면 addCardAtCenterPosition 액션을 호출한다', async () => {
      const { result } = renderHook(() => useIdeaMapHandlers(mockProps));
      const cardData = { id: 'new-card', title: '새 카드', content: '내용' };

      await act(async () => {
        await result.current.handleCardCreated(cardData);
      });

      expect(mockAddCardAtCenterPosition).toHaveBeenCalledWith(cardData);
    });

    it('엣지 드롭 시 createEdgeAndNodeOnDrop 액션을 호출한다', async () => {
      const { result } = renderHook(() => useIdeaMapHandlers(mockProps));
      const cardData = { id: 'new-card', title: '새 카드', content: '내용' };
      const position = { x: 200, y: 200 };
      const connectingNodeId = 'node1';
      const handleType = 'target' as const;

      await act(async () => {
        await result.current.handleEdgeDropCardCreated(cardData, position, connectingNodeId, handleType);

        // setTimeout을 빠르게 진행시킴
        vi.advanceTimersByTime(500);
      });

      expect(mockCreateEdgeAndNodeOnDrop).toHaveBeenCalledWith(
        cardData,
        position,
        connectingNodeId,
        handleType
      );
      expect(mockProps.fetchCards).toHaveBeenCalled();
    });
  });
}); 