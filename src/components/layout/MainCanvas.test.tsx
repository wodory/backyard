/**
 * 파일명: MainCanvas.test.tsx
 * 목적: MainCanvas 컴포넌트 테스트
 * 역할: MainCanvas가 적절하게 렌더링되고 IdeaMap 컴포넌트에 올바른 props를 전달하는지 테스트
 * 작성일: 2025-03-28
 */

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { MainCanvas } from './MainCanvas';

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

vi.mock('@/components/ideamap/components/IdeaMap', () => ({
  default: ({ onSelectCard, className, showControls }: any) => (
    <div
      data-testid="ideamap-component"
      data-selectcard={!!onSelectCard}
      data-classname={className}
      data-showcontrols={showControls}
    >
      IdeaMap Component
    </div>
  ),
}));

describe('MainCanvas', () => {
  it('renders ReactFlowProvider and IdeaMap component with correct props', () => {
    render(<MainCanvas />);

    // ReactFlowProvider가 렌더링되었는지 확인
    expect(screen.getByTestId('react-flow-provider')).toBeInTheDocument();

    // IdeaMap 컴포넌트가 렌더링되었는지 확인
    const ideaMapComponent = screen.getByTestId('ideamap-component');
    expect(ideaMapComponent).toBeInTheDocument();

    // IdeaMap 컴포넌트에 올바른 props가 전달되었는지 확인
    expect(ideaMapComponent.getAttribute('data-selectcard')).toBe('true');
    expect(ideaMapComponent.getAttribute('data-classname')).toBe('bg-background');
    expect(ideaMapComponent.getAttribute('data-showcontrols')).toBe('true');
  });
}); 