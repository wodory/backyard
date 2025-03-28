/**
 * 파일명: useBoardUtils.test.tsx
 * 목적: useBoardUtils 훅을 테스트
 * 역할: 보드 유틸리티 함수 관련 로직 테스트
 * 작성일: 2024-05-11
 */

import { renderHook, act } from '@testing-library/react';
import { vi, expect } from 'vitest';
import { toast } from 'sonner';
import { useBoardUtils } from './useBoardUtils';
import { BoardSettings, saveBoardSettingsToServer, loadBoardSettingsFromServer } from '@/lib/board-utils';
import { getGridLayout, getLayoutedElements } from '@/lib/layout-utils';
import { mockReactFlow } from '@/tests/utils/react-flow-mock';
import { ConnectionLineType, MarkerType, Node, Edge, Viewport } from '@xyflow/react';
import { useAppStore } from '@/store/useAppStore';
import { TRANSFORM_STORAGE_KEY } from '@/lib/board-constants';

// 모든 vi.mock 호출을 먼저 수행
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    useReactFlow: () => ({
      ...mockReactFlow,
      getViewport: () => ({ x: 100, y: 200, zoom: 2 }),
    }),
  };
});

// Mock 함수들
const mockedSetBoardSettings = vi.fn();

// 전역 상태 모킹
vi.mock('@/store/useAppStore', () => ({
  useAppStore: vi.fn(() => ({
    boardSettings: {
      strokeWidth: 2,
      edgeColor: '#000000',
      selectedEdgeColor: '#ff0000',
      animated: false,
      markerEnd: true,
      connectionLineType: 'straight',
      snapToGrid: false,
      snapGrid: [20, 20],
      markerSize: 20,
    },
    setBoardSettings: mockedSetBoardSettings,
  })),
}));

vi.mock('@/lib/board-utils', () => ({
  BoardSettings: {},
  saveBoardSettings: vi.fn(),
  applyEdgeSettings: vi.fn().mockImplementation((edges, settings) => edges),
  saveBoardSettingsToServer: vi.fn().mockResolvedValue({}),
  loadBoardSettingsFromServer: vi.fn().mockResolvedValue({
    strokeWidth: 2,
    edgeColor: '#000000',
    selectedEdgeColor: '#ff0000',
    animated: false,
    markerEnd: true,
    connectionLineType: 'straight',
    snapToGrid: false,
    snapGrid: [20, 20],
    markerSize: 20,
  }),
}));

