/**
 * 파일명: storage-mock.ts
 * 목적: 브라우저 스토리지 API 모킹
 * 역할: 테스트 환경에서 스토리지 API 시뮬레이션
 * 작성일: 2024-03-26
 */

import { vi } from 'vitest';

/**
 * localStorage 모킹
 * @returns 모의 localStorage 객체
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => {
        delete store[key];
      });
    }),
    key: vi.fn((index: number) => {
      return Object.keys(store)[index] || null;
    }),
    length: vi.fn(() => {
      return Object.keys(store).length;
    }),
    _getStore: () => ({ ...store }), // 테스트용 내부 메서드
  };
}

/**
 * sessionStorage 모킹
 * @returns 모의 sessionStorage 객체
 */
export function mockSessionStorage() {
  return mockLocalStorage(); // 인터페이스가 동일하므로 localStorage 모킹 재사용
}

/**
 * 쿠키 모킹
 * @returns 모의 document.cookie 작업을 위한 유틸리티
 */
export function mockCookies() {
  let cookies: Record<string, string> = {};

  return {
    get: vi.fn((name: string) => {
      return cookies[name] || null;
    }),
    getAll: vi.fn(() => {
      return Object.entries(cookies).map(([name, value]) => ({ name, value }));
    }),
    set: vi.fn((name: string, value: string, options = {}) => {
      cookies[name] = value;
    }),
    delete: vi.fn((name: string) => {
      delete cookies[name];
    }),
    has: vi.fn((name: string) => {
      return name in cookies;
    }),
    clear: vi.fn(() => {
      cookies = {};
    }),
    _getAll: () => ({ ...cookies }), // 테스트용 내부 메서드
  };
}

/**
 * Web Crypto API 모킹
 * @returns 모의 crypto 객체
 */
export function mockCrypto() {
  return {
    getRandomValues: vi.fn((array: Uint8Array) => {
      // 예측 가능한 "랜덤" 값 생성 (테스트용)
      for (let i = 0; i < array.length; i++) {
        array[i] = i % 256;
      }
      return array;
    }),
    subtle: {
      digest: vi.fn(async (algorithm: string, data: ArrayBuffer) => {
        // 간단한 SHA-256 시뮬레이션 (실제로는 다름)
        const mockHash = new Uint8Array(32); // SHA-256 결과는 32바이트
        for (let i = 0; i < 32; i++) {
          mockHash[i] = i;
        }
        return mockHash.buffer;
      })
    }
  };
}

/**
 * IndexedDB 모킹
 * @returns 모의 IndexedDB 작업을 위한 유틸리티
 */
export function mockIndexedDB() {
  const stores: Record<string, Record<string, any>> = {};

  // 현재 열려있는 DB와 저장소 이름
  let currentDB: string | null = null;
  let currentStore: string | null = null;

  // IndexedDB 인터페이스 모킹
  return {
    open: vi.fn((dbName: string) => {
      currentDB = dbName;
      if (!stores[dbName]) {
        stores[dbName] = {};
      }

      return {
        result: {
          objectStoreNames: {
            contains: vi.fn((storeName: string) => !!stores[dbName][storeName]),
          },
          createObjectStore: vi.fn((storeName: string) => {
            stores[dbName][storeName] = {};
            return {
              put: vi.fn(),
              get: vi.fn()
            };
          }),
          transaction: vi.fn(() => ({
            objectStore: vi.fn((storeName: string) => {
              currentStore = storeName;
              if (!stores[dbName][storeName]) {
                stores[dbName][storeName] = {};
              }
              return {
                put: vi.fn((value: any, key: string) => {
                  stores[dbName][storeName][key] = value;
                  return { onsuccess: null, onerror: null };
                }),
                get: vi.fn((key: string) => {
                  const result = stores[dbName][storeName][key];
                  return { 
                    onsuccess: null, 
                    onerror: null,
                    result
                  };
                }),
                delete: vi.fn((key: string) => {
                  delete stores[dbName][storeName][key];
                  return { onsuccess: null, onerror: null };
                })
              };
            }),
            oncomplete: null
          })),
          close: vi.fn()
        },
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
      };
    }),
    // 테스트용 내부 메서드
    _getStores: () => ({ ...stores }),
    _getCurrentStore: () => currentStore ? { ...stores[currentDB!][currentStore] } : null,
  };
} 