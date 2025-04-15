/**
 * 파일명: ThemeContext.test.tsx
 * 목적: ThemeContext 및 ThemeProvider 테스트
 * 역할: 테마 관련 기능 검증
 * 작성일: 2025-03-27
 * 수정일: 2025-04-01
 */

import React from 'react';

import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

import { ThemeProvider } from './ThemeContext';

// 모든 모킹을 파일 상단에 그룹화
// ResizeObserver 모킹
const mockResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// console.log 모킹
vi.spyOn(console, 'log').mockImplementation(() => undefined);

// CSS 속성 적용 모킹을 위한 함수 모킹
const mockSetProperty = vi.fn();

// 원본 함수 참조 저장 변수
let originalSetProperty: typeof document.documentElement.style.setProperty;

describe('ThemeContext', () => {
  // 모든 테스트 전에 전역 객체 모킹 설정
  beforeAll(() => {
    // ResizeObserver 모킹
    vi.stubGlobal('ResizeObserver', mockResizeObserver);

    // document.documentElement.style.setProperty 모킹
    originalSetProperty = document.documentElement.style.setProperty;
    document.documentElement.style.setProperty = mockSetProperty;
  });

  // 각 테스트 전에 모킹 함수 초기화
  beforeEach(() => {
    mockSetProperty.mockClear();
    vi.clearAllMocks();
  });

  // 각 테스트 후에 정리
  afterEach(() => {
    vi.resetAllMocks();
  });

  // 모든 테스트 후에 전역 모킹 복원
  afterAll(() => {
    // 원본 함수 복원
    document.documentElement.style.setProperty = originalSetProperty;

    // 모든 모킹 복원
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('ThemeProvider가 자식 컴포넌트를 렌더링해야 함', () => {
    render(
      <ThemeProvider>
        <div>테스트 자식</div>
      </ThemeProvider>
    );

    expect(screen.getByText('테스트 자식')).toBeInTheDocument();
    expect(mockSetProperty).toHaveBeenCalled();
  });
}); 