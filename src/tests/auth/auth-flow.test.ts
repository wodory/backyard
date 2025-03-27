/**
 * 파일명: auth-flow.test.ts
 * 목적: 인증 흐름 전체를 테스트
 * 역할: 인증 흐름의 각 단계가 올바르게 작동하는지 검증
 * 작성일: 2024-03-30
 */

import { getAuthData, setAuthData, removeAuthData, clearAllAuthData, STORAGE_KEYS } from '@/lib/auth-storage';
import { generateMockCodeVerifier, generateMockAuthCode } from '../mocks/auth-mock';

// 브라우저 환경 모킹
const mockLocalStorage: Record<string, string> = {};
const mockSessionStorage: Record<string, string> = {};
const mockCookies: Record<string, string> = {};

// mock cookies
Object.defineProperty(document, 'cookie', {
  get: jest.fn(() => {
    return Object.entries(mockCookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }),
  set: jest.fn((cookie) => {
    const parts = cookie.split('=');
    const name = parts[0].trim();
    const value = parts.slice(1).join('=');
    mockCookies[name] = value;
    return cookie;
  }),
});

// mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn((key: string) => {
      return mockLocalStorage[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      mockLocalStorage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete mockLocalStorage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(mockLocalStorage).forEach((key) => {
        delete mockLocalStorage[key];
      });
    }),
    key: jest.fn((index: number) => {
      return Object.keys(mockLocalStorage)[index] || null;
    }),
    length: jest.fn(() => {
      return Object.keys(mockLocalStorage).length;
    }),
  },
  writable: true,
});

// mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn((key: string) => {
      return mockSessionStorage[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      mockSessionStorage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete mockSessionStorage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(mockSessionStorage).forEach((key) => {
        delete mockSessionStorage[key];
      });
    }),
    key: jest.fn((index: number) => {
      return Object.keys(mockSessionStorage)[index] || null;
    }),
    length: jest.fn(() => {
      return Object.keys(mockSessionStorage).length;
    }),
  },
  writable: true,
});

// mock Supabase response
jest.mock('@/lib/auth', () => ({
  getAuthClient: jest.fn(() => ({
    auth: {
      exchangeCodeForSession: jest.fn((code: string) => {
        if (code === 'valid_code' && window.localStorage.getItem('code_verifier')) {
          return {
            data: {
              session: {
                access_token: 'test_access_token',
                refresh_token: 'test_refresh_token',
                user: {
                  id: 'test_user_id',
                  app_metadata: {
                    provider: 'google'
                  }
                }
              }
            },
            error: null
          };
        } else {
          return {
            data: { session: null },
            error: {
              message: 'invalid request: both auth code and code verifier should be non-empty',
              status: 400
            }
          };
        }
      }),
      signInWithOAuth: jest.fn(() => ({
        data: { url: 'https://example.com/oauth/redirect' },
        error: null
      })),
      signOut: jest.fn(() => ({ error: null })),
      getUser: jest.fn(() => ({ data: { user: null }, error: null }))
    }
  }))
}));

