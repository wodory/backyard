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
import { ConnectionLineType, MarkerType, Node, Edge } from '@xyflow/react';
import { useAppStore } from '@/store/useAppStore';

// 모든 vi.mock 호출을 먼저 수행
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    useReactFlow: () => mockReactFlow,
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
      markerSize: 30,
    };
    
    // 인증된 사용자로 설정 변경
    await act(async () => {
      await result.current.handleBoardSettingsChange(newSettings, true, 'user123');
    });
    
    // 결과 검증
    expect(mockedSetBoardSettings).toHaveBeenCalledWith(newSettings);
    expect(setEdges).toHaveBeenCalled();
    expect(mockedSaveBoardSettingsToServer).toHaveBeenCalledWith('user123', newSettings);
  });
  
  it('loadBoardSettingsFromServerIfAuthenticated가 인증된 사용자에게만 설정을 로드해야 함', async () => {
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
    
    // 인증되지 않은 사용자로 호출
    await act(async () => {
      await result.current.loadBoardSettingsFromServerIfAuthenticated(false);
    });
    
    // 서버 로드가 호출되지 않아야 함
    expect(mockedLoadBoardSettingsFromServer).not.toHaveBeenCalled();
    
    // 인증된 사용자로 호출
    await act(async () => {
      await result.current.loadBoardSettingsFromServerIfAuthenticated(true, 'user123');
    });
    
    // 서버 로드가 호출되어야 함
    expect(mockedLoadBoardSettingsFromServer).toHaveBeenCalledWith('user123');
    
    // 설정 적용 확인
    expect(mockedSetBoardSettings).toHaveBeenCalled();
    expect(setEdges).toHaveBeenCalled();
  });
  
  it('handleAutoLayout이 그리드 레이아웃을 적용하고 저장해야 함', () => {
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
    expect(saveLayout).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('카드가 격자 형태로 배치되었습니다.');
  });
  
  it('handleLayoutChange가 레이아웃 방향을 변경하고 노드 내부를 업데이트해야 함', () => {
    // 실제 타이머 대신 가상 타이머 사용
    vi.useFakeTimers();
    
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
      // 타이머 진행
      vi.advanceTimersByTime(300);
    });
    
    // 결과 검증
    expect(mockedGetLayoutedElements).toHaveBeenCalledWith(mockNodes, mockEdges, 'horizontal');
    expect(setNodes).toHaveBeenCalled();
    expect(setEdges).toHaveBeenCalled();
    expect(updateNodeInternals).toHaveBeenCalledTimes(mockNodes.length * 3); // 3번의 업데이트 각각 노드 수만큼 호출
    expect(toast.success).toHaveBeenCalledWith('수평 레이아웃으로 변경되었습니다.');
    
    // 가상 타이머 종료
    vi.useRealTimers();
  });
}); 