/**
 * 파일명: setup.ts
 * 목적: Vitest 테스트 설정
 * 역할: 테스트 환경 설정 및 전역 설정 제공
 * 작성일: 2024-03-31
 */

import '@testing-library/jest-dom/vitest';
import { beforeEach, afterEach, vi, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { beforeAll, afterAll } from 'vitest';
import { server } from './msw/server';

// Testing Library의 jest-dom 매처 확장
expect.extend(matchers);

// 항상 document.body가 존재하도록 함
if (typeof document !== 'undefined' && !document.body) {
  document.body = document.createElement('body');
}

// 문서 초기화 함수 - 테스트 전 호출
function setupDocument() {
  if (typeof document !== 'undefined') {
    if (!document.body) {
      document.body = document.createElement('body');
    }
    // 루트 컨테이너 초기화
    const rootEl = document.createElement('div');
    rootEl.id = 'test-root';
    document.body.appendChild(rootEl);
  }
}

// Logger 모킹
vi.mock('@/lib/logger', () => {
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };

  const createLogger = vi.fn(() => mockLogger);

  return {
    default: createLogger,
    LogLevel: {
      DEBUG: 'debug',
      INFO: 'info',
      WARN: 'warn',
      ERROR: 'error'
    },
    logger: vi.fn(),
    createLogger,
    getLogs: vi.fn(() => []),
    clearLogs: vi.fn(),
    LogStorage: vi.fn(() => ({
      getInstance: vi.fn(() => ({
        getSessionId: vi.fn(() => 'test-session-id'),
        addLog: vi.fn(),
        getLogs: vi.fn(() => []),
        clearLogs: vi.fn()
      }))
    }))
  };
});

// Storage 모킹
class MockStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] || null;
  }
}

// IndexedDB 모킹
const mockIndexedDB = {
  open: vi.fn(() => {
    const request = {
      result: {
        createObjectStore: vi.fn(),
        transaction: vi.fn(() => ({
          objectStore: vi.fn(() => ({
            put: vi.fn(),
            get: vi.fn(),
            delete: vi.fn(),
          })),
        })),
      },
      onupgradeneeded: null as Function | null,
      onsuccess: null as Function | null,
      onerror: null as Function | null,
    };

    // 비동기적으로 onsuccess 호출
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);

    return request;
  }),
  deleteDatabase: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
  })),
};

// ResizeObserver 모킹
class MockResizeObserver {
  observe() { return vi.fn(); }
  unobserve() { return vi.fn(); }
  disconnect() { return vi.fn(); }
}

// DOMStringList 모킹
// @ts-ignore
class MockDOMStringList {
  length = 0;
  item() { return null; }
  contains() { return false; }
  [Symbol.iterator]() {
    return {
      next: () => ({ value: undefined, done: true })
    };
  }
}

// 스토리지 키 상수
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'sb-access-token',
  REFRESH_TOKEN: 'sb-refresh-token',
  CODE_VERIFIER: 'code_verifier'
};

// 스토리지 모킹을 위한 Map 객체
const storageMap = new Map<string, string>();

// 브라우저 환경 모킹
const mockWindow = {
  location: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    replace: vi.fn(),
    assign: vi.fn(),
    reload: vi.fn()
  },
  localStorage: {
    getItem: (key: string) => storageMap.get(key) || null,
    setItem: (key: string, value: string) => storageMap.set(key, value),
    removeItem: (key: string) => storageMap.delete(key),
    clear: () => storageMap.clear(),
    length: 0,
    key: (index: number) => Array.from(storageMap.keys())[index] || null,
  },
  navigator: {},
};

// crypto 객체 모킹
const mockCrypto = {
  getRandomValues: (array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
  subtle: {
    digest: async (algorithm: string, data: ArrayBuffer) => {
      return new Uint8Array(32).buffer;
    }
  } as SubtleCrypto,
  randomUUID: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  })
};

// Next.js 라우터 함수 모킹
const mockRouterFunctions = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
  refresh: vi.fn(),
};

