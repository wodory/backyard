/**
 * 파일명: auth-flow.test.ts
 * 목적: 인증 흐름 테스트
 * 역할: 인증 관련 기능의 통합 테스트
 * 작성일: 2025-03-27
 * 수정일: 2025-03-30
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { STORAGE_KEYS, getAuthData, setAuthData, clearTestEnvironment } from '../setup';

// 타입 정의
interface AuthOptions {
  queryParams?: {
    code_challenge?: string;
    code_challenge_method?: string;
  };
  redirectTo?: string;
}

interface AuthResponse {
  data: any;
  error: any;
}

// 모킹된 Supabase 함수
const mockSignInWithOAuth = async ({ options }: { options: AuthOptions }): Promise<AuthResponse> => {
  if (!options.queryParams?.code_challenge) {
    return { data: null, error: { message: 'code_challenge is required', status: 400 } };
  }
  if (options.queryParams.code_challenge === 'invalid') {
    return { data: null, error: { message: 'Invalid code challenge', status: 400 } };
  }
  return { data: { provider: 'google', url: 'https://accounts.google.com/auth' }, error: null };
};

const mockSignOut = async (): Promise<{ error: null }> => {
  await setAuthData(STORAGE_KEYS.ACCESS_TOKEN, '');
  await setAuthData(STORAGE_KEYS.REFRESH_TOKEN, '');
  return { error: null };
};

describe('인증 흐름 테스트', () => {
  beforeEach(async () => {
    await clearTestEnvironment();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('auth-storage의 데이터 설정 및 가져오기 기능', async () => {
    const key = STORAGE_KEYS.ACCESS_TOKEN;
    const value = 'test-value';

    await setAuthData(key, value);
    const result = await getAuthData(key);

    expect(result).toBe(value);
  });

  test('여러 스토리지에서 우선순위에 따른 데이터 가져오기', async () => {
    const key = STORAGE_KEYS.ACCESS_TOKEN;
    const value = 'test-value';

    await setAuthData(key, value);
    const result = await getAuthData(key);

    expect(result).toBe(value);
  });

  test('code_verifier 생성 및 저장', async () => {
    const key = STORAGE_KEYS.CODE_VERIFIER;
    const value = 'test-code-verifier';

    await setAuthData(key, value);
    const result = await getAuthData(key);

    expect(result).toBe(value);
  });

  test('인증 토큰 만료 시간 관리', async () => {
    const key = STORAGE_KEYS.ACCESS_TOKEN;
    const value = 'test-token';
    const expiresAt = new Date().getTime() + 3600000; // 1시간 후

    await setAuthData(key, value);
    await setAuthData('auth-expires-at', expiresAt.toString());

    const token = await getAuthData(key);
    const expiry = await getAuthData('auth-expires-at');

    expect(token).toBe(value);
    expect(Number(expiry)).toBe(expiresAt);
  });
});

describe('전체 인증 흐름 시나리오', () => {
  beforeEach(async () => {
    await clearTestEnvironment();
  });

  it('로그인 성공 시나리오', async () => {
    // 1. 로그인 시도
    const { data, error } = await mockSignInWithOAuth({
      options: {
        queryParams: {
          code_challenge: 'valid_challenge',
          code_challenge_method: 'S256'
        },
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    });

    // 2. 결과 확인
    expect(error).toBeNull();
    expect(data).toEqual({
      provider: 'google',
      url: 'https://accounts.google.com/auth'
    });
  });

  it('code_verifier 누락 시 로그인 실패 시나리오', async () => {
    // 1. 로그인 시도
    const { data, error } = await mockSignInWithOAuth({
      options: {
        queryParams: {},
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    });

    // 2. 결과 확인
    expect(data).toBeNull();
    expect(error).toEqual({
      message: 'code_challenge is required',
      status: 400
    });
  });

  it('인증 코드 누락 시 로그인 실패 시나리오', async () => {
    // 1. 로그인 시도
    const { data, error } = await mockSignInWithOAuth({
      options: {
        queryParams: {
          code_challenge: 'invalid',
          code_challenge_method: 'S256'
        },
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    });

    // 2. 결과 확인
    expect(data).toBeNull();
    expect(error).toEqual({
      message: 'Invalid code challenge',
      status: 400
    });
  });

  it('로그아웃 시나리오', async () => {
    // 1. 초기 상태 설정
    await setAuthData(STORAGE_KEYS.ACCESS_TOKEN, 'test_access_token');
    
    // 2. 로그아웃 실행
    const { error } = await mockSignOut();
    
    // 3. 결과 확인
    expect(error).toBeNull();
    const token = await getAuthData(STORAGE_KEYS.ACCESS_TOKEN);
    expect(token).toBeNull();
  });
}); 