import '@testing-library/jest-dom/vitest';
import { expect, vi, beforeAll, afterAll } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Jest DOM matchers 확장 설정
expect.extend(matchers);

// 전역 모킹 설정
vi.mock('next/navigation', () => {
  return {
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    })),
    usePathname: vi.fn(() => '/'),
    useSearchParams: vi.fn(() => ({
      get: (param: string) => null,
      toString: () => '',
    })),
  };
});

// 콘솔 오류 모킹 (테스트 중 예상된 오류가 발생해도 테스트 출력이 어지럽지 않도록)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// 글로벌 페치 모킹
global.fetch = vi.fn(); 