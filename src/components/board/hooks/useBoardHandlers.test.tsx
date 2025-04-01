/**
 * 파일명: useBoardHandlers.test.tsx
 * 목적: useBoardHandlers 훅을 테스트
 * 역할: 보드 이벤트 핸들러 관련 로직 테스트
 * 작성일: 2024-05-11
 */

// 모킹 함수 정의
const mockHandleSelectionChange = vi.fn();
const mockHandleNodeClick = vi.fn();
const mockHandlePaneClick = vi.fn();
const mockSyncZustandToReactFlow = vi.fn();
const mockOnDragOver = vi.fn();
const mockOnDrop = vi.fn();
const mockHandleCardCreated = vi.fn();
const mockHandleEdgeDropCardCreated = vi.fn();

// 하위 모듈 모킹
vi.mock('./useBoardSelectionHandler', () => ({
  useBoardSelectionHandler: vi.fn(() => ({
    handleSelectionChange: mockHandleSelectionChange,
    handleNodeClick: mockHandleNodeClick,
    handlePaneClick: mockHandlePaneClick,
    syncZustandToReactFlow: mockSyncZustandToReactFlow
  }))
}));

vi.mock('./useBoardDragHandler', () => ({
  useBoardDragHandler: vi.fn(() => ({
    onDragOver: mockOnDragOver,
    onDrop: mockOnDrop,
    handleCardCreated: mockHandleCardCreated,
    handleEdgeDropCardCreated: mockHandleEdgeDropCardCreated
  }))
}));

// useAppStore 모킹
vi.mock('@/store/useAppStore', () => ({
  useAppStore: vi.fn()
}));

// 토스트 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBoardHandlers } from './useBoardHandlers';

