/// <reference types="vitest" />
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TagsPage from './page';
import '@testing-library/jest-dom/vitest';

// prisma 모킹
vi.mock('@/lib/prisma', () => ({
  prisma: {
    tag: {
      findMany: vi.fn()
    }
  }
}));

// formatDate 모킹
vi.mock('@/lib/utils', () => ({
  formatDate: vi.fn((date: string | Date) => '2023년 1월 1일'),
  cn: vi.fn((...args: any[]) => args.join(' '))
}));

// TagForm 및 TagList 컴포넌트 모킹
vi.mock('@/components/tags/TagForm', () => ({
  default: () => <div data-testid="tag-form">태그 추가 폼</div>
}));

vi.mock('@/components/tags/TagList', () => ({
  default: ({ initialTags }: { initialTags: any[] }) => (
    <div data-testid="tag-list">
      태그 수: {initialTags.length}
    </div>
  )
}));

describe('TagsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    cleanup();
  });
  
  it('태그 관리 페이지가 올바르게 렌더링되어야 함', async () => {
    // 가짜 태그 데이터
    const mockTags = [
      { 
        id: '1', 
        name: '자바스크립트', 
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { cardTags: 5 }
      },
      { 
        id: '2', 
        name: '리액트', 
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { cardTags: 3 }
      },
      { 
        id: '3', 
        name: '타입스크립트', 
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { cardTags: 0 }
      }
    ];
    
    // prisma 모킹 설정
    const { prisma } = await import('@/lib/prisma');
    (prisma.tag.findMany as any).mockResolvedValue(mockTags);
    
    const page = await TagsPage();
    render(page);
    
    // 페이지 헤더가 올바르게 표시되는지 확인
    expect(screen.getByRole('heading', { name: '태그 관리' })).toBeInTheDocument();
    
    // TagForm 컴포넌트가 렌더링되는지 확인
    expect(screen.getByTestId('tag-form')).toBeInTheDocument();
    expect(screen.getByText('태그 추가 폼')).toBeInTheDocument();
    
    // TagList 컴포넌트가 올바른 태그 수로 렌더링되는지 확인
    expect(screen.getByTestId('tag-list')).toBeInTheDocument();
    expect(screen.getByText('태그 수: 3')).toBeInTheDocument();
    
    // prisma가 올바르게 호출되었는지 확인
    expect(prisma.tag.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
      include: { _count: { select: { cardTags: true } } }
    });
  });
  
  it('태그가 없을 때도 페이지가 올바르게 렌더링되어야 함', async () => {
    // 빈 태그 배열 모킹
    const { prisma } = await import('@/lib/prisma');
    (prisma.tag.findMany as any).mockResolvedValue([]);
    
    const page = await TagsPage();
    render(page);
    
    // 페이지 헤더가 올바르게 표시되는지 확인
    expect(screen.getByRole('heading', { name: '태그 관리' })).toBeInTheDocument();
    
    // TagForm 컴포넌트가 렌더링되는지 확인
    expect(screen.getByTestId('tag-form')).toBeInTheDocument();
    
    // 태그 수가 0으로 표시되는지 확인
    expect(screen.getByText('태그 수: 0')).toBeInTheDocument();
  });
  
  it('prisma 오류 발생 시 빈 태그 배열로 렌더링되어야 함', async () => {
    // prisma 오류 모킹
    const { prisma } = await import('@/lib/prisma');
    (prisma.tag.findMany as any).mockRejectedValue(new Error('데이터베이스 오류'));
    
    // 콘솔 오류 출력 방지를 위한 스파이
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const page = await TagsPage();
    render(page);
    
    // 페이지는 여전히 렌더링되어야 함
    expect(screen.getByRole('heading', { name: '태그 관리' })).toBeInTheDocument();
    
    // 태그 수가 0으로 표시되는지 확인
    expect(screen.getByText('태그 수: 0')).toBeInTheDocument();
    
    // 오류 로깅이 확인
    expect(consoleSpy).toHaveBeenCalled();
    
    // 스파이 복원
    consoleSpy.mockRestore();
  });
}); 