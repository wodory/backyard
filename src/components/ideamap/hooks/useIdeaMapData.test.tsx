/**
 * 파일명: useIdeaMapData.test.tsx
 * 목적: useIdeaMapData 훅의 기능 테스트
 * 역할: 아이디어맵 데이터 로딩 및 로딩 상태 관리 테스트
 * 작성일: 2023-04-10
 * 수정일: 2025-05-05
 */

import { describe, it, expect, beforeEach, vi, afterEach, afterAll, beforeAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { server } from '@/tests/msw/server';
import { http, HttpResponse } from 'msw';
import { Viewport, ConnectionLineType, MarkerType } from '@xyflow/react';
import { mockLocalStorage } from '@/tests/mocks/storage-mock';
import { IDEAMAP_LAYOUT_STORAGE_KEY, IDEAMAP_EDGES_STORAGE_KEY, IDEAMAP_TRANSFORM_STORAGE_KEY } from '@/lib/ideamap-constants';

// 모든 모킹은 파일 상단에 그룹화
// 외부 모듈부터 모킹 (호이스팅 고려)
// @xyflow/react 모킹
const mockFitView = vi.fn().mockResolvedValue(undefined);
const mockSetViewport = vi.fn().mockResolvedValue(undefined);
const mockGetZoom = vi.fn().mockReturnValue(1);
const mockGetViewport = vi.fn().mockReturnValue({ x: 0, y: 0, zoom: 1 });

vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    useReactFlow: () => ({
      fitView: mockFitView,
      setViewport: mockSetViewport,
      getZoom: mockGetZoom,
      getViewport: mockGetViewport
    })
  };
});

// loadIdeaMapData 모킹을 위한 함수
const mockLoadIdeaMapData = vi.fn().mockResolvedValue(undefined);

// 기본 상태 객체 정의 - IdeaMapState 인터페이스에 맞춰 모든 필수 속성 포함
const createMockState = (overrides = {}) => ({
  // 노드 관련
  nodes: [{
    id: 'node-1',
    position: { x: 0, y: 0 },
    data: {
      id: 'card-1',
      title: '카드 1',
      content: '카드 1 내용',
      tags: []
    }
  }],
  setNodes: vi.fn(),
  onNodesChange: vi.fn(),

  // 엣지 관련
  edges: [{ id: 'edge-1', source: 'node-1', target: 'node-2' }],
  setEdges: vi.fn(),
  onEdgesChange: vi.fn(),
  onConnect: vi.fn(),

  // 아이디어맵 설정
  ideaMapSettings: {
    layout: 'horizontal',
    strokeWidth: 2,
    animated: false,
    lineType: 'straight',
    nodePadding: 10,
    nodeSpacing: 20,
    applyForce: false,
    snapToGrid: false,
    snapGrid: [10, 10] as [number, number],
    connectionLineType: 'bezier' as ConnectionLineType,
    markerEnd: 'arrow' as MarkerType,
    zoomOnScroll: true,
    panOnScroll: false,
    fitView: true,
    markerSize: 8,
    edgeColor: '#555555',
    selectedEdgeColor: '#0096FF'
  },
  setIdeaMapSettings: vi.fn(),
  updateIdeaMapSettings: vi.fn(),

  // 레이아웃
  applyLayout: vi.fn(),
  applyGridLayout: vi.fn(),

  // 저장
  saveLayout: vi.fn(),
  saveEdges: vi.fn(),
  saveAllLayoutData: vi.fn().mockReturnValue(true),

  // 엣지 스타일
  updateEdgeStyles: vi.fn(),

  // 서버 동기화
  loadIdeaMapSettingsFromServerIfAuthenticated: vi.fn(),

  // 엣지 생성
  createEdgeOnDrop: vi.fn().mockReturnValue({ id: 'new-edge', source: 'node-1', target: 'node-2' }),

  // 변경 사항 추적
  hasUnsavedChanges: false,
  setHasUnsavedChanges: vi.fn(),

  // 리액트 플로우
  reactFlowInstance: null,
  setReactFlowInstance: vi.fn(),

  // 아이디어맵 데이터 상태
  isIdeaMapLoading: false,
  ideaMapError: null,
  loadedViewport: null,
  needsFitView: false,
  loadIdeaMapData: mockLoadIdeaMapData,  // 일관된 모킹 함수 사용

  ...overrides
});

// useIdeaMapStore 모킹
vi.mock('@/store/useIdeaMapStore', () => ({
  useIdeaMapStore: vi.fn((selector) => {
    const mockState = createMockState();
    if (typeof selector === 'function') {
      return selector(mockState);
    }
    return {
      subscribe: vi.fn((callback) => {
        callback(mockState);
        return () => { };
      }),
      getState: () => mockState
    };
  })
}));

// 모킹 이후에 필요한 모듈 가져오기
import { useIdeaMapData } from './useIdeaMapData';
import { useReactFlow } from '@xyflow/react';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import { toast } from 'sonner';

// toast 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// localStorage 모킹 반환 타입 정의
type MockedStorage = ReturnType<typeof mockLocalStorage>;

