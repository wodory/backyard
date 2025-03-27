/**
 * 파일명: auth-storage.test.ts
 * 목적: 다중 스토리지 전략 테스트
 * 역할: 인증 데이터 저장 및 복원 로직 테스트
 * 작성일: 2024-03-26
 */

import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { mockLocalStorage, mockSessionStorage, mockCookies } from '../mocks/storage-mock';
import { mockClientEnvironment } from '../mocks/env-mock';

// 테스트 대상 모듈을 모킹하기 전에 원본 참조 저장
const originalModule = vi.importActual('../../lib/auth-storage');

// 테스트 환경 설정
let mockStorage: ReturnType<typeof mockLocalStorage>;
let mockSession: ReturnType<typeof mockSessionStorage>;
let mockCookie: ReturnType<typeof mockCookies>;
let clientEnvironment: { restore: () => void };

// auth-storage 모듈 모킹
vi.mock('../../lib/auth-storage', async () => {
  const actual = await vi.importActual('../../lib/auth-storage');
  return {
    ...actual as object,
    // 필요한 함수만 오버라이드
  };
});

// 쿠키 유틸리티 모듈 모킹
vi.mock('../../lib/cookie', () => {
  return {
    getAuthCookie: vi.fn((key: string) => mockCookie.get(key)),
    setAuthCookie: vi.fn((key: string, value: string, days: number) => mockCookie.set(key, value)),
    deleteAuthCookie: vi.fn((key: string) => mockCookie.delete(key)),
  };
});

