import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import BoardPage from './page';
import { Node, Edge, NodeChange } from '@xyflow/react';

// LocalStorage 모킹
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
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// ResizeObserver 모킹 (ReactFlow에서 필요)
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.ResizeObserver = ResizeObserverMock;

// React Flow의 applyNodeChanges 함수 결과를 모킹하기 위한 변수
let mockAppliedNodes: Node[] = [];

// ReactFlow 전체 모킹 - 테스트에서는 실제 렌더링 없이 모킹된 구성요소만 사용
const nodesMock: Node[] = [];
const edgesMock: Edge[] = [];
const setNodesMock = vi.fn();
const setEdgesMock = vi.fn();
const onNodesChangeMock = vi.fn();
const onEdgesChangeMock = vi.fn();

// viewportCenter 모킹 - getNewCardPosition에서 사용
const viewportCenterMock = { x: 500, y: 300 };

// ReactFlow의 ReactFlowProvider와 useReactFlow hook 모킹
vi.mock('reactflow', () => {
  // ReactFlow 컴포넌트 모킹
  const ReactFlowMock = ({ children, onNodesChange }: { children?: React.ReactNode, onNodesChange?: (changes: NodeChange[]) => void }) => (
    <div 
      data-testid="react-flow-mock"
      onClick={() => {
        // 노드 위치 변경 시뮬레이션
        if (onNodesChange) {
          onNodesChange([{
            type: 'position',
            id: '1',
            position: { x: 200, y: 200 },
          } as NodeChange]);
        }
      }}
    >
      {children}
    </div>
  );
  
  return {
    // default export 추가 (중요!)
    default: ReactFlowMock,
    // 필요한 다른 export들
    ReactFlow: ReactFlowMock,
    ReactFlowProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="react-flow-provider">{children}</div>
    ),
    Controls: () => <div data-testid="react-flow-controls">Controls</div>,
    Background: () => <div data-testid="react-flow-background">Background</div>,
    Panel: ({ position, children }: any) => (
      <div data-testid={`react-flow-panel-${position}`}>{children}</div>
    ),
    useNodesState: () => [nodesMock, setNodesMock, onNodesChangeMock],
    useEdgesState: () => [edgesMock, setEdgesMock, onEdgesChangeMock],
    ConnectionLineType: {
      SmoothStep: 'smoothstep',
    },
    useReactFlow: () => ({
      getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
      project: (pos: any) => pos,
      getBoundingClientRect: () => ({ width: 1000, height: 600, x: 0, y: 0, top: 0, left: 0, right: 1000, bottom: 600 }),
      screenToFlowPosition: (pos: any) => pos,
    }),
    applyNodeChanges: vi.fn((changes, nodes) => {
      // 변경사항 적용 결과 모킹
      mockAppliedNodes = [
        { id: '1', position: { x: 200, y: 200 } },
        { id: '2', position: { x: 400, y: 400 } },
      ] as Node[];
      return mockAppliedNodes;
    }),
    applyEdgeChanges: vi.fn((changes, edges) => edges),
    addEdge: vi.fn((connection, edges) => [
      ...edges,
      { id: `e-${Date.now()}`, source: connection.source, target: connection.target }
    ]),
    // 추가적인 타입 에러 방지를 위한 export
    Node: vi.fn(),
    Edge: vi.fn(),
    NodeChange: vi.fn(),
  };
});

// CreateCardButton 모킹
vi.mock('@/components/cards/CreateCardButton', () => ({
  default: ({ onCardCreated }: { onCardCreated?: (cardData: any) => void }) => (
    <button 
      data-testid="create-card-button"
      onClick={() => {
        if (onCardCreated) {
          onCardCreated({
            id: 'new-card-123',
            title: '새 카드',
            content: '새 카드 내용',
            cardTags: [{ tag: { name: '새태그' } }],
            createdAt: new Date().toISOString(),
          });
        }
      }}
    >
      새 카드 만들기
    </button>
  ),
}));

// Console error 모킹
console.error = vi.fn();

// Toast 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// mocking fetch API
global.fetch = vi.fn();

