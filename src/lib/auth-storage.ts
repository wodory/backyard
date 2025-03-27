/**
 * 파일명: auth-storage.ts
 * 목적: 인증 관련 상태를 여러 스토리지에 분산 저장
 * 역할: 브라우저 스토리지 간 인증 상태 동기화 및 복원
 * 작성일: 2024-03-30
 */

'use client';

import createLogger from './logger';
import { getAuthCookie, setAuthCookie, deleteAuthCookie } from './cookie';
import { Database } from '../types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

// 로거 생성
const logger = createLogger('AuthStorage');

// Window 객체 타입 확장
declare global {
  interface Window {
    __SUPABASE_AUTH_SET_ITEM?: (key: string, value: string) => void;
    __SUPABASE_AUTH_GET_ITEM?: (key: string) => string | null;
    __SUPABASE_AUTH_REMOVE_ITEM?: (key: string) => void;
    __SUPABASE_AUTH_CODE_VERIFIER?: string;
    __SUPABASE_SINGLETON_CLIENT?: SupabaseClient<Database, "public", any>;
  }
}

// 스토리지 키 정의
export const STORAGE_KEYS = {
  CODE_VERIFIER: 'code_verifier',
  ACCESS_TOKEN: 'sb-access-token',
  REFRESH_TOKEN: 'sb-refresh-token',
  SESSION: 'sb-session',
  PROVIDER: 'auth-provider',
  USER_ID: 'auth-user-id'
};

// IndexedDB 데이터베이스 설정
const DB_CONFIG = {
  NAME: 'auth_backup',
  VERSION: 1,
  STORE_NAME: 'auth_data'
};

/**
 * 여러 스토리지에 인증 데이터 저장
 * @param key 저장할 데이터의 키
 * @param value 저장할 데이터 값
 * @param options 저장 옵션 (만료 시간 등)
 * @returns 저장 성공 여부
 */
export function setAuthData(key: string, value: string, options: { expiry?: number } = {}): boolean {
  try {
    // 값이 null이면 제거 함수 호출
    if (value === null || value === undefined) {
      return removeAuthData(key);
    }
    
    // 저장하기 전에 민감 데이터 암호화
    const shouldEncrypt = key.includes('token') || key === STORAGE_KEYS.CODE_VERIFIER;
    const valueToStore = shouldEncrypt ? encryptValue(key, value) : value;
    
    // 동기식 스토리지 저장 시도 (우선순위 순서대로)
    const storageAttempts: Array<{ name: string; fn: () => void }> = [
      {
        name: 'localStorage',
        fn: () => localStorage.setItem(key, valueToStore)
      },
      {
        name: 'sessionStorage',
        fn: () => sessionStorage.setItem(`auth.${key}.backup`, valueToStore)
      },
      {
        name: 'cookie',
        fn: () => {
          // 쿠키 저장 옵션: 만료 시간 설정
          const expiry = options.expiry ? options.expiry / (60 * 60 * 24) : 1; // 초 -> 일 변환
          setAuthCookie(key, valueToStore, expiry);
        }
      }
    ];
    
    // 전역 헬퍼 함수가 있으면 추가
    if (typeof window !== 'undefined' && window.__SUPABASE_AUTH_SET_ITEM) {
      storageAttempts.unshift({
        name: 'Supabase 헬퍼',
        fn: () => {
          // @ts-ignore
          window.__SUPABASE_AUTH_SET_ITEM(key, valueToStore);
        }
      });
    }
    
    // 코드 검증기인 경우 전역 변수에도 저장
    if (key === STORAGE_KEYS.CODE_VERIFIER && typeof window !== 'undefined') {
      storageAttempts.push({
        name: '전역 변수',
        fn: () => {
          // @ts-ignore
          window.__SUPABASE_AUTH_CODE_VERIFIER = valueToStore;
        }
      });
    }
    
    // 모든 저장 메서드 시도
    const successfulStores: string[] = [];
    const failedStores: string[] = [];
    
    for (const attempt of storageAttempts) {
      try {
        attempt.fn();
        successfulStores.push(attempt.name);
      } catch (err) {
        failedStores.push(attempt.name);
        logger.warn(`${key}를 ${attempt.name}에 저장 실패`, err);
      }
    }
    
    // IndexedDB에 비동기적으로 저장 (성공/실패 여부는 확인하지 않음)
    saveToIndexedDB(key, valueToStore).catch(err => {
      logger.warn(`${key}를 IndexedDB에 저장 실패`, err);
    });
    
    // 결과 로깅
    if (successfulStores.length > 0) {
      logger.info(`${key} 저장 성공: ${successfulStores.join(', ')}`);
    }
    
    if (failedStores.length > 0) {
      logger.warn(`${key} 저장 실패: ${failedStores.join(', ')}`);
    }
    
    return successfulStores.length > 0;
  } catch (error) {
    logger.error(`${key} 저장 중 오류 발생`, error);
    return false;
  }
}

