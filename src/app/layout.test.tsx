/**
 * 파일명: layout.test.tsx
 * 목적: RootLayout 컴포넌트 테스트
 * 역할: 레이아웃 컴포넌트의 기능과 구조 검증
 * 작성일: 2025-03-05
 * 수정일: 2025-03-30
 * 수정일: 2025-04-27 : import 순서 정리
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import RootLayout from './layout';
import { metadata } from './metadata';

// next/font 모듈 모킹
vi.mock('next/font/google', () => ({
  Geist: vi.fn().mockReturnValue({
    variable: 'mocked-geist-sans',
  }),
  Geist_Mono: vi.fn().mockReturnValue({
    variable: 'mocked-geist-mono',
  }),
}));

// ClientLayout 모킹
vi.mock('@/components/layout/ClientLayout', () => ({
  ClientLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="client-layout">{children}</div>
  ),
}));

describe('메타데이터 테스트', () => {
  it('기본 메타데이터가 올바르게 설정되어 있어야 합니다', () => {
    expect(metadata.title).toBeDefined();
    expect(metadata.description).toBeDefined();
  });
});

describe('RootLayout 컴포넌트 테스트', () => {
  beforeEach(() => {
    render(
      <RootLayout>
        <div data-testid="test-child">Test Child</div>
      </RootLayout>
    );
  });

  it('컴포넌트가 정의되어 있어야 합니다', () => {
    expect(RootLayout).toBeDefined();
  });

  it('자식 컴포넌트를 올바르게 렌더링해야 합니다', () => {
    const testChild = screen.getByTestId('test-child');
    expect(testChild).toBeInTheDocument();
    expect(testChild).toHaveTextContent('Test Child');
  });

  it('ClientLayout이 렌더링되어야 합니다', () => {
    const clientLayout = screen.getByTestId('client-layout');
    expect(clientLayout).toBeInTheDocument();
    expect(clientLayout).toContainElement(screen.getByTestId('test-child'));
  });
}); 