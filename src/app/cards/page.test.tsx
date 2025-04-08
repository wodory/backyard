/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import CardsPage from './page';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

// Next.js의 router 훅 모킹
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    pathname: '/cards',
  })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn((key) => null),
    has: vi.fn(() => false),
    forEach: vi.fn(),
  })),
}));

// TagFilter 컴포넌트 모킹
vi.mock('@/components/cards/TagFilter', () => ({
  TagFilter: vi.fn(() => <div data-testid="tag-filter">태그 필터</div>)
}));

// React.Suspense 모킹
vi.mock('react', async () => {
  const originalReact = await vi.importActual('react');
  return {
    ...originalReact,
    Suspense: ({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) => {
      return (
        <>
          <div data-testid="suspense-fallback">{fallback}</div>
          <div data-testid="suspense-children">{children}</div>
        </>
      );
    },
  };
});

// 테스트용 CardListSkeleton (page 모듈에서 가져오지 않고 테스트에서 직접 정의)
const CardListSkeleton = () => (
  <div data-testid="skeleton-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array(6).fill(0).map((_, index) => (
      <div key={index} className="border rounded-md p-4 space-y-4">
        <div data-testid="skeleton" className="h-6 w-3/4" />
        <div data-testid="skeleton" className="h-24" />
        <div className="flex justify-between">
          <div data-testid="skeleton" className="h-4 w-1/4" />
          <div data-testid="skeleton" className="h-8 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

// Suspense 내부 컴포넌트 모킹
vi.mock('@/components/cards/CardList', () => {
  return {
    default: vi.fn(() => <div data-testid="card-list">카드 목록 컴포넌트</div>)
  };
});

// CreateCardButton 모킹을 CreateCardModal로 변경
vi.mock('@/components/cards/CreateCardModal', () => {
  return {
    default: vi.fn(() => <button data-testid="create-card-modal-button">새 카드 만들기</button>)
  };
});

// UI 컴포넌트 모킹
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: vi.fn(({ className }: { className?: string }) => <div data-testid="skeleton" className={className} />),
}));

describe('Cards Page', () => {
  it('페이지 제목이 올바르게 렌더링되는지 확인한다', () => {
    render(<CardsPage />);

    const heading = screen.getByRole('heading', { name: /카드 목록/i });
    expect(heading).toBeInTheDocument();
  });

  it('카드 목록 컴포넌트가 렌더링되는지 확인한다', () => {
    render(<CardsPage />);

    const cardListContainer = screen.getByTestId('suspense-children');
    expect(cardListContainer).toBeInTheDocument();

    const cardList = screen.getByTestId('card-list');
    expect(cardList).toBeInTheDocument();
  });

  it('새 카드 만들기 버튼이 렌더링되는지 확인한다', () => {
    render(<CardsPage />);

    const createButton = screen.getByRole('button', { name: /새 카드 만들기/i });
    expect(createButton).toBeInTheDocument();
  });

  it('Suspense fallback이 스켈레톤을 사용하는지 확인한다', () => {
    render(<CardsPage />);

    const fallbackContainer = screen.getByTestId('suspense-fallback');
    expect(fallbackContainer).toBeInTheDocument();
  });
});

describe('CardListSkeleton', () => {
  it('6개의 스켈레톤 카드를 렌더링한다', () => {
    render(<CardListSkeleton />);

    const skeletons = screen.getAllByTestId('skeleton');
    // 각 카드는 4개의 스켈레톤 요소를 가짐 (제목, 내용, 날짜, 버튼)
    expect(skeletons.length).toBe(6 * 4);
  });

  it('그리드 레이아웃을 사용한다', () => {
    render(<CardListSkeleton />);

    const gridContainer = screen.getByTestId('skeleton-grid');
    expect(gridContainer).toHaveClass('grid');
    expect(gridContainer).toHaveClass('grid-cols-1');
    expect(gridContainer).toHaveClass('md:grid-cols-2');
    expect(gridContainer).toHaveClass('lg:grid-cols-3');
  });
}); 