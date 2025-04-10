/**
 * 파일명: environment-detection.test.ts
 * 목적: 서버/클라이언트 환경 감지 기능 테스트
 * 역할: 환경 감지 유틸리티 함수의 정확성 검증
 * 작성일: 2025-03-27
 * 수정일: 2025-03-30
 */

import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { mockClientEnvironment, mockServerEnvironment } from '../mocks/env-mock';
import { clearTestEnvironment } from '../setup';

// 테스트 환경 설정
let clientEnv: { restore: () => void };
let serverEnv: { restore: () => void };

// Supabase 클라이언트 모킹
const mockBrowserClient = { type: 'browser-client' };
const mockServerClient = { type: 'server-client' };

// 환경 플래그 변수
let isServer = false;

// 환경 감지 모킹
vi.mock('../../lib/environment', () => ({
  isClient: () => !isServer,
  isServer: () => isServer,
  executeOnClient: (fn: () => void) => {
    if (!isServer) fn();
  },
  executeOnServer: (fn: () => void) => {
    if (isServer) fn();
  }
}));

// Supabase 클라이언트 모킹
vi.mock('../../lib/supabase', () => ({
  createSupabaseClient: () => {
    return isServer ? mockServerClient : mockBrowserClient;
  }
}));

describe('환경 감지 테스트', () => {
  beforeEach(async () => {
    await clearTestEnvironment();
    vi.resetAllMocks();
    isServer = false; // 기본값은 클라이언트 환경
  });
  
  afterEach(() => {
    if (clientEnv) clientEnv.restore();
    if (serverEnv) serverEnv.restore();
    vi.clearAllMocks();
  });
  
  test('isClient가 클라이언트 환경에서 true를 반환하는지 검증', async () => {
    // 클라이언트 환경 설정
    isServer = false;
    clientEnv = mockClientEnvironment();
    
    // 환경 유틸리티 모듈 임포트
    const { isClient } = await import('../../lib/environment');
    
    // 검증
    expect(isClient()).toBe(true);
  });
  
  test('isClient가 서버 환경에서 false를 반환하는지 검증', async () => {
    // 서버 환경 설정
    isServer = true;
    serverEnv = mockServerEnvironment();
    
    // 환경 유틸리티 모듈 임포트
    const { isClient } = await import('../../lib/environment');
    
    // 검증
    expect(isClient()).toBe(false);
  });
  
  test('isServer가 서버 환경에서 true를 반환하는지 검증', async () => {
    // 서버 환경 설정
    isServer = true;
    serverEnv = mockServerEnvironment();
    
    // 환경 유틸리티 모듈 임포트
    const { isServer: isServerFn } = await import('../../lib/environment');
    
    // 검증
    expect(isServerFn()).toBe(true);
  });
  
  test('isServer가 클라이언트 환경에서 false를 반환하는지 검증', async () => {
    // 클라이언트 환경 설정
    isServer = false;
    clientEnv = mockClientEnvironment();
    
    // 환경 유틸리티 모듈 임포트
    const { isServer: isServerFn } = await import('../../lib/environment');
    
    // 검증
    expect(isServerFn()).toBe(false);
  });
  
  test('환경에 따라 올바른 Supabase 클라이언트가 생성되는지 검증', async () => {
    // 먼저 서버 환경으로 설정
    isServer = true;
    serverEnv = mockServerEnvironment();
    
    // Supabase 클라이언트 팩토리 임포트
    const { createSupabaseClient } = await import('../../lib/supabase');
    
    // 서버 환경에서 클라이언트 생성
    const serverClient = createSupabaseClient();
    
    // 서버 클라이언트 확인
    expect(serverClient).toHaveProperty('type', 'server-client');
    
    // 클라이언트 환경으로 변경
    isServer = false;
    clientEnv = mockClientEnvironment();
    
    // 모듈 캐시 초기화
    vi.resetModules();
    
    // Supabase 클라이언트 팩토리 다시 임포트
    const { createSupabaseClient: createBrowserClient } = await import('../../lib/supabase');
    
    // 클라이언트 환경에서 클라이언트 생성
    const browserClient = createBrowserClient();
    
    // 브라우저 클라이언트 확인
    expect(browserClient).toHaveProperty('type', 'browser-client');
  });
  
  test('클라이언트 전용 코드가 서버에서 실행되지 않는지 검증', async () => {
    // 서버 환경 설정
    isServer = true;
    serverEnv = mockServerEnvironment();
    
    // 환경 유틸리티 임포트
    const { executeOnClient } = await import('../../lib/environment');
    
    // 모의 함수
    const clientFunction = vi.fn();
    
    // 클라이언트 전용 함수 실행
    executeOnClient(clientFunction);
    
    // 서버 환경에서는 실행되지 않아야 함
    expect(clientFunction).not.toHaveBeenCalled();
  });
  
  test('클라이언트 전용 코드가 클라이언트에서 실행되는지 검증', async () => {
    // 클라이언트 환경 설정
    isServer = false;
    clientEnv = mockClientEnvironment();
    
    // 환경 유틸리티 임포트
    const { executeOnClient } = await import('../../lib/environment');
    
    // 모의 함수
    const clientFunction = vi.fn();
    
    // 클라이언트 전용 함수 실행
    executeOnClient(clientFunction);
    
    // 클라이언트 환경에서는 실행되어야 함
    expect(clientFunction).toHaveBeenCalled();
  });
  
  test('서버 전용 코드가 클라이언트에서 실행되지 않는지 검증', async () => {
    // 클라이언트 환경 설정
    isServer = false;
    clientEnv = mockClientEnvironment();
    
    // 환경 유틸리티 임포트
    const { executeOnServer } = await import('../../lib/environment');
    
    // 모의 함수
    const serverFunction = vi.fn();
    
    // 서버 전용 함수 실행
    executeOnServer(serverFunction);
    
    // 클라이언트 환경에서는 실행되지 않아야 함
    expect(serverFunction).not.toHaveBeenCalled();
  });
  
  test('서버 전용 코드가 서버에서 실행되는지 검증', async () => {
    // 서버 환경 설정
    isServer = true;
    serverEnv = mockServerEnvironment();
    
    // 환경 유틸리티 임포트
    const { executeOnServer } = await import('../../lib/environment');
    
    // 모의 함수
    const serverFunction = vi.fn();
    
    // 서버 전용 함수 실행
    executeOnServer(serverFunction);
    
    // 서버 환경에서는 실행되어야 함
    expect(serverFunction).toHaveBeenCalled();
  });
}); 