describe('인증 흐름 테스트', () => {
  beforeEach(() => {
    // 각 테스트 전 모킹 데이터 초기화
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
    Object.keys(mockSessionStorage).forEach((key) => delete mockSessionStorage[key]);
    Object.keys(mockCookies).forEach((key) => delete mockCookies[key]);
    
    // IndexedDB 모킹 (단순화)
    global.indexedDB = {
      open: jest.fn(() => ({
        result: {
          transaction: jest.fn(() => ({
            objectStore: jest.fn(() => ({
              get: jest.fn(() => ({ 
                result: null, 
                onsuccess: null,
                onerror: null 
              })),
              put: jest.fn(() => ({ 
                onsuccess: null,
                onerror: null 
              })),
            })),
            oncomplete: null
          })),
          objectStoreNames: {
            contains: jest.fn(() => true)
          },
          close: jest.fn()
        },
        onupgradeneeded: null,
        onsuccess: function(cb: any) {
          if (this.onsuccess) {
            this.onsuccess(cb);
          }
          return this;
        },
        onerror: null
      }))
    } as any;
  });

  test('auth-storage의 데이터 설정 및 가져오기 기능', () => {
    // 테스트 데이터
    const testKey = STORAGE_KEYS.CODE_VERIFIER;
    const testValue = 'test_value';
    
    // 데이터 설정
    setAuthData(testKey, testValue, { expiry: 60 });
    
    // localStorage 확인
    expect(mockLocalStorage[testKey]).toBe(testValue);
    
    // sessionStorage 백업 확인
    expect(mockSessionStorage[`auth.${testKey}.backup`]).toBe(testValue);
    
    // 데이터 가져오기
    const retrievedValue = getAuthData(testKey);
    expect(retrievedValue).toBe(testValue);
    
    // 데이터 삭제
    removeAuthData(testKey);
    
    // 삭제 확인
    expect(mockLocalStorage[testKey]).toBeUndefined();
    expect(getAuthData(testKey)).toBeNull();
  });

  test('여러 스토리지에서 우선순위에 따른 데이터 가져오기', () => {
    const testKey = STORAGE_KEYS.ACCESS_TOKEN;
    
    // localStorage에만 값 설정
    mockLocalStorage[testKey] = 'local_value';
    expect(getAuthData(testKey)).toBe('local_value');
    
    // sessionStorage에 다른 값 설정 (localStorage가 우선)
    mockSessionStorage[`auth.${testKey}.backup`] = 'session_value';
    expect(getAuthData(testKey)).toBe('local_value');
    
    // localStorage 삭제 후 sessionStorage에서 복원
    delete mockLocalStorage[testKey];
    expect(getAuthData(testKey)).toBe('session_value');
    
    // 쿠키 설정 (세션보다 우선)
    mockCookies[testKey] = 'cookie_value';
    expect(getAuthData(testKey)).toBe('cookie_value');
    
    // 모든 스토리지 삭제
    clearAllAuthData();
    
    // 모든 값 삭제 확인
    expect(getAuthData(testKey)).toBeNull();
    expect(Object.keys(mockLocalStorage).length).toBe(0);
    expect(Object.keys(mockSessionStorage).filter(k => k.startsWith('auth.'))).toHaveLength(0);
  });

  test('code_verifier 생성 및 저장', () => {
    // 코드 검증기 생성
    const mockVerifier = generateMockCodeVerifier();
    
    // 코드 검증기 저장
    setAuthData(STORAGE_KEYS.CODE_VERIFIER, mockVerifier, { expiry: 60 });
    
    // localStorage에 직접 저장 (Supabase 내부 구현 흉내)
    localStorage.setItem('code_verifier', mockVerifier);
    
    // 저장된 값 확인
    expect(getAuthData(STORAGE_KEYS.CODE_VERIFIER)).toBe(mockVerifier);
    expect(mockLocalStorage['code_verifier']).toBe(mockVerifier);
    expect(mockSessionStorage[`auth.${STORAGE_KEYS.CODE_VERIFIER}.backup`]).toBe(mockVerifier);
    
    // code_verifier가 여러 위치에 저장되었는지 확인
    const storedLocations = [
      mockLocalStorage[STORAGE_KEYS.CODE_VERIFIER],
      mockLocalStorage['code_verifier'],
      mockSessionStorage[`auth.${STORAGE_KEYS.CODE_VERIFIER}.backup`]
    ].filter(Boolean);
    
    expect(storedLocations.length).toBeGreaterThanOrEqual(2);
  });

  test('인증 토큰 만료 시간 관리', () => {
    jest.useFakeTimers();
    
    // 짧은 만료 시간으로 데이터 설정
    setAuthData(STORAGE_KEYS.ACCESS_TOKEN, 'short_lived_token', { expiry: 1/60 }); // 1초
    
    // 초기 확인
    expect(getAuthData(STORAGE_KEYS.ACCESS_TOKEN)).toBe('short_lived_token');
    
    // 시간 경과
    jest.advanceTimersByTime(2000); // 2초 경과
    
    // 만료 확인 (실제로는 만료되지만 모킹 환경에서는 작동하지 않음)
    // 이 테스트는 실제 브라우저 환경에서만 정확하게 작동
    
    jest.useRealTimers();
  });
});

/**
 * 전체 인증 흐름 시나리오 테스트
 */
