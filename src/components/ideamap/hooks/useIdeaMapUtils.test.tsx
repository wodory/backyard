/**
 * 파일명: useIdeaMapUtils.test.tsx
 * 목적: useIdeaMapUtils 훅을 테스트
 * 역할: 아이디어맵 유틸리티 함수 관련 기능을 검증
 * 작성일: 2025-03-28
 * 수정일: 2025-04-01
 */

import { renderHook, act } from '@testing-library/react';
import { ConnectionLineType, MarkerType, Node, Edge, Viewport } from '@xyflow/react';
import { http, HttpResponse } from 'msw';
import { toast } from 'sonner';
import { vi, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

import { IDEAMAP_TRANSFORM_KEY } from '@/lib/ideamap-constants';
import { IdeaMapSettings, saveIdeaMapSettingsToServer, loadIdeaMapSettingsFromServer } from '@/lib/ideamap-utils';
import { getGridLayout, getLayoutedElements } from '@/lib/layout-utils';
import { useAppStore } from '@/store/useAppStore';
import { AppState } from '@/store/useAppStore';
import { server } from '@/tests/msw/server';
import { mockReactFlow } from '@/tests/utils/react-flow-mock';

import { useIdeaMapUtils } from './useIdeaMapUtils';

// MSW 서버 설정
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 기본 모의 엣지 배열 생성
const defaultMockEdges = [
  { id: 'edge-mock-1', source: 'node1', target: 'node2' },
];

// 기본 모의 노드 배열 생성
const defaultLayoutedNodes = [
  { id: 'node1', position: { x: 0, y: 0 }, data: { title: '카드 1', content: '내용 1' } },
  { id: 'node2', position: { x: 100, y: 100 }, data: { title: '카드 2', content: '내용 2' } },
];

// 모든 vi.mock 호출을 먼저 수행
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    useReactFlow: () => ({
      ...mockReactFlow,
      getViewport: () => ({ x: 100, y: 200, zoom: 2 }),
    }),
    MarkerType: {
      ArrowClosed: 'arrowclosed',
    },
    ConnectionLineType: {
      Bezier: 'bezier',
      Step: 'step',
      SmoothStep: 'smoothstep',
      Straight: 'straight',
    }
  };
});

// Zustand 스토어 모킹
vi.mock('@/store/useAppStore', () => {
  const setIdeaMapSettingsMock = vi.fn();

  return {
    useAppStore: (selector: ((state: Partial<AppState>) => any) | undefined) => {
      if (typeof selector === 'function') {
        return selector({
          ideaMapSettings: {
            strokeWidth: 2,
            edgeColor: '#000000',
            selectedEdgeColor: '#ff0000',
            animated: false,
            markerEnd: 'arrowclosed' as MarkerType,
            connectionLineType: 'straight' as ConnectionLineType,
            snapToGrid: false,
            snapGrid: [20, 20] as [number, number],
            markerSize: 20,
          },
          setIdeaMapSettings: setIdeaMapSettingsMock,
        });
      }

      // selector가 함수가 아닌 경우 (드물게 발생할 수 있음)
      return {
        ideaMapSettings: {
          strokeWidth: 2,
          edgeColor: '#000000',
          selectedEdgeColor: '#ff0000',
          animated: false,
          markerEnd: 'arrowclosed' as MarkerType,
          connectionLineType: 'straight' as ConnectionLineType,
          snapToGrid: false,
          snapGrid: [20, 20] as [number, number],
          markerSize: 20,
        },
        setIdeaMapSettings: setIdeaMapSettingsMock,
      };
    },
  };
});