// Next.js navigation 모듈 모킹
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    ...mockRouterFunctions,
    pathname: '/',
    query: {},
    asPath: '/',
    basePath: '',
    route: '/',
    isFallback: false,
    isReady: true,
    isLocaleDomain: false,
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn()
    }
  }),
  useSearchParams: () => ({
    get: vi.fn((key) => {
      // URL에서 검색 파라미터 추출
      const params = new URLSearchParams(window.location.search);
      return params.get(key);
    }),
    getAll: vi.fn(),
    has: vi.fn(),
    forEach: vi.fn(),
    entries: vi.fn(() => []),
    toString: vi.fn(() => '')
  }),
  redirect: vi.fn((url) => {
    // 리다이렉트 시 window.location.replace 호출 모킹
    window.location.replace(url);
    throw new Error(`Redirected to ${url}`); // 실행 중단을 위한 예외 발생
  }),
  notFound: vi.fn(() => {
    throw new Error('Not found');
  })
}));

// @react-native-async-storage/async-storage 모킹
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (key: string) => storageMap.get(key) || null,
    setItem: async (key: string, value: string) => storageMap.set(key, value),
    removeItem: async (key: string) => storageMap.delete(key),
    clear: async () => storageMap.clear(),
  },
}));

// @supabase/supabase-js 모킹
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: vi.fn(async ({ options }) => {
        if (!options.queryParams?.code_challenge) {
          return { data: null, error: { message: 'code_challenge is required', status: 400 } };
        }
        if (options.queryParams.code_challenge === 'invalid') {
          return { data: null, error: { message: 'Invalid code challenge', status: 400 } };
        }
        return { data: { provider: 'google', url: 'https://accounts.google.com/auth' }, error: null };
      }),
      signOut: vi.fn(async () => {
        storageMap.clear();
        return { error: null };
      }),
      getSession: vi.fn(() => ({
        data: {
          session: {
            access_token: storageMap.get(STORAGE_KEYS.ACCESS_TOKEN),
            refresh_token: storageMap.get(STORAGE_KEYS.REFRESH_TOKEN),
          },
        },
        error: null,
      })),
      exchangeCodeForSession: vi.fn(async (code: string) => {
        if (code === 'error_code') {
          return {
            data: { session: null },
            error: { message: '인증 실패' }
          };
        }
        
        return {
          data: {
            session: {
              access_token: 'test_access_token',
              refresh_token: 'test_refresh_token',
              user: {
                id: 'test_user_id',
                app_metadata: { provider: 'google' }
              }
            }
          },
          error: null
        };
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'test-id', title: 'Test Card', content: 'Test Content' },
            error: null
          }))
        })),
        order: vi.fn(() => ({
          data: [
            { id: 'test-id-1', title: 'Test Card 1', content: 'Test Content 1' },
            { id: 'test-id-2', title: 'Test Card 2', content: 'Test Content 2' }
          ],
          error: null
        }))
      }))
    })),
  }),
}));

// 테스트 유틸리티 함수
export const setAuthData = async (key: string, value: string): Promise<void> => {
  storageMap.set(key, value);
};

export const getAuthData = async (key: string): Promise<string | null> => {
  return storageMap.get(key) || null;
};

// 테스트 환경 초기화 함수
export const clearTestEnvironment = () => {
  storageMap.clear();
  vi.clearAllMocks();
};

// 타이머 모킹 함수
const mockTimerFn = (callback: Function, timeout?: number) => {
  // 오류 방지를 위해 체크, document.body가 없을 수 있음
  if (typeof document !== 'undefined' && document.body === undefined) {
    if (typeof document.createElement === 'function') {
      document.body = document.createElement('body');
    }
  }
  
  if (typeof callback === 'function') {
    try {
      callback();
    } catch (error) {
      console.error('Error in setTimeout callback:', error);
    }
  }
  return 1; // fake timer id
};

// 전역 타이머 설정
global.setTimeout = vi.fn(mockTimerFn) as unknown as typeof setTimeout;
global.clearTimeout = vi.fn() as unknown as typeof clearTimeout;
global.setInterval = vi.fn(() => 1) as unknown as typeof setInterval;
global.clearInterval = vi.fn() as unknown as typeof clearInterval;
global.requestAnimationFrame = vi.fn(callback => {
  callback(Date.now());
  return 1;
}) as unknown as typeof requestAnimationFrame;
global.cancelAnimationFrame = vi.fn() as unknown as typeof cancelAnimationFrame;