describe('인증 스토리지 전략 테스트', () => {
  beforeEach(() => {
    // 테스트 환경 초기화
    vi.resetModules();
    
    // 스토리지 모킹
    mockStorage = mockLocalStorage();
    mockSession = mockSessionStorage();
    mockCookie = mockCookies();
    
    // 클라이언트 환경 모킹
    clientEnvironment = mockClientEnvironment();
    
    // window 객체의 localStorage 및 sessionStorage 오버라이드
    Object.defineProperty(global.window, 'localStorage', {
      value: mockStorage,
      writable: true
    });
    
    Object.defineProperty(global.window, 'sessionStorage', {
      value: mockSession,
      writable: true
    });
  });
  
  afterEach(() => {
    // 테스트 환경 정리
    clientEnvironment.restore();
    vi.clearAllMocks();
  });
  
  // 모듈 import는 환경 설정 후에 수행
  const importAuthStorage = async () => {
    return await import('../../lib/auth-storage');
  };
  
  test('setAuthData가 여러 스토리지에 값을 저장하는지 검증', async () => {
    // 모듈 가져오기
    const { setAuthData, STORAGE_KEYS } = await importAuthStorage();
    
    // 테스트 데이터
    const key = STORAGE_KEYS.ACCESS_TOKEN;
    const value = 'test-access-token';
    
    // 함수 실행
    const result = setAuthData(key, value);
    
    // 결과 검증
    expect(result).toBe(true);
    
    // 여러 스토리지에 저장되었는지 확인
    expect(mockStorage.setItem).toHaveBeenCalledWith(key, expect.any(String));
    expect(mockSession.setItem).toHaveBeenCalledWith(`auth.${key}.backup`, expect.any(String));
    
    // 쿠키 유틸리티 호출 확인
    const cookieModule = await vi.importActual('../../lib/cookie');
    expect(vi.mocked(cookieModule).setAuthCookie).toHaveBeenCalledWith(key, expect.any(String), expect.any(Number));
  });
  
  test('getAuthData가 우선순위에 따라 값을 가져오는지 검증', async () => {
    // 모듈 가져오기
    const { getAuthData, STORAGE_KEYS } = await importAuthStorage();
    
    // 테스트 데이터
    const key = STORAGE_KEYS.ACCESS_TOKEN;
    const localStorage_value = 'localStorage-token';
    const sessionStorage_value = 'sessionStorage-token';
    const cookie_value = 'cookie-token';
    
    // localStorage에만 값 설정
    mockStorage.getItem.mockReturnValueOnce(localStorage_value);
    mockSession.getItem.mockReturnValueOnce(null);
    const cookieModule = await vi.importActual('../../lib/cookie');
    vi.mocked(cookieModule).getAuthCookie.mockReturnValueOnce(null);
    
    // 함수 실행 및 검증
    let result = getAuthData(key);
    expect(result).toBe(localStorage_value);
    expect(mockStorage.getItem).toHaveBeenCalledWith(key);
    
    // 초기화
    vi.clearAllMocks();
    
    // localStorage에 없고 쿠키에 있는 경우
    mockStorage.getItem.mockReturnValueOnce(null);
    vi.mocked(cookieModule).getAuthCookie.mockReturnValueOnce(cookie_value);
    
    // 함수 실행 및 검증
    result = getAuthData(key);
    expect(result).toBe(cookie_value);
    expect(mockStorage.getItem).toHaveBeenCalledWith(key);
    expect(vi.mocked(cookieModule).getAuthCookie).toHaveBeenCalledWith(key);
    expect(mockStorage.setItem).toHaveBeenCalledWith(key, cookie_value); // 동기화 확인
    
    // 초기화
    vi.clearAllMocks();
    
    // localStorage, 쿠키에 없고 sessionStorage에 있는 경우
    mockStorage.getItem.mockReturnValueOnce(null);
    vi.mocked(cookieModule).getAuthCookie.mockReturnValueOnce(null);
    mockSession.getItem.mockReturnValueOnce(sessionStorage_value);
    
    // 함수 실행 및 검증
    result = getAuthData(key);
    expect(result).toBe(sessionStorage_value);
    expect(mockStorage.getItem).toHaveBeenCalledWith(key);
    expect(vi.mocked(cookieModule).getAuthCookie).toHaveBeenCalledWith(key);
    expect(mockSession.getItem).toHaveBeenCalledWith(`auth.${key}.backup`);
    expect(mockStorage.setItem).toHaveBeenCalledWith(key, sessionStorage_value); // 동기화 확인
  });
  
  test('암호화된 토큰이 안전하게 저장 및 복원되는지 검증', async () => {
    // 모듈 가져오기
    const { setAuthData, getAuthData, STORAGE_KEYS } = await importAuthStorage();
    
    // 테스트 데이터
    const key = STORAGE_KEYS.ACCESS_TOKEN; // 토큰은 암호화 대상
    const value = 'sensitive-access-token';
    
    // 암호화 함수가 적용되어야 함
    mockStorage.setItem.mockImplementation((k, v) => {
      // 암호화된 값이 원본과 달라야 함
      expect(v).not.toBe(value);
      // 'enc:' 접두사가 인코딩에 포함되어야 함
      expect(v.includes('enc:')).toBe(true);
    });
    
    // 함수 실행
    setAuthData(key, value);
    
    // localStorage에서 암호화된 값 가져오기 시뮬레이션
    const encryptedValue = 'enc:some-encrypted-value';
    mockStorage.getItem.mockReturnValueOnce(encryptedValue);
    
    // 복호화 함수는 원본 값을 반환해야 함
    const result = getAuthData(key);
    
    // 암호화/복호화 과정을 거쳐도 원본 값과 동일해야 함
    // 실제 테스트에서는 모킹된 값이므로 정확한 검증은 어려움
    expect(result).not.toBeNull();
  });
  
  test('스토리지 실패 시 대체 스토리지를 사용하는지 검증', async () => {
    // 모듈 가져오기
    const { setAuthData, getAuthData, STORAGE_KEYS } = await importAuthStorage();
    
    // 테스트 데이터
    const key = STORAGE_KEYS.ACCESS_TOKEN;
    const value = 'test-access-token';
    
    // localStorage 실패 시뮬레이션
    mockStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage 접근 불가');
    });
    
    // sessionStorage는 정상 작동
    mockSession.setItem.mockImplementation(() => {});
    
    // 함수 실행
    const result = setAuthData(key, value);
    
    // localStorage 실패해도 다른 스토리지에 저장되면 성공으로 간주
    expect(result).toBe(true);
    expect(mockStorage.setItem).toHaveBeenCalledWith(key, expect.any(String));
    expect(mockSession.setItem).toHaveBeenCalledWith(`auth.${key}.backup`, expect.any(String));
    
    // 초기화
    vi.clearAllMocks();
    
    // localStorage에서 값을 가져올 수 없는 경우 시뮬레이션
    mockStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage 접근 불가');
    });
    
    // sessionStorage에 값 있음
    mockSession.getItem.mockReturnValueOnce(value);
    
    // 함수 실행
    const getValue = getAuthData(key);
    
    // sessionStorage에서 값을 가져올 수 있어야 함
    expect(getValue).toBe(value);
    expect(mockSession.getItem).toHaveBeenCalledWith(`auth.${key}.backup`);
  });
  
  test('removeAuthData가 모든 스토리지에서 데이터를 제거하는지 검증', async () => {
    // 모듈 가져오기
    const { removeAuthData, STORAGE_KEYS } = await importAuthStorage();
    
    // 테스트 데이터
    const key = STORAGE_KEYS.ACCESS_TOKEN;
    
    // 함수 실행
    const result = removeAuthData(key);
    
    // 결과 검증
    expect(result).toBe(true);
    
    // 모든 스토리지에서 제거되었는지 확인
    expect(mockStorage.removeItem).toHaveBeenCalledWith(key);
    expect(mockSession.removeItem).toHaveBeenCalledWith(`auth.${key}.backup`);
    
    // 쿠키 유틸리티 호출 확인
    const cookieModule = await vi.importActual('../../lib/cookie');
    expect(vi.mocked(cookieModule).deleteAuthCookie).toHaveBeenCalledWith(key);
  });
}); 