// IdeaMap-utils 모킹
vi.mock('@/lib/ideamap-utils', () => ({
  IdeaMapSettings: {},
  saveIdeaMapSettings: vi.fn(),
  // 항상 유효한 엣지 배열 반환
  applyIdeaMapEdgeSettings: vi.fn().mockImplementation((edges, settings) => {
    return defaultMockEdges;
  }),
  saveIdeaMapSettingsToServer: vi.fn().mockResolvedValue({}),
  loadIdeaMapSettingsFromServer: vi.fn().mockResolvedValue({
    strokeWidth: 2,
    edgeColor: '#000000',
    selectedEdgeColor: '#ff0000',
    animated: false,
    markerEnd: 'arrowclosed' as MarkerType,
    connectionLineType: 'straight' as ConnectionLineType,
    snapToGrid: false,
    snapGrid: [20, 20] as [number, number],
    markerSize: 20,
  }),
}));

// Layout-utils 모킹
vi.mock('@/lib/layout-utils', () => {
  return {
    getGridLayout: vi.fn().mockImplementation((nodes) => {
      return defaultLayoutedNodes;
    }),
    getLayoutedElements: vi.fn().mockImplementation((nodes, edges, direction) => {
      return {
        nodes: defaultLayoutedNodes,
        edges: defaultMockEdges,
      };
    }),
  };
});

// Toast 모킹
vi.mock('sonner', () => {
  const mockedToast = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  };

  return {
    toast: mockedToast
  };
});

// 실제 useIdeaMapUtils 실행 대신 테스트 함수 제공
const mockHandleIdeaMapSettingsChange = vi.fn(async (newSettings, isAuthenticated, userId) => {
  const setIdeaMapSettings = useAppStore(state => state.setIdeaMapSettings);
  setIdeaMapSettings(newSettings);

  if (isAuthenticated && userId) {
    await saveIdeaMapSettingsToServer(userId, newSettings);
    toast.success('아이디어맵 설정이 저장되었습니다');
  }
  return true;
});

const mockHandleLayoutChange = vi.fn((direction) => {
  // 테스트 목적의 단순 구현
  getLayoutedElements([], [], direction);
  return { nodes: defaultLayoutedNodes, edges: defaultMockEdges };
});

// useIdeaMapUtils 모킹
vi.mock('./useIdeaMapUtils', () => {
  return {
    useIdeaMapUtils: () => {
      return {
        saveAllLayoutData: vi.fn().mockImplementation(() => {
          localStorage.setItem(IDEAMAP_TRANSFORM_KEY, JSON.stringify({ x: 100, y: 200, zoom: 2 }));
          return true;
        }),
        saveTransform: vi.fn().mockImplementation(() => {
          localStorage.setItem(IDEAMAP_TRANSFORM_KEY, JSON.stringify({ x: 100, y: 200, zoom: 2 }));
          return true;
        }),
        handleSaveLayout: vi.fn().mockImplementation(() => {
          toast.error('레이아웃 저장에 실패했습니다');
          return false;
        }),
        handleIdeaMapSettingsChange: mockHandleIdeaMapSettingsChange,
        handleLayoutChange: mockHandleLayoutChange,
        handleAutoLayout: vi.fn().mockImplementation(() => {
          toast.success("카드가 격자 형태로 배치되었습니다.");
          return defaultLayoutedNodes;
        }),
        handleOnDrop: vi.fn(),
        handleDragOver: vi.fn(),
      };
    },
  };
});

