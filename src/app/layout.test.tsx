import { Metadata } from 'next';
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import RootLayout, { metadata } from './layout';
import { describe, it, expect, vi } from 'vitest';

// next/font 모듈 모킹
vi.mock('next/font/google', () => ({
  Geist: vi.fn().mockReturnValue({
    variable: 'mocked-geist-sans',
  }),
  Geist_Mono: vi.fn().mockReturnValue({
    variable: 'mocked-geist-mono',
  }),
}));

describe('메타데이터', () => {
  it('올바른 메타데이터를 가져야 합니다', () => {
    expect(metadata).toBeDefined();
    expect(metadata.title).toBe('backyard - 지식 관리 도구');
    expect(metadata.description).toBe('아이디어와 지식을 시각적으로 구성, 관리, 공유할 수 있는 도구');
  });
});

describe('RootLayout', () => {
  it('RootLayout 함수가 정의되어 있습니다', () => {
    // 함수가 존재하는지 테스트
    expect(typeof RootLayout).toBe('function');
  });
  
  it('올바른 구조로 JSX를 반환합니다', () => {
    // JSX 요소를 직접 검사
    const result = RootLayout({ children: <div>테스트</div> });
    
    // React 요소인지 확인
    expect(result).toBeTruthy();
    
    // 올바른 태그와 속성을 가지고 있는지 확인
    expect(result.type).toBe('html');
    expect(result.props.lang).toBe('en');
    
    // body 요소 확인
    const bodyElement = result.props.children;
    expect(bodyElement.type).toBe('body');
    
    // 클래스 속성 확인 (클래스 이름에 모킹된 값이 포함되어 있는지)
    const className = bodyElement.props.className;
    expect(className).toContain('mocked-geist-sans');
    expect(className).toContain('mocked-geist-mono');
  });
}); 