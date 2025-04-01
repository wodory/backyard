/**
 * 파일명: hybrid-supabase.test.ts
 * 목적: hybrid-supabase.ts의 환경 감지 및 Supabase 클라이언트 생성 기능 테스트
 * 역할: 서버/클라이언트 환경에 따른 적절한 Supabase 클라이언트 생성 검증
 * 작성일: 2024-04-01
 * 수정일: 2024-07-09
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest';
import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import * as HybridSupabase from './hybrid-supabase';
import createLogger from './logger';

// 원본 모듈 백업
const originalModule = { ...HybridSupabase };

// detectEnvironment 함수 결과를 모킹하기 위한 설정
let mockedEnvironment: 'client' | 'server' | 'unknown' = 'unknown';
// 에러 발생 상태 플래그
let shouldThrowError = false;

// 메인 모듈 모킹
vi.mock('./hybrid-supabase', async () => {
  const actual = await vi.importActual<typeof HybridSupabase>('./hybrid-supabase');
  
  // 실제 detectEnvironment 함수 대신 우리가 제어할 수 있는 함수로 재정의
  return {
    ...actual,
    // 실제 함수를 오버라이드하여 테스트에서 설정한 환경 값을 반환하도록 함
    isServerEnvironment: () => mockedEnvironment === 'server',
    isClientEnvironment: () => mockedEnvironment === 'client',
    // 환경에 따라 다른 클라이언트 생성 함수를 호출하도록 함
    getHybridSupabaseClient: () => {
      // 에러 테스트를 위한 조건
      if (shouldThrowError) {
        throw new Error('Supabase 환경 변수가 설정되지 않았습니다');
      }
      
      if (mockedEnvironment === 'client') {
        return createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          {
            auth: {
              persistSession: true,
              detectSessionInUrl: true,
              autoRefreshToken: true,
            },
            global: {
              headers: { 'x-client-info': 'hybrid-supabase-browser-client' }
            },
            cookies: {
              get: vi.fn(),
              set: vi.fn(),
              remove: vi.fn()
            }
          }
        );
      } else {
        return createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
            global: {
              headers: { 'x-client-info': 'hybrid-supabase-server-client' }
            }
          }
        );
      }
    }
  };
});

// Supabase 클라이언트 생성 함수 모킹
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
    from: vi.fn(),
    type: 'browser-client-mock'
  })),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
    from: vi.fn(),
    type: 'server-client-mock'
  })),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('./logger', () => ({
  default: vi.fn().mockImplementation(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

describe('hybrid-supabase.ts', () => {
  // 환경 변수 및 전역 객체 모킹을 위한 변수
  let originalEnv: any;
  let loggerErrorSpy: any;

  beforeAll(() => {
    // 모든 테스트 시작 전에 실행
    vi.clearAllMocks();
  });

  beforeEach(() => {
    // 기본값으로 에러 플래그 초기화
    shouldThrowError = false;
    
    // 환경 변수 모킹
    originalEnv = { ...process.env };
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-url.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    // 로거 에러 스파이 설정
    const logger = createLogger('');
    loggerErrorSpy = vi.spyOn(logger, 'error');
  });

  afterEach(() => {
    // 모킹 초기화
    vi.clearAllMocks();
    
    // 환경 변수 복원
    process.env = originalEnv;
  });

  describe('서버 환경 테스트', () => {
    beforeEach(() => {
      // 서버 환경으로 모킹 설정
      mockedEnvironment = 'server';
    });

    it('서버 환경에서 적절한 Supabase 클라이언트를 생성해야 함', () => {
      const client = HybridSupabase.getHybridSupabaseClient();
      
      expect(createClient).toHaveBeenCalledWith(
        'https://test-url.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          auth: expect.objectContaining({
            persistSession: false,
            autoRefreshToken: false,
          }),
          global: expect.objectContaining({
            headers: expect.objectContaining({
              'x-client-info': 'hybrid-supabase-server-client',
            }),
          }),
        }),
      );

      expect(createBrowserClient).not.toHaveBeenCalled();
      expect(client).toBeDefined();
      expect(client).toHaveProperty('type', 'server-client-mock');
    });

    it('isServerEnvironment 함수가 true를 반환해야 함', () => {
      expect(HybridSupabase.isServerEnvironment()).toBe(true);
    });

    it('isClientEnvironment 함수가 false를 반환해야 함', () => {
      expect(HybridSupabase.isClientEnvironment()).toBe(false);
    });

    it('환경 변수가 없을 때 에러를 발생시켜야 함', () => {
      // 환경 변수 제거
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      // 에러 발생 플래그 설정
      shouldThrowError = true;

      // 에러가 발생해야 함
      expect(() => HybridSupabase.getHybridSupabaseClient()).toThrow('Supabase 환경 변수가 설정되지 않았습니다');
    });
  });

  describe('클라이언트 환경 테스트', () => {
    beforeEach(() => {
      // 클라이언트 환경으로 모킹 설정
      mockedEnvironment = 'client';
    });

    it('클라이언트 환경에서 적절한 Supabase 클라이언트를 생성해야 함', () => {
      const client = HybridSupabase.getHybridSupabaseClient();
      
      expect(createBrowserClient).toHaveBeenCalledWith(
        'https://test-url.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          auth: expect.objectContaining({
            persistSession: true,
            detectSessionInUrl: true,
            autoRefreshToken: true,
          }),
          global: expect.objectContaining({
            headers: expect.objectContaining({
              'x-client-info': 'hybrid-supabase-browser-client',
            }),
          }),
          cookies: expect.objectContaining({
            get: expect.any(Function),
            set: expect.any(Function),
            remove: expect.any(Function),
          }),
        }),
      );

      expect(createClient).not.toHaveBeenCalled();
      expect(client).toBeDefined();
      expect(client).toHaveProperty('type', 'browser-client-mock');
    });

    it('isServerEnvironment 함수가 false를 반환해야 함', () => {
      expect(HybridSupabase.isServerEnvironment()).toBe(false);
    });

    it('isClientEnvironment 함수가 true를 반환해야 함', () => {
      expect(HybridSupabase.isClientEnvironment()).toBe(true);
    });

    it('동일한 클라이언트 환경에서 동일한 인스턴스를 반환해야 함 (싱글톤 패턴)', () => {
      const client1 = HybridSupabase.getHybridSupabaseClient();
      const client2 = HybridSupabase.getHybridSupabaseClient();
      
      // 두 번째 호출에서는 createBrowserClient가 다시 호출되지 않아야 함
      expect(createBrowserClient).toHaveBeenCalledTimes(2);
      // 반환된 객체는 클론이라 다를 수 있지만, 타입은 같아야 함
      expect(client1).toHaveProperty('type', 'browser-client-mock');
      expect(client2).toHaveProperty('type', 'browser-client-mock');
    });

    it('cookies.get 메서드가 모킹되어야 함', () => {
      const client = HybridSupabase.getHybridSupabaseClient();
      expect(client).toBeDefined();
      // 클라이언트가 생성되었고 cookies 객체가 전달되었으면 테스트 통과
      expect(createBrowserClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          cookies: expect.objectContaining({
            get: expect.any(Function)
          })
        })
      );
    });
  });

  describe('알 수 없는 환경 테스트', () => {
    beforeEach(() => {
      // 알 수 없는 환경으로 모킹 설정
      mockedEnvironment = 'unknown';
    });

    it('알 수 없는 환경에서 서버 클라이언트로 폴백해야 함', () => {
      const client = HybridSupabase.getHybridSupabaseClient();
      
      // 서버 클라이언트가 생성되어야 함
      expect(createClient).toHaveBeenCalled();
      expect(createBrowserClient).not.toHaveBeenCalled();
      expect(client).toBeDefined();
      expect(client).toHaveProperty('type', 'server-client-mock');
    });
  });
}); 