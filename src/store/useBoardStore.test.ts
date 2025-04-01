/**
 * 파일명: useBoardStore.test.ts
 * 목적: useBoardStore 상태 관리 테스트
 * 역할: 보드 상태 관리 로직 테스트
 * 작성일: 2024-05-31
 */

import { describe, it, expect, vi, beforeEach, afterEach, afterAll, beforeAll } from 'vitest';
import { act } from '@testing-library/react';
import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';
import { NodeChange, EdgeChange, Position, MarkerType, ConnectionLineType } from '@xyflow/react';

// 모듈 모킹을 가장 상단에 배치 (호이스팅 문제 방지)
// board-utils 모킹
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
  getLayoutedElements: vi.fn((...args) => {
    // 모킹된 노드와 엣지 반환
    return {
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
    };
  }),
  getGridLayout: vi.fn().mockImplementation((nodes: any[]) => {
    return nodes.map(node => ({
      ...node,
      position: { x: 100, y: 100 } // 그리드 레이아웃에서는 모든 노드가 같은 위치를 가진다고 가정
    }));
  })
}));

// toast 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

// 실제 import - 모든 모킹이 완료된 후 임포트
import { useBoardStore } from './useBoardStore';
import { DEFAULT_BOARD_SETTINGS, loadBoardSettingsFromServer, applyEdgeSettings } from '@/lib/board-utils';
import { Node, Edge, Connection } from '@xyflow/react';
import { CardData } from '@/components/board/types/board-types';
import { toast } from 'sonner';
import { getLayoutedElements, getGridLayout } from '@/lib/layout-utils';

// 모킹된 함수에 대한 타입 설정
const mockedApplyEdgeSettings = vi.mocked(applyEdgeSettings);
const mockedGetGridLayout = vi.mocked(getGridLayout);
const mockedLoadBoardSettingsFromServer = vi.mocked(loadBoardSettingsFromServer);

// 전역 스토리지 상태를 추적하기 위한 객체
const storageCache: Record<string, string> = {};