// 추가 모듈 모킹 설정
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, asChild, variant, size }: any) => (
    <button 
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      data-as-child={asChild}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/board/CardNode', () => ({
  default: ({ data }: any) => (
    <div data-testid={`card-node-${data.id}`}>
      <h3>{data.title}</h3>
      <p>{data.content}</p>
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon">Loading</div>,
  Save: () => <div data-testid="save-icon">Save</div>,
  LayoutGrid: () => <div data-testid="layout-grid-icon">Grid</div>,
}));

// BoardPage 컴포넌트 모킹을 위한 내부 함수 모킹
vi.mock('./page', async (importOriginal) => {
  // 원본 모듈 가져오기
  const originalModule = await importOriginal();
  
  // 실제 BoardPage 컴포넌트를 사용, 단 내부 함수는 모킹
  return {
    ...(originalModule as object),
    // 필요한 내부 함수만 모킹하고 컴포넌트는 그대로 유지
    getNewCardPosition: vi.fn((viewportCenter) => {
      return viewportCenter || { x: 500, y: 300 }; // 모킹된 중앙 위치 반환
    }),
    autoLayoutNodes: vi.fn((nodes: Node[]) => {
      // 자동 배치 기능 모킹
      return nodes.map((node: Node, index: number) => ({
        ...node,
        position: {
          x: (index % 3) * 300 + 50, 
          y: Math.floor(index / 3) * 200 + 50
        }
      }));
    })
  };
});

