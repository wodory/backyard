/**
 * 파일명: environment-detection.test.ts
 * 목적: 서버/클라이언트 환경 감지 기능 테스트
 * 역할: 환경 감지 유틸리티 함수의 정확성 검증
 * 작성일: 2024-03-26
 */

import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals';
import { mockClientEnvironment, mockServerEnvironment, mockHybridEnvironment } from '../mocks/env-mock';

// 테스트 환경 설정
let clientEnv: { restore: () => void };
let serverEnv: { restore: () => void };
let hybridEnv: ReturnType<typeof mockHybridEnvironment>;

describe('환경 감지 테스트', () => {
  afterEach(() => {
    // 모든 환경 설정 정리
    if (clientEnv) clientEnv.restore();
    if (serverEnv) serverEnv.restore();
    
    // 모듈 캐시 초기화
    jest.resetModules();
  });
  
  test('isClient가 클라이언트 환경에서 true를 반환하는지 검증', async () => {
    // 클라이언트 환경 설정
    clientEnv = mockClientEnvironment();
    
    // 환경 유틸리티 모듈 임포트
    const { isClient } = await import('../../lib/environment');
    
    // 검증
    expect(isClient()).toBe(true);
  });
  
  test('isClient가 서버 환경에서 false를 반환하는지 검증', async () => {
    // 서버 환경 설정
    serverEnv = mockServerEnvironment();
    
    // 환경 유틸리티 모듈 임포트
    const { isClient } = await import('../../lib/environment');
    
    // 검증
    expect(isClient()).toBe(false);
  });
  
  test('isServer가 서버 환경에서 true를 반환하는지 검증', async () => {
    // 서버 환경 설정
    serverEnv = mockServerEnvironment();
    
    // 환경 유틸리티 모듈 임포트
    const { isServer } = await import('../../lib/environment');
    
    // 검증
    expect(isServer()).toBe(true);
  });
  
  test('isServer가 클라이언트 환경에서 false를 반환하는지 검증', async () => {
    // 클라이언트 환경 설정
    clientEnv = mockClientEnvironment();
    
    // 환경 유틸리티 모듈 임포트
    const { isServer } = await import('../../lib/environment');
    
    // 검증
    expect(isServer()).toBe(false);
  });
  
  test('환경에 따라 올바른 Supabase 클라이언트가 생성되는지 검증', async () => {
    // 하이브리드 환경 모킹 (환경 변경 가능)
    hybridEnv = mockHybridEnvironment();
    
    // 먼저 서버 환경으로 설정
    hybridEnv.setServerEnvironment();
    
    // Supabase 클라이언트 모듈 모킹
    jest.mock('@supabase/supabase-js', () => {
      return {
        createClient: jest.fn().mockReturnValue({ type: 'browser-client' }),
        createServerClient: jest.fn().mockReturnValue({ type: 'server-client' })
      };
    });
    
    // Supabase 클라이언트 팩토리 임포트
    const { createSupabaseClient } = await import('../../lib/supabase');
    
    // 서버 환경에서 클라이언트 생성
    const serverClient = createSupabaseClient();
    
    // 서버 클라이언트 확인
    expect(serverClient).toHaveProperty('type', 'server-client');
    
    // 클라이언트 환경으로 변경
    hybridEnv.setClientEnvironment();
    
    // 모듈 캐시 초기화
    jest.resetModules();
    
    // Supabase 클라이언트 팩토리 다시 임포트
    const { createSupabaseClient: createClientSupabaseClient } = await import('../../lib/supabase');
    
    // 클라이언트 환경에서 클라이언트 생성
    const browserClient = createClientSupabaseClient();
    
    // 브라우저 클라이언트 확인
    expect(browserClient).toHaveProperty('type', 'browser-client');
  });
  
  test('클라이언트 전용 코드가 서버에서 실행되지 않는지 검증', async () => {
    // 서버 환경 설정
    serverEnv = mockServerEnvironment();
    
    // 환경 유틸리티 임포트
    const { executeOnClient } = await import('../../lib/environment');
    
    // 모의 함수
    const clientFunction = jest.fn();
    
    // 클라이언트 전용 함수 실행
    executeOnClient(clientFunction);
    
    // 서버 환경에서는 실행되지 않아야 함
    expect(clientFunction).not.toHaveBeenCalled();
  });
  
  test('클라이언트 전용 코드가 클라이언트에서 실행되는지 검증', async () => {
    // 클라이언트 환경 설정
    clientEnv = mockClientEnvironment();
    
    // 환경 유틸리티 임포트
    const { executeOnClient } = await import('../../lib/environment');
    
    // 모의 함수
    const clientFunction = jest.fn();
    
    // 클라이언트 전용 함수 실행
    executeOnClient(clientFunction);
    
    // 클라이언트 환경에서는 실행되어야 함
    expect(clientFunction).toHaveBeenCalled();
  });
  
  test('서버 전용 코드가 클라이언트에서 실행되지 않는지 검증', async () => {
    // 클라이언트 환경 설정
    clientEnv = mockClientEnvironment();
    
    // 환경 유틸리티 임포트
    const { executeOnServer } = await import('../../lib/environment');
    
    // 모의 함수
    const serverFunction = jest.fn();
    
    // 서버 전용 함수 실행
    executeOnServer(serverFunction);
    
    // 클라이언트 환경에서는 실행되지 않아야 함
    expect(serverFunction).not.toHaveBeenCalled();
  });
  
  test('서버 전용 코드가 서버에서 실행되는지 검증', async () => {
    // 서버 환경 설정
    serverEnv = mockServerEnvironment();
    
    // 환경 유틸리티 임포트
    const { executeOnServer } = await import('../../lib/environment');
    
    // 모의 함수
    const serverFunction = jest.fn();
    
    // 서버 전용 함수 실행
    executeOnServer(serverFunction);
    
    // 서버 환경에서는 실행되어야 함
    expect(serverFunction).toHaveBeenCalled();
  });
}); 