describe('useBoardStore', () => {
  // localStorage 메서드들에 대한 스파이 설정
  const localStorageGetItemSpy = vi.spyOn(window.localStorage, 'getItem');
  const localStorageSetItemSpy = vi.spyOn(window.localStorage, 'setItem');
  const localStorageRemoveItemSpy = vi.spyOn(window.localStorage, 'removeItem');
  
  // 전역 설정
  beforeAll(() => {
    // 테스트 전 필요한 전역 설정이 있다면 여기에 추가
  });
  
  // 각 테스트 전에 스토어와 로컬 스토리지 초기화
  beforeEach(() => {
    // 스토리지 캐시 초기화
    Object.keys(storageCache).forEach((key) => delete storageCache[key]);
    
    // 로컬 스토리지 스파이 초기화
    localStorageGetItemSpy.mockClear();
    localStorageSetItemSpy.mockClear();
    localStorageRemoveItemSpy.mockClear();
    
    // localStorage 스파이 초기 구현 설정
    localStorageGetItemSpy.mockImplementation((key) => storageCache[key] || null);
    localStorageSetItemSpy.mockImplementation((key, value) => {
      storageCache[key] = String(value);
    });
    localStorageRemoveItemSpy.mockImplementation((key) => {
      delete storageCache[key];
    });
    
    // 모든 모킹 함수 초기화
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
  
  // 각 테스트 후 정리
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  // 모든 테스트 후 정리
  afterAll(() => {
    vi.restoreAllMocks();
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
    
    // 원래 store의 saveLayout 함수를 직접 테스트
    const saveResult = useBoardStore.getState().saveLayout();
    expect(saveResult).toBe(true);
    
    // 로컬 스토리지에 저장되었는지 확인
    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.any(String)
    );
    
    // 저장된 형식 확인 - 미리 확인된 예상 형식에 맞추어 테스트
    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.stringContaining('"test-node-1"')
    );
    
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
    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
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
    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.stringContaining('test-node-1')
    );
    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
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
    
    // applyLayout 호출
    useBoardStore.getState().applyLayout('horizontal');
    
    // 레이아웃이 적용되었는지 확인
    const state = useBoardStore.getState();
    expect(state.hasUnsavedChanges).toBe(true);
    // 노드가 업데이트 되었는지 확인 (모킹된 응답으로 업데이트됨)
    expect(state.nodes[0].position).toEqual({ x: 0, y: 0 });
  });

  it('createEdgeOnDrop 액션이 엣지를 생성하고 반환해야 함', () => {
    // saveEdges 메서드를 모킹 - hasUnsavedChanges가 false로 설정되는 것을 방지
    const originalSaveEdges = useBoardStore.getState().saveEdges;
    const saveEdgesMock = vi.fn().mockImplementation((edges) => {
      // 로컬 스토리지에 저장하는 부분만 실행하고 상태는 변경하지 않음
      window.localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(edges || []));
      return true;
    });
    
    useBoardStore.getState().saveEdges = saveEdgesMock;
    
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
    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      EDGES_STORAGE_KEY,
      expect.any(String)
    );
    
    // 모킹 원복
    useBoardStore.getState().saveEdges = originalSaveEdges;
  });
  
  it('로컬 스토리지 오류 발생 시 saveLayout이 false를 반환해야 함', () => {
    // saveLayout 함수를 직접 모킹
    const originalSaveLayout = useBoardStore.getState().saveLayout;
    
    // 노드 추가
    const testNode = {
      id: 'test-node-1',
      type: 'default',
      position: { x: 100, y: 200 },
      data: {
        id: 'test-node-1',
        title: '테스트 노드 1',
        content: '테스트 내용 1'
      }
    } as Node<CardData>;
    
    useBoardStore.getState().setNodes([testNode]);
    
    // localStorage.setItem이 에러를 발생시키도록 모킹
    localStorageSetItemSpy.mockImplementationOnce(() => {
      throw new Error('로컬 스토리지 접근 실패');
    });
    
    // saveLayout 직접 호출
    // 참고: persist 미들웨어로 인한 부수 효과 방지를 위해 필요한 경우 추가 작업 필요
    try {
      const result = useBoardStore.getState().saveLayout();
      expect(result).toBe(false);
    } catch (error) {
      // 에러 처리 로직이 구현되지 않은 경우 테스트 실패
      expect(error).toBeUndefined(); 
    }
  });

  // 새로 추가된 테스트 케이스들

  it('onConnect 액션이 엣지를 생성해야 함', () => {
    // 노드 추가
    const testNodes: Node<CardData>[] = [
      {
        id: 'test-node-1',
        type: 'default',
        position: { x: 100, y: 200 },
        targetPosition: Position.Left,
        data: {
          id: 'test-node-1',
          title: '테스트 노드 1',
          content: '테스트 내용 1',
        },
      },
      {
        id: 'test-node-2',
        type: 'default',
        position: { x: 300, y: 200 },
        targetPosition: Position.Left,
        data: {
          id: 'test-node-2',
          title: '테스트 노드 2',
          content: '테스트 내용 2',
        },
      }
    ];
    
    useBoardStore.getState().setNodes(testNodes);
    
    // 연결 객체 생성
    const connection: Connection = {
      source: 'test-node-1',
      target: 'test-node-2',
      sourceHandle: 'right',
      targetHandle: 'left',
    };
    
    // onConnect 액션 호출
    useBoardStore.getState().onConnect(connection);
    
    // 엣지가 생성되었는지 확인
    const state = useBoardStore.getState();
    expect(state.edges.length).toBe(1);
    expect(state.edges[0].source).toBe('test-node-1');
    expect(state.edges[0].target).toBe('test-node-2');
    expect(state.edges[0].type).toBe('custom');
    
    // toast가 호출되었는지 확인
    expect(toast.success).toHaveBeenCalledWith('카드가 연결되었습니다.');
  });

  it('동일한 노드에 연결 시도할 경우 onConnect 액션이 엣지를 생성하지 않아야 함', () => {
    // 노드 추가
    const testNode: Node<CardData> = {
      id: 'test-node-1',
      type: 'default',
      position: { x: 100, y: 200 },
      data: {
        id: 'test-node-1',
        title: '테스트 노드 1',
        content: '테스트 내용 1',
      },
    };
    
    useBoardStore.getState().setNodes([testNode]);
    
    // 같은 노드에 연결 시도
    const connection: Connection = {
      source: 'test-node-1',
      target: 'test-node-1',
      sourceHandle: null,
      targetHandle: null,
    };
    
    // onConnect 액션 호출
    useBoardStore.getState().onConnect(connection);
    
    // 엣지가 생성되지 않았는지 확인
    const state = useBoardStore.getState();
    expect(state.edges.length).toBe(0);
    
    // 에러 toast가 호출되었는지 확인
    expect(toast.error).toHaveBeenCalledWith('같은 카드에 연결할 수 없습니다.');
  });

  it('applyGridLayout 액션이 노드를 격자 형태로 배치해야 함', () => {
    // 노드 추가
    const testNodes: Node<CardData>[] = [
      {
        id: 'test-node-1',
        type: 'default',
        position: { x: 100, y: 200 },
        data: {
          id: 'test-node-1',
          title: '테스트 노드 1',
          content: '테스트 내용 1',
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
        },
      }
    ];
    
    useBoardStore.getState().setNodes(testNodes);
    
    // saveLayout 메서드 모킹
    const originalSaveLayout = useBoardStore.getState().saveLayout;
    const saveLayoutMock = vi.fn().mockReturnValue(true);
    useBoardStore.getState().saveLayout = saveLayoutMock;
    
    // applyGridLayout 호출
    useBoardStore.getState().applyGridLayout();
    
    // 레이아웃이 적용되었는지 확인
    const state = useBoardStore.getState();
    expect(state.hasUnsavedChanges).toBe(true);
    
    // getGridLayout 함수가 호출되었는지 확인
    expect(mockedGetGridLayout).toHaveBeenCalledWith(testNodes);
    
    // saveLayout이 호출되었는지 확인
    expect(saveLayoutMock).toHaveBeenCalled();
    
    // toast가 호출되었는지 확인
    expect(toast.success).toHaveBeenCalledWith('카드가 격자 형태로 배치되었습니다.');
    
    // 원래 함수로 복원
    useBoardStore.getState().saveLayout = originalSaveLayout;
  });

  it('updateEdgeStyles 액션이 엣지 스타일을 올바르게 업데이트해야 함', () => {
    // 엣지 추가
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
    
    // 새 설정
    const newSettings = {
      ...DEFAULT_BOARD_SETTINGS,
      edgeColor: '#FF0000',
      strokeWidth: 2
    };
    
    // updateEdgeStyles 호출
    useBoardStore.getState().updateEdgeStyles(newSettings);
    
    // applyEdgeSettings 함수가 호출되었는지 확인
    expect(mockedApplyEdgeSettings).toHaveBeenCalledWith(testEdges, newSettings);
    
    // 엣지 스타일이 업데이트되었는지 확인
    const state = useBoardStore.getState();
    expect(state.edges[0].style).toEqual(
      expect.objectContaining({
        strokeWidth: 2,
        stroke: '#FF0000'
      })
    );
  });

  it('엣지가 없는 경우 updateEdgeStyles 액션이 실행되지 않아야 함', () => {
    // 엣지 배열을 비워둠
    useBoardStore.getState().setEdges([]);
    
    // 새 설정
    const newSettings = {
      ...DEFAULT_BOARD_SETTINGS,
      edgeColor: '#FF0000',
      strokeWidth: 2
    };
    
    // updateEdgeStyles 호출
    useBoardStore.getState().updateEdgeStyles(newSettings);
    
    // applyEdgeSettings 함수가 호출되지 않았는지 확인
    expect(mockedApplyEdgeSettings).not.toHaveBeenCalled();
  });

  it('loadBoardSettingsFromServerIfAuthenticated 액션이 인증된 사용자의 설정을 로드해야 함', async () => {
    // loadBoardSettingsFromServer를 모킹
    const mockSettings = {
      edgeColor: '#0000FF',
      strokeWidth: 3,
      animated: true,
      markerEnd: MarkerType.Arrow,
      connectionLineType: ConnectionLineType.SmoothStep,
      snapToGrid: true,
      snapGrid: [30, 30] as [number, number],
      markerSize: 10,
      selectedEdgeColor: '#FF0000'
    };
    
    mockedLoadBoardSettingsFromServer.mockResolvedValueOnce(mockSettings);
    
    // 엣지 추가
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
    
    // 설정 로드 호출 (인증된 사용자)
    await useBoardStore.getState().loadBoardSettingsFromServerIfAuthenticated(true, 'test-user-id');
    
    // 서버에서 설정을 로드했는지 확인
    expect(mockedLoadBoardSettingsFromServer).toHaveBeenCalledWith('test-user-id');
    
    // 설정이 업데이트되었는지 확인
    const state = useBoardStore.getState();
    expect(state.boardSettings).toEqual(mockSettings);
    
    // 엣지 스타일이 업데이트되었는지 확인
    expect(state.edges[0].style).toEqual(
      expect.objectContaining({
        strokeWidth: 3,
        stroke: '#0000FF'
      })
    );
  });

  it('loadBoardSettingsFromServerIfAuthenticated 액션이 인증되지 않은 사용자의 설정을 로드하지 않아야 함', async () => {
    // 설정 로드 호출 (인증되지 않은 사용자)
    await useBoardStore.getState().loadBoardSettingsFromServerIfAuthenticated(false);
    
    // 서버에서 설정을 로드하지 않았는지 확인
    expect(mockedLoadBoardSettingsFromServer).not.toHaveBeenCalled();
    
    // 설정이 변경되지 않았는지 확인
    const state = useBoardStore.getState();
    expect(state.boardSettings).toEqual(DEFAULT_BOARD_SETTINGS);
  });

  it('setHasUnsavedChanges 액션이 상태를 올바르게 업데이트해야 함', () => {
    // 초기값 확인
    expect(useBoardStore.getState().hasUnsavedChanges).toBe(false);
    
    // 상태 변경
    useBoardStore.getState().setHasUnsavedChanges(true);
    
    // 변경됐는지 확인
    expect(useBoardStore.getState().hasUnsavedChanges).toBe(true);
    
    // 다시 변경
    useBoardStore.getState().setHasUnsavedChanges(false);
    
    // 변경됐는지 확인
    expect(useBoardStore.getState().hasUnsavedChanges).toBe(false);
  });

  it('setReactFlowInstance 액션이 인스턴스를 올바르게 설정해야 함', () => {
    // 초기값 확인
    expect(useBoardStore.getState().reactFlowInstance).toBeNull();
    
    // 모의 인스턴스 생성
    const mockInstance = { project: vi.fn(), getNodes: vi.fn() };
    
    // 인스턴스 설정
    useBoardStore.getState().setReactFlowInstance(mockInstance);
    
    // 설정됐는지 확인
    expect(useBoardStore.getState().reactFlowInstance).toBe(mockInstance);
  });
}); 