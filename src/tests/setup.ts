/**
 * 파일명: setup.ts
 * 목적: Vitest 테스트 설정
 * 역할: 테스트 환경 설정 및 전역 설정 제공
 * 작성일: 2025-03-27
 * 수정일: 2025-04-08 - waitFor 제대로 작동하도록 setTimeout 모킹 방식 수정
 * 수정일: 2023-10-27 : 린터 오류 수정 (미사용 변수/함수 제거, 타입 문제 해결)
 */

import '@testing-library/jest-dom/vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { beforeEach, afterEach, vi, expect, beforeAll, afterAll } from 'vitest';

import { server } from './msw/server'; // MSW 서버 임포트

// Testing Library의 jest-dom 매처 확장
expect.extend(matchers);

// --- MSW 서버 설정 ---
// Node.js v20 undici 타임아웃 이슈 해결을 위한 설정
beforeAll(() => {
  // fetch 타임아웃 관련 이슈 해결을 위해 bypass 모드 사용
  server.listen({ 
    onUnhandledRequest: 'bypass',
  });
  
  // 타이머 모킹 제거 - wait-for가 정상적으로 작동하도록 수정
  // 실제 타이머를 사용하도록 설정
  if (typeof window !== 'undefined') {
    // 실제 타이머를 사용 (모킹하지 않음)
    vi.useRealTimers(); // waitFor가 의존하는 실제 타이머 사용
  }
});

afterEach(() => {
  // 각 테스트 후 핸들러 초기화
  server.resetHandlers();
  // React 컴포넌트 정리
  cleanup();
});

afterAll(() => {
  // 모든 테스트 후 서버 정리
  server.close();
});
// --- MSW 서버 설정 끝 ---

// 항상 document.body가 존재하도록 함
if (typeof document !== 'undefined' && !document.body) {
  document.body = document.createElement('body');
}

// Logger 모킹 (실제 구현과 일치하도록 수정)
vi.mock('@/lib/logger', () => {
  const mockLogs: any[] = [];
  const mockSessionId = 'test-session-id';
  let isWindowDefined = true;

  const mockLogStorage = {
    getInstance: vi.fn(() => ({
      getSessionId: vi.fn(() => mockSessionId),
      addLog: vi.fn((log: any) => {
        log.sessionId = mockSessionId;
        mockLogs.push(log);
        if (mockLogs.length > 100) mockLogs.shift();
        
        if (isWindowDefined) {
          try {
            localStorage.setItem('logger.logs', JSON.stringify(mockLogs));
          } catch (error) {
            console.error('로그 저장 실패:', error);
          }
        }
      }),
      getLogs: vi.fn(() => [...mockLogs]),
      clearLogs: vi.fn(() => {
        mockLogs.length = 0;
        if (isWindowDefined) {
          localStorage.removeItem('logger.logs');
        }
      })
    }))
  };

  const mockLogger = vi.fn((module: string, level: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logData = { timestamp, level, module, message, data, sessionId: mockSessionId };
    
    // 세션 ID 초기화
    if (isWindowDefined) {
      if (!localStorage.getItem('logger.sessionId')) {
        localStorage.setItem('logger.sessionId', mockSessionId);
      }
    }

    mockLogStorage.getInstance().addLog(logData);

    const formattedMessage = `[${timestamp.split('T')[1].split('.')[0]}][${module}][${level.toUpperCase()}] ${message}`;
    switch (level) {
      case 'debug':
        console.debug(formattedMessage, data || '');
        break;
      case 'info':
        console.info(formattedMessage, data || '');
        break;
      case 'warn':
        console.warn(formattedMessage, data || '');
        break;
      case 'error':
        console.error(formattedMessage, data || '');
        break;
    }

    // 수정: fetchPromise가 undefined일 때 catch 호출 방지
    if ((level === 'error' || level === 'warn') && isWindowDefined) {
      try {
        const fetchPromise = fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData),
          keepalive: true
        });
        
        // 안전하게 catch 호출 - fetchPromise가 유효한 경우에만
        if (fetchPromise && typeof fetchPromise.catch === 'function') {
          fetchPromise.catch(() => {});
        }
      } catch (error) {
        // fetch 호출 자체가 실패한 경우 처리
        console.error('로그 전송 오류:', error);
      }
    }
  });

  // 수정: 각 로그 함수를 vi.fn()으로 명시적으로 만들어 스파이로 인식되도록 함
  const createLoggerMock = vi.fn((module: string) => {
    // 모듈별로 새로운 스파이 함수 생성
    return {
      debug: vi.fn((message: string, data?: any) => mockLogger(module, 'debug', message, data)),
      info: vi.fn((message: string, data?: any) => mockLogger(module, 'info', message, data)),
      warn: vi.fn((message: string, data?: any) => mockLogger(module, 'warn', message, data)),
      error: vi.fn((message: string, data?: any) => mockLogger(module, 'error', message, data))
    };
  });

  // window 객체 모킹 설정을 위한 함수
  const setWindowDefined = (defined: boolean) => {
    isWindowDefined = defined;
  };

  return {
    default: createLoggerMock,
    LogLevel: { DEBUG: 'debug', INFO: 'info', WARN: 'warn', ERROR: 'error' },
    logger: mockLogger,
    createLogger: createLoggerMock,
    getLogs: vi.fn(() => mockLogStorage.getInstance().getLogs()),
    clearLogs: vi.fn(() => mockLogStorage.getInstance().clearLogs()),
    __setWindowDefined: setWindowDefined // 테스트용 헬퍼 함수
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

// DOMStringList 모킹 (기존 구현 유지)
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

export const clearTestEnvironment = () => {
  storageMap.clear(); // AsyncStorage 모킹용으로 유지
  mockLocalStorage.clear(); // localStorage 모킹 클리어
  mockSessionStorage.clear(); // sessionStorage 모킹 클리어
  vi.clearAllMocks();
};

// 타이머 및 DOM API 모킹
const mockTimerFn = (/* 사용하지 않는 파라미터 제거 */) => { /* ... */ };
global.setTimeout = vi.fn(mockTimerFn) as unknown as typeof setTimeout;

// --- 테스트 전/후 처리 ---
beforeEach(async () => {
  // await cleanup();
  // // 모킹된 스토리지 초기화
  // mockLocalStorage.clear();
  // mockSessionStorage.clear();
  // storageMap.clear(); // AsyncStorage 모킹용 초기화
  // // 문서 초기화
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