/**
 * 여러 스토리지에서 인증 데이터 가져오기 (우선순위 적용)
 * @param key 가져올 데이터의 키
 * @returns 가져온 데이터 값 또는 null
 */
export function getAuthData(key: string): string | null {
  try {
    // 스토리지 소스 정의 (우선순위 순서대로)
    const storageSources: Array<{ name: string; fn: () => string | null }> = [
      {
        name: 'Supabase 헬퍼',
        fn: () => {
          if (typeof window !== 'undefined' && window.__SUPABASE_AUTH_GET_ITEM) {
            try {
              // @ts-ignore
              return window.__SUPABASE_AUTH_GET_ITEM(key);
            } catch {
              return null;
            }
          }
          return null;
        }
      },
      {
        name: 'localStorage',
        fn: () => {
          try {
            return localStorage.getItem(key);
          } catch {
            return null;
          }
        }
      },
      {
        name: 'cookie',
        fn: () => {
          try {
            return getAuthCookie(key);
          } catch {
            return null;
          }
        }
      },
      {
        name: 'sessionStorage',
        fn: () => {
          try {
            return sessionStorage.getItem(`auth.${key}.backup`);
          } catch {
            return null;
          }
        }
      }
    ];
    
    // 코드 검증기인 경우 전역 변수도 확인
    if (key === STORAGE_KEYS.CODE_VERIFIER) {
      storageSources.push({
        name: '전역 변수',
        fn: () => {
          try {
            // @ts-ignore
            return window.__SUPABASE_AUTH_CODE_VERIFIER || null;
          } catch {
            return null;
          }
        }
      });
    }
    
    // 모든 소스를 확인하고 첫 번째 유효한 값 반환
    for (const source of storageSources) {
      const value = source.fn();
      if (value) {
        // 값을 찾았으면 다른 모든 스토리지에 동기화 (백그라운드에서)
        logger.debug(`${key}를 ${source.name}에서 찾음`);
        
        // 모든 스토리지에 값 동기화 (현재 소스 제외)
        syncValueToAllStorages(key, value, source.name).catch(err => 
          logger.warn(`${key} 동기화 실패`, err)
        );
        
        // 암호화된 값이면 복호화
        const shouldDecrypt = key.includes('token') || key === STORAGE_KEYS.CODE_VERIFIER;
        return shouldDecrypt ? decryptValue(key, value) : value;
      }
    }
    
    logger.debug(`${key}를 찾을 수 없음`);
    return null;
  } catch (error) {
    logger.error(`${key} 조회 중 오류 발생`, error);
    return null;
  }
}

/**
 * 모든 스토리지에 값 동기화
 * @param key 동기화할 키
 * @param value 동기화할 값
 * @param excludeSource 제외할 소스
 */
