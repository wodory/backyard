/**
 * 파일명: MainCanvas.test.tsx
 * 목적: MainCanvas 컴포넌트 테스트
 * 역할: MainCanvas가 적절하게 렌더링되고 Board 컴포넌트에 올바른 props를 전달하는지 테스트
 * 작성일: 2024-05-31
 */

import { render, screen } from '@testing-library/react';
import { MainCanvas } from './MainCanvas';
import { vi } from 'vitest';

// 종속성 모킹
vi.mock('@/store/useAppStore', () => ({
  useAppStore: () => ({
    selectCard: vi.fn(),
  }),
}));

vi.mock('@xyflow/react', () => ({
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="react-flow-provider">{children}</div>
  ),
}));

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

describe('MainCanvas', () => {
  it('renders ReactFlowProvider and Board component with correct props', () => {
    render(<MainCanvas />);
    
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
}); 