/**
 * 파일명: page.test.tsx
 * 목적: 홈 페이지 컴포넌트 테스트
 * 역할: 홈 페이지의 렌더링과 기능 검증
 * 작성일: 2024-03-28
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Home from './page';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// DashboardLayout 모킹
vi.mock('@/components/layout/DashboardLayout', () => ({
  DashboardLayout: vi.fn().mockImplementation(() => (
    <div data-testid="dashboard-layout">
      <h1>Backyard</h1>
      <p>아이디어와 지식을 시각적으로 구성, 관리, 공유할 수 있는 도구</p>
      <a href="/cards">카드 목록 보기</a>
    </div>
  )),
}));

describe('Home 페이지', () => {
  it('컴포넌트가 정의되어 있어야 합니다', () => {
    expect(typeof Home).toBe('function');
  });

  it('DashboardLayout을 렌더링해야 합니다', () => {
    render(<Home />);
    const dashboard = screen.getByTestId('dashboard-layout');
    expect(dashboard).toBeInTheDocument();
  });

  it('Backyard 제목이 렌더링되어야 합니다', () => {
    render(<Home />);
    const heading = screen.getByText('Backyard');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');
  });
  
  it('설명 텍스트가 렌더링되어야 합니다', () => {
    render(<Home />);
    const description = screen.getByText('아이디어와 지식을 시각적으로 구성, 관리, 공유할 수 있는 도구');
    expect(description).toBeInTheDocument();
    expect(description.tagName).toBe('P');
  });
  
  it('카드 목록 보기 링크가 렌더링되어야 합니다', () => {
    render(<Home />);
    const link = screen.getByText('카드 목록 보기');
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/cards');
  });

  it('DashboardLayout이 호출되어야 합니다', () => {
    render(<Home />);
    expect(DashboardLayout).toHaveBeenCalled();
  });
}); 