async function syncValueToAllStorages(key: string, value: string, excludeSource?: string): Promise<void> {
  // 비동기 작업을 병렬로 수행
  const syncPromises: Promise<void>[] = [];
  
  // localStorage 동기화
  if (excludeSource !== 'localStorage') {
    syncPromises.push(
      new Promise<void>((resolve) => {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          logger.warn(`localStorage 동기화 실패: ${key}`, e);
        }
        resolve();
      })
    );
  }
  
  // sessionStorage 동기화
  if (excludeSource !== 'sessionStorage') {
    syncPromises.push(
      new Promise<void>((resolve) => {
        try {
          sessionStorage.setItem(`auth.${key}.backup`, value);
        } catch (e) {
          logger.warn(`sessionStorage 동기화 실패: ${key}`, e);
        }
        resolve();
      })
    );
  }
  
  // 쿠키 동기화
  if (excludeSource !== 'cookie') {
    syncPromises.push(
      new Promise<void>((resolve) => {
        try {
          setAuthCookie(key, value, 1); // 1일 유효
        } catch (e) {
          logger.warn(`쿠키 동기화 실패: ${key}`, e);
        }
        resolve();
      })
    );
  }
  
  // IndexedDB 동기화
  syncPromises.push(
    saveToIndexedDB(key, value).catch(e => {
      logger.warn(`IndexedDB 동기화 실패: ${key}`, e);
    })
  );
  
  // 전역 변수 동기화 (코드 검증기만)
  if (key === STORAGE_KEYS.CODE_VERIFIER && excludeSource !== '전역 변수') {
    syncPromises.push(
      new Promise<void>((resolve) => {
        try {
          // @ts-ignore
          window.__SUPABASE_AUTH_CODE_VERIFIER = value;
        } catch (e) {
          logger.warn(`전역 변수 동기화 실패: ${key}`, e);
        }
        resolve();
      })
    );
  }
  
  // 모든 동기화 작업 완료 대기
  await Promise.all(syncPromises);
}

/**
 * 간단한 값 암호화 (기본 보안용)
 * @param key 암호화 키로 사용할 값
 * @param value 암호화할 값
 * @returns 암호화된 값
 */
function encryptValue(key: string, value: string): string {
  try {
    // 프로덕션이나 개발 환경이 아니면 암호화하지 않음
    if (typeof process === 'undefined' || !process.env.NODE_ENV) {
      return value;
    }
    
    // 매우 간단한 XOR 암호화 (기본 보안용)
    const securityKey = `${key}-${window.location.hostname}-${navigator.userAgent.slice(0, 10)}`;
    const keyChars = Array.from(securityKey);
    const valueChars = Array.from(value);
    
    const encrypted = valueChars.map((char, index) => {
      const keyChar = keyChars[index % keyChars.length];
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
    }).join('');
    
    // Base64로 인코딩
    return btoa(`enc:${encrypted}`);
  } catch (error) {
    logger.warn('암호화 실패, 원본 값 반환', error);
    return value;
  }
}

/**
 * 암호화된 값 복호화
 * @param key 복호화 키로 사용할 값
 * @param value 복호화할 값
 * @returns 복호화된 값
 */
function decryptValue(key: string, value: string): string {
  try {
    // 암호화된 값이 아니면 그대로 반환
    if (!value.startsWith('enc:') && !value.includes('enc:')) {
      return value;
    }
    
    // Base64 디코딩
    let decoded;
    try {
      decoded = atob(value);
    } catch {
      // Base64가 아니면 원래 값 반환
      return value;
    }
    
    // 암호화 접두사 확인
    if (!decoded.startsWith('enc:')) {
      return value;
    }
    
    // 접두사 제거
    const encrypted = decoded.substring(4);
    
    // 복호화 (XOR 반전)
    const securityKey = `${key}-${window.location.hostname}-${navigator.userAgent.slice(0, 10)}`;
    const keyChars = Array.from(securityKey);
    const encryptedChars = Array.from(encrypted);
    
    const decrypted = encryptedChars.map((char, index) => {
      const keyChar = keyChars[index % keyChars.length];
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
    }).join('');
    
    return decrypted;
  } catch (error) {
    logger.warn('복호화 실패, 원본 값 반환', error);
    return value;
  }
}

/**
 * 여러 스토리지에서 인증 데이터 비동기적으로 가져오기 (IndexedDB까지 확인)
 * @param key 가져올 데이터의 키
 * @returns Promise 내의 가져온 데이터 값 또는 null
 */