describe('useIdeaMapData 훅 테스트', () => {
  // 모킹된 localStorage
  let mockedStorage: MockedStorage;

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    // 모든 모킹 함수 초기화
    vi.clearAllMocks();

    // storage-mock 사용하여 localStorage 모킹
    mockedStorage = mockLocalStorage();
    vi.stubGlobal('localStorage', mockedStorage);
  });

  afterEach(() => {
    server.resetHandlers();
    vi.unstubAllGlobals(); // localStorage 모킹 제거
  });

  it('테스트 1: 초기 로딩 상태가 올바르게 설정되어야 함', async () => {
    // isIdeaMapLoading이 true인 상태로 설정
    const loadingState = createMockState({ isIdeaMapLoading: true });
    vi.mocked(useIdeaMapStore).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(loadingState);
      }
      return {
        subscribe: vi.fn((callback) => {
          callback(loadingState);
          return () => { };
        }),
        getState: () => loadingState
      };
    });

    // 훅 렌더링
    const { result } = renderHook(() => useIdeaMapData());

    // 초기 로딩 상태가 true인지 확인
    expect(result.current.isLoading).toBe(true);
  });

  it('테스트 3: API 호출 완료 후 로딩 상태가 false로 변경되어야 함', async () => {
    // 카드 데이터 API 응답 모킹
    server.use(
      http.get('/api/cards', () => {
        return HttpResponse.json([
          { id: 'card-1', title: '카드 1', content: '내용 1', cardTags: [] },
          { id: 'card-2', title: '카드 2', content: '내용 2', cardTags: [] }
        ]);
      })
    );

    // 먼저 로딩 상태를 true로 설정
    let stateOverrides = { isIdeaMapLoading: true };
    const loadingState = createMockState(stateOverrides);

    let updateState = (newState: any) => {
      stateOverrides = { ...stateOverrides, ...newState };
      return createMockState(stateOverrides);
    };

    // loadIdeaMapData 함수를 모킹하여 호출 시 isIdeaMapLoading을 false로 변경
    const mockLoadDataImpl = vi.fn().mockImplementation(async () => {
      updateState({ isIdeaMapLoading: false });
      return Promise.resolve();
    });

    // 스토어 모킹 업데이트
    vi.mocked(useIdeaMapStore).mockImplementation((selector) => {
      const currentState = createMockState({
        ...stateOverrides,
        loadIdeaMapData: mockLoadDataImpl
      });

      if (typeof selector === 'function') {
        return selector(currentState);
      }

      return {
        subscribe: vi.fn((callback) => {
          callback(currentState);
          return () => { };
        }),
        getState: () => currentState
      };
    });

    // 훅 렌더링
    const { result, rerender } = renderHook(() => useIdeaMapData());

    // 초기 로딩 상태 확인
    expect(result.current.isLoading).toBe(true);

    // loadNodesAndEdges 호출
    await act(async () => {
      await result.current.loadNodesAndEdges();
    });

    // loadIdeaMapData가 호출되었는지 확인
    expect(mockLoadDataImpl).toHaveBeenCalled();

    // 스토어 상태 업데이트 후 다시 렌더링
    rerender();

    // 로딩 상태가 false로 변경되었는지 확인
    expect(result.current.isLoading).toBe(false);
  });

  it('테스트 4: 에러 발생 시 에러 상태 설정과 로딩 상태 해제가 올바르게 처리되어야 함', async () => {
    // 에러 응답 모킹
    server.use(
      http.get('/api/cards', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    // 상태 관리를 위한 변수
    let stateOverrides = {
      isIdeaMapLoading: true,
      ideaMapError: null
    };

    // 상태 업데이트 함수
    let updateState = (newState: any) => {
      stateOverrides = { ...stateOverrides, ...newState };
      return createMockState(stateOverrides);
    };

    // 에러가 발생하는 loadIdeaMapData 함수 모킹
    const mockLoadDataWithError = vi.fn().mockImplementation(async () => {
      updateState({
        isIdeaMapLoading: false,
        ideaMapError: '서버 오류가 발생했습니다'
      });
      return Promise.reject(new Error('서버 오류가 발생했습니다'));
    });

    // 스토어 모킹 업데이트
    vi.mocked(useIdeaMapStore).mockImplementation((selector) => {
      const currentState = createMockState({
        ...stateOverrides,
        loadIdeaMapData: mockLoadDataWithError
      });

      if (typeof selector === 'function') {
        return selector(currentState);
      }

      return {
        subscribe: vi.fn((callback) => {
          callback(currentState);
          return () => { };
        }),
        getState: () => currentState
      };
    });

    // 훅 렌더링
    const { result, rerender } = renderHook(() => useIdeaMapData());

    // 초기 로딩 상태 확인
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);

    // loadNodesAndEdges 호출
    await act(async () => {
      try {
        await result.current.loadNodesAndEdges();
      } catch (error) {
        // 에러 무시 (테스트에서는 에러가 발생해도 계속 진행)
      }
    });

    // loadIdeaMapData가 호출되었는지 확인
    expect(mockLoadDataWithError).toHaveBeenCalled();

    // 스토어 상태 업데이트 후 다시 렌더링
    rerender();

    // 로딩 상태가 false로 변경되고 에러 상태가 설정되었는지 확인
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('서버 오류가 발생했습니다');
  });
}); 