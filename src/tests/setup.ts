/**
 * 파일명: setup.ts
 * 목적: Vitest 테스트 설정 파일
 * 역할: 테스트에 필요한 전역 설정 및 모의 객체 설정
 * 작성일: 2024-03-26
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// JSDOM 환경이 없을 경우 대비
if (typeof window === 'undefined') {
  global.window = {} as any;
  global.document = {} as any;
  
  // navigator는 getter-only 속성이므로 Object.defineProperty 사용
  Object.defineProperty(global, 'navigator', {
    value: { userAgent: 'vitest' },
    writable: true,
    configurable: true
  });
}

// 각 테스트 후 DOM 정리
afterEach(() => {
  cleanup();
});

// 콘솔 경고 억제 (선택 사항)
// const originalConsoleError = console.error;
// const originalConsoleWarn = console.warn;
// console.error = (...args) => {
//   if (args[0]?.includes('Warning:')) {
//     return;
//   }
//   originalConsoleError(...args);
// };
// console.warn = (...args) => {
//   if (args[0]?.includes('Warning:')) {
//     return;
//   }
//   originalConsoleWarn(...args);
// };

// ResizeObserver 모킹 (테스트 환경에서 사용할 수 있도록)
if (typeof window !== 'undefined') {
  // ResizeObserver가 정의되어 있지 않은 경우에만 모킹
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      constructor(callback: any) {
        this.callback = callback;
      }
      private callback: any;
      observe() { return null; }
      unobserve() { return null; }
      disconnect() { return null; }
    };
  }

  // 모의 환경 객체 설정 (안전하게 체크)
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // localStorage 및 sessionStorage 모킹
  if (!window.localStorage) {
    window.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    } as any;
  }

  if (!window.sessionStorage) {
    window.sessionStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    } as any;
  }
}

// Next.js 라우터 모킹 (필요시 사용)
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    reload: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
  }),
}));

// 환경 변수 모킹
process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-client-id';
process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL = 'http://localhost:3000/auth/callback';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// 테스트에 필요한 기타 설정을 여기에 추가 