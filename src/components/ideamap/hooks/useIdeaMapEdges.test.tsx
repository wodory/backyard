/**
 * 파일명: src/components/ideamap/hooks/useEdges.test.tsx
 * 목적: useIdeaMapEdges 훅 테스트
 * 역할: useIdeaMapEdges 훅의 기능 검증
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : useEdges에서 useIdeaMapEdges로 이름 변경
 */

import { renderHook, act } from '@testing-library/react';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import { Edge, Connection, Node, EdgeChange, Position, ConnectionLineType, MarkerType } from '@xyflow/react';
import { IdeaMapSettings } from '@/components/ideamap/types/ideamap-types';

// useIdeaMapStore 모킹
vi.mock('@/store/useIdeaMapStore', () => {
  // 모킹할 함수들을 정의
  const mockApplyEdgeChangesAction = vi.fn();
  const mockConnectNodesAction = vi.fn();
  const mockSaveEdgesAction = vi.fn().mockReturnValue(true);
  const mockUpdateAllEdgeStylesAction = vi.fn();
  const mockCreateEdgeOnDropAction = vi.fn();
  const mockSetEdges = vi.fn();
  const edges: Edge[] = [
    {
      id: 'edge-1',
      source: 'node-1',
      target: 'node-2',
      type: 'custom',
    }
  ];

  return {
    // useIdeaMapStore 훅 자체를 모킹
    useIdeaMapStore: (selector?: ((state: any) => any) | undefined) => {
      // selector 함수가 전달된 경우 실행, 아니면 전체 상태 객체 반환
      return selector ? selector({
        edges,
        setEdges: mockSetEdges,
        applyEdgeChangesAction: mockApplyEdgeChangesAction,
        connectNodesAction: mockConnectNodesAction,
        saveEdgesAction: mockSaveEdgesAction,
        updateAllEdgeStylesAction: mockUpdateAllEdgeStylesAction,
        createEdgeOnDropAction: mockCreateEdgeOnDropAction,
        hasUnsavedChanges: false
      }) : {
        edges,
        setEdges: mockSetEdges,
        applyEdgeChangesAction: mockApplyEdgeChangesAction,
        connectNodesAction: mockConnectNodesAction,
        saveEdgesAction: mockSaveEdgesAction,
        updateAllEdgeStylesAction: mockUpdateAllEdgeStylesAction,
        createEdgeOnDropAction: mockCreateEdgeOnDropAction,
        hasUnsavedChanges: false
      };
    }
  };
});

// React Flow 모킹
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
  };
});

// 테스트할 훅 임포트
import { useIdeaMapStore } from '@/store/useIdeaMapStore';

import { useIdeaMapEdges } from './useIdeaMapEdges';

// 테스트용 보드 설정
const mockIdeaMapSettings: IdeaMapSettings = {
  snapToGrid: false,
  snapGrid: [15, 15],
  connectionLineType: ConnectionLineType.SmoothStep,
  markerEnd: MarkerType.Arrow as MarkerType, // 타입 캐스팅 추가
  strokeWidth: 2,
  markerSize: 20,
  edgeColor: '#C1C1C1',
  selectedEdgeColor: '#FF0072',
  animated: false,
};

// 테스트용 노드 데이터
const mockNodes: Node[] = [
  {
    id: 'node-1',
    type: 'default',
    position: { x: 100, y: 100 },
    data: { label: 'Node 1' },
    targetPosition: Position.Left
  },
  {
    id: 'node-2',
    type: 'default',
    position: { x: 300, y: 100 },
    data: { label: 'Node 2' }
  }
];