// React Flow 모킹 함수
const mockReactFlow = () => {
  // ResizeObserver 모킹
  class ResizeObserver {
    callback: any;
    constructor(callback: any) {
      this.callback = callback;
    }
    observe() { }
    unobserve() { }
    disconnect() { }
  }

  // 전역 객체에 할당
  global.ResizeObserver = ResizeObserver as any;

  // Window 이벤트 리스너 모킹
  Object.defineProperty(global, 'window', {
    value: {
      ...global.window,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
    writable: true,
  });
};

// 훅 테스트
describe('useBoardHandlers', () => {
  // 테스트 전 설정
  beforeEach(() => {
    // 모의 함수 초기화
    vi.clearAllMocks();

    // React Flow 모킹 적용
    mockReactFlow();
  });

  // 테스트용 데이터 및 함수 준비
  const setupTest = () => {
    const saveLayout = vi.fn().mockReturnValue(true);
    const setNodes = vi.fn();
    const fetchCards = vi.fn().mockResolvedValue({ nodes: [], edges: [] });

    // 테스트 노드 데이터
    const mockNodes = [
      { id: 'node1', position: { x: 0, y: 0 }, data: { id: 'card1', title: '카드 1', content: '내용 1' } },
      { id: 'node2', position: { x: 100, y: 100 }, data: { id: 'card2', title: '카드 2', content: '내용 2' } },
    ];

    // React Flow wrapper 레퍼런스 모킹
    const reactFlowWrapper = {
      current: {
        getBoundingClientRect: vi.fn().mockReturnValue({
          left: 0,
          top: 0,
          width: 1000,
          height: 800,
        }),
        offsetWidth: 1000,
        offsetHeight: 800,
      },
    } as unknown as React.RefObject<HTMLDivElement>;

    // React Flow 인스턴스 모킹
    const reactFlowInstance = {
      screenToFlowPosition: vi.fn().mockImplementation((pos) => pos),
    };

    // 훅 프로퍼티 반환
    return {
      saveLayout,
      setNodes,
      fetchCards,
      mockNodes,
      reactFlowWrapper,
      reactFlowInstance,
    };
  };

  // 테스트 케이스들
  describe('선택 관련 핸들러', () => {
    it('handleSelectionChange가 useBoardSelectionHandler로부터 핸들러를 가져와야 함', () => {
      // 테스트 데이터 설정
      const { saveLayout, setNodes, fetchCards, mockNodes, reactFlowWrapper, reactFlowInstance } = setupTest();

      // 훅 렌더링
      const { result } = renderHook(() => useBoardHandlers({
        saveLayout,
        nodes: mockNodes as any,
        setNodes,
        reactFlowWrapper,
        reactFlowInstance,
        fetchCards,
      }));

      // 테스트 데이터 - 선택된 노드들
      const selectionData = {
        nodes: [{ id: 'node3' }, { id: 'node4' }] as any,
        edges: [] as any,
      };

      // 핸들러 호출
      act(() => {
        result.current.handleSelectionChange(selectionData);
      });

      // 기대 결과 검증
      expect(mockHandleSelectionChange).toHaveBeenCalledWith(selectionData);
    });

    it('handlePaneClick이 useBoardSelectionHandler로부터 핸들러를 가져와야 함', () => {
      // 테스트 데이터 설정
      const { saveLayout, setNodes, fetchCards, mockNodes, reactFlowWrapper, reactFlowInstance } = setupTest();

      // 훅 렌더링
      const { result } = renderHook(() => useBoardHandlers({
        saveLayout,
        nodes: mockNodes as any,
        setNodes,
        reactFlowWrapper,
        reactFlowInstance,
        fetchCards,
      }));

      // 이벤트 객체
      const event = {} as React.MouseEvent;

      // 핸들러 호출
      act(() => {
        result.current.handlePaneClick(event);
      });

      // 기대 결과 검증
      expect(mockHandlePaneClick).toHaveBeenCalledWith(event);
    });
  });

  describe('드래그 & 드롭 관련 핸들러', () => {
    it('onDragOver가 useBoardDragHandler로부터 핸들러를 가져와야 함', () => {
      // 테스트 데이터 설정
      const { saveLayout, setNodes, fetchCards, mockNodes, reactFlowWrapper, reactFlowInstance } = setupTest();

      // 훅 렌더링
      const { result } = renderHook(() => useBoardHandlers({
        saveLayout,
        nodes: mockNodes as any,
        setNodes,
        reactFlowWrapper,
        reactFlowInstance,
        fetchCards,
      }));

      // 드래그 오버 이벤트 객체 생성
      const event = {} as React.DragEvent;

      // 핸들러 호출
      act(() => {
        result.current.onDragOver(event);
      });

      // 기대 결과 검증
      expect(mockOnDragOver).toHaveBeenCalledWith(event);
    });

    it('onDrop이 useBoardDragHandler로부터 핸들러를 가져와야 함', () => {
      // 테스트 데이터 설정
      const { saveLayout, setNodes, fetchCards, mockNodes, reactFlowWrapper, reactFlowInstance } = setupTest();

      // 훅 렌더링
      const { result } = renderHook(() => useBoardHandlers({
        saveLayout,
        nodes: mockNodes as any,
        setNodes,
        reactFlowWrapper,
        reactFlowInstance,
        fetchCards,
      }));

      // 드롭 이벤트 객체 생성
      const event = {} as React.DragEvent;

      // 핸들러 호출
      act(() => {
        result.current.onDrop(event);
      });

      // 기대 결과 검증
      expect(mockOnDrop).toHaveBeenCalledWith(event);
    });
  });

  describe('카드 생성 관련 핸들러', () => {
    it('handleCardCreated가 useBoardDragHandler로부터 핸들러를 가져와야 함', () => {
      // 테스트 데이터 설정
      const { saveLayout, setNodes, fetchCards, mockNodes, reactFlowWrapper, reactFlowInstance } = setupTest();

      // 훅 렌더링
      const { result } = renderHook(() => useBoardHandlers({
        saveLayout,
        nodes: mockNodes as any,
        setNodes,
        reactFlowWrapper,
        reactFlowInstance,
        fetchCards,
      }));

      // 카드 생성 데이터
      const cardData = { id: 'new-card', title: '새 카드', content: '새 내용' };

      // 핸들러 호출
      act(() => {
        result.current.handleCardCreated(cardData as any);
      });

      // 기대 결과 검증
      expect(mockHandleCardCreated).toHaveBeenCalledWith(cardData);
    });

    it('handleEdgeDropCardCreated가 useBoardDragHandler로부터 핸들러를 가져와야 함', () => {
      // 테스트 데이터 설정
      const { saveLayout, setNodes, fetchCards, mockNodes, reactFlowWrapper, reactFlowInstance } = setupTest();

      // 훅 렌더링
      const { result } = renderHook(() => useBoardHandlers({
        saveLayout,
        nodes: mockNodes as any,
        setNodes,
        reactFlowWrapper,
        reactFlowInstance,
        fetchCards,
      }));

      // 카드 생성 데이터
      const cardData = { id: 'edge-drop-card', title: '엣지 드롭 카드', content: '엣지 드롭 내용' };
      const position = { x: 200, y: 200 };
      const connectingNodeId = 'node1';
      const handleType = 'source' as const;

      // 핸들러 호출
      act(() => {
        result.current.handleEdgeDropCardCreated(cardData as any, position, connectingNodeId, handleType);
      });

      // 기대 결과 검증
      expect(mockHandleEdgeDropCardCreated).toHaveBeenCalledWith(cardData, position, connectingNodeId, handleType);
    });
  });
}); 