// 프로미스 관련 DOM API 모킹
global.MutationObserver = class {
  observe() {}
  disconnect() {}
  takeRecords() { return [] }
} as any;

global.IntersectionObserver = class {
  observe() {}
  disconnect() {}
  takeRecords() { return [] }
  unobserve() {}
} as any;

// 전역 객체 설정
Object.defineProperty(global, 'crypto', {
  value: mockCrypto
});

// 클립보드 모의 구현
const mockedClipboard = {
  readText: vi.fn(() => Promise.resolve('')),
  writeText: vi.fn(() => Promise.resolve()),
  read: vi.fn(() => Promise.resolve([])),
  write: vi.fn(() => Promise.resolve()),
  addEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  removeEventListener: vi.fn()
};

global.window = {
  ...mockWindow,
  navigator: {
    ...(mockWindow.navigator || {}),
    clipboard: mockedClipboard,
  },
  getComputedStyle: vi.fn(el => ({
    getPropertyValue: vi.fn(prop => {
      return '';
    }),
    paddingLeft: '0px',
    paddingRight: '0px',
    paddingTop: '0px',
    paddingBottom: '0px',
    marginLeft: '0px',
    marginRight: '0px',
    marginTop: '0px',
    marginBottom: '0px',
    borderLeftWidth: '0px',
    borderRightWidth: '0px',
    borderTopWidth: '0px',
    borderBottomWidth: '0px'
  })),
  setTimeout: vi.fn((callback, timeout) => {
    if (typeof callback === 'function') {
      callback();
    }
    return 1; // fake timer id
  }),
  clearTimeout: vi.fn(),
  setInterval: vi.fn(() => 1),
  clearInterval: vi.fn(),
  requestAnimationFrame: vi.fn(callback => {
    callback(Date.now());
    return 1;
  }),
  cancelAnimationFrame: vi.fn(),
  fetch: vi.fn(),
  matchMedia: vi.fn(() => ({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
} as any;

// navigator가 getter만 있는 전역 객체일 수 있어서 defineProperty 사용
if (global.navigator) {
  // 기존 속성은 유지
  const existingNavigator = { ...global.navigator };
  
  // clipboard 속성 추가
  Object.defineProperty(global, 'navigator', {
    value: {
      ...existingNavigator,
      clipboard: mockedClipboard
    },
    writable: true,
    configurable: true
  });
} else {
  // navigator가 없는 경우 새로 만듦
  Object.defineProperty(global, 'navigator', {
    value: {
      clipboard: mockedClipboard
    },
    writable: true,
    configurable: true
  });
}

// 클립보드에 대한 표준 view 모의 객체
class DataTransferItemMock {
  kind = 'string';
  type = 'text/plain';
  getAsString = vi.fn(callback => callback(''));
  getAsFile = vi.fn(() => null);
}

class DataTransferMock {
  items = [new DataTransferItemMock()];
  getData = vi.fn(() => '');
  setData = vi.fn();
}

Object.defineProperty(global, 'DataTransfer', {
  value: function() { return new DataTransferMock(); }
});

// 스토리지 설정
global.localStorage = mockWindow.localStorage;
global.sessionStorage = new MockStorage() as any;

// 테스트 전 초기화
beforeEach(async () => {
  await cleanup();
  localStorage.clear();
  sessionStorage.clear();
  setupDocument(); // 문서 초기화
  
  // fetch 모킹 초기화
  if (typeof global.fetch === 'function') {
    (global.fetch as any).mockReset?.();
  }
  
  // 라우팅 함수 모킹 초기화
  Object.keys(mockRouterFunctions).forEach(key => {
    const routerFn = mockRouterFunctions[key as keyof typeof mockRouterFunctions];
    if (typeof routerFn.mockReset === 'function') {
      routerFn.mockReset();
    }
  });
  
  // window.location 초기화
  if (typeof window !== 'undefined' && window.location) {
    window.location.href = 'http://localhost:3000';
    window.location.search = '';
    window.location.hash = '';
  }
});

// 테스트 후 정리
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.resetModules();
  localStorage.clear();
  sessionStorage.clear();
  
  // document.body 초기화
  if (typeof document !== 'undefined' && document.body) {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  }
});

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' })
})

afterAll(() => {
  server.close()
})

afterEach(() => {
  server.resetHandlers()
})