/**
 * 파일명: useBoardData.test.tsx
 * 목적: useBoardData 훅을 테스트
 * 역할: 보드 데이터 로드 및 뷰포트 저장/복원 기능 테스트
 * 작성일: 2024-06-20
 */

import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useBoardData } from './useBoardData';
import { STORAGE_KEY, EDGES_STORAGE_KEY, TRANSFORM_STORAGE_KEY } from '@/lib/board-constants';
import { mockReactFlow } from '@/tests/utils/react-flow-mock';
import { toast } from 'sonner';

// ReactFlow 모킹
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    useReactFlow: () => mockReactFlow,
  };
});

// AppStore 모킹
vi.mock('@/store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => selector({
    setCards: vi.fn(),
  })),
}));

// Fetch API 모킹
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { id: '1', title: '카드 1', content: '내용 1', cardTags: [] },
      { id: '2', title: '카드 2', content: '내용 2', cardTags: [] },
    ]),
  })
) as any;

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

// Toast 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// ReactFlowInstance 모킹
const mockReactFlowInstance = {
  fitView: vi.fn(),
  setViewport: vi.fn(),
  getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
  screenToFlowPosition: vi.fn((pos) => pos),
  getNodes: vi.fn(() => []),
  getEdges: vi.fn(() => []),
};

describe('useBoardData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  it('노드와 엣지 데이터를 로드해야 함', async () => {
    const { result } = renderHook(() => useBoardData());
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await result.current.loadNodesAndEdges(mockReactFlowInstance as any);
      // 비동기 작업이 완료될 때까지 대기
      await Promise.resolve();
    });
    
    expect(global.fetch).toHaveBeenCalledWith('/api/cards');
    expect(result.current.nodes).toHaveLength(2);
    expect(result.current.edges).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('저장된 노드 위치를 복원해야 함', async () => {
    const savedPositions = {
      '1': { position: { x: 100, y: 200 } },
      '2': { position: { x: 300, y: 400 } },
    };
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(savedPositions));

    const { result } = renderHook(() => useBoardData());
    
    await act(async () => {
      await result.current.loadNodesAndEdges(mockReactFlowInstance as any);
      await Promise.resolve();
    });

    expect(result.current.nodes[0].position).toEqual(savedPositions['1'].position);
    expect(result.current.nodes[1].position).toEqual(savedPositions['2'].position);
  });

  it('저장된 뷰포트가 없을 때 fitView를 호출해야 함', async () => {
    const { result } = renderHook(() => useBoardData());
    
    await act(async () => {
      await result.current.loadNodesAndEdges(mockReactFlowInstance as any);
      await Promise.resolve();
      // setTimeout 실행
      vi.runAllTimers();
    });

    expect(mockReactFlowInstance.fitView).toHaveBeenCalledTimes(1);
    expect(mockReactFlowInstance.setViewport).not.toHaveBeenCalled();
  });

  it('저장된 뷰포트가 있을 때 setViewport를 호출해야 함', async () => {
    const savedViewport = { x: 100, y: 200, zoom: 1.5 };
    localStorageMock.setItem(TRANSFORM_STORAGE_KEY, JSON.stringify(savedViewport));

    const { result } = renderHook(() => useBoardData());
    
    await act(async () => {
      await result.current.loadNodesAndEdges(mockReactFlowInstance as any);
      await Promise.resolve();
      // setTimeout 실행
      vi.runAllTimers();
    });

    expect(mockReactFlowInstance.setViewport).toHaveBeenCalledWith(savedViewport);
    expect(mockReactFlowInstance.fitView).not.toHaveBeenCalled();
  });

  it('localStorage에서 오류가 발생해도 기본 위치와 fitView를 사용해야 함', async () => {
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error('Storage 오류');
    });

    const { result } = renderHook(() => useBoardData());
    
    await act(async () => {
      await result.current.loadNodesAndEdges(mockReactFlowInstance as any);
      await Promise.resolve();
      // setTimeout 실행
      vi.runAllTimers();
    });

    // 노드가 기본 위치를 가지고 있는지 확인
    expect(result.current.nodes[0].position).toEqual({ x: 0, y: 50 });
    expect(result.current.nodes[1].position).toEqual({ x: 250, y: 50 });
    expect(mockReactFlowInstance.fitView).toHaveBeenCalledTimes(1);
  });
}); 