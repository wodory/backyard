/**
 * 파일명: auth-storage.test.ts
 * 목적: 인증 스토리지 유틸리티 테스트
 * 역할: 여러 스토리지에 인증 정보를 저장하고 복구하는 로직 검증
 * 작성일: 2024-03-30
 */

import { test, expect, describe, beforeEach, afterEach, jest } from '@jest/globals';
import { 
  setAuthData, 
  getAuthData, 
  removeAuthData,
  clearAllAuthData,
  STORAGE_KEYS
} from '../lib/auth-storage';

// 로컬 스토리지와 세션 스토리지 모킹
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

// 모킹된 쿠키 함수들
const mockGetAuthCookie = jest.fn();
const mockSetAuthCookie = jest.fn();
const mockDeleteAuthCookie = jest.fn();

// IndexedDB 모킹
const mockIndexedDB = {
  open: jest.fn()
};

// 테스트 설정
describe('인증 스토리지 유틸리티', () => {
  beforeEach(() => {
    // 전역 객체 모킹
    Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });
    Object.defineProperty(global, 'sessionStorage', { value: mockSessionStorage });
    Object.defineProperty(global, 'indexedDB', { value: mockIndexedDB });
    
    // 함수 모킹 초기화
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockSessionStorage.getItem.mockClear();
    mockSessionStorage.setItem.mockClear();
    mockSessionStorage.removeItem.mockClear();
    mockGetAuthCookie.mockClear();
    mockSetAuthCookie.mockClear();
    mockDeleteAuthCookie.mockClear();
  });
  
  afterEach(() => {
    jest.resetAllMocks();
  });
  
  // 데이터 저장 테스트
  test('setAuthData는 여러 스토리지에 데이터를 저장해야 함', () => {
    // 테스트 데이터
    const key = STORAGE_KEYS.CODE_VERIFIER;
    const value = 'test-verifier-123';
    
    // 함수 호출
    const result = setAuthData(key, value);
    
    // 검증
    expect(result).toBe(true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, value);
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(`auth.${key}.backup`, value);
    expect(mockSetAuthCookie).toHaveBeenCalledWith(key, value, expect.any(Number));
  });
  
  // 데이터 가져오기 테스트
  test('getAuthData는 우선순위에 따라 데이터를 가져와야 함', () => {
    // 테스트 데이터
    const key = STORAGE_KEYS.ACCESS_TOKEN;
    const value = 'test-access-token-xyz';
    
    // localStorage에만 값이 있는 경우
    mockLocalStorage.getItem.mockReturnValueOnce(value);
    mockGetAuthCookie.mockReturnValueOnce(null);
    mockSessionStorage.getItem.mockReturnValueOnce(null);
    
    // 함수 호출
    const result = getAuthData(key);
    
    // 검증
    expect(result).toBe(value);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);
  });
  
  // 데이터 제거 테스트
  test('removeAuthData는 모든 스토리지에서 데이터를 제거해야 함', () => {
    // 테스트 데이터
    const key = STORAGE_KEYS.REFRESH_TOKEN;
    
    // 함수 호출
    const result = removeAuthData(key);
    
    // 검증
    expect(result).toBe(true);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(key);
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(`auth.${key}.backup`);
    expect(mockDeleteAuthCookie).toHaveBeenCalledWith(key);
  });
  
  // 모든 데이터 제거 테스트
  test('clearAllAuthData는 모든 인증 데이터를 제거해야 함', () => {
    // document.cookie 모킹
    Object.defineProperty(document, 'cookie', {
      get: jest.fn().mockReturnValue('sb-access-token=abc; auth-user-id=123'),
      set: jest.fn()
    });
    
    // 함수 호출
    const result = clearAllAuthData();
    
    // 검증
    expect(result).toBe(true);
    // 각 스토리지 키에 대해 removeAuthData가 호출되었는지 확인
    Object.values(STORAGE_KEYS).forEach(key => {
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(key);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(`auth.${key}.backup`);
      expect(mockDeleteAuthCookie).toHaveBeenCalledWith(key);
    });
  });
  
  // 스토리지 동기화 테스트
  test('getAuthData는 스토리지 간 동기화를 수행해야 함', () => {
    // 테스트 데이터
    const key = STORAGE_KEYS.CODE_VERIFIER;
    const value = 'cookie-verifier-value';
    
    // localStorage에는 값이 없고 쿠키에는 값이 있는 경우
    mockLocalStorage.getItem.mockReturnValueOnce(null);
    mockGetAuthCookie.mockReturnValueOnce(value);
    
    // 함수 호출
    const result = getAuthData(key);
    
    // 검증
    expect(result).toBe(value);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);
    expect(mockGetAuthCookie).toHaveBeenCalledWith(key);
    // 쿠키에서 찾은 값을 localStorage에 동기화해야 함
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, value);
  });
}); 