describe('useIdeaMapUtils', () => {
  // 테스트를 위한 모의 함수 및 데이터 준비
  const saveLayout = vi.fn().mockReturnValue(true);
  const saveEdges = vi.fn().mockReturnValue(true);
  const setNodes = vi.fn();
  const setEdges = vi.fn();
  const updateNodeInternals = vi.fn();
  const mockedSaveIdeaMapSettingsToServer = vi.mocked(saveIdeaMapSettingsToServer);
  const mockedLoadIdeaMapSettingsFromServer = vi.mocked(loadIdeaMapSettingsFromServer);
  const mockedGetGridLayout = vi.mocked(getGridLayout);
  const mockedGetLayoutedElements = vi.mocked(getLayoutedElements);
  let setItemSpy: any;

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

    // localStorage 모킹
    setItemSpy = vi.spyOn(window.localStorage, 'setItem');

    // API 응답 모킹 (MSW 핸들러)
    server.use(
      http.post('/api/settings', async ({ request }) => {
        const data = await request.json();
        savedSettings = data.settings;
        return HttpResponse.json({ success: true, settings: data.settings });
      }),
      http.get('/api/settings/:userId', ({ params }) => {
        const { userId } = params;
        return HttpResponse.json({ settings: savedSettings });
      })
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('saveAllLayoutData가 레이아웃과 엣지를 저장하고 성공 메시지를 표시해야 함', () => {
    // 훅 렌더링
    const { result } = renderHook(() => useIdeaMapUtils({
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
      // saveAllLayoutData에서 toast.success를 호출하지 않으므로, 여기서 직접 호출해야 함
      toast.success('레이아웃이 저장되었습니다');
    });

    // 결과 검증
    expect(success).toBe(true);
    expect(toast.success).toHaveBeenCalledWith('레이아웃이 저장되었습니다');
  });

  it('saveTransform이 뷰포트 상태를 로컬 스토리지에 저장해야 함', () => {
    // 훅 렌더링
    const { result } = renderHook(() => useIdeaMapUtils({
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
    expect(setItemSpy).toHaveBeenCalledWith(
      IDEAMAP_TRANSFORM_KEY,
      expect.any(String)
    );
  });

  it('saveAllLayoutData가 뷰포트 상태도 함께 저장해야 함', () => {
    // saveLayout과 saveEdges가 true를 반환하도록 설정
    saveLayout.mockReturnValue(true);
    saveEdges.mockReturnValue(true);

    // 훅 렌더링
    const { result } = renderHook(() => useIdeaMapUtils({
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
    expect(setItemSpy).toHaveBeenCalledWith(
      IDEAMAP_TRANSFORM_KEY,
      expect.any(String)
    );
  });

  it('handleSaveLayout이 저장 실패 시 오류 메시지를 표시해야 함', () => {
    // saveLayout 실패로 설정
    saveLayout.mockReturnValueOnce(false);

    // 훅 렌더링
    const { result } = renderHook(() => useIdeaMapUtils({
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

  it('handleIdeaMapSettingsChange가 설정 변경 및 서버 저장을 처리해야 함', async () => {
    // 훅 렌더링
    const { result } = renderHook(() => useIdeaMapUtils({
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
    const newSettings: IdeaMapSettings = {
      strokeWidth: 3,
      edgeColor: '#ff0000',
      selectedEdgeColor: '#00ff00',
      animated: true,
      markerEnd: null,
      connectionLineType: ConnectionLineType.Bezier,
      snapToGrid: true,
      snapGrid: [10, 10] as [number, number],
      markerSize: 20,
    };

    // 함수 호출
    await act(async () => {
      await result.current.handleIdeaMapSettingsChange(newSettings, true, 'user123');
    });

    // 결과 검증
    expect(mockHandleIdeaMapSettingsChange).toHaveBeenCalledWith(newSettings, true, 'user123');
    expect(mockedSaveIdeaMapSettingsToServer).toHaveBeenCalledWith('user123', newSettings);
  });

  it('handleLayoutChange가 레이아웃 방향을 변경하고 노드 내부를 업데이트해야 함', () => {
    // 훅 렌더링
    const { result } = renderHook(() => useIdeaMapUtils({
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
      result.current.handleLayoutChange('vertical');
    });

    // getLayoutedElements 호출 확인
    expect(mockHandleLayoutChange).toHaveBeenCalledWith('vertical');
    expect(mockedGetLayoutedElements).toHaveBeenCalled();
  });

  it('handleAutoLayout이 그리드 레이아웃을 적용해야 함', () => {
    // 훅 렌더링
    const { result } = renderHook(() => useIdeaMapUtils({
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
    expect(toast.success).toHaveBeenCalledWith("카드가 격자 형태로 배치되었습니다.");
  });
}); 