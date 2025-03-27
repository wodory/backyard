/// <reference types="vitest" />
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TagsPage from './page';
import '@testing-library/jest-dom/vitest';

/**
 * 파일명: page.test.tsx
 * 목적: 태그 관리 페이지 테스트
 * 역할: 태그 페이지 렌더링 및 기능 검증
 * 작성일: 2024-05-27
 */

// vi.hoisted를 사용하여 모킹 객체 생성
const mocks = vi.hoisted(() => ({
  findMany: vi.fn()
}));

// prisma 모킹
vi.mock('@/lib/prisma', () => ({
  default: {
    tag: {
      findMany: mocks.findMany
    }
  }
}));

// formatDate 모킹
vi.mock('@/lib/utils', () => ({
  formatDate: vi.fn((date: string | Date) => '2023년 1월 1일'),
  cn: vi.fn((...args: any[]) => args.join(' '))
}));

// 컴포넌트 모킹 - 올바른 경로로 수정
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

// Card 모킹
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm ">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 ">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div data-slot="card-title" className="leading-none font-semibold ">{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div data-slot="card-description" className="text-sm text-muted-foreground ">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-slot="card-content" className="px-6 ">{children}</div>,
  CardFooter: ({ children }: { children: React.ReactNode }) => <div data-slot="card-footer" className="flex gap-3 px-6 pt-6 ">{children}</div>,
}));

// 템플릿 태그 데이터 - _count 속성 추가
const mockTags = [
  { 
    id: '1', 
    name: '업무', 
    color: '#FF5733', 
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { cardTags: 5 }
  },
  { 
    id: '2', 
    name: '개인', 
    color: '#33FF57', 
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { cardTags: 3 }
  },
  { 
    id: '3', 
    name: '학습', 
    color: '#3357FF', 
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { cardTags: 0 }
  }
];

describe('TagsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    cleanup();
  });
  
  it('태그 관리 페이지가 올바르게 렌더링되어야 함', async () => {
    // 성공 응답 설정
    mocks.findMany.mockResolvedValue(mockTags);
    
    // 컴포넌트 렌더링
    render(await TagsPage());
    
    // 제목이 렌더링되는지 확인
    expect(screen.getByText('태그 관리')).toBeInTheDocument();
    
    // 태그 추가 카드가 렌더링되는지 확인
    expect(screen.getByText('새 태그 추가')).toBeInTheDocument();
    expect(screen.getByTestId('tag-form')).toBeInTheDocument();
    
    // 태그 목록 카드가 렌더링되는지 확인
    expect(screen.getByText('태그 목록')).toBeInTheDocument();
    
    // TagList 컴포넌트가 올바른 태그 수로 렌더링되는지 확인
    expect(screen.getByTestId('tag-list')).toBeInTheDocument();
    const tagListElement = screen.getByTestId('tag-list');
    expect(tagListElement.textContent).toContain('태그 수: 3');
    
    // prisma가 올바르게 호출되었는지 확인
    expect(mocks.findMany).toHaveBeenCalledTimes(1);
    expect(mocks.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
      include: { _count: { select: { cardTags: true } } }
    });
  });
  
  it('태그가 없을 때도 페이지가 올바르게 렌더링되어야 함', async () => {
    // 빈 배열 반환하도록 모킹
    mocks.findMany.mockResolvedValue([]);
    
    // 컴포넌트 렌더링
    render(await TagsPage());
    
    // 기본 UI 요소 확인
    expect(screen.getByText('태그 관리')).toBeInTheDocument();
    expect(screen.getByText('새 태그 추가')).toBeInTheDocument();
    expect(screen.getByText('태그 목록')).toBeInTheDocument();
    
    // 빈 태그 목록 확인
    const tagListElement = screen.getByTestId('tag-list');
    expect(tagListElement.textContent).toContain('태그 수: 0');
    
    expect(mocks.findMany).toHaveBeenCalledTimes(1);
  });
  
  it('prisma 오류 발생 시 빈 태그 배열로 렌더링되어야 함', async () => {
    // 오류 발생하도록 모킹
    mocks.findMany.mockRejectedValue(new Error('태그 조회 오류'));
    
    // 콘솔 오류 모킹
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // 컴포넌트 렌더링
    render(await TagsPage());
    
    // 기본 UI 요소 확인
    expect(screen.getByText('태그 관리')).toBeInTheDocument();
    
    // 오류 발생 시에도 빈 태그 목록 렌더링 확인
    const tagListElement = screen.getByTestId('tag-list');
    expect(tagListElement.textContent).toContain('태그 수: 0');
    
    // 콘솔 오류 호출 확인
    expect(consoleErrorSpy).toHaveBeenCalledWith('태그 조회 오류:', expect.any(Error));
    
    consoleErrorSpy.mockRestore();
  });
}); 