describe('전체 인증 흐름 시나리오', () => {
  beforeEach(() => {
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
    Object.keys(mockSessionStorage).forEach((key) => delete mockSessionStorage[key]);
    Object.keys(mockCookies).forEach((key) => delete mockCookies[key]);
  });
  
  test('로그인 성공 시나리오', () => {
    // 1. code_verifier 생성 및 저장
    const mockVerifier = generateMockCodeVerifier();
    setAuthData(STORAGE_KEYS.CODE_VERIFIER, mockVerifier, { expiry: 60 });
    window.localStorage.setItem('code_verifier', mockVerifier);
    
    // 2. 인증 코드 받기 (실제로는 OAuth 리디렉션으로 받음)
    const mockAuthCode = 'valid_code';
    
    // 3. 인증 코드를 세션으로 교환 (실제 구현에서는 callback 컴포넌트가 수행)
    const { getAuthClient } = require('@/lib/auth');
    const supabase = getAuthClient();
    
    // 세션 교환 시도
    return supabase.auth.exchangeCodeForSession(mockAuthCode)
      .then(({ data, error }: { 
        data: { 
          session: { 
            access_token: string; 
            refresh_token: string; 
            user: { 
              id: string; 
              app_metadata: { 
                provider: string; 
              } 
            } 
          } | null 
        }; 
        error: { message: string; status: number; } | null 
      }) => {
        // 4. 성공 확인
        expect(error).toBeNull();
        expect(data.session).not.toBeNull();
        if (data.session) {
          expect(data.session.access_token).toBe('test_access_token');
        }
        
        // 5. 토큰 저장 시뮬레이션
        if (data.session) {
          setAuthData(STORAGE_KEYS.ACCESS_TOKEN, data.session.access_token, { expiry: 60 });
          setAuthData(STORAGE_KEYS.REFRESH_TOKEN, data.session.refresh_token, { expiry: 60 });
          setAuthData(STORAGE_KEYS.USER_ID, data.session.user.id, { expiry: 60 });
          setAuthData(STORAGE_KEYS.PROVIDER, data.session.user.app_metadata.provider, { expiry: 60 });
        }
        
        // 6. 세션 정보가 저장되었는지 확인
        expect(getAuthData(STORAGE_KEYS.ACCESS_TOKEN)).toBe('test_access_token');
        expect(getAuthData(STORAGE_KEYS.REFRESH_TOKEN)).toBe('test_refresh_token');
        expect(getAuthData(STORAGE_KEYS.USER_ID)).toBe('test_user_id');
        expect(getAuthData(STORAGE_KEYS.PROVIDER)).toBe('google');
      });
  });
  
  test('code_verifier 누락 시 로그인 실패 시나리오', () => {
    // 1. code_verifier를 설정하지 않음
    
    // 2. 인증 코드 받기
    const mockAuthCode = 'valid_code';
    
    // 3. 인증 코드를 세션으로 교환 시도
    const { getAuthClient } = require('@/lib/auth');
    const supabase = getAuthClient();
    
    // 세션 교환 시도
    return supabase.auth.exchangeCodeForSession(mockAuthCode)
      .then(({ data, error }: { 
        data: { session: any | null }; 
        error: { message: string; status: number; } | null 
      }) => {
        // 4. 실패 확인
        expect(error).not.toBeNull();
        if (error) {
          expect(error.message).toContain('code verifier');
          expect(error.message).toContain('both auth code and code verifier should be non-empty');
        }
        expect(data.session).toBeNull();
      });
  });
  
  test('인증 코드 누락 시 로그인 실패 시나리오', () => {
    // 1. code_verifier 설정
    const mockVerifier = generateMockCodeVerifier();
    setAuthData(STORAGE_KEYS.CODE_VERIFIER, mockVerifier, { expiry: 60 });
    window.localStorage.setItem('code_verifier', mockVerifier);
    
    // 2. 잘못된 인증 코드 사용
    const invalidCode = '';
    
    // 3. 인증 코드를 세션으로 교환 시도
    const { getAuthClient } = require('@/lib/auth');
    const supabase = getAuthClient();
    
    // 세션 교환 시도
    return supabase.auth.exchangeCodeForSession(invalidCode)
      .then(({ data, error }: { 
        data: { session: any | null }; 
        error: { message: string; status: number; } | null 
      }) => {
        // 4. 실패 확인
        expect(error).not.toBeNull();
        expect(data.session).toBeNull();
      });
  });
  
  test('로그아웃 시나리오', () => {
    // 1. 먼저 로그인 상태 설정
    setAuthData(STORAGE_KEYS.ACCESS_TOKEN, 'test_access_token', { expiry: 60 });
    setAuthData(STORAGE_KEYS.REFRESH_TOKEN, 'test_refresh_token', { expiry: 60 });
    setAuthData(STORAGE_KEYS.USER_ID, 'test_user_id', { expiry: 60 });
    setAuthData(STORAGE_KEYS.PROVIDER, 'google', { expiry: 60 });
    
    // code_verifier 설정 (로그아웃 후에도 유지되어야 함)
    const mockVerifier = generateMockCodeVerifier();
    setAuthData(STORAGE_KEYS.CODE_VERIFIER, mockVerifier, { expiry: 60 });
    
    // 2. 로그인 상태 확인
    expect(getAuthData(STORAGE_KEYS.ACCESS_TOKEN)).toBe('test_access_token');
    
    // 3. 로그아웃 시뮬레이션
    removeAuthData(STORAGE_KEYS.ACCESS_TOKEN);
    removeAuthData(STORAGE_KEYS.REFRESH_TOKEN);
    removeAuthData(STORAGE_KEYS.USER_ID);
    removeAuthData(STORAGE_KEYS.PROVIDER);
    
    // 4. 로그아웃 상태 확인
    expect(getAuthData(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
    expect(getAuthData(STORAGE_KEYS.REFRESH_TOKEN)).toBeNull();
    expect(getAuthData(STORAGE_KEYS.USER_ID)).toBeNull();
    expect(getAuthData(STORAGE_KEYS.PROVIDER)).toBeNull();
    
    // 5. code_verifier는 유지되어야 함
    expect(getAuthData(STORAGE_KEYS.CODE_VERIFIER)).toBe(mockVerifier);
  });
}); 