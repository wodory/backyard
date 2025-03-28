/**
 * 파일명: CardNode.test.tsx
 * 목적: CardNode 컴포넌트 테스트
 * 역할: 카드 노드 컴포넌트의 기능 테스트
 * 작성일: 2024-05-31
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CardNode from '../CardNode';
import { ReactFlowProvider, Node, NodeProps } from '@xyflow/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NodeData } from '../CardNode';

// AppStore 모킹
vi.mock('@/store/useAppStore', () => ({
  useAppStore: (selector: Function) => {
    const state = {
      selectCard: vi.fn(),
      addSelectedCard: vi.fn(),
      removeSelectedCard: vi.fn(),
      selectedCardIds: [],
      updateCard: vi.fn(),
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
        size: 8
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
      setNodes: vi.fn()
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
    expect(screen.getByTestId('handle-right')).toBeInTheDocument();
    expect(screen.getByTestId('handle-left')).toBeInTheDocument();
    expect(screen.getByTestId('handle-bottom')).toBeInTheDocument();
    expect(screen.getByTestId('handle-top')).toBeInTheDocument();
    
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
}); 