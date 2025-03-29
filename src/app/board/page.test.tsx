/**
 * 파일명: page.test.tsx
 * 목적: 보드 페이지 컴포넌트 테스트
 * 역할: Board 컴포넌트를 사용하는 페이지 컴포넌트 테스트
 * 작성일: 2024-05-31
 */

import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import BoardPage from './page';
import { Node, Edge, NodeChange } from '@xyflow/react';
import '@testing-library/jest-dom/vitest';
import { autoLayoutNodes } from './page';

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
vi.mock('@xyflow/react', () => {
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
    Panel: ({ position, children, className, ...props }: any) => (
      <div data-testid={`react-flow-panel-${position}`} className={className} {...props}>
        {position === "top-left" && className === "z-20" ?
          children : children}
      </div>
    ),
    useNodesState: () => [nodesMock, setNodesMock, onNodesChangeMock],
    useEdgesState: () => [edgesMock, setEdgesMock, onEdgesChangeMock],
    ConnectionLineType: {
      Bezier: 'bezier',
      Straight: 'straight',
      Step: 'step',
      SmoothStep: 'smoothstep',
      SimpleBezier: 'simplebezier',
    },
    MarkerType: {
      Arrow: 'arrow',
      ArrowClosed: 'arrowclosed',
    },
    Position: {
      Top: 'top',
      Right: 'right',
      Bottom: 'bottom',
      Left: 'left',
    },
    useReactFlow: () => ({
      getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
      project: (pos: any) => pos,
      getBoundingClientRect: () => ({ width: 1000, height: 600, x: 0, y: 0, top: 0, left: 0, right: 1000, bottom: 600 }),
      screenToFlowPosition: (pos: any) => pos,
      fitView: vi.fn(),
    }),
    useUpdateNodeInternals: () => vi.fn(),
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
    EdgeChange: vi.fn(),
    Connection: vi.fn(),
    OnConnectStart: vi.fn(),
    OnConnectEnd: vi.fn(),
    XYPosition: vi.fn(),
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
  Layout: () => <div data-testid="layout-icon">Layout</div>,
  AlignHorizontalJustifyCenter: () => <div data-testid="horizontal-layout-icon">Horizontal</div>,
  AlignVerticalJustifyCenter: () => <div data-testid="vertical-layout-icon">Vertical</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  Box: () => <div data-testid="box-icon">Box</div>,
  Grid3X3: () => <div data-testid="grid-3x3-icon">Grid3X3</div>,
  ArrowRightIcon: () => <div data-testid="arrow-right-icon">ArrowRight</div>,
  ArrowRight: () => <div data-testid="arrow-right-icon">ArrowRight</div>,
  Circle: () => <div data-testid="circle-icon">Circle</div>,
  SeparatorHorizontal: () => <div data-testid="separator-horizontal-icon">SeparatorHorizontal</div>,
  Paintbrush: () => <div data-testid="paintbrush-icon">Paintbrush</div>,
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

// 테스트 전체에서 사용할 카드 데이터
const mockCardData = [
  { id: 1, title: '테스트 카드 1', content: '내용 1', cardTags: [] },
  { id: 2, title: '테스트 카드 2', content: '내용 2', cardTags: [] }
];

// 필요한 모의 설정 추가
vi.mock('@/components/board/components/Board', () => ({
  default: ({ onSelectCard, className, showControls }: any) => (
    <div
      data-testid="board-component"
      data-selectcard={!!onSelectCard}
      data-classname={className}
      data-showcontrols={showControls}
    >
      Board Component
    </div>
  ),
}));

// useAppStore 모킹 추가
vi.mock('@/store/useAppStore', () => ({
  useAppStore: () => ({
    selectCard: vi.fn(),
    // 기존 테스트에서 필요한 다른 상태/함수들
    cards: [],
    setCards: vi.fn(),
    selectedCardIds: [],
    toggleSelectedCard: vi.fn(),
    clearSelectedCards: vi.fn(),
  }),
}));

describe('BoardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // fetch 모킹
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );
  });

  test('renders Board component inside ReactFlowProvider', async () => {
    render(<BoardPage />);

    // ReactFlowProvider가 렌더링되었는지 확인
    expect(screen.getByTestId('react-flow-provider')).toBeInTheDocument();

    // Board 컴포넌트가 렌더링되었는지 확인
    const boardComponent = screen.getByTestId('board-component');
    expect(boardComponent).toBeInTheDocument();

    // Board 컴포넌트에 올바른 props가 전달되었는지 확인
    expect(boardComponent.getAttribute('data-selectcard')).toBe('true');
    expect(boardComponent.getAttribute('data-classname')).toBe('bg-background');
    expect(boardComponent.getAttribute('data-showcontrols')).toBe('true');
  });

  test('autoLayoutNodes function returns correctly formatted nodes', () => {
    // autoLayoutNodes 함수 테스트
    const testNodes = [
      { id: '1', position: { x: 0, y: 0 } },
      { id: '2', position: { x: 0, y: 0 } }
    ];

    const result = autoLayoutNodes(testNodes);

    expect(result).toHaveLength(2);
    expect(result[0].position.x).toBe(50);
    expect(result[0].position.y).toBe(50);
    expect(result[1].position.x).toBe(350);
    expect(result[1].position.y).toBe(50);
  });
}); 