export async function getAuthDataAsync(key: string): Promise<string | null> {
  // 동기 스토리지 먼저 확인
  const syncValue = getAuthData(key);
  if (syncValue) return syncValue;
  
  // IndexedDB에서 확인 (비동기)
  try {
    const dbValue = await getFromIndexedDB(key);
    if (dbValue) {
      logger.debug(`IndexedDB에서 ${key} 찾음`);
      // 동기화
      localStorage.setItem(key, dbValue);
      return dbValue;
    }
  } catch (dbError) {
    logger.warn(`IndexedDB에서 ${key} 조회 실패`, dbError);
  }
  
  return null;
}

/**
 * 여러 스토리지에서 인증 데이터 제거
 * @param key 제거할 데이터의 키
 */
export function removeAuthData(key: string): boolean {
  try {
    // 1. localStorage에서 제거
    localStorage.removeItem(key);
    
    // 2. sessionStorage에서 제거
    sessionStorage.removeItem(`auth.${key}.backup`);
    
    // 3. 쿠키에서 제거
    deleteAuthCookie(key);
    
    // 4. Supabase 전역 헬퍼 함수가 있으면 사용
    if (typeof window !== 'undefined' && window.__SUPABASE_AUTH_REMOVE_ITEM) {
      try {
        // @ts-ignore
        window.__SUPABASE_AUTH_REMOVE_ITEM(key);
      } catch (helperError) {
        logger.warn(`헬퍼로 ${key} 제거 실패`, helperError);
      }
    }
    
    // 5. 전역 객체에서 제거 (code_verifier 전용)
    if (key === STORAGE_KEYS.CODE_VERIFIER) {
      try {
        // @ts-ignore
        delete window.__SUPABASE_AUTH_CODE_VERIFIER;
      } catch (globalError) {
        // 무시
      }
    }
    
    // 6. IndexedDB에서 제거 (비동기)
    removeFromIndexedDB(key).catch(err => {
      logger.warn(`IndexedDB에서 ${key} 제거 실패`, err);
    });
    
    logger.info(`${key} 모든 스토리지에서 제거 완료`);
    return true;
  } catch (error) {
    logger.error(`${key} 제거 중 오류 발생`, error);
    return false;
  }
}

/**
 * 모든 인증 데이터 제거 (로그아웃용)
 */
export function clearAllAuthData(): boolean {
  try {
    // 주요 인증 키 제거
    Object.values(STORAGE_KEYS).forEach(key => {
      removeAuthData(key);
    });
    
    // 인증 관련 쿠키 제거
    const allCookies = document.cookie.split(';');
    allCookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName.startsWith('sb-') || cookieName.startsWith('auth')) {
        deleteAuthCookie(cookieName);
      }
    });
    
    logger.info('모든 인증 데이터 제거됨');
    return true;
  } catch (error) {
    logger.error('인증 데이터 제거 중 오류 발생', error);
    return false;
  }
}

// IndexedDB 헬퍼 함수
async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_CONFIG.NAME, DB_CONFIG.VERSION);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_CONFIG.STORE_NAME)) {
        db.createObjectStore(DB_CONFIG.STORE_NAME);
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToIndexedDB(key: string, value: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_CONFIG.STORE_NAME, 'readwrite');
    const store = tx.objectStore(DB_CONFIG.STORE_NAME);
    const request = store.put(value, key);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    
    tx.oncomplete = () => db.close();
  });
}

async function getFromIndexedDB(key: string): Promise<string | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_CONFIG.STORE_NAME, 'readonly');
    const store = tx.objectStore(DB_CONFIG.STORE_NAME);
    const request = store.get(key);
    
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    
    tx.oncomplete = () => db.close();
  });
}

async function removeFromIndexedDB(key: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_CONFIG.STORE_NAME, 'readwrite');
    const store = tx.objectStore(DB_CONFIG.STORE_NAME);
    const request = store.delete(key);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    
    tx.oncomplete = () => db.close();
  });
} 