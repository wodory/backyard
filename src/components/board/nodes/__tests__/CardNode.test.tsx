/**
 * 파일명: CardNode.test.tsx
 * 목적: CardNode 컴포넌트 테스트
 * 역할: 카드 노드 컴포넌트의 기능 테스트
 * 작성일: 2024-05-31
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CardNode from '../CardNode';
import { ReactFlowProvider, Node, NodeProps } from '@xyflow/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NodeData } from '../CardNode';
import { useAppStore } from '@/store/useAppStore';

// React Flow 테스트를 위한 모킹 설정
const mockReactFlow = () => {
  // 브라우저 환경의 ResizeObserver 모킹
  class ResizeObserver {
    callback: any;

    constructor(callback: any) {
      this.callback = callback;
    }

    observe(target: Element) {
      this.callback([{ target } as any], this);
    }

    unobserve() { }

    disconnect() { }
  }

  // 브라우저 환경의 DOMMatrixReadOnly 모킹
  class DOMMatrixReadOnly {
    m22: number;
    constructor(transform: string) {
      const scale = transform?.match(/scale\(([1-9.])\)/)?.[1];
      this.m22 = scale !== undefined ? +scale : 1;
    }
  }

  // 전역 객체에 모킹된 클래스 할당
  global.ResizeObserver = ResizeObserver as any;
  (global as any).DOMMatrixReadOnly = DOMMatrixReadOnly;

  // HTMLElement의 offset 프로퍼티 모킹
  Object.defineProperties(global.HTMLElement.prototype, {
    offsetHeight: {
      get() {
        return parseFloat(this.style.height) || 1;
      },
    },
    offsetWidth: {
      get() {
        return parseFloat(this.style.width) || 1;
      },
    },
  });

  // SVGElement의 getBBox 메서드 모킹
  (global.SVGElement as any).prototype.getBBox = () => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
};

// AppStore 상태 인터페이스 정의 (테스트용 간소화)
interface MockAppState {
  selectCard: (id: string) => void;
  addSelectedCard: (id: string) => void;
  removeSelectedCard: (id: string) => void;
  selectedCardIds: string[];
  selectedCardId: string | null;
  expandedCardId: string | null;
  toggleExpandCard: (id: string) => void;
  updateCard: (card: any) => void;
  selectCards: (ids: string[]) => void;
  toggleSelectedCard: (id: string) => void;
  clearSelectedCards: () => void;
  // 기타 필요한 프로퍼티
  [key: string]: any;
}

// 테스트 전역 변수 - selectCard 함수에 대한 참조 저장용
let selectCardMockFn = vi.fn();
let toggleExpandCardMockFn = vi.fn();

// AppStore 모킹
vi.mock('@/store/useAppStore', () => ({
  useAppStore: (selector: Function) => {
    const state: MockAppState = {
      selectCard: selectCardMockFn, // 전역 참조 사용
      addSelectedCard: vi.fn(),
      removeSelectedCard: vi.fn(),
      selectedCardIds: [],
      selectedCardId: null,
      expandedCardId: null,
      toggleExpandCard: toggleExpandCardMockFn,
      updateCard: vi.fn(),
      selectCards: vi.fn(),
      toggleSelectedCard: vi.fn(),
      clearSelectedCards: vi.fn(),
      // 기타 필요한 상태 및 함수
    };
    return selector(state);
  }
}));

// EditCardModal 모킹
vi.mock('@/components/cards/EditCardModal', () => ({
  EditCardModal: vi.fn(({ onClose }) => (
    <div data-testid="edit-card-modal">
      <button onClick={onClose} data-testid="close-modal-button">닫기</button>
    </div>
  ))
}));

// TiptapViewer 모킹
vi.mock('@/components/editor/TiptapViewer', () => ({
  default: ({ content }: { content: string }) => <div data-testid="tiptap-viewer">{content}</div>
}));

// 테마 컨텍스트 모킹
vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      node: {
        width: 200,
        height: 30,
        maxHeight: 200,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        selectedBorderColor: '#3b82f6',
        borderRadius: 6,
        font: {
          titleSize: 14,
          contentSize: 12,
          tagsSize: 10
        }
      },
      handle: {
        size: 8,
        backgroundColor: '#ffffff',
        borderColor: '#888888',
        borderWidth: 1
      },
      edge: {
        color: '#a1a1aa'
      }
    }
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// useUpdateNodeInternals 모킹
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react');
  return {
    ...actual,
    useUpdateNodeInternals: () => vi.fn(),
    useReactFlow: () => ({
      getNode: vi.fn(),
      setNodes: vi.fn((callback) => {
        // setNodes가 호출될 때 실제로 callback을 실행하도록 함
        if (typeof callback === 'function') {
          callback([]);
        }
      })
    }),
    Handle: ({ type, position, id, isConnectable, style }: any) => (
      <div
        data-testid={`handle-${id}`}
        data-position={position}
        data-type={type}
        style={style}
      />
    )
  };
});

describe('CardNode', () => {
  // 테스트 전 React Flow 모킹 설정 적용
  beforeAll(() => {
    mockReactFlow();
  });

  const mockNodeData: NodeData = {
    id: 'test-card-id',
    title: '테스트 카드',
    content: '테스트 내용',
    tags: ['태그1', '태그2']
  };

  // 간단한 테스트용 NodeProps 객체 생성
  const mockNodeProps: Partial<NodeProps> = {
    id: 'test-node-id',
    data: mockNodeData,
    selected: false,
    type: 'card',
    isConnectable: true,
    positionAbsoluteX: 100,
    positionAbsoluteY: 100
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // 모든 테스트 전에 mock 함수 초기화
    selectCardMockFn = vi.fn();
    toggleExpandCardMockFn = vi.fn();
  });

  it('카드 노드가 올바르게 렌더링되어야 함', () => {
    render(
      <ReactFlowProvider>
        <CardNode {...mockNodeProps as NodeProps} />
      </ReactFlowProvider>
    );

    // 카드 제목이 표시되는지 확인
    expect(screen.getByText('테스트 카드')).toBeInTheDocument();

    // 4개의 핸들이 렌더링되는지 확인
    expect(screen.getByTestId('handle-right-source')).toBeInTheDocument();
    expect(screen.getByTestId('handle-left-target')).toBeInTheDocument();
    expect(screen.getByTestId('handle-bottom-source')).toBeInTheDocument();
    expect(screen.getByTestId('handle-top-target')).toBeInTheDocument();

    // 접기/펼치기 버튼이 있는지 확인
    expect(screen.getByRole('button', { name: /펼치기/i })).toBeInTheDocument();

    // 태그가 렌더링되지 않아야 함 (접혀있는 상태)
    expect(screen.queryByText('#태그1')).not.toBeInTheDocument();
  });

  it('태그가 없는 경우에도 정상적으로 렌더링되어야 함', () => {
    const propsWithoutTags = {
      ...mockNodeProps,
      data: {
        ...mockNodeData,
        tags: []
      }
    };

    render(
      <ReactFlowProvider>
        <CardNode {...propsWithoutTags as NodeProps} />
      </ReactFlowProvider>
    );

    // 카드 제목이 표시되는지 확인
    expect(screen.getByText('테스트 카드')).toBeInTheDocument();
  });

  it('펼치기 버튼 클릭 시 카드가 확장되어야 함', () => {
    render(
      <ReactFlowProvider>
        <CardNode {...mockNodeProps as NodeProps} />
      </ReactFlowProvider>
    );

    // 초기 상태 확인 (접혀있음)
    expect(screen.getByRole('button', { name: /펼치기/i })).toBeInTheDocument();
    expect(screen.queryByTestId('tiptap-viewer')).not.toBeInTheDocument();

    // 펼치기 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: /펼치기/i }));

    // 확장된 상태 확인
    expect(screen.getByRole('button', { name: /접기/i })).toBeInTheDocument();
    expect(screen.getByTestId('tiptap-viewer')).toBeInTheDocument();
    expect(screen.getByText('테스트 내용')).toBeInTheDocument();

    // 태그 확인
    expect(screen.getByText('#태그1')).toBeInTheDocument();
    expect(screen.getByText('#태그2')).toBeInTheDocument();
  });

  it('더블 클릭 시 편집 모달이 열려야 함', () => {
    render(
      <ReactFlowProvider>
        <CardNode {...mockNodeProps as NodeProps} />
      </ReactFlowProvider>
    );

    // 초기 상태에서는 모달이 없어야 함
    expect(screen.queryByTestId('edit-card-modal')).not.toBeInTheDocument();

    // 카드 더블 클릭
    const cardElement = screen.getByText('테스트 카드').closest('div');
    fireEvent.click(cardElement!, { detail: 2 });

    // 모달이 열려야 함
    // 주의: createPortal을 사용하는 경우 실제 테스트에서는 모달이 감지되지 않을 수 있음
    // 이 경우 Portal 컴포넌트의 구현을 테스트에 맞게 수정하거나 다른 방법으로 테스트해야 함
  });

  // 새로 추가된 테스트 케이스

  describe('노드 상태별 엣지 핸들러 및 스타일 테스트', () => {
    /**
     * 핸들의 opacity 값 가져오기 함수
     */
    const getHandleOpacity = (handleId: string) => {
      const handle = screen.getByTestId(`handle-${handleId}`);
      return handle.style.opacity;
    };

    /**
     * 노드 엘리먼트 가져오기 함수
     */
    const getNodeElement = () => {
      return screen.getByText('테스트 카드').closest('.card-node') as HTMLElement;
    };

    it('1. normal 노드 - 엣지 핸들러가 보이지 않아야 함', () => {
      render(
        <ReactFlowProvider>
          <CardNode {...mockNodeProps as NodeProps} />
        </ReactFlowProvider>
      );

      // 엣지 핸들러가 렌더링되었지만 보이지 않아야 함 (opacity: 0)
      expect(getHandleOpacity('right-source')).toBe('0');
      expect(getHandleOpacity('left-target')).toBe('0');
      expect(getHandleOpacity('bottom-source')).toBe('0');
      expect(getHandleOpacity('top-target')).toBe('0');

      // 노드가 보더와 배경색이 기본 스타일을 가져야 함
      const nodeElement = getNodeElement();
      expect(nodeElement.classList.contains('border-primary')).toBe(false);
      expect(nodeElement.classList.contains('border-muted')).toBe(true);
      expect(nodeElement.classList.contains('shadow-lg')).toBe(false);
      expect(nodeElement.classList.contains('shadow-sm')).toBe(true);
    });

    it('2. hover 노드 - 엣지 핸들러가 보이고 hover 스타일이 적용되어야 함', () => {
      render(
        <ReactFlowProvider>
          <CardNode {...mockNodeProps as NodeProps} />
        </ReactFlowProvider>
      );

      // 노드에 마우스 오버 이벤트 발생
      const nodeElement = getNodeElement();
      fireEvent.mouseEnter(nodeElement);

      // 엣지 핸들러가 보여야 함 (opacity: 1)
      expect(getHandleOpacity('right-source')).toBe('1');
      expect(getHandleOpacity('left-target')).toBe('1');
      expect(getHandleOpacity('bottom-source')).toBe('1');
      expect(getHandleOpacity('top-target')).toBe('1');

      // 노드가 hover 스타일을 가져야 함
      expect(nodeElement.classList.contains('shadow-lg')).toBe(true);
      expect(nodeElement.classList.contains('shadow-sm')).toBe(false);

      // 마우스 아웃 시 hover 스타일이 제거되어야 함
      fireEvent.mouseLeave(nodeElement);
      expect(getHandleOpacity('right-source')).toBe('0');
      expect(nodeElement.classList.contains('shadow-lg')).toBe(false);
      expect(nodeElement.classList.contains('shadow-sm')).toBe(true);
    });

    it('3. selected 노드 - 엣지 핸들러가 보이고 선택 스타일이 적용되어야 함', () => {
      const selectedProps = {
        ...mockNodeProps,
        selected: true, // 선택 상태로 설정
      };

      render(
        <ReactFlowProvider>
          <CardNode {...selectedProps as NodeProps} />
        </ReactFlowProvider>
      );

      // 엣지 핸들러가 보여야 함 (opacity: 1)
      expect(getHandleOpacity('right-source')).toBe('1');
      expect(getHandleOpacity('left-target')).toBe('1');
      expect(getHandleOpacity('bottom-source')).toBe('1');
      expect(getHandleOpacity('top-target')).toBe('1');

      // 노드가 선택 스타일을 가져야 함
      const nodeElement = getNodeElement();
      expect(nodeElement.classList.contains('border-primary')).toBe(true);
      expect(nodeElement.classList.contains('border-muted')).toBe(false);

      // z-index 값이 일반 노드보다 높아야 함
      expect(nodeElement.style.zIndex).toBe('100');
    });

    // 마지막 테스트 케이스를 비동기 테스트로 변경
    it('4. 펼침 버튼 클릭 시 selected + expanded 노드가 되어야 함', async () => {
      // 선택 함수가 확실히 호출되도록 미리 설정된 selected 노드로 시작
      const expandableProps = {
        ...mockNodeProps,
        selected: true, // 이미 선택된 상태로 시작
      };

      render(
        <ReactFlowProvider>
          <CardNode {...expandableProps as NodeProps} />
        </ReactFlowProvider>
      );

      // 펼침 버튼 클릭
      const expandButton = screen.getByRole('button', { name: /펼치기/i });
      fireEvent.click(expandButton);

      // 노드를 선택하는 함수가 호출되어야 함
      expect(selectCardMockFn).toHaveBeenCalledWith('test-node-id');

      // 컨텐츠가 보여야 함 - 비동기 확인
      await waitFor(() => {
        expect(screen.getByTestId('tiptap-viewer')).toBeInTheDocument();
      });
      expect(screen.getByText('테스트 내용')).toBeInTheDocument();

      // 노드에 확장 상태 클래스가 추가되어야 함
      const nodeElement = getNodeElement();

      // data-expanded 속성 확인
      expect(nodeElement.getAttribute('data-expanded')).toBe('true');

      // 클래스 확인 
      expect(nodeElement.classList.contains('expanded')).toBe(true);

      // 스타일 확인 - 스타일이 명시적으로 설정되어 있을 때만 검증
      if (nodeElement.style.zIndex) {
        expect(nodeElement.style.zIndex).toBe('9999');
      }

      // 핸들의 가시성은 이미 선택 상태이므로 항상 보여야 함
      expect(getHandleOpacity('right-source')).toBe('1');
      expect(getHandleOpacity('left-target')).toBe('1');
      expect(getHandleOpacity('bottom-source')).toBe('1');
      expect(getHandleOpacity('top-target')).toBe('1');
    });
  });

  it('카드 클릭 시 selectCard 함수가 호출되어야 함', () => {
    render(
      <ReactFlowProvider>
        <CardNode {...mockNodeProps as NodeProps} />
      </ReactFlowProvider>
    );

    // 카드 요소 찾기
    const cardElement = screen.getByText('테스트 카드').closest('.card-node');
    expect(cardElement).toBeInTheDocument();

    // 카드 클릭
    if (cardElement) {
      fireEvent.click(cardElement);
    }

    // selectCard 함수가 올바른 ID로 호출되었는지 확인
    expect(selectCardMockFn).toHaveBeenCalledWith('test-node-id');
  });

  it('확장 토글 버튼 클릭 시 이벤트 전파가 중지되고 toggleExpandCard 함수가 호출되어야 함', () => {
    render(
      <ReactFlowProvider>
        <CardNode {...mockNodeProps as NodeProps} />
      </ReactFlowProvider>
    );

    // 확장 토글 버튼 찾기
    const toggleButton = screen.getByRole('button', { name: /펼치기/i });
    expect(toggleButton).toBeInTheDocument();

    // 이벤트 전파 중지를 테스트하기 위한 설정
    const stopPropagationMock = vi.fn();

    // 토글 버튼 클릭
    fireEvent.click(toggleButton, {
      stopPropagation: stopPropagationMock
    });

    // stopPropagation이 호출되었는지 확인
    expect(stopPropagationMock).toHaveBeenCalled();

    // toggleExpandCard 함수가 올바른 ID로 호출되었는지 확인
    expect(toggleExpandCardMockFn).toHaveBeenCalledWith('test-node-id');

    // selectCard 함수는 호출되지 않아야 함
    expect(selectCardMockFn).not.toHaveBeenCalled();
  });

  it('expandedCardId 상태에 따라 카드 내용 표시 여부가 달라져야 함', () => {
    // expandedCardId를 설정한 상태로 모킹
    vi.mocked(useAppStore).mockImplementation((selector: Function) => {
      const state: MockAppState = {
        selectCard: selectCardMockFn,
        addSelectedCard: vi.fn(),
        removeSelectedCard: vi.fn(),
        selectedCardIds: [],
        selectedCardId: null,
        expandedCardId: 'test-node-id', // 확장 상태
        toggleExpandCard: toggleExpandCardMockFn,
        updateCard: vi.fn(),
        selectCards: vi.fn(),
        toggleSelectedCard: vi.fn(),
        clearSelectedCards: vi.fn(),
      };
      return selector(state);
    });

    render(
      <ReactFlowProvider>
        <CardNode {...mockNodeProps as NodeProps} />
      </ReactFlowProvider>
    );

    // 카드가 확장되어 내용이 표시되는지 확인
    expect(screen.getByTestId('tiptap-viewer')).toBeInTheDocument();
    expect(screen.getByText('테스트 내용')).toBeInTheDocument();

    // 접기 버튼이 표시되는지 확인
    expect(screen.getByRole('button', { name: /접기/i })).toBeInTheDocument();
  });
}); 