vi.mock('@/lib/layout-utils', () => ({
  getGridLayout: vi.fn().mockImplementation((nodes: any[]) => 
    nodes.map((node: any, index: number) => ({
      ...node,
      position: { x: index * 200, y: 100 },
    }))
  ),
  getLayoutedElements: vi.fn().mockImplementation((nodes: any[], edges: any[], direction: string) => ({
    nodes: nodes.map((node: any) => ({
      ...node,
      targetPosition: direction === 'horizontal' ? 'left' : 'top',
      sourcePosition: direction === 'horizontal' ? 'right' : 'bottom',
    })),
    edges,
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    store,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useBoardUtils', () => {
  // 테스트를 위한 모의 함수 및 데이터 준비
  const saveLayout = vi.fn().mockReturnValue(true);
  const saveEdges = vi.fn().mockReturnValue(true);
  const setNodes = vi.fn();
  const setEdges = vi.fn();
  const updateNodeInternals = vi.fn();
  const mockedSaveBoardSettingsToServer = vi.mocked(saveBoardSettingsToServer);
  const mockedLoadBoardSettingsFromServer = vi.mocked(loadBoardSettingsFromServer);
  const mockedGetGridLayout = vi.mocked(getGridLayout);
  const mockedGetLayoutedElements = vi.mocked(getLayoutedElements);
  
  const mockNodes = [
    { id: 'node1', position: { x: 0, y: 0 }, data: { title: '카드 1', content: '내용 1' } },
    { id: 'node2', position: { x: 100, y: 100 }, data: { title: '카드 2', content: '내용 2' } },
  ];
  
  const mockEdges = [
    { id: 'edge1', source: 'node1', target: 'node2' },
  ];
  
  const reactFlowWrapper = {
    current: {
      getBoundingClientRect: vi.fn().mockReturnValue({
        left: 0,
        top: 0,
        width: 1000,
        height: 800,
      }),
    },
  } as unknown as React.RefObject<HTMLDivElement>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });
  
  it('saveAllLayoutData가 레이아웃과 엣지를 저장하고 성공 메시지를 표시해야 함', () => {
    // 훅 렌더링
    const { result } = renderHook(() => useBoardUtils({
      reactFlowWrapper,
      updateNodeInternals,
      saveLayout,
      saveEdges,
      nodes: mockNodes as any,
      edges: mockEdges as any,
      setNodes,
      setEdges,
    }));
    
    // 함수 호출
    let success;
    act(() => {
      success = result.current.saveAllLayoutData();
    });
    
    // 결과 검증
    expect(success).toBe(true);
    expect(saveLayout).toHaveBeenCalled();
    expect(saveEdges).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('레이아웃이 저장되었습니다');
  });

  it('saveTransform이 뷰포트 상태를 로컬 스토리지에 저장해야 함', () => {
    // 훅 렌더링
    const { result } = renderHook(() => useBoardUtils({
      reactFlowWrapper,
      updateNodeInternals,
      saveLayout,
      saveEdges,
      nodes: mockNodes as any,
      edges: mockEdges as any,
      setNodes,
      setEdges,
    }));
    
    // saveTransform 함수 호출
    let success;
    act(() => {
      success = result.current.saveTransform();
    });
    
    // 결과 검증
    expect(success).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      TRANSFORM_STORAGE_KEY, 
      expect.any(String)
    );
    
    // 저장된 뷰포트 데이터 확인
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData).toEqual({ x: 100, y: 200, zoom: 2 });
  });
  
  it('saveAllLayoutData가 뷰포트 상태도 함께 저장해야 함', () => {
    // 훅 렌더링
    const { result } = renderHook(() => useBoardUtils({
      reactFlowWrapper,
      updateNodeInternals,
      saveLayout,
      saveEdges,
      nodes: mockNodes as any,
      edges: mockEdges as any,
      setNodes,
      setEdges,
    }));
    
    // 함수 호출
    let success;
    act(() => {
      success = result.current.saveAllLayoutData();
    });
    
    // 결과 검증
    expect(success).toBe(true);
    expect(saveLayout).toHaveBeenCalled();
    expect(saveEdges).toHaveBeenCalled();
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      TRANSFORM_STORAGE_KEY, 
      expect.any(String)
    );
  });
  
  it('handleSaveLayout이 저장 실패 시 오류 메시지를 표시해야 함', () => {
    // saveLayout 실패로 설정
    saveLayout.mockReturnValueOnce(false);
    
    // 훅 렌더링
    const { result } = renderHook(() => useBoardUtils({
      reactFlowWrapper,
      updateNodeInternals,
      saveLayout,
      saveEdges,
      nodes: mockNodes as any,
      edges: mockEdges as any,
      setNodes,
      setEdges,
    }));
    
    // 함수 호출
    act(() => {
      result.current.handleSaveLayout();
    });
    
    // 결과 검증
    expect(toast.error).toHaveBeenCalledWith('레이아웃 저장에 실패했습니다');
  });
  
  it('handleBoardSettingsChange가 설정 변경 및 서버 저장을 처리해야 함', async () => {
    // 훅 렌더링
    const { result } = renderHook(() => useBoardUtils({
      reactFlowWrapper,
      updateNodeInternals,
      saveLayout,
      saveEdges,
      nodes: mockNodes as any,
      edges: mockEdges as any,
      setNodes,
      setEdges,
    }));
    
    // 새로운 설정
    const newSettings: BoardSettings = {
      strokeWidth: 3,
      edgeColor: '#ff0000',
      selectedEdgeColor: '#00ff00',
      animated: true,
      markerEnd: null,
      connectionLineType: 'default' as ConnectionLineType,
      snapToGrid: true,
      snapGrid: [10, 10],
      markerSize: 20,
    };
    
    // 함수 호출
    act(() => {
      result.current.handleBoardSettingsChange(newSettings, true, 'user123');
    });
    
    // 결과 검증
    expect(mockedSetBoardSettings).toHaveBeenCalledWith(newSettings);
    expect(setEdges).toHaveBeenCalled();
    expect(mockedSaveBoardSettingsToServer).toHaveBeenCalledWith('user123', newSettings);
  });
  
  it('handleLayoutChange가 레이아웃 방향을 변경하고 노드 내부를 업데이트해야 함', () => {
    // 훅 렌더링
    const { result } = renderHook(() => useBoardUtils({
      reactFlowWrapper,
      updateNodeInternals,
      saveLayout,
      saveEdges,
      nodes: mockNodes as any,
      edges: mockEdges as any,
      setNodes,
      setEdges,
    }));
    
    // 함수 호출
    act(() => {
      result.current.handleLayoutChange('horizontal');
    });
    
    // 결과 검증
    expect(mockedGetLayoutedElements).toHaveBeenCalledWith(mockNodes, mockEdges, 'horizontal');
    expect(setNodes).toHaveBeenCalled();
    expect(setEdges).toHaveBeenCalled();
    expect(updateNodeInternals).toHaveBeenCalledTimes(mockNodes.length);
  });
  
  it('handleAutoLayout이 그리드 레이아웃을 적용해야 함', () => {
    // 훅 렌더링
    const { result } = renderHook(() => useBoardUtils({
      reactFlowWrapper,
      updateNodeInternals,
      saveLayout,
      saveEdges,
      nodes: mockNodes as any,
      edges: mockEdges as any,
      setNodes,
      setEdges,
    }));
    
    // 함수 호출
    act(() => {
      result.current.handleAutoLayout();
    });
    
    // 결과 검증
    expect(mockedGetGridLayout).toHaveBeenCalledWith(mockNodes);
    expect(setNodes).toHaveBeenCalled();
    expect(updateNodeInternals).toHaveBeenCalledTimes(mockNodes.length);
  });
}); 