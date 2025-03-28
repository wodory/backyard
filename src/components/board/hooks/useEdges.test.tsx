/**
 * 파일명: useEdges.test.tsx
 * 목적: useEdges 커스텀 훅 테스트
 * 역할: 엣지 관련 기능의 정상 작동 검증
 * 작성일: 2024-05-11
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Edge, Connection, Node, MarkerType, ConnectionLineType, Position } from '@xyflow/react';
import { EDGES_STORAGE_KEY } from '@/lib/board-constants';
import { BoardSettings } from '@/lib/board-utils';

// toast 모킹은 파일 최상단에 위치하도록 이동
vi.mock('sonner', () => {
  return {
    toast: {
      success: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
    }
  };
});

// React Flow 모킹 관련 임포트 및 호출
import { mockReactFlow } from '@/tests/utils/react-flow-mock';
mockReactFlow();

// 테스트할 훅 임포트
import { useEdges } from './useEdges';

// 테스트용 보드 설정
const mockBoardSettings: BoardSettings = {
  snapToGrid: false,
  snapGrid: [15, 15],
  connectionLineType: ConnectionLineType.SmoothStep,
  markerEnd: MarkerType.Arrow,
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

// 로컬 스토리지 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useEdges', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });
  
  it('초기 상태가 올바르게 반환되어야 함', () => {
    const { result } = renderHook(() => useEdges({ 
      boardSettings: mockBoardSettings, 
      nodes: mockNodes 
    }));
    
    expect(result.current.edges).toEqual([]);
    expect(typeof result.current.handleEdgesChange).toBe('function');
    expect(typeof result.current.onConnect).toBe('function');
    expect(typeof result.current.saveEdges).toBe('function');
    expect(typeof result.current.updateEdgeStyles).toBe('function');
    expect(typeof result.current.createEdgeOnDrop).toBe('function');
  });

  it('handleEdgesChange가 엣지 변경사항을 적용해야 함', () => {
    const { result } = renderHook(() => useEdges({ 
      boardSettings: mockBoardSettings, 
      nodes: mockNodes 
    }));
    
    // 제거 변경 테스트
    const removeChange = {
      id: 'edge-1',
      type: 'remove' as const,
    };
    
    act(() => {
      // 먼저 엣지 상태에 엣지 추가 (테스트를 위해)
      result.current.setEdges([{ id: 'edge-1', source: 'node-1', target: 'node-2' }] as Edge[]);
      // 제거 변경 적용
      result.current.handleEdgesChange([removeChange]);
    });
    
    // 엣지가 제거되었는지 확인
    expect(result.current.edges).toEqual([]);
  });

  it('saveEdges가 엣지를 로컬 스토리지에 저장해야 함', () => {
    const { result } = renderHook(() => useEdges({ 
      boardSettings: mockBoardSettings, 
      nodes: mockNodes 
    }));
    
    // 테스트 엣지 데이터
    const testEdges: Edge[] = [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'custom',
      }
    ];
    
    act(() => {
      result.current.saveEdges(testEdges);
    });
    
    // 로컬 스토리지에 저장되었는지 확인
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      EDGES_STORAGE_KEY,
      expect.stringContaining('edge-1')
    );
  });

  it('onConnect가 노드를 연결하고 새 엣지를 생성해야 함', () => {
    const { result } = renderHook(() => useEdges({ 
      boardSettings: mockBoardSettings, 
      nodes: mockNodes 
    }));
    
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
    
    // 새 엣지가 생성되었는지 확인
    expect(result.current.edges.length).toBe(1);
    expect(result.current.edges[0].source).toBe('node-1');
    expect(result.current.edges[0].target).toBe('node-2');
    
    // 엣지에 올바른 속성이 설정되었는지 확인
    expect(result.current.edges[0].type).toBe('custom');
    expect(result.current.edges[0].animated).toBe(mockBoardSettings.animated);
    expect(result.current.edges[0].style?.stroke).toBe(mockBoardSettings.edgeColor);
  });

  it('onConnect가 소스와 타겟이 같을 때 연결을 방지해야 함', () => {
    const { result } = renderHook(() => useEdges({ 
      boardSettings: mockBoardSettings, 
      nodes: mockNodes 
    }));
    
    // 동일한 노드를 소스와 타겟으로 설정
    const sameNodeConnection: Partial<Connection> = {
      source: 'node-1',
      target: 'node-1',
    };
    
    act(() => {
      result.current.onConnect(sameNodeConnection as Connection);
    });
    
    // 엣지가 생성되지 않았는지 확인
    expect(result.current.edges.length).toBe(0);
  });

  it('createEdgeOnDrop이 새 엣지를 생성하고 반환해야 함', () => {
    const { result } = renderHook(() => useEdges({ 
      boardSettings: mockBoardSettings, 
      nodes: mockNodes 
    }));
    
    let createdEdge: Edge | undefined;
    
    act(() => {
      createdEdge = result.current.createEdgeOnDrop('node-1', 'node-2');
    });
    
    // 엣지가 생성되었는지 확인
    expect(result.current.edges.length).toBe(1);
    
    // 생성된 엣지가 반환되었는지 확인
    expect(createdEdge).toBeDefined();
    expect(createdEdge?.source).toBe('node-1');
    expect(createdEdge?.target).toBe('node-2');
    
    // 엣지 상태가 로컬 스토리지에 저장되었는지 확인
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      EDGES_STORAGE_KEY,
      expect.any(String)
    );
  });
}); 