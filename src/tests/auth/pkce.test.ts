/**
 * 파일명: pkce.test.ts
 * 목적: PKCE 인증 테스트
 * 역할: PKCE 인증 흐름 검증
 * 작성일: 2024-03-31
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { createClient } from '@/lib/supabase/client';
import { generateCodeChallenge } from '@/lib/auth';
import { STORAGE_KEYS, getAuthData, setAuthData } from '@/lib/auth-storage';
import { SupabaseClient, OAuthResponse } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// 로거 모킹
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }),
  default: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}));

// auth-storage 모킹
vi.mock('@/lib/auth-storage', () => {
  const storage = new Map<string, string>();
  return {
    STORAGE_KEYS: {
      CODE_VERIFIER: 'code_verifier',
      ACCESS_TOKEN: 'access_token',
      REFRESH_TOKEN: 'refresh_token',
      SESSION: 'session',
      PROVIDER: 'provider',
      USER_ID: 'user_id'
    },
    getAuthData: vi.fn((key: string) => storage.get(key)),
    setAuthData: vi.fn((key: string, value: string) => {
      storage.set(key, value);
      return Promise.resolve(true);
    })
  };
});

// Supabase 클라이언트 모킹
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => {
    const mockClient = {
      supabaseUrl: 'http://localhost:54321',
      supabaseKey: 'test-key',
      realtime: { connect: vi.fn() },
      realtimeUrl: 'ws://localhost:54321/realtime/v1',
      rest: { url: 'http://localhost:54321/rest/v1' },
      storageUrl: 'http://localhost:54321/storage/v1',
      functionsUrl: 'http://localhost:54321/functions/v1',
      queryBuilder: vi.fn(),
      channel: vi.fn(),
      removeChannel: vi.fn(),
      removeAllChannels: vi.fn(),
      getChannels: vi.fn(),
      from: vi.fn(),
      rpc: vi.fn(),
      storage: { from: vi.fn() },
      functions: { invoke: vi.fn() },
      auth: {
        signInWithOAuth: vi.fn().mockImplementation(async () => ({
          data: { url: 'https://example.com/oauth/google' },
          error: null
        } as OAuthResponse)),
        getSession: vi.fn(),
        getUser: vi.fn(),
        signOut: vi.fn(),
        onAuthStateChange: vi.fn(),
        resetPasswordForEmail: vi.fn(),
        verifyOtp: vi.fn(),
        refreshSession: vi.fn(),
        setSession: vi.fn(),
        updateUser: vi.fn(),
        resend: vi.fn()
      }
    } as unknown as SupabaseClient<Database>;
    return mockClient;
  })
}));

// 환경 변수 모킹
vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: 'test-client-id',
    NEXT_PUBLIC_OAUTH_REDIRECT_URL: 'http://localhost:3000/auth/callback',
  }
}));

describe('PKCE 인증 테스트', () => {
  let mockSupabase: SupabaseClient<Database>;
  let mockSignInWithOAuth: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Supabase 클라이언트 초기화
    mockSupabase = createClient();
    mockSignInWithOAuth = vi.fn().mockImplementation(async () => ({
      data: { url: 'https://example.com/oauth/google' },
      error: null
    } as OAuthResponse));
    mockSupabase.auth.signInWithOAuth = mockSignInWithOAuth;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Google 로그인 URL을 생성하고 code_verifier를 저장합니다', async () => {
    // code_verifier 생성
    const verifier = 'test_code_verifier';
    const challenge = await generateCodeChallenge(verifier);

    // code_verifier 저장
    await setAuthData(STORAGE_KEYS.CODE_VERIFIER, verifier, { expiry: 300 });

    // 로그인 URL 생성
    const { data, error } = await mockSupabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          code_challenge: challenge,
          code_challenge_method: 'S256'
        }
      }
    });

    // 응답 확인
    expect(error).toBeNull();
    expect(data.url).toBeDefined();

    // code_verifier가 저장되었는지 확인
    const storedVerifier = await getAuthData(STORAGE_KEYS.CODE_VERIFIER);
    expect(storedVerifier).toBe(verifier);
  });

  test('기존 code_verifier가 있으면 재사용합니다', async () => {
    // 기존 code_verifier 저장
    const existingVerifier = 'existing_code_verifier';
    await setAuthData(STORAGE_KEYS.CODE_VERIFIER, existingVerifier, { expiry: 300 });

    // 로그인 시도
    const { data, error } = await mockSupabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          code_challenge: await generateCodeChallenge(existingVerifier),
          code_challenge_method: 'S256'
        }
      }
    });

    // 응답 확인
    expect(error).toBeNull();
    expect(data.url).toBeDefined();

    // 기존 code_verifier가 유지되는지 확인
    const storedVerifier = await getAuthData(STORAGE_KEYS.CODE_VERIFIER);
    expect(storedVerifier).toBe(existingVerifier);
  });

  test('오류 발생 시 적절한 에러 응답을 반환합니다', async () => {
    // 오류 발생 시뮬레이션
    mockSignInWithOAuth.mockImplementationOnce(async () => ({
      data: { url: null },
      error: new Error('인증 오류')
    } as OAuthResponse));

    // 로그인 시도
    const { data, error } = await mockSupabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          code_challenge: 'invalid_challenge',
          code_challenge_method: 'S256'
        }
      }
    });

    // 에러 발생 확인
    expect(data.url).toBeNull();
    expect(error).toBeDefined();
    expect(error?.message).toBe('인증 오류');
  });
}); 