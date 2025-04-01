/**
 * 파일명: test-utils.ts
 * 목적: 태그 관련 컴포넌트 테스트를 위한 유틸리티 함수 및 모킹 객체 제공
 * 역할: 테스트 설정, 정리, 모킹된 액션 제공
 * 작성일: 2024-03-31
 */

import { vi } from 'vitest';

// 모킹된 액션들
export const mockActions = {
  createTag: vi.fn((name: string) => Promise.resolve({
    ok: true,
    json: async () => ({}),
  })),
  deleteTag: vi.fn((id: string) => Promise.resolve({
    ok: true,
    json: async () => ({}),
  })),
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  reload: vi.fn(),
};

/**
 * setupTagFormTests: TagForm 테스트를 위한 환경을 설정
 */
export const setupTagFormTests = () => {
  // 모든 모킹된 함수 초기화
  vi.clearAllMocks();

  // Sonner 토스트 모킹
  vi.mock('sonner', () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }));

  // fetch 모킹
  global.fetch = vi.fn((url: string | URL | Request, options?: RequestInit) => {
    const urlStr = typeof url === 'string' ? url : url.toString();
    const body = options?.body ? JSON.parse(options.body as string) : {};
    return mockActions.createTag(body.name);
  });

  // window.location.reload 모킹
  Object.defineProperty(window, 'location', {
    value: {
      reload: mockActions.reload,
    },
    writable: true,
  });
};

/**
 * setupTagListTests: TagList 테스트를 위한 환경을 설정
 */
export const setupTagListTests = () => {
  // 모든 모킹된 함수 초기화
  vi.clearAllMocks();

  // Sonner 토스트 모킹
  vi.mock('sonner', () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }));

  // fetch 모킹
  global.fetch = vi.fn((url: string | URL | Request, options?: RequestInit) => {
    const urlStr = typeof url === 'string' ? url : url.toString();
    const matches = urlStr.match(/\/api\/tags\/(\d+)/);
    if (matches && options?.method === 'DELETE') {
      return mockActions.deleteTag(matches[1]);
    }
    return Promise.reject(new Error('Unexpected request'));
  });
};

/**
 * teardownTagFormTests: TagForm 테스트 후 정리 작업 수행
 */
export const teardownTagFormTests = () => {
  vi.clearAllMocks();
  vi.resetModules();
};

/**
 * teardownTagListTests: TagList 테스트 후 정리 작업 수행
 */
export const teardownTagListTests = () => {
  vi.clearAllMocks();
  vi.resetModules();
};

/**
 * waitForDomChanges: 비동기 작업의 안전한 완료를 위한 도우미 함수
 */
export const waitForDomChanges = () => new Promise(resolve => setTimeout(resolve, 50)); 