describe('useIdeaMapEdges', () => {
  beforeEach(() => {
    // 모든 모킹 초기화
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 모든 모킹 재설정
    vi.resetAllMocks();
  });

  it('초기 상태가 올바르게 반환되어야 함', () => {
    const { result } = renderHook(() => useIdeaMapEdges({
      ideaMapSettings: mockIdeaMapSettings,
      nodes: mockNodes
    }));

    expect(result.current.edges).toBeDefined();
    expect(typeof result.current.handleEdgesChange).toBe('function');
    expect(typeof result.current.onConnect).toBe('function');
    expect(typeof result.current.saveEdges).toBe('function');
    expect(typeof result.current.updateEdgeStyles).toBe('function');
    expect(typeof result.current.createEdgeOnDrop).toBe('function');
  });

  it('handleEdgesChange가 applyEdgeChangesAction을 호출해야 함', () => {
    const { result } = renderHook(() => useIdeaMapEdges({
      ideaMapSettings: mockIdeaMapSettings,
      nodes: mockNodes
    }));

    const mockApplyEdgeChangesAction = vi.mocked(useIdeaMapStore(state => state.applyEdgeChangesAction));

    // 제거 변경 테스트
    const removeChange: EdgeChange = {
      id: 'edge-1',
      type: 'remove',
    };

    act(() => {
      result.current.handleEdgesChange([removeChange]);
    });

    // applyEdgeChangesAction이 호출되었는지 확인
    expect(mockApplyEdgeChangesAction).toHaveBeenCalledWith([removeChange]);
  });

  it('onConnect가 connectNodesAction을 호출해야 함', () => {
    const { result } = renderHook(() => useIdeaMapEdges({
      ideaMapSettings: mockIdeaMapSettings,
      nodes: mockNodes
    }));

    const mockConnectNodesAction = vi.mocked(useIdeaMapStore(state => state.connectNodesAction));

    // 테스트 연결 파라미터
    const connection: Connection = {
      source: 'node-1',
      target: 'node-2',
      sourceHandle: 'output',
      targetHandle: 'input',
    };

    act(() => {
      result.current.onConnect(connection);
    });

    // connectNodesAction이 호출되었는지 확인
    expect(mockConnectNodesAction).toHaveBeenCalledWith(connection);
  });

  it('saveEdges가 setEdges와 saveEdgesAction을 호출해야 함', () => {
    const { result } = renderHook(() => useIdeaMapEdges({
      ideaMapSettings: mockIdeaMapSettings,
      nodes: mockNodes
    }));

    const mockSetEdges = vi.mocked(useIdeaMapStore(state => state.setEdges));
    const mockSaveEdgesAction = vi.mocked(useIdeaMapStore(state => state.saveEdgesAction));

    // 명시적으로 true를 반환하도록 설정
    mockSaveEdgesAction.mockReturnValue(true);

    // 테스트 엣지 데이터
    const testEdges: Edge[] = [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'custom',
      }
    ];

    // 반환값 변수 선언
    let success: boolean = false;

    act(() => {
      success = result.current.saveEdges(testEdges) as boolean;
    });

    // 반환값 검증을 act 외부로 이동
    expect(success).toBe(true);

    // setEdges와 saveEdgesAction이 호출되었는지 확인
    expect(mockSetEdges).toHaveBeenCalledWith(testEdges);
    expect(mockSaveEdgesAction).toHaveBeenCalled();
  });

  it('updateEdgeStyles가 updateAllEdgeStylesAction을 호출해야 함', () => {
    const { result } = renderHook(() => useIdeaMapEdges({
      ideaMapSettings: mockIdeaMapSettings,
      nodes: mockNodes
    }));

    const mockUpdateAllEdgeStylesAction = vi.mocked(useIdeaMapStore(state => state.updateAllEdgeStylesAction));

    act(() => {
      result.current.updateEdgeStyles();
    });

    // updateAllEdgeStylesAction이 호출되었는지 확인
    expect(mockUpdateAllEdgeStylesAction).toHaveBeenCalled();
  });

  it('createEdgeOnDrop이 createEdgeOnDropAction을 호출해야 함', () => {
    const { result } = renderHook(() => useIdeaMapEdges({
      ideaMapSettings: mockIdeaMapSettings,
      nodes: mockNodes
    }));

    const mockCreateEdgeOnDropAction = vi.mocked(useIdeaMapStore(state => state.createEdgeOnDropAction));

    // 소스 노드와 타겟 노드 ID
    const sourceId = 'node-1';
    const targetId = 'node-2';

    act(() => {
      result.current.createEdgeOnDrop(sourceId, targetId);
    });

    // createEdgeOnDropAction이 호출되었는지 확인
    expect(mockCreateEdgeOnDropAction).toHaveBeenCalledWith(sourceId, targetId);
  });
}); 