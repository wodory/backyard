/**
 * 파일명: auth-storage.test.ts
 * 목적: 인증 스토리지 유틸리티 테스트
 * 역할: 여러 스토리지에 인증 정보를 저장하고 복구하는 로직 검증
 * 작성일: 2024-03-30
 */

// 모듈 모킹을 최상단에 배치
vi.mock('./cookie', () => ({
  getAuthCookie: vi.fn(),
  setAuthCookie: vi.fn(),
  deleteAuthCookie: vi.fn()
}));

vi.mock('./logger', () => {
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
  
  return {
    default: vi.fn(() => mockLogger),
    LogLevel: {
      DEBUG: 'debug',
      INFO: 'info',
      WARN: 'warn',
      ERROR: 'error'
    },
    createLogger: vi.fn(() => mockLogger),
    logger: vi.fn(),
    getLogs: vi.fn().mockReturnValue([]),
    clearLogs: vi.fn()
  };
});

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  setAuthData, 
  getAuthData, 
  removeAuthData,
  clearAllAuthData,
  STORAGE_KEYS
} from './auth-storage';

// Storage 인터페이스 구현
const createMockStorage = () => ({
  length: 0,
  key: vi.fn((index: number) => null),
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  [Symbol.iterator]: function* () { yield* []; }
});

// IndexedDB 타입 정의
type IDBEventHandler = ((this: IDBRequest<any>, ev: Event) => any) | null;

// 간단한 DOMException 모킹
class MockDOMException extends Error {
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
  
  readonly code: number = 0;
  readonly INDEX_SIZE_ERR: number = 1;
  readonly DOMSTRING_SIZE_ERR: number = 2;
  readonly HIERARCHY_REQUEST_ERR: number = 3;
  readonly WRONG_DOCUMENT_ERR: number = 4;
  readonly INVALID_CHARACTER_ERR: number = 5;
  readonly NO_DATA_ALLOWED_ERR: number = 6;
  readonly NO_MODIFICATION_ALLOWED_ERR: number = 7;
  readonly NOT_FOUND_ERR: number = 8;
  readonly NOT_SUPPORTED_ERR: number = 9;
  readonly INUSE_ATTRIBUTE_ERR: number = 10;
  readonly INVALID_STATE_ERR: number = 11;
  readonly SYNTAX_ERR: number = 12;
  readonly INVALID_MODIFICATION_ERR: number = 13;
  readonly NAMESPACE_ERR: number = 14;
  readonly INVALID_ACCESS_ERR: number = 15;
  readonly VALIDATION_ERR: number = 16;
  readonly TYPE_MISMATCH_ERR: number = 17;
  readonly SECURITY_ERR: number = 18;
  readonly NETWORK_ERR: number = 19;
  readonly ABORT_ERR: number = 20;
  readonly URL_MISMATCH_ERR: number = 21;
  readonly QUOTA_EXCEEDED_ERR: number = 22;
  readonly TIMEOUT_ERR: number = 23;
  readonly INVALID_NODE_TYPE_ERR: number = 24;
  readonly DATA_CLONE_ERR: number = 25;
}

interface MockIDBRequest extends EventTarget {
  result: any;
  error: DOMException | null;
  source: any;
  transaction: any;
  readyState: IDBRequestReadyState;
  onerror: IDBEventHandler;
  onsuccess: IDBEventHandler;
  onupgradeneeded?: IDBEventHandler;
}

