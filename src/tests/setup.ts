/**
 * 파일명: setup.ts
 * 목적: Vitest 테스트 설정
 * 역할: 테스트 환경 설정 및 전역 설정 제공
 * 작성일: 2024-03-31
 * 수정일: [오늘 날짜] - localStorage/sessionStorage 모킹 방식을 vi.stubGlobal로 변경하고, Supabase 모킹에서 storageMap 의존성 제거 시도
 */

import '@testing-library/jest-dom/vitest';
import { beforeEach, afterEach, vi, expect, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { server } from './msw/server'; // MSW 서버 임포트

// Testing Library의 jest-dom 매처 확장
expect.extend(matchers);

// --- MSW 서버 설정 ---
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' })); // 경고 대신 바이패스 또는 'warn'
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
// --- MSW 서버 설정 끝 ---

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
    // 루트 컨테이너 초기화 (기존 로직 유지)
    const rootEl = document.querySelector('#test-root');
    if (!rootEl) {
        const newRootEl = document.createElement('div');
        newRootEl.id = 'test-root';
        document.body.appendChild(newRootEl);
    } else if (rootEl.parentNode !== document.body) {
        document.body.appendChild(rootEl); // 루트가 body 밖에 있으면 다시 추가
    }
  }
}

// Logger 모킹 (기존 로직 유지)
vi.mock('@/lib/logger', () => {
  const mockLogger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  const createLogger = vi.fn(() => mockLogger);
  return {
    default: createLogger,
    LogLevel: { DEBUG: 'debug', INFO: 'info', WARN: 'warn', ERROR: 'error' },
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

// --- Storage 모킹 (vi.stubGlobal 사용) ---
const createMockStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = String(value); }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    _getStore: () => store, // 테스트 검증용
  };
};

const mockLocalStorage = createMockStorage();
const mockSessionStorage = createMockStorage();

vi.stubGlobal('localStorage', mockLocalStorage);
vi.stubGlobal('sessionStorage', mockSessionStorage);
// --- Storage 모킹 끝 ---

// IndexedDB 모킹 (기존 로직 유지)
const mockIndexedDB = { /* ... 기존 구현 ... */ };
vi.stubGlobal('indexedDB', mockIndexedDB);

// ResizeObserver 모킹 (기존 로직 유지)
class MockResizeObserver { /* ... */ } // 기존 구현 유지
vi.stubGlobal('ResizeObserver', MockResizeObserver);

// DOMStringList 모킹 (기존 로직 유지)
// @ts-ignore
class MockDOMStringList { /* ... */ } // 기존 구현 유지
vi.stubGlobal('DOMStringList', MockDOMStringList);

// 스토리지 키 상수 (기존 로직 유지)
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'sb-access-token',
  REFRESH_TOKEN: 'sb-refresh-token',
  CODE_VERIFIER: 'code_verifier'
  // ...기타 키들
};

// **주의**: storageMap은 @react-native-async-storage 모킹을 위해 일단 유지합니다.
const storageMap = new Map<string, string>();

// crypto 객체 모킹 (기존 로직 유지)
const mockCrypto = { /* ... */ }; // 기존 구현 유지
vi.stubGlobal('crypto', mockCrypto);

// Next.js navigation 모듈 모킹 (기존 로직 유지)
const mockRouterFunctions = { /* ... */ }; // 기존 구현 유지
// vi.mock('next/navigation', () => ({ /* ... */ })); // 기존 구현 유지

vi.mock('next/navigation', () => {
  const actual = vi.importActual('next/navigation'); // 실제 모듈의 다른 export 보존
  return {
    ...actual,
    useRouter: vi.fn(() => ({
      push: vi.fn(),       // router.push 등을 모두 mock 함수로
      back: vi.fn(),
      refresh: vi.fn(),
    })),
    useSearchParams: vi.fn(() => ({
      get: vi.fn(),
    })),
    usePathname: vi.fn(() => "/"),  // 필요시 현재 경로 등 정의
  };
});


// @react-native-async-storage/async-storage 모킹 (기존 로직 유지 - storageMap 사용)
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    // 비동기 동작을 유지하면서 storageMap 사용
    getItem: async (key: string) => storageMap.get(key) || null,
    setItem: async (key: string, value: string) => storageMap.set(key, value),
    removeItem: async (key: string) => storageMap.delete(key),
    clear: async () => storageMap.clear(),
  },
}));

