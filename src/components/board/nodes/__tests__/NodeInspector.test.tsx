/**
 * 파일명: NodeInspector.test.tsx
 * 목적: NodeInspector 컴포넌트 테스트
 * 역할: 노드 인스펙터 컴포넌트의 기능 테스트
 * 작성일: 2024-05-31
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NodeInspector } from '../NodeInspector';
import { Node } from '@xyflow/react';

// Modal 모킹
vi.mock('@/components/ui/modal', () => ({
  Modal: {
    Root: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
      <div data-testid="modal-root" data-open={open}>
        {children}
      </div>
    ),
    Content: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="modal-content">{children}</div>
    ),
    Title: ({ children }: { children: React.ReactNode }) => (
      <h2 data-testid="modal-title">{children}</h2>
    ),
    Description: ({ children }: { children: React.ReactNode }) => (
      <p data-testid="modal-description">{children}</p>
    ),
    Close: ({ children }: { children: React.ReactNode }) => (
      <button data-testid="modal-close">{children}</button>
    )
  }
}));

// useNodeStore 모킹
vi.mock('@/store/useNodeStore', () => ({
  useNodeStore: () => ({
    inspectorOpen: true,
    inspectedNode: {
      id: 'test-node-1',
      data: {
        title: 'Test Node',
        content: 'Test content',
        tags: ['tag1', 'tag2']
      },
      position: { x: 100, y: 100 }
    },
    setInspectorOpen: vi.fn(),
    setInspectedNode: vi.fn()
  })
}));

// TiptapViewer 모킹
vi.mock('@/components/editor/TiptapViewer', () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="tiptap-viewer">{content}</div>
  )
}));

describe('NodeInspector', () => {
  const mockNodes: Node[] = [
    {
      id: 'test-node-1',
      data: {
        title: 'Test Node',
        content: 'Test content',
        tags: ['tag1', 'tag2']
      },
      position: { x: 100, y: 100 },
      type: 'card'
    },
    {
      id: 'test-node-2',
      data: {
        title: 'Test Node 2',
        content: 'Another content',
        tags: ['tag3']
      },
      position: { x: 300, y: 200 },
      type: 'card'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('노드 인스펙터가 열렸을 때 내용이 올바르게 표시되어야 함', () => {
    render(<NodeInspector nodes={mockNodes} />);

    // 모달이 열려 있는지 확인
    const modalRoot = screen.getByTestId('modal-root');
    expect(modalRoot).toHaveAttribute('data-open', 'true');

    // 제목이 올바르게 표시되는지 확인
    const modalTitle = screen.getByTestId('modal-title');
    expect(modalTitle).toHaveTextContent('Test Node');

    // 내용이 올바르게 표시되는지 확인
    const tiptapViewer = screen.getByTestId('tiptap-viewer');
    expect(tiptapViewer).toHaveTextContent('Test content');

    // 태그가 올바르게 표시되는지 확인
    const tagElements = screen.getAllByTestId('node-tag');
    expect(tagElements).toHaveLength(2);
    expect(tagElements[0]).toHaveTextContent('tag1');
    expect(tagElements[1]).toHaveTextContent('tag2');
  });

  it('닫기 버튼을 클릭하면 인스펙터가 닫혀야 함', () => {
    const setInspectorOpenMock = vi.fn();
    vi.mocked(require('@/store/useNodeStore').useNodeStore).mockReturnValue({
      inspectorOpen: true,
      inspectedNode: {
        id: 'test-node-1',
        data: {
          title: 'Test Node',
          content: 'Test content',
          tags: ['tag1', 'tag2']
        },
        position: { x: 100, y: 100 }
      },
      setInspectorOpen: setInspectorOpenMock,
      setInspectedNode: vi.fn()
    });

    render(<NodeInspector nodes={mockNodes} />);

    // 닫기 버튼 클릭
    const closeButton = screen.getByTestId('modal-close');
    fireEvent.click(closeButton);

    // setInspectorOpen이 false로 호출되었는지 확인
    expect(setInspectorOpenMock).toHaveBeenCalledWith(false);
  });

  it('인스펙터가 닫혀 있을 때 모달이 표시되지 않아야 함', () => {
    // nodeStore를 닫힌 상태로 설정
    vi.mocked(require('@/store/useNodeStore').useNodeStore).mockReturnValue({
      inspectorOpen: false,
      inspectedNode: null,
      setInspectorOpen: vi.fn(),
      setInspectedNode: vi.fn()
    });

    render(<NodeInspector nodes={mockNodes} />);

    // 모달이 닫혀 있는지 확인
    const modalRoot = screen.getByTestId('modal-root');
    expect(modalRoot).toHaveAttribute('data-open', 'false');
  });

  it('인스펙트된 노드가 없을 때 모달이 표시되지 않아야 함', () => {
    // nodeStore에 인스펙트된 노드가 없는 상태로 설정
    vi.mocked(require('@/store/useNodeStore').useNodeStore).mockReturnValue({
      inspectorOpen: true,
      inspectedNode: null,
      setInspectorOpen: vi.fn(),
      setInspectedNode: vi.fn()
    });

    render(<NodeInspector nodes={mockNodes} />);

    // 모달이 닫혀 있는지 확인
    const modalRoot = screen.getByTestId('modal-root');
    expect(modalRoot).toHaveAttribute('data-open', 'false');
  });
}); 