// IndexedDB 모킹
const createMockIndexedDB = () => {
  // EventTarget 메서드 구현
  const createEventTarget = () => ({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  });
  
  const createRequest = (initialValues = {}): MockIDBRequest => ({
    ...createEventTarget(),
    result: null,
    error: null,
    source: null,
    transaction: null,
    readyState: 'pending' as IDBRequestReadyState,
    onerror: null,
    onsuccess: null,
    ...initialValues
  });
  
  const mockObjectStore = {
    put: vi.fn(() => createRequest()),
    get: vi.fn(() => createRequest()),
    delete: vi.fn(() => createRequest())
  };
  
  const mockTransaction = {
    objectStore: vi.fn().mockReturnValue(mockObjectStore)
  };
  
  const mockDatabase = {
    createObjectStore: vi.fn(),
    transaction: vi.fn().mockReturnValue(mockTransaction),
    objectStoreNames: {
      contains: vi.fn().mockReturnValue(false)
    }
  };
  
  const mockOpenRequest = createRequest({ result: mockDatabase });
  const mockDeleteRequest = createRequest();
  
  return {
    open: vi.fn().mockImplementation(() => {
      setTimeout(() => {
        if (mockOpenRequest.onupgradeneeded) {
          const event = new Event('upgradeneeded');
          Object.defineProperty(event, 'target', { value: mockOpenRequest });
          mockOpenRequest.onupgradeneeded.call(mockOpenRequest, event);
        }
        if (mockOpenRequest.onsuccess) {
          const event = new Event('success');
          Object.defineProperty(event, 'target', { value: mockOpenRequest });
          mockOpenRequest.onsuccess.call(mockOpenRequest, event);
        }
      }, 0);
      return mockOpenRequest;
    }),
    deleteDatabase: vi.fn().mockImplementation(() => {
      setTimeout(() => {
        if (mockDeleteRequest.onsuccess) {
          const event = new Event('success');
          Object.defineProperty(event, 'target', { value: mockDeleteRequest });
          mockDeleteRequest.onsuccess.call(mockDeleteRequest, event);
        }
      }, 0);
      return mockDeleteRequest;
    }),
    cmp: vi.fn(),
    databases: vi.fn().mockResolvedValue([])
  };
};

// 테스트 설정
describe('인증 스토리지 유틸리티', () => {
  beforeEach(() => {
    // 전역 객체 모킹
    global.localStorage = createMockStorage();
    global.sessionStorage = createMockStorage();
    global.indexedDB = createMockIndexedDB();
    
    // document.cookie 초기화
    Object.defineProperty(global.document, 'cookie', {
      writable: true,
      value: ''
    });
    
    // window.location 모킹
    Object.defineProperty(global, 'window', {
      value: {
        location: {
          hostname: 'localhost'
        },
        navigator: {
          userAgent: 'test-agent'
        }
      },
      writable: true
    });
    
    // process.env 모킹
    Object.defineProperty(process, 'env', {
      value: {
        NODE_ENV: 'test'
      },
      writable: true
    });
    
    // 모킹 초기화
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  test('setAuthData는 여러 스토리지에 데이터를 저장해야 함', async () => {
    const key = STORAGE_KEYS.CODE_VERIFIER;
    const value = 'test-verifier-123';
    
    const result = await setAuthData(key, value);
    
    expect(result).toBe(true);
    expect(global.localStorage.setItem).toHaveBeenCalled();
    expect(global.sessionStorage.setItem).toHaveBeenCalled();
  });
  
  test('getAuthData는 우선순위에 따라 데이터를 가져와야 함', async () => {
    const key = STORAGE_KEYS.ACCESS_TOKEN;
    const value = 'test-access-token-xyz';
    
    vi.mocked(global.localStorage.getItem).mockReturnValue(value);
    
    const result = await getAuthData(key);
    
    expect(result).toBe(value);
    expect(global.localStorage.getItem).toHaveBeenCalledWith(key);
  });
  
  test('removeAuthData는 모든 스토리지에서 데이터를 제거해야 함', async () => {
    const key = STORAGE_KEYS.REFRESH_TOKEN;
    
    const result = await removeAuthData(key);
    
    expect(result).toBe(true);
    expect(global.localStorage.removeItem).toHaveBeenCalledWith(key);
    expect(global.sessionStorage.removeItem).toHaveBeenCalledWith(`auth.${key}.backup`);
  });
  
  test('clearAllAuthData는 모든 인증 데이터를 제거해야 함', async () => {
    const result = await clearAllAuthData();
    
    expect(result).toBe(true);
    expect(global.localStorage.removeItem).toHaveBeenCalled();
    expect(global.sessionStorage.removeItem).toHaveBeenCalled();
  });
  
  test('getAuthData는 스토리지 간 동기화를 수행해야 함', async () => {
    const key = STORAGE_KEYS.CODE_VERIFIER;
    const value = 'cookie-verifier-value';
    
    vi.mocked(global.localStorage.getItem).mockReturnValue(null);
    vi.mocked(global.sessionStorage.getItem).mockReturnValue(value);
    
    const result = await getAuthData(key);
    
    expect(result).toBe(value);
    expect(global.localStorage.setItem).toHaveBeenCalled();
  });
}); 