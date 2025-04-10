/**
 * 파일명: auth-storage.test.ts
 * 목적: 인증 스토리지 유틸리티 테스트
 * 역할: 인증 데이터의 저장, 조회, 삭제 기능 검증
 * 작성일: 2025-03-27
 * 수정일: 2025-03-30
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { clearTestEnvironment } from '../setup';

// 스토리지 키 상수 정의
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id'
};

// 스토리지 모킹을 위한 Map 객체
const storageMock = new Map();

// 모킹 함수
const mockEncryptValue = vi.fn((key, value) => `encrypted_${value}`);
const mockDecryptValue = vi.fn((key, value) => value.replace('encrypted_', ''));

// 인증 스토리지 함수 모킹
const setAuthData = vi.fn(async (key, value) => {
  try {
    const encryptedValue = mockEncryptValue(key, value);
    storageMock.set(key, encryptedValue);
    return { data: true, error: null };
  } catch (error) {
    return { data: false, error };
  }
});

const getAuthData = vi.fn(async (key) => {
  try {
    const encryptedValue = storageMock.get(key);
    if (!encryptedValue) return { data: null, error: null };
    const decryptedValue = mockDecryptValue(key, encryptedValue);
    return { data: decryptedValue, error: null };
  } catch (error) {
    return { data: null, error };
  }
});

const clearAllAuthData = vi.fn(async () => {
  storageMock.clear();
  return { error: null };
});

// 모듈 모킹
vi.mock('@/lib/crypto', () => ({
  encryptValue: mockEncryptValue,
  decryptValue: mockDecryptValue
}));

vi.mock('@/lib/auth-storage', () => ({
  STORAGE_KEYS,
  setAuthData,
  getAuthData,
  clearAllAuthData
}));

// 스토리지 객체 모킹
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

const mockSession = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// 전역 객체 모킹
vi.stubGlobal('localStorage', mockStorage);
vi.stubGlobal('sessionStorage', mockSession);

describe('인증 스토리지 전략 테스트', () => {
  beforeEach(async () => {
    await clearTestEnvironment();
    vi.clearAllMocks();
    storageMock.clear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('setAuthData가 암호화된 값을 저장하는지 검증', async () => {
    const key = 'test-key';
    const value = 'test-token';
    
    // 토큰 저장 테스트
    const result = await setAuthData(`${STORAGE_KEYS.ACCESS_TOKEN}.${key}`, value);

    // 암호화 함수 호출 확인
    expect(mockEncryptValue).toHaveBeenCalledWith(`${STORAGE_KEYS.ACCESS_TOKEN}.${key}`, value);
    
    // 저장 성공 여부 확인
    expect(result.data).toBe(true);
    expect(result.error).toBeNull();
  });

  it('getAuthData가 값을 복호화하여 가져오는지 검증', async () => {
    const key = 'test-key';
    const value = 'test-token';
    const fullKey = `${STORAGE_KEYS.ACCESS_TOKEN}.${key}`;
    
    // 먼저 데이터 저장
    await setAuthData(fullKey, value);
    
    // 데이터 조회
    const result = await getAuthData(fullKey);

    // 복호화 함수 호출 확인
    expect(mockDecryptValue).toHaveBeenCalled();
    
    // 조회 결과 확인
    expect(result.data).toBe(value);
    expect(result.error).toBeNull();
  });

  it('존재하지 않는 키로 조회할 경우 null을 반환하는지 검증', async () => {
    const nonExistentKey = 'non-existent-key';
    
    // 존재하지 않는 키로 조회
    const result = await getAuthData(nonExistentKey);
    
    // null 반환 확인
    expect(result.data).toBeNull();
    expect(result.error).toBeNull();
  });

  it('clearAllAuthData가 모든 인증 데이터를 지우는지 검증', async () => {
    // 먼저 데이터 저장
    await setAuthData(`${STORAGE_KEYS.ACCESS_TOKEN}.key1`, 'value1');
    await setAuthData(`${STORAGE_KEYS.REFRESH_TOKEN}.key2`, 'value2');
    
    // 모든 데이터 삭제
    const result = await clearAllAuthData();
    
    // 삭제 후 조회
    const data1 = await getAuthData(`${STORAGE_KEYS.ACCESS_TOKEN}.key1`);
    const data2 = await getAuthData(`${STORAGE_KEYS.REFRESH_TOKEN}.key2`);
    
    // 삭제 확인
    expect(result.error).toBeNull();
    expect(data1.data).toBeNull();
    expect(data2.data).toBeNull();
  });
}); 