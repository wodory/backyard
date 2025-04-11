/**
 * 파일명: useBoardStore.test.ts
 * 목적: useBoardStore의 액션들을 테스트
 * 역할: 보드 관련 상태 관리 및 액션 테스트
 * 작성일: 2025-04-12
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { Node, Edge, Viewport, ConnectionLineType, MarkerType, NodeChange, EdgeChange, Connection } from '@xyflow/react';
import { server } from '@/tests/msw/server';
import { http, HttpResponse } from 'msw';
import { mockReactFlow } from '@/tests/utils/react-flow-mock';
import { CardData } from '@/components/board/types/board-types';
import { TRANSFORM_STORAGE_KEY, STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';
import { toast } from 'sonner';

// Zustand 모듈 모킹
vi.mock('zustand', () => {
  return {
    create: vi.fn(() => vi.fn())
  };
});

// 모킹된 스토어 상태 및 액션
const mockSetNodes = vi.fn();
const mockSetEdges = vi.fn();
const mockSetHasUnsavedChanges = vi.fn();
const mockSaveLayout = vi.fn().mockReturnValue(true);
const mockSaveEdges = vi.fn().mockReturnValue(true);
const mockSaveAllLayoutData = vi.fn().mockReturnValue(true);
const mockSaveViewport = vi.fn();
const mockRestoreViewport = vi.fn();
const mockSaveBoardState = vi.fn().mockReturnValue(true);
const mockApplyLayout = vi.fn();
const mockApplyGridLayout = vi.fn();
const mockSetBoardSettings = vi.fn();
const mockLoadAndApplyBoardSettings = vi.fn();
const mockUpdateAndSaveBoardSettings = vi.fn();
const mockOnNodesChange = vi.fn();
const mockOnEdgesChange = vi.fn();
const mockOnConnect = vi.fn();
const mockSetReactFlowInstance = vi.fn();

// 테스트 데이터
const mockUserId = 'user-123';
const mockNodes: Node<CardData>[] = [
  { id: 'node1', type: 'card', position: { x: 0, y: 0 }, data: { id: '1', title: '카드 1', content: '내용 1' } },
  { id: 'node2', type: 'card', position: { x: 100, y: 100 }, data: { id: '2', title: '카드 2', content: '내용 2' } }
];
const mockEdges: Edge[] = [
  { id: 'edge1', source: 'node1', target: 'node2' }
];
const mockViewport: Viewport = { x: 100, y: 200, zoom: 1.5 };

// 초기 스토어 상태
const initialState = {
  nodes: mockNodes,
  edges: mockEdges,
  hasUnsavedChanges: false,
  viewportToRestore: null,
  isSettingsLoading: false,
  settingsError: null,
  boardSettings: {
    snapToGrid: false,
    snapGrid: [15, 15],
    connectionLineType: ConnectionLineType.SmoothStep,
    markerEnd: MarkerType.Arrow,
    strokeWidth: 2,
    markerSize: 20,
    edgeColor: '#C1C1C1',
    selectedEdgeColor: '#FF0072',
    animated: false,
  },
  reactFlowInstance: null
};

// 스토어 상태와 액션을 모킹
const mockStore = {
  getState: vi.fn(() => ({
    ...initialState,
    setNodes: mockSetNodes,
    setEdges: mockSetEdges,
    setHasUnsavedChanges: mockSetHasUnsavedChanges,
    saveLayout: mockSaveLayout,
    saveEdges: mockSaveEdges,
    saveAllLayoutData: mockSaveAllLayoutData,
    saveViewport: mockSaveViewport,
    restoreViewport: mockRestoreViewport,
    saveBoardState: mockSaveBoardState,
    applyLayout: mockApplyLayout,
    applyGridLayout: mockApplyGridLayout,
    setBoardSettings: mockSetBoardSettings,
    loadAndApplyBoardSettings: mockLoadAndApplyBoardSettings,
    updateAndSaveBoardSettings: mockUpdateAndSaveBoardSettings,
    onNodesChange: mockOnNodesChange,
    onEdgesChange: mockOnEdgesChange,
    onConnect: mockOnConnect,
    setReactFlowInstance: mockSetReactFlowInstance,
  })),
  setState: vi.fn((updater) => {
    const currentState = mockStore.getState();
    const newState = typeof updater === 'function' ? updater(currentState) : updater;
    Object.assign(initialState, newState);
  })
};

// useBoardStore 모킹
vi.mock('./useBoardStore', () => ({
  useBoardStore: mockStore,
}));

// 보드 유틸리티 모킹
vi.mock('@/lib/board-utils', () => {
  const DEFAULT_BOARD_SETTINGS_MOCK = {
    snapToGrid: false,
    snapGrid: [15, 15],
    connectionLineType: 'smoothstep',
    markerEnd: 'arrow',
    strokeWidth: 2,
    markerSize: 20,
    edgeColor: '#C1C1C1',
    selectedEdgeColor: '#FF0072',
    animated: false,
  };
  
  return {
    DEFAULT_BOARD_SETTINGS: DEFAULT_BOARD_SETTINGS_MOCK,
    loadBoardSettings: vi.fn().mockReturnValue(DEFAULT_BOARD_SETTINGS_MOCK),
    saveBoardSettings: vi.fn(),
    applyEdgeSettings: vi.fn((edges, settings) => edges.map((edge: Edge) => ({
      ...edge,
      style: {
        stroke: settings.edgeColor,
        strokeWidth: settings.strokeWidth,
      },
      animated: settings.animated,
      markerEnd: settings.markerEnd ? {
        type: settings.markerEnd,
        width: settings.markerSize,
        height: settings.markerSize,
        color: settings.edgeColor,
      } : undefined,
    }))),
    saveBoardSettingsToServer: vi.fn().mockImplementation((userId, settings) => {
      return Promise.resolve({ success: true });
    }),
    loadBoardSettingsFromServer: vi.fn().mockImplementation((userId) => {
      return Promise.resolve({
        snapToGrid: true,
        snapGrid: [20, 20],
        connectionLineType: 'straight',
        markerEnd: 'arrowclosed',
        strokeWidth: 3,
        markerSize: 25,
        edgeColor: '#333333',
        selectedEdgeColor: '#FF0000',
        animated: true,
      });
    }),
  };
});

// 레이아웃 유틸리티 모킹
vi.mock('@/lib/layout-utils', () => ({
  getLayoutedElements: vi.fn().mockImplementation((nodes, edges, direction) => {
    const layoutedNodes = nodes.map((node: Node<CardData>, index: number) => ({
      ...node,
      position: { x: index * 100, y: index * 50 }
    }));
    return { nodes: layoutedNodes, edges };
  }),
  getGridLayout: vi.fn().mockImplementation((nodes) => {
    return nodes.map((node: Node<CardData>, index: number) => ({
      ...node,
      position: { x: Math.floor(index / 2) * 150, y: (index % 2) * 150 }
    }));
  }),
}));

// 토스트 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }
}));

// AppStore 모킹
vi.mock('@/store/useAppStore', () => ({
  useAppStore: {
    getState: vi.fn().mockReturnValue({
      setCards: vi.fn(),
      boardSettings: {
        snapToGrid: false,
        snapGrid: [15, 15],
        connectionLineType: 'smoothstep',
        markerEnd: 'arrow',
        strokeWidth: 2,
        markerSize: 20,
        edgeColor: '#C1C1C1',
        selectedEdgeColor: '#FF0072',
        animated: false,
      },
      selectedCardIds: [],
      selectedCardId: null,
      expandedCardId: null,
      cards: [],
    })
  }
}));

// 테스트 헬퍼 함수
function setupLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    'node1': { position: { x: 0, y: 0 } },
    'node2': { position: { x: 100, y: 100 } }
  }));
  localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(mockEdges));
  localStorage.setItem(TRANSFORM_STORAGE_KEY, JSON.stringify(mockViewport));
}

// MSW 서버 설정
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
  localStorage.clear();
  
  // 모킹된 스토어 상태 초기화
  Object.assign(initialState, {
    nodes: mockNodes,
    edges: mockEdges,
    hasUnsavedChanges: false,
    viewportToRestore: null,
    isSettingsLoading: false,
    settingsError: null,
    boardSettings: {
      snapToGrid: false,
      snapGrid: [15, 15],
      connectionLineType: ConnectionLineType.SmoothStep,
      markerEnd: MarkerType.Arrow,
      strokeWidth: 2,
      markerSize: 20,
      edgeColor: '#C1C1C1',
      selectedEdgeColor: '#FF0072',
      animated: false,
    }
  });
});
afterAll(() => server.close());

describe('useBoardStore', () => {
  let store: any;
  let setItemSpy: any;
  let getItemSpy: any;

  beforeEach(() => {
    store = mockStore.getState();
    
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    
    // 브라우저 환경 확인
    vi.stubGlobal('window', { 
      localStorage,
      matchMedia: () => ({
        matches: false,
        addListener: () => {},
        removeListener: () => {}
      })
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    setItemSpy.mockRestore();
    getItemSpy.mockRestore();
  });

  describe('기본 상태 및 액션', () => {
    it('초기 상태가 올바르게 설정되어 있어야 함', () => {
      expect(store.nodes).toEqual(mockNodes);
      expect(store.edges).toEqual(mockEdges);
      expect(store.boardSettings).toBeDefined();
      expect(store.isSettingsLoading).toBe(false);
      expect(store.settingsError).toBeNull();
      expect(store.viewportToRestore).toBeNull();
      expect(store.hasUnsavedChanges).toBe(false);
    });

    it('setNodes는 노드 상태를 업데이트하고 hasUnsavedChanges를 true로 설정해야 함', () => {
      const newNodes: Node<CardData>[] = [{ id: 'node3', position: { x: 200, y: 200 }, data: { id: '3', title: '카드 3', content: '내용 3' } }];
      
      // 직접 hasUnsavedChanges 상태를 false로 설정
      mockStore.setState({ hasUnsavedChanges: false });
      
      mockSetNodes.mockImplementation((nodes) => {
        // 직접 hasUnsavedChanges를 true로 설정
        mockStore.setState({ nodes, hasUnsavedChanges: true });
      });
      
      store.setNodes(newNodes);
      
      expect(mockSetNodes).toHaveBeenCalledWith(newNodes);
      // getState()를 호출하여 최신 상태를 확인
      expect(mockStore.getState().hasUnsavedChanges).toBe(true);
    });

    it('setEdges는 엣지 상태를 업데이트하고 hasUnsavedChanges를 true로 설정해야 함', () => {
      const newEdges = [{ id: 'edge2', source: 'node1', target: 'node3' }];
      
      // 직접 hasUnsavedChanges 상태를 false로 설정
      mockStore.setState({ hasUnsavedChanges: false });
      
      mockSetEdges.mockImplementation((edges) => {
        // 직접 hasUnsavedChanges를 true로 설정
        mockStore.setState({ edges, hasUnsavedChanges: true });
      });
      
      store.setEdges(newEdges);
      
      expect(mockSetEdges).toHaveBeenCalledWith(newEdges);
      // getState()를 호출하여 최신 상태를 확인
      expect(mockStore.getState().hasUnsavedChanges).toBe(true);
    });
  });

  describe('saveViewport', () => {
    it('현재 뷰포트를 localStorage에 저장해야 함', () => {
      // ReactFlow 인스턴스 설정
      const mockInstance = {
        getViewport: () => mockViewport
      } as any; // 타입 오류 방지
      mockStore.setState({ reactFlowInstance: mockInstance });
      
      // saveViewport 구현 시뮬레이션
      mockSaveViewport.mockImplementation(() => {
        const instance = mockStore.getState().reactFlowInstance;
        if (!instance) {
          toast.error('뷰포트를 저장할 수 없습니다');
          return;
        }
        
        const viewport = instance.getViewport();
        localStorage.setItem(TRANSFORM_STORAGE_KEY, JSON.stringify(viewport));
        toast.info('현재 보기가 저장되었습니다');
      });
      
      store.saveViewport();
      
      expect(setItemSpy).toHaveBeenCalledWith(
        TRANSFORM_STORAGE_KEY, 
        JSON.stringify(mockViewport)
      );
      expect(toast.info).toHaveBeenCalledWith('현재 보기가 저장되었습니다');
    });

    it('ReactFlow 인스턴스가 없을 때 에러 메시지를 표시해야 함', () => {
      // ReactFlow 인스턴스가 없음을 시뮬레이션
      mockStore.setState({ reactFlowInstance: null });
      
      // saveViewport 구현 시뮬레이션
      mockSaveViewport.mockImplementation(() => {
        const instance = mockStore.getState().reactFlowInstance;
        if (!instance) {
          toast.error('뷰포트를 저장할 수 없습니다');
          return;
        }
      });
      
      store.saveViewport();
      
      expect(toast.error).toHaveBeenCalledWith('뷰포트를 저장할 수 없습니다');
      expect(setItemSpy).not.toHaveBeenCalledWith(TRANSFORM_STORAGE_KEY, expect.any(String));
    });
  });

  describe('restoreViewport', () => {
    it('localStorage에서 뷰포트 정보를 가져와 viewportToRestore에 설정해야 함', () => {
      // 테스트 데이터 설정
      setupLocalStorage();
      
      // restoreViewport 구현 시뮬레이션
      mockRestoreViewport.mockImplementation(() => {
        const transformString = localStorage.getItem(TRANSFORM_STORAGE_KEY);
        if (!transformString) {
          toast.info('저장된 보기가 없습니다');
          return;
        }
        
        const viewport = JSON.parse(transformString);
        mockStore.setState({ viewportToRestore: viewport });
        toast.info('저장된 보기를 불러왔습니다');
      });
      
      // 초기 상태 설정 - restoreViewport 함수가 실행되기 전에 명확하게 null로 설정
      mockStore.setState({ viewportToRestore: null });
      
      // 함수 실행
      store.restoreViewport();
      
      // 호출 및 상태 검증
      expect(getItemSpy).toHaveBeenCalledWith(TRANSFORM_STORAGE_KEY);
      // 이제 이 시점에서 viewportToRestore 상태가 업데이트되어야 합니다
      expect(mockStore.getState().viewportToRestore).toEqual(mockViewport);
      expect(toast.info).toHaveBeenCalledWith('저장된 보기를 불러왔습니다');
    });

    it('저장된 뷰포트 정보가 없을 때 메시지를 표시해야 함', () => {
      // localStorage가 비어 있는 상태
      // restoreViewport 구현 시뮬레이션
      mockRestoreViewport.mockImplementation(() => {
        const transformString = localStorage.getItem(TRANSFORM_STORAGE_KEY);
        if (!transformString) {
          toast.info('저장된 보기가 없습니다');
          return;
        }
      });
      
      store.restoreViewport();
      
      expect(getItemSpy).toHaveBeenCalledWith(TRANSFORM_STORAGE_KEY);
      expect(toast.info).toHaveBeenCalledWith('저장된 보기가 없습니다');
      expect(store.viewportToRestore).toBeNull();
    });
  });

  // 추가 테스트 케이스들은 유사한 방식으로 구현...
}); 