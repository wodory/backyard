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
import { server } from '@/tests/msw/server';
import { http, HttpResponse } from 'msw';
import { AppState } from '@/store/useAppStore';

// MSW 서버 설정
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ReactFlow 모킹
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    useReactFlow: () => mockReactFlow,
  };
});

// Zustand 스토어 모킹
vi.mock('@/store/useAppStore', () => {
  const setCardsMock = vi.fn();

  return {
    useAppStore: vi.fn((selector) => {
      const state: Partial<AppState> = {
        cards: [],
        setCards: setCardsMock,
        selectedCardIds: [],
        expandedCardId: null,
        // 필요한 다른 상태와 액션 추가
      };

      return selector(state as AppState);
    }),
  };
});

// Toast 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('useBoardData', () => {
  let mockReactFlowInstance: any;
  let getItemSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // ReactFlowInstance 모킹
    mockReactFlowInstance = {
      fitView: vi.fn(),
      setViewport: vi.fn(),
      getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
      screenToFlowPosition: vi.fn((pos) => pos),
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
    };

    // localStorage 모킹
    getItemSpy = vi.spyOn(window.localStorage, 'getItem');

    // setTimeout 모킹 (즉시 실행)
    vi.useFakeTimers();

    // API 응답 모킹 (MSW 핸들러)
    server.use(
      http.get('/api/cards', () => {
        return HttpResponse.json([
          { id: '1', title: '카드 1', content: '내용 1', cardTags: [] },
          { id: '2', title: '카드 2', content: '내용 2', cardTags: [] },
        ]);
      })
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  it('노드와 엣지 데이터를 로드해야 함', async () => {
    getItemSpy.mockReturnValue(null);

    const { result } = renderHook(() => useBoardData());
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await result.current.loadNodesAndEdges(mockReactFlowInstance);
      // 즉시 타이머 실행
      vi.runAllTimers();
    });

    expect(result.current.nodes).toHaveLength(2);
    expect(result.current.edges).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('저장된 노드 위치를 복원해야 함', async () => {
    // 노드와 위치 정보 준비
    const savedPositions = {
      '1': { position: { x: 100, y: 200 } },
      '2': { position: { x: 300, y: 400 } },
    };

    // localStorage를 모킹하여 저장된 위치 데이터 반환
    getItemSpy.mockImplementation((key: string) => {
      if (key === STORAGE_KEY) {
        return JSON.stringify(savedPositions);
      }
      return null;
    });

    const { result } = renderHook(() => useBoardData());

    await act(async () => {
      await result.current.loadNodesAndEdges(mockReactFlowInstance);
      // 즉시 타이머 실행
      vi.runAllTimers();
    });

    // 위치가 복원되었는지 확인 - 기본 위치가 아닌 저장된 위치가 사용되어야 함
    expect(result.current.nodes[0].position.x).toBe(100);
    expect(result.current.nodes[0].position.y).toBe(200);
    expect(result.current.nodes[1].position.x).toBe(300);
    expect(result.current.nodes[1].position.y).toBe(400);
  });

  it('저장된 뷰포트가 없을 때 fitView를 호출해야 함', async () => {
    // localStorage에 뷰포트 정보가 없는 상태 설정
    getItemSpy.mockReturnValue(null);

    const { result } = renderHook(() => useBoardData());

    await act(async () => {
      await result.current.loadNodesAndEdges(mockReactFlowInstance);
      // 즉시 타이머 실행
      vi.runAllTimers();
    });

    expect(mockReactFlowInstance.fitView).toHaveBeenCalledTimes(1);
    expect(mockReactFlowInstance.setViewport).not.toHaveBeenCalled();
  });

  it('저장된 뷰포트가 있을 때 setViewport를 호출해야 함', async () => {
    const savedViewport = { x: 100, y: 200, zoom: 1.5 };

    // localStorage를 모킹하여 저장된 뷰포트 데이터 반환
    getItemSpy.mockImplementation((key: string) => {
      if (key === TRANSFORM_STORAGE_KEY) {
        return JSON.stringify(savedViewport);
      }
      return null;
    });

    const { result } = renderHook(() => useBoardData());

    await act(async () => {
      await result.current.loadNodesAndEdges(mockReactFlowInstance);
      // 즉시 타이머 실행
      vi.runAllTimers();
    });

    expect(mockReactFlowInstance.setViewport).toHaveBeenCalledWith(savedViewport);
  });

  it('localStorage에서 오류가 발생해도 기본 위치와 fitView를 사용해야 함', async () => {
    // localStorage 접근 시 오류 발생 모킹
    getItemSpy.mockImplementation(() => {
      throw new Error('Storage 오류');
    });

    const { result } = renderHook(() => useBoardData());

    await act(async () => {
      await result.current.loadNodesAndEdges(mockReactFlowInstance);
      // 즉시 타이머 실행
      vi.runAllTimers();
    });

    // 노드가 기본 위치를 가지고 있는지 확인
    expect(result.current.nodes[0].position).toEqual({ x: 0, y: 50 });
    expect(result.current.nodes[1].position).toEqual({ x: 250, y: 50 });
    expect(mockReactFlowInstance.fitView).toHaveBeenCalledTimes(1);
  });
}); 