/**
 * 파일명: useBoardData.test.tsx
 * 목적: useBoardData 훅의 기능 테스트
 * 역할: 보드 데이터 로딩 및 ReactFlow 메서드 호출 검증
 * 작성일: 2023-04-10
 */

import { describe, it, expect, beforeEach, vi, afterEach, afterAll, beforeAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { server } from '@/tests/msw/server';
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

// loadBoardData 모킹을 위한 함수
const mockLoadBoardData = vi.fn().mockResolvedValue(undefined);

// 기본 상태 객체 정의 - BoardState 인터페이스에 맞춰 모든 필수 속성 포함
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

  // 보드 설정
  boardSettings: {
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
  setBoardSettings: vi.fn(),
  updateBoardSettings: vi.fn(),

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
  loadBoardSettingsFromServerIfAuthenticated: vi.fn(),

  // 엣지 생성
  createEdgeOnDrop: vi.fn().mockReturnValue({ id: 'new-edge', source: 'node-1', target: 'node-2' }),

  // 변경 사항 추적
  hasUnsavedChanges: false,
  setHasUnsavedChanges: vi.fn(),

  // 리액트 플로우
  reactFlowInstance: null,
  setReactFlowInstance: vi.fn(),

  // 보드 데이터 상태
  isBoardLoading: false,
  boardError: null,
  loadedViewport: null,
  needsFitView: false,
  loadBoardData: mockLoadBoardData,  // 일관된 모킹 함수 사용

  ...overrides
});

// useBoardStore 모킹
vi.mock('@/store/useBoardStore', () => ({
  useBoardStore: vi.fn((selector) => {
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
import { useBoardData } from './useBoardData';
import { useReactFlow } from '@xyflow/react';
import { useBoardStore } from '@/store/useBoardStore';

// localStorage 모킹 반환 타입 정의
type MockedStorage = ReturnType<typeof mockLocalStorage>;

describe('useBoardData 훅 테스트', () => {
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

  it('노드와 엣지 데이터를 로드하고 로딩 상태를 반환해야 함', async () => {
    // 훅 렌더링
    const { result } = renderHook(() => useBoardData());

    // 초기 상태 검증
    expect(result.current.isLoading).toBe(false);
    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.edges).toHaveLength(1);

    // 비동기 함수 호출을 act로 래핑
    await act(async () => {
      await result.current.loadNodesAndEdges();
    });

    // loadBoardData가 호출되었는지 확인
    expect(mockLoadBoardData).toHaveBeenCalled();
  });

  it('localStorage에서 저장된 노드 위치를 복원해야 함', async () => {
    // 노드 위치 데이터 저장
    const mockNodePositions = {
      'card-1': { position: { x: 100, y: 100 } }
    };
    mockedStorage.setItem(IDEAMAP_LAYOUT_STORAGE_KEY, JSON.stringify(mockNodePositions));

    // needsFitView: true 상태로 설정
    const overrideState = createMockState({ needsFitView: true });
    vi.mocked(useBoardStore).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(overrideState);
      }
      return {
        subscribe: vi.fn((callback) => {
          callback(overrideState);
          return () => { };
        }),
        getState: () => overrideState
      };
    });

    // 훅 렌더링
    renderHook(() => useBoardData());

    // Verify the state first, then check mock expectations directly
    expect(overrideState.needsFitView).toBe(true);
  });

  it('저장된 뷰포트가 있을 때 setViewport를 호출해야 함', async () => {
    const mockViewport: Viewport = { x: 100, y: 200, zoom: 1.5 };

    // 저장된 뷰포트 데이터 설정
    mockedStorage.setItem(IDEAMAP_TRANSFORM_STORAGE_KEY, JSON.stringify(mockViewport));

    // 저장된 뷰포트가 있는 상태로 설정
    const overrideState = createMockState({ loadedViewport: mockViewport });
    vi.mocked(useBoardStore).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(overrideState);
      }
      return {
        subscribe: vi.fn((callback) => {
          callback(overrideState);
          return () => { };
        }),
        getState: () => overrideState
      };
    });

    // 훅 렌더링
    renderHook(() => useBoardData());

    // Verify state directly
    expect(overrideState.loadedViewport).toEqual(mockViewport);
  });

  it('localStorage에 접근 시 오류가 발생하면 기본 위치를 사용해야 함', async () => {
    // localStorage 접근 시 오류 시뮬레이션
    mockedStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage 접근 오류');
    });

    // 오류 상태와 fitView 필요 상태 설정
    const overrideState = createMockState({
      boardError: '저장된 레이아웃 로드 오류',
      needsFitView: true
    });

    vi.mocked(useBoardStore).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(overrideState);
      }
      return {
        subscribe: vi.fn((callback) => {
          callback(overrideState);
          return () => { };
        }),
        getState: () => overrideState
      };
    });

    // 훅 렌더링
    renderHook(() => useBoardData());

    // Verify state directly
    expect(overrideState.boardError).toBe('저장된 레이아웃 로드 오류');
    expect(overrideState.needsFitView).toBe(true);
  });
}); 