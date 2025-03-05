import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Home from './page';
import { describe, it, expect } from 'vitest';
import React from 'react';

describe('Home 페이지', () => {
  it('Backyard 제목이 렌더링되어야 합니다', () => {
    render(<Home />);
    
    const heading = screen.getByText('Hello backyard');
    expect(heading).toBeInTheDocument();
  });
  
  it('설명 텍스트가 렌더링되어야 합니다', () => {
    render(<Home />);
    
    const description = screen.getByText('아이디어와 지식을 시각적으로 구성, 관리, 공유할 수 있는 도구');
    expect(description).toBeInTheDocument();
  });
  
  it('카드 목록 보기 링크가 렌더링되어야 합니다', () => {
    render(<Home />);
    
    const link = screen.getByText('카드 목록 보기');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/cards');
  });
}); 