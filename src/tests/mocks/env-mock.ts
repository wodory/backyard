/**
 * 파일명: env-mock.ts
 * 목적: 테스트를 위한 환경 모킹 유틸리티
 * 역할: 서버/클라이언트 환경 감지 기능 모킹
 * 작성일: 2025-03-27
 */

import { vi, MockInstance } from 'vitest';

/**
 * window 객체 모킹
 * @returns 모의 window 객체
 */
export function mockWindow() {
  return {
    location: {
      hostname: 'localhost',
      protocol: 'http:',
      port: '3000',
      pathname: '/',
      href: 'http://localhost:3000/',
      origin: 'http://localhost:3000',
      search: '',
      hash: '',
      assign: vi.fn(),
      replace: vi.fn()
    },
    localStorage: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    },
    sessionStorage: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    },
    navigator: {
      userAgent: 'Mozilla/5.0 (Test) Test/1.0',
      language: 'ko-KR',
    },
    document: {
      cookie: '',
      createElement: vi.fn(),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(),
      getElementById: vi.fn(),
    },
    fetch: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    setTimeout: vi.fn(),
    clearTimeout: vi.fn(),
    crypto: {
      getRandomValues: vi.fn(),
      subtle: {
        digest: vi.fn()
      }
    },
    btoa: vi.fn((str: string) => Buffer.from(str).toString('base64')),
    atob: vi.fn((str: string) => Buffer.from(str, 'base64').toString()),
    __SUPABASE_AUTH_SET_ITEM: vi.fn(),
    __SUPABASE_AUTH_GET_ITEM: vi.fn(),
    __SUPABASE_AUTH_REMOVE_ITEM: vi.fn(),
    __SUPABASE_AUTH_CODE_VERIFIER: null,
  };
}

/**
 * process.env 모킹
 * @returns 모의 process.env 객체
 */
export function mockProcessEnv(): Record<string, string> {
  return {
    NODE_ENV: 'test',
    NEXT_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-anon-key',
    NEXT_PUBLIC_OAUTH_REDIRECT_URL: 'http://localhost:3000',
  };
}

/**
 * 클라이언트 환경 모킹
 */
export function mockClientEnvironment() {
  // 원래 객체 저장 (나중에 복원하기 위해)
  const originalWindow = global.window;
  const originalDocument = global.document;
  const originalLocalStorage = global.localStorage;
  const originalSessionStorage = global.sessionStorage;
  const originalNavigator = global.navigator;
  const originalCrypto = global.crypto;
  
  // window 객체를 global에 설정
  const mockWindowObj = mockWindow();
  Object.defineProperty(global, 'window', {
    value: mockWindowObj,
    writable: true,
    configurable: true
  });
  
  // document 객체를 global에 설정
  Object.defineProperty(global, 'document', { 
    value: mockWindowObj.document,
    writable: true,
    configurable: true
  });
  
  // localStorage 및 sessionStorage 객체를 global에 설정
  Object.defineProperty(global, 'localStorage', {
    value: mockWindowObj.localStorage,
    writable: true,
    configurable: true
  });
  
  Object.defineProperty(global, 'sessionStorage', {
    value: mockWindowObj.sessionStorage,
    writable: true,
    configurable: true
  });
  
  // 기타 필요한 전역 객체 설정
  Object.defineProperty(global, 'navigator', {
    value: mockWindowObj.navigator,
    writable: true,
    configurable: true
  });
  
  Object.defineProperty(global, 'crypto', {
    value: mockWindowObj.crypto,
    writable: true,
    configurable: true
  });
  
  // 환경 변수 설정
  const mockEnv = mockProcessEnv();
  const originalEnv = { ...process.env };
  Object.keys(mockEnv).forEach(key => {
    process.env[key] = mockEnv[key];
  });
  
  // isClientEnvironment 함수 모킹을 위한 utility
  return {
    restore: () => {
      // 원래 전역 객체 복원
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true
      });
      
      Object.defineProperty(global, 'document', {
        value: originalDocument,
        writable: true,
        configurable: true
      });
      
      Object.defineProperty(global, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true
      });
      
      Object.defineProperty(global, 'sessionStorage', {
        value: originalSessionStorage,
        writable: true,
        configurable: true
      });
      
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true
      });
      
      Object.defineProperty(global, 'crypto', {
        value: originalCrypto,
        writable: true,
        configurable: true
      });
      
      // 환경 변수 복원
      process.env = originalEnv;
    }
  };
}

/**
 * 서버 환경 모킹
 */
export function mockServerEnvironment() {
  // 원래 상태 저장
  const originalWindow = global.window;
  const originalDocument = global.document;
  
  // window 객체가 없도록 설정
  Object.defineProperty(global, 'window', {
    value: undefined,
    writable: true,
    configurable: true
  });
  
  // document 객체가 없도록 설정
  Object.defineProperty(global, 'document', {
    value: undefined,
    writable: true,
    configurable: true
  });
  
  // 환경 변수 설정
  const mockEnv = mockProcessEnv();
  const originalEnv = { ...process.env };
  Object.keys(mockEnv).forEach(key => {
    process.env[key] = mockEnv[key];
  });
  
  // isServerEnvironment 함수 모킹을 위한 utility
  return {
    restore: () => {
      // 원래 상태 복원
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true
      });
      
      Object.defineProperty(global, 'document', {
        value: originalDocument,
        writable: true,
        configurable: true
      });
      
      // 환경 변수 복원
      process.env = originalEnv;
    }
  };
}

// 하이브리드 환경 모킹 타입 정의
type HybridEnvironmentMock = {
  isClientEnvironment: MockInstance<any, any>;
  isServerEnvironment: MockInstance<any, any>;
  getHybridSupabaseClient: MockInstance<any, any>;
  setClientEnvironment: () => void;
  setServerEnvironment: () => void;
};

/**
 * 하이브리드 환경 모킹 (환경 감지 함수 모킹)
 */
export function mockHybridEnvironment(): HybridEnvironmentMock {
  const mock: HybridEnvironmentMock = {
    isClientEnvironment: vi.fn(() => true),
    isServerEnvironment: vi.fn(() => false),
    getHybridSupabaseClient: vi.fn(),
    setClientEnvironment: () => {
      mock.isClientEnvironment.mockReturnValue(true);
      mock.isServerEnvironment.mockReturnValue(false);
    },
    setServerEnvironment: () => {
      mock.isClientEnvironment.mockReturnValue(false);
      mock.isServerEnvironment.mockReturnValue(true);
    }
  };
  
  return mock;
} 