// @supabase/supabase-js 모킹 (storageMap 의존성 제거 시도)
vi.mock('@supabase/supabase-js', () => {
  // 모킹된 클라이언트 생성 함수
  const createClient = () => ({
    auth: {
      signInWithOAuth: vi.fn(async ({ options }: any) => {
        // 이 부분은 그대로 유지 (storageMap 사용 안 함)
        if (!options.queryParams?.code_challenge) { /* ... */ }
        if (options.queryParams.code_challenge === 'invalid') { /* ... */ }
        return { data: { provider: 'google', url: 'https://accounts.google.com/auth' }, error: null };
      }),
      signOut: vi.fn(async () => {
        // signOut 시 localStorage/sessionStorage 사용 가정 (실제 라이브러리 동작 모방)
        // vi.stubGlobal로 모킹된 객체를 사용하게 됨
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN); // 세션 스토리지도 클리어 (필요시)
        return { error: null };
      }),
      getSession: vi.fn(async () => {
        // getSession 시 localStorage 사용 가정 (실제 라이브러리 동작 모방)
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (accessToken) {
          return {
            data: {
              session: {
                access_token: accessToken,
                refresh_token: refreshToken,
                // ...기타 세션 정보 모킹...
                user: { id: 'mock-user-id', /* ... */ }
              },
            },
            error: null,
          };
        } else {
          return { data: { session: null }, error: null };
        }
      }),
      exchangeCodeForSession: vi.fn(async (code: string) => {
        // 이 부분은 그대로 유지 (storageMap 사용 안 함)
        if (code === 'error_code') { /* ... */ }
        // 성공 시 토큰을 localStorage에 저장하는 동작 모방
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'test_access_token');
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'test_refresh_token');
        return {
          data: {
            session: {
              access_token: 'test_access_token',
              refresh_token: 'test_refresh_token',
              user: { id: 'test_user_id', /* ... */ }
            }
          },
          error: null
        };
      }),
    },
    from: vi.fn(() => ({ /* ... DB 관련 모킹 ... */ })),
    // ... 기타 필요한 메서드 모킹 ...
  });

  // createClient 함수를 export
  return { createClient };
});

// 테스트 유틸리티 함수 (set/getAuthData는 이제 storageMap이 아닌 localStorage 모킹에 의존하도록 변경 필요)
// **중요**: 이 유틸리티 함수들이 테스트에서 직접 사용되고 있다면 수정해야 합니다.
//          만약 사용되지 않고, 오직 모킹 내부에서만 storageMap을 썼다면 이 함수들은 제거 가능합니다.
// export const setAuthData = async (key: string, value: string): Promise<void> => { mockLocalStorage.setItem(key, value); };
// export const getAuthData = async (key: string): Promise<string | null> => { return mockLocalStorage.getItem(key); };
export const clearTestEnvironment = () => {
  storageMap.clear(); // AsyncStorage 모킹용으로 유지
  mockLocalStorage.clear(); // localStorage 모킹 클리어
  mockSessionStorage.clear(); // sessionStorage 모킹 클리어
  vi.clearAllMocks();
};

// 타이머 및 DOM API 모킹 (기존 로직 유지)
const mockTimerFn = (callback: Function, timeout?: number) => { /* ... */ }; // 기존 구현 유지
global.setTimeout = vi.fn(mockTimerFn) as unknown as typeof setTimeout;
// ... 기타 타이머 및 DOM API 모킹 ...

// 클립보드 모킹 (기존 로직 유지)
const mockedClipboard = { /* ... */ }; // 기존 구현 유지
// ... navigator 설정 ...
class DataTransferItemMock { /* ... */ } // 기존 구현 유지
class DataTransferMock { /* ... */ } // 기존 구현 유지
Object.defineProperty(global, 'DataTransfer', { /* ... */ }); // 기존 구현 유지

// --- 테스트 전/후 처리 ---
beforeEach(async () => {
  // await cleanup();
  // // 모킹된 스토리지 초기화
  // mockLocalStorage.clear();
  // mockSessionStorage.clear();
  // storageMap.clear(); // AsyncStorage 모킹용 초기화
  // // 문서 초기화
  // setupDocument();
  // // 모든 모의 함수 호출 기록 초기화
  // vi.clearAllMocks();
  // // window.location 초기화
  // if (typeof window !== 'undefined' && window.location) { /* ... */ } // 기존 구현 유지
});

afterEach(() => {
  cleanup();
  // vi.clearAllMocks();
  // vi.resetModules();
  // // 모킹된 스토리지 초기화
  // mockLocalStorage.clear();
  // mockSessionStorage.clear();
  // storageMap.clear(); // AsyncStorage 모킹용 초기화
  // // document.body 초기화
  // if (typeof document !== 'undefined' && document.body) { /* ... */ } // 기존 구현 유지
});
// --- 테스트 전/후 처리 끝 ---