describe('BoardPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorageMock.clear();
    mockAppliedNodes = [];
    
    // console.error를 spyOn으로 모킹
    vi.spyOn(console, 'error');
    
    // fetch API 성공 응답 기본 모킹
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] },
        { id: 2, title: '테스트 카드 2', content: '내용 2', cardTags: [] }
      ]),
    });
    
    // getBoundingClientRect 모킹 (reactFlowWrapper.current)
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1000,
      height: 600,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 600,
      toJSON: () => {}
    }));
  });

  test('로딩 상태를 표시해야 함', () => {
    // fetch 응답을 받기 전에는 로딩 상태를 표시
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));

    render(<BoardPage />);
    
    expect(screen.getByText('보드를 불러오는 중...')).toBeInTheDocument();
  });

  test('카드 데이터 불러오기 실패 시 에러 메시지를 표시해야 함', async () => {
    // 실패 응답 모킹
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: '카드 데이터를 불러오는데 실패했습니다.' }),
    });

    render(<BoardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('카드 데이터를 불러오는데 실패했습니다.')).toBeInTheDocument();
    });
    
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });

  test('카드 데이터 불러오기 성공 시 ReactFlow 컴포넌트가 렌더링되어야 함', async () => {
    render(<BoardPage />);
    
    // 로딩이 끝나고 ReactFlow 컴포넌트가 렌더링 되는지 확인
    await waitFor(() => {
      // ReactFlowProvider 내에 있는 ReactFlow 컴포넌트 확인
      expect(screen.getByTestId('react-flow-provider')).toBeInTheDocument();
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 패널 내부의 콘텐츠 확인
    expect(screen.getByTestId('react-flow-panel-top-left')).toHaveTextContent('카드 보드');
    expect(screen.getByTestId('react-flow-panel-top-left')).toHaveTextContent('노드를 드래그하여 위치를 변경할 수 있습니다.');
    expect(screen.getByRole('link', { name: '카드 목록' })).toBeInTheDocument();
  });

  test('저장된 레이아웃이 있을 경우 로컬 스토리지에서 로드해야 함', async () => {
    // 로컬 스토리지에 레이아웃 저장
    const storedLayout = [
      { id: '1', position: { x: 100, y: 100 } },
      { id: '2', position: { x: 300, y: 300 } }
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedLayout));
    
    render(<BoardPage />);
    
    // 비동기 로딩 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 로컬 스토리지에서 레이아웃 로드 확인
    expect(localStorageMock.getItem).toHaveBeenCalledWith('backyard-board-layout');
  });

  test('레이아웃 저장 버튼 클릭 시 현재 레이아웃이 저장되어야 함', async () => {
    render(<BoardPage />);
    
    // ReactFlow가 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 레이아웃 저장 버튼 찾기
    const buttons = screen.getAllByRole('button');
    const saveLayoutButton = Array.from(buttons).find(
      button => button.textContent?.includes('레이아웃 저장')
    );
    
    // 버튼 있는지 확인
    expect(saveLayoutButton).toBeInTheDocument();
    
    // 버튼 클릭
    if (saveLayoutButton) {
      fireEvent.click(saveLayoutButton);
    }
    
    // localStorage 저장 확인
    expect(localStorageMock.setItem).toHaveBeenCalledWith('backyard-board-layout', expect.any(String));
    
    // toast 확인
    const { toast } = await import('sonner');
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('보드 레이아웃과 연결선이 저장되었습니다'));
  });

  test('ReactFlow에서 노드 이동 시 localStorage에 위치가 저장되어야 함', async () => {
    render(<BoardPage />);
    
    // ReactFlow가 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // ReactFlow 컴포넌트 클릭해서 노드 이동 이벤트 시뮬레이션
    const reactFlowElement = screen.getByTestId('react-flow-mock');
    fireEvent.click(reactFlowElement);
    
    // localStorage 저장 확인
    expect(localStorageMock.setItem).toHaveBeenCalledWith('backyard-board-layout', expect.any(String));
  });

  test('카드 생성 버튼 클릭 시 새 카드가 보드에 추가되어야 함', async () => {
    render(<BoardPage />);
    
    // ReactFlow가 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 카드 생성 버튼 찾기
    const createCardButton = screen.getByTestId('create-card-button');
    
    // 버튼 클릭
    fireEvent.click(createCardButton);
    
    // toast 확인 (모킹된 toast 함수 호출 확인)
    const { toast } = await import('sonner');
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('카드가 보드에 추가되었습니다'));
  });

  test('자동 배치 버튼 클릭 시 노드가 자동으로 배치되어야 함', async () => {
    render(<BoardPage />);
    
    // ReactFlow가 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 자동 배치 버튼 찾기 (Panel 내부의 버튼)
    const buttons = screen.getAllByRole('button');
    const autoLayoutButton = Array.from(buttons).find(
      button => button.textContent?.includes('자동 배치')
    );
    
    // 버튼 있는지 확인
    expect(autoLayoutButton).toBeInTheDocument();
    
    // 버튼 클릭
    if (autoLayoutButton) {
      fireEvent.click(autoLayoutButton);
    }
    
    // toast 확인
    const { toast } = await import('sonner');
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('카드가 자동으로 배치되었습니다'));
  });

  test('노드 위치 변경 시 로컬 스토리지에 저장되어야 함', async () => {
    // 성공 응답 모킹 - API 응답 형식 수정
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] },
        { id: 2, title: '테스트 카드 2', content: '내용 2', cardTags: [] }
      ]),
    });

    // getBoundingClientRect 모킹
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1000,
      height: 600,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 600,
      toJSON: () => {}
    }));

    render(<BoardPage />);
    
    // ReactFlow가 렌더링 될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // ReactFlow 컴포넌트 클릭으로 노드 위치 변경 이벤트 시뮬레이션
    fireEvent.click(screen.getByTestId('react-flow-mock'));
    
    // 로컬 스토리지에 저장되었는지 확인
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'backyard-board-layout',
      expect.any(String)
    );
  });

  test('로컬 스토리지 저장 시 오류가 발생하면 콘솔 에러가 출력되어야 함', async () => {
    // 성공 응답 모킹 - API 응답 형식 수정
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] }
      ]),
    });

    // localStorage.setItem에서 에러 발생 시뮬레이션
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    // getBoundingClientRect 모킹
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1000,
      height: 600,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 600,
      toJSON: () => {}
    }));

    render(<BoardPage />);
    
    // ReactFlow가 렌더링 될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 저장 버튼 클릭
    const saveButton = screen.getByText('레이아웃 저장');
    saveButton.click();
    
    // 콘솔 에러가 호출되었는지 확인
    expect(console.error).toHaveBeenCalledWith('Error saving layout:', expect.any(Error));
  });

  test('저장된 레이아웃이 없는 경우 기본 그리드 위치를 사용해야 함', async () => {
    // 성공 응답 모킹 - 카드 3개
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 1, title: '카드 1', content: '내용 1', cardTags: [] },
        { id: 2, title: '카드 2', content: '내용 2', cardTags: [] },
        { id: 3, title: '카드 3', content: '내용 3', cardTags: [] }
      ]),
    });

    // getBoundingClientRect 모킹
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1000,
      height: 600,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 600,
      toJSON: () => {}
    }));

    render(<BoardPage />);
    
    // ReactFlow가 렌더링 될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 카드가 3개 이상인 경우 추가 엣지가 생성되었는지 확인
    expect(setEdgesMock).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ id: 'e1-2' }),
      expect.objectContaining({ id: 'e1-3' })
    ]));
  });

  test('로컬 스토리지 파싱 중 오류가 발생하면 콘솔 에러가 출력되어야 함', async () => {
    // 잘못된 JSON 형식으로 저장된 레이아웃 Mock
    localStorageMock.getItem.mockReturnValue('{ invalid json }');
    
    // 성공 응답 모킹 - API 응답 형식 수정
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] }
      ]),
    });

    // getBoundingClientRect 모킹
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1000,
      height: 600,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 600,
      toJSON: () => {}
    }));

    render(<BoardPage />);
    
    // ReactFlow가 렌더링 될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 콘솔 에러가 호출되었는지 확인
    expect(console.error).toHaveBeenCalledWith('Error loading stored layout:', expect.any(Error));
  });

  test('다시 시도 버튼을 클릭하면 카드를 다시 가져와야 함', async () => {
    // 처음에는 실패하도록 설정
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: '카드 데이터를 불러오는데 실패했습니다.' }),
    });

    // 두 번째 요청은 성공하도록 설정 - API 응답 형식 수정
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] }
      ]),
    });

    // getBoundingClientRect 모킹
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1000,
      height: 600,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 600,
      toJSON: () => {}
    }));

    render(<BoardPage />);
    
    // 에러 메시지가 표시될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('카드 데이터를 불러오는데 실패했습니다.')).toBeInTheDocument();
    });
    
    // 다시 시도 버튼 클릭
    const retryButton = screen.getByRole('button', { name: '다시 시도' });
    fireEvent.click(retryButton);
    
    // ReactFlow가 렌더링 될 때까지 대기 (성공 시)
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // fetch가 두 번 호출되었는지 확인
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('자동 배치 버튼을 클릭하면 노드가 자동으로 배치되어야 함', async () => {
    const { toast } = await import('sonner');
    
    // 성공 응답 모킹 - API 응답 형식 수정
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] },
        { id: 2, title: '테스트 카드 2', content: '내용 2', cardTags: [] }
      ]),
    });

    // getBoundingClientRect 모킹
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1000,
      height: 600,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 600,
      toJSON: () => {}
    }));

    render(<BoardPage />);
    
    // ReactFlow가 렌더링 될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 자동 배치 버튼 찾기
    const autoLayoutButton = screen.getByText('자동 배치');
    expect(autoLayoutButton).toBeInTheDocument();
    
    // 클릭 이벤트 호출
    autoLayoutButton.click();
    
    // 노드 상태 업데이트 확인
    expect(setNodesMock).toHaveBeenCalled();
    
    // 토스트 메시지 확인
    expect(toast.success).toHaveBeenCalledWith('카드가 자동으로 배치되었습니다.');
  });

  test('새 카드 생성 버튼을 클릭하면 새 카드가 보드에 추가되어야 함', async () => {
    const { toast } = await import('sonner');
    
    // 성공 응답 모킹 - API 응답 형식 수정
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] }
      ]),
    });

    // getBoundingClientRect 모킹
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1000,
      height: 600,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 600,
      toJSON: () => {}
    }));

    render(<BoardPage />);
    
    // ReactFlow가 렌더링 될 때까지 대기
    await waitFor(() => {
      expect(screen.getByTestId('react-flow-mock')).toBeInTheDocument();
    });
    
    // 새 카드 만들기 버튼 찾기
    const createCardButton = screen.getByTestId('create-card-button');
    expect(createCardButton).toBeInTheDocument();
    
    // 클릭 이벤트 호출
    createCardButton.click();
    
    // 노드 상태 업데이트 확인
    expect(setNodesMock).toHaveBeenCalled();
    
    // 토스트 메시지 확인
    expect(toast.success).toHaveBeenCalledWith('카드가 보드에 추가되었습니다.');
  });
}); 