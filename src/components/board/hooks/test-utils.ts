/**
 * 파일명: test-utils.ts
 * 목적: 보드 핸들러 테스트를 위한 유틸리티 함수 및 모킹 객체 제공
 * 역할: 테스트 설정, 정리, 모킹된 액션 제공
 * 작성일: 2024-03-31
 */

import { vi } from 'vitest';
import { Node, Edge, XYPosition } from '@xyflow/react';
import { create } from 'zustand';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// 카드 데이터 타입 정의
export interface CardData extends Record<string, unknown> {
  id: string;
  title: string;
  content: string;
}

// Zustand 스토어 타입 정의
interface AppStore {
  selectedCardIds: string[];
  selectCards: (cardIds: string[]) => void;
}

// 테스트 노드 데이터
const TEST_NODES: Node<CardData>[] = [
  {
    id: 'node1',
    position: { x: 0, y: 0 },
    data: { id: 'card1', title: '카드 1', content: '내용 1' },
    type: 'card',
  },
  {
    id: 'node2',
    position: { x: 100, y: 100 },
    data: { id: 'card2', title: '카드 2', content: '내용 2' },
    type: 'card',
  },
];

// Zustand 스토어 모킹
export const mockStore = create<AppStore>((set) => ({
  selectedCardIds: [],
  selectCards: (cardIds: string[]) => {
    console.log('[AppStore] 카드 선택 변경:', cardIds);
    set({ selectedCardIds: cardIds });
  },
}));

// 모킹된 액션들
export const mockActions = {
  store: {
    saveLayout: vi.fn((nodesToSave?: Node<CardData>[]) => true),
    setNodes: vi.fn((updater: ((nodes: Node<CardData>[]) => Node<CardData>[]) | Node<CardData>[]) => void {}),
    fetchCards: vi.fn(async () => ({ nodes: TEST_NODES, edges: [] })),
  },
  selection: {
    handleSelectionChange: vi.fn(({ nodes }: { nodes: Node[]; edges: Edge[] }) => void {}),
  },
};

/**
 * createTestNodes: 테스트용 노드 생성
 * @returns {Node<CardData>[]} 테스트용 노드 배열
 */
export const createTestNodes = (): Node<CardData>[] => TEST_NODES;

/**
 * createReactFlowWrapper: ReactFlow 래퍼 요소 생성
 * @returns {React.RefObject<HTMLDivElement>} ReactFlow 래퍼 요소의 ref 객체
 */
export const createReactFlowWrapper = () => {
  const div = document.createElement('div');
  div.style.width = '800px';
  div.style.height = '600px';
  return {
    current: div,
  };
};

/**
 * createReactFlowInstance: ReactFlow 인스턴스 생성
 * @returns {Object} 모킹된 ReactFlow 인스턴스
 */
export const createReactFlowInstance = () => ({
  project: vi.fn((position: XYPosition) => position),
  getNode: vi.fn((id: string) => TEST_NODES.find(node => node.id === id)),
  screenToFlowPosition: vi.fn((position: XYPosition) => position),
});

/**
 * setupBoardHandlersTest: 보드 핸들러 테스트를 위한 환경을 설정
 */
export const setupBoardHandlersTest = () => {
  // 모든 모킹된 함수 초기화
  vi.clearAllMocks();

  // React 환경 설정
  vi.mock('react', async () => {
    const actual = await vi.importActual('react');
    return {
      ...actual,
      useSyncExternalStore: vi.fn((subscribe, getSnapshot) => getSnapshot()),
    };
  });

  // Zustand 스토어 모킹
  const mockUseAppStore = vi.fn(() => ({
    selectedCardIds: mockStore.getState().selectedCardIds,
    selectCards: mockStore.getState().selectCards,
  }));

  vi.mock('@/store/useAppStore', () => ({
    useAppStore: mockUseAppStore,
  }));

  // ResizeObserver 모킹 (XYFlow 요구사항)
  global.ResizeObserver = class ResizeObserver {
    callback: globalThis.ResizeObserverCallback;

    constructor(callback: globalThis.ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element) {
      this.callback([{ target } as globalThis.ResizeObserverEntry], this);
    }

    unobserve() {}
    disconnect() {}
  };

  // DOMMatrixReadOnly 모킹 (XYFlow 요구사항)
  class DOMMatrixReadOnlyMock {
    m22: number;
    constructor(transform?: string) {
      const scale = transform?.match(/scale\(([1-9.])\)/)?.[1];
      this.m22 = scale !== undefined ? +scale : 1;
    }
  }
  global.DOMMatrixReadOnly = DOMMatrixReadOnlyMock as any;

  // HTMLElement 프로토타입 확장 (XYFlow 요구사항)
  Object.defineProperties(global.HTMLElement.prototype, {
    offsetHeight: {
      get() { return parseFloat(this.style.height) || 600; },
    },
    offsetWidth: {
      get() { return parseFloat(this.style.width) || 800; },
    },
  });

  // SVGElement getBBox 모킹 (XYFlow 요구사항)
  (global.SVGElement as any).prototype.getBBox = () => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
};

/**
 * teardownBoardHandlersTest: 보드 핸들러 테스트 후 정리 작업 수행
 */
export const teardownBoardHandlersTest = () => {
  vi.clearAllMocks();
  vi.resetModules();
}; 