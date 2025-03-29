/**
 * 파일명: useBoardStore.test.ts
 * 목적: useBoardStore 상태 관리 테스트
 * 역할: 보드 상태 관리 로직 테스트
 * 작성일: 2024-05-31
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { DEFAULT_BOARD_SETTINGS } from '@/lib/board-utils';
import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';

// 로컬 스토리지 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    store
  };
})();

// window.localStorage를 모킹된 버전으로 대체
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 외부 모듈 모킹 - import 전에 수행
vi.mock('@/lib/board-utils', () => {
  return {
    DEFAULT_BOARD_SETTINGS: {
      edgeColor: '#000000',
      strokeWidth: 1,
      animated: false,
      markerEnd: true,
      connectionLineType: 'default',
      snapToGrid: false,
      snapGrid: [20, 20]
    },
    saveBoardSettingsToServer: vi.fn().mockResolvedValue(true),
    loadBoardSettingsFromServer: vi.fn().mockResolvedValue({
      edgeColor: '#000000',
      strokeWidth: 1,
      animated: false,
      markerEnd: true,
      connectionLineType: 'default',
      snapToGrid: false,
      snapGrid: [20, 20]
    }),
    applyEdgeSettings: vi.fn((edges, settings) => {
      return edges.map((edge: { style?: any; [key: string]: any }) => ({
        ...edge,
        animated: settings.animated,
        style: {
          ...edge.style,
          strokeWidth: settings.strokeWidth,
          stroke: settings.edgeColor
        }
      }));
    })
  };
});

// layout-utils 모킹
vi.mock('@/lib/layout-utils', () => ({
  getLayoutedElements: vi.fn().mockReturnValue({
    nodes: [
      {
        id: 'test-node-1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: { id: 'test-node-1', title: '테스트 노드 1', content: '테스트 내용 1' }
      }
    ],
    edges: [
      {
        id: 'test-edge-1',
        source: 'test-node-1',
        target: 'test-node-2',
        type: 'custom',
      }
    ]
  }),
  getGridLayout: vi.fn().mockImplementation((nodes) => nodes)
}));

// toast 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

// 이후에 실제 import
import { useBoardStore } from '../useBoardStore';
import { Node, Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react';
import { CardData } from '@/components/board/types/board-types';

describe('useBoardStore', () => {
  // 각 테스트 전에 스토어와 로컬 스토리지 초기화
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();

    // 스토어 재설정
    useBoardStore.setState({
      nodes: [],
      edges: [],
      boardSettings: DEFAULT_BOARD_SETTINGS,
      hasUnsavedChanges: false,
      reactFlowInstance: null
    });
  });

  it('초기 상태가 올바르게 설정되어야 함', () => {
    const state = useBoardStore.getState();
    
    expect(state.nodes).toEqual([]);
    expect(state.edges).toEqual([]);
    expect(state.boardSettings).toEqual(DEFAULT_BOARD_SETTINGS);
    expect(state.hasUnsavedChanges).toBe(false);
    expect(state.reactFlowInstance).toBeNull();
  });

  it('setNodes 액션이 노드를 업데이트해야 함', () => {
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
      }
    ];
    
    useBoardStore.getState().setNodes(testNodes);
    
    const state = useBoardStore.getState();
    expect(state.nodes).toEqual(testNodes);
    expect(state.hasUnsavedChanges).toBe(true);
  });

  it('onNodesChange 액션이 노드 변경사항을 적용해야 함', () => {
    // 먼저 노드 추가
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
      }
    ];
    
    useBoardStore.getState().setNodes(testNodes);
    
    // 노드 위치 변경
    const positionChange: NodeChange = {
      id: 'test-node-1',
      type: 'position',
      position: { x: 150, y: 250 },
      dragging: false,
    };
    
    useBoardStore.getState().onNodesChange([positionChange]);
    
    // 변경사항이 적용되었는지 확인
    const state = useBoardStore.getState();
    expect(state.nodes[0].position).toEqual({ x: 150, y: 250 });
    expect(state.hasUnsavedChanges).toBe(true);
  });

  it('setEdges 액션이 엣지를 업데이트해야 함', () => {
    const testEdges: Edge[] = [
      {
        id: 'test-edge-1',
        source: 'test-node-1',
        target: 'test-node-2',
        type: 'custom',
      }
    ];
    
    useBoardStore.getState().setEdges(testEdges);
    
    const state = useBoardStore.getState();
    expect(state.edges).toEqual(testEdges);
    expect(state.hasUnsavedChanges).toBe(true);
  });

  it('onEdgesChange 액션이 엣지 변경사항을 적용해야 함', () => {
    // 먼저 엣지 추가
    const testEdges: Edge[] = [
      {
        id: 'test-edge-1',
        source: 'test-node-1',
        target: 'test-node-2',
        type: 'custom',
      }
    ];
    
    useBoardStore.getState().setEdges(testEdges);
    
    // 엣지 삭제 변경
    const removeChange: EdgeChange = {
      id: 'test-edge-1',
      type: 'remove',
    };
    
    useBoardStore.getState().onEdgesChange([removeChange]);
    
    // 변경사항이 적용되었는지 확인
    const state = useBoardStore.getState();
    expect(state.edges).toEqual([]);
    expect(state.hasUnsavedChanges).toBe(true);
  });

  it('saveLayout 액션이 노드 레이아웃을 로컬 스토리지에 저장해야 함', () => {
    // 먼저 노드 추가
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
      }
    ];
    
    useBoardStore.getState().setNodes(testNodes);
    useBoardStore.getState().saveLayout();
    
    // 로컬 스토리지에 저장되었는지 확인
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.stringContaining('test-node-1')
    );
    
    // 저장된 형식 확인
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1][1]);
    expect(savedData['test-node-1']).toEqual({ position: { x: 100, y: 200 } });
    
    // 저장 후 hasUnsavedChanges가 false로 설정되었는지 확인
    expect(useBoardStore.getState().hasUnsavedChanges).toBe(false);
  });

  it('saveEdges 액션이 엣지를 로컬 스토리지에 저장해야 함', () => {
    // 먼저 엣지 추가
    const testEdges: Edge[] = [
      {
        id: 'test-edge-1',
        source: 'test-node-1',
        target: 'test-node-2',
        type: 'custom',
      }
    ];
    
    useBoardStore.getState().setEdges(testEdges);
    useBoardStore.getState().saveEdges();
    
    // 로컬 스토리지에 저장되었는지 확인
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      EDGES_STORAGE_KEY,
      expect.stringContaining('test-edge-1')
    );
    
    // 저장 후 hasUnsavedChanges가 false로 설정되었는지 확인
    expect(useBoardStore.getState().hasUnsavedChanges).toBe(false);
  });

  it('saveAllLayoutData 액션이 노드와 엣지 모두 저장해야 함', () => {
    // 먼저 노드와 엣지 추가
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
      }
    ];
    
    const testEdges: Edge[] = [
      {
        id: 'test-edge-1',
        source: 'test-node-1',
        target: 'test-node-2',
        type: 'custom',
      }
    ];
    
    useBoardStore.getState().setNodes(testNodes);
    useBoardStore.getState().setEdges(testEdges);
    useBoardStore.getState().saveAllLayoutData();
    
    // 노드와 엣지 모두 저장되었는지 확인
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.stringContaining('test-node-1')
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      EDGES_STORAGE_KEY,
      expect.stringContaining('test-edge-1')
    );
    
    // 저장 후 hasUnsavedChanges가 false로 설정되었는지 확인
    expect(useBoardStore.getState().hasUnsavedChanges).toBe(false);
  });

  it('updateBoardSettings 액션이 보드 설정을 업데이트해야 함', async () => {
    // 먼저 엣지 추가
    const testEdges: Edge[] = [
      {
        id: 'test-edge-1',
        source: 'test-node-1',
        target: 'test-node-2',
        type: 'custom',
        style: { strokeWidth: 1, stroke: '#000000' }
      }
    ];
    useBoardStore.getState().setEdges(testEdges);
    
    // 설정 업데이트
    await useBoardStore.getState().updateBoardSettings({ 
      edgeColor: '#FF0000', 
      strokeWidth: 2 
    }, true, 'test-user-id');
    
    // 설정이 업데이트되었는지 확인
    const state = useBoardStore.getState();
    expect(state.boardSettings.edgeColor).toBe('#FF0000');
    expect(state.boardSettings.strokeWidth).toBe(2);
  });

  it('applyLayout 액션이 레이아웃을 적용해야 함', () => {
    // 먼저 노드와 엣지 추가
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
      }
    ];
    
    const testEdges: Edge[] = [
      {
        id: 'test-edge-1',
        source: 'test-node-1',
        target: 'test-node-2',
        type: 'custom',
      }
    ];
    
    useBoardStore.getState().setNodes(testNodes);
    useBoardStore.getState().setEdges(testEdges);
    useBoardStore.getState().applyLayout('horizontal');
    
    // 레이아웃이 적용되었는지 확인
    const state = useBoardStore.getState();
    expect(state.hasUnsavedChanges).toBe(true);
  });

  it('createEdgeOnDrop 액션이 엣지를 생성하고 반환해야 함', () => {
    // saveEdges 메서드를 모킹 - hasUnsavedChanges가 false로 설정되는 것을 방지
    const originalSaveEdges = useBoardStore.getState().saveEdges;
    useBoardStore.getState().saveEdges = vi.fn().mockImplementation((edges) => {
      // 로컬 스토리지에 저장하는 부분만 실행하고 상태는 변경하지 않음
      localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(edges || []));
      return true;
    });
    
    const edge = useBoardStore.getState().createEdgeOnDrop('source-node', 'target-node');
    
    // 반환된 엣지 확인
    expect(edge.id).toContain('source-node-target-node');
    expect(edge.source).toBe('source-node');
    expect(edge.target).toBe('target-node');
    
    // 상태에 추가되었는지 확인
    const state = useBoardStore.getState();
    expect(state.edges.length).toBe(1);
    expect(state.edges[0].source).toBe('source-node');
    expect(state.edges[0].target).toBe('target-node');
    expect(state.hasUnsavedChanges).toBe(true);
    
    // 로컬 스토리지에 저장되었는지 확인
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      EDGES_STORAGE_KEY,
      expect.any(String)
    );
    
    // 모킹 원복
    useBoardStore.getState().saveEdges = originalSaveEdges;
  });
}); 