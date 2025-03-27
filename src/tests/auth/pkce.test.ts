/**
 * 파일명: pkce.test.ts
 * 목적: PKCE 인증 구현 테스트
 * 역할: 코드 검증기 및 코드 챌린지 생성/검증 기능 테스트
 * 작성일: 2024-03-26
 */

import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { mockClientEnvironment } from '../mocks/env-mock';
import { mockCrypto } from '../mocks/storage-mock';

// 테스트 대상 모듈을 모킹하기 전에 원본 참조 저장
const originalModule = vi.importActual('../../lib/auth');

// 테스트 환경 설정
let clientEnvironment: { restore: () => void };
let crypto: ReturnType<typeof mockCrypto>;

// auth 모듈 모킹
vi.mock('../../lib/auth', async () => {
  const actual = await vi.importActual('../../lib/auth');
  return {
    ...actual as object,
    // 필요한 함수만 오버라이드
  };
});

describe('PKCE 인증 구현 테스트', () => {
  beforeEach(() => {
    // 테스트 환경 초기화
    vi.resetModules();
    
    // 클라이언트 환경 모킹
    clientEnvironment = mockClientEnvironment();
    
    // 암호화 함수 모킹
    crypto = mockCrypto();
    Object.defineProperty(global, 'crypto', {
      value: crypto,
      writable: true
    });
  });
  
  afterEach(() => {
    // 테스트 환경 정리
    clientEnvironment.restore();
    vi.clearAllMocks();
  });
  
  // 모듈 import는 환경 설정 후에 수행
  const importAuth = async () => {
    return await import('../../lib/auth');
  };
  
  test('generateCodeVerifier가 올바른 길이와 형식의 코드를 생성하는지 검증', async () => {
    // 모듈 가져오기
    const { generateCodeVerifier } = await importAuth();
    
    // 예측 가능한 랜덤 값을 위한 모킹
    crypto.getRandomValues.mockImplementation((buffer: Uint8Array) => {
      // 0-255 사이의 예측 가능한 값으로 채우기
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = i % 256;
      }
      return buffer;
    });
    
    // 함수 실행
    const codeVerifier = generateCodeVerifier();
    
    // 결과 검증
    expect(codeVerifier).toBeDefined();
    expect(typeof codeVerifier).toBe('string');
    
    // RFC 7636 표준 준수 검증
    // 코드 검증기 길이는 43-128 문자 사이어야 함
    expect(codeVerifier.length).toBeGreaterThanOrEqual(43);
    expect(codeVerifier.length).toBeLessThanOrEqual(128);
    
    // 코드 검증기는 A-Z, a-z, 0-9, -, ., _, ~ 문자만 포함해야 함
    expect(codeVerifier).toMatch(/^[A-Za-z0-9\-._~]+$/);
    
    // crypto.getRandomValues가 호출되었는지 확인
    expect(crypto.getRandomValues).toHaveBeenCalled();
  });
  
  test('generateCodeChallenge가 코드 검증기에 기반한 SHA-256 해시를 생성하는지 검증', async () => {
    // 모듈 가져오기
    const { generateCodeChallenge } = await importAuth();
    
    // 테스트 데이터
    const codeVerifier = 'test-code-verifier';
    
    // SHA-256 해시 함수 모킹
    crypto.subtle.digest.mockImplementation(async () => {
      // 테스트용 고정 해시 값
      const buffer = new Uint8Array(32);
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = i;
      }
      return buffer.buffer;
    });
    
    // 함수 실행
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // 결과 검증
    expect(codeChallenge).toBeDefined();
    expect(typeof codeChallenge).toBe('string');
    
    // RFC 7636 표준 준수 검증
    // 코드 챌린지는 URL 안전 Base64로 인코딩되어야 함
    expect(codeChallenge).toMatch(/^[A-Za-z0-9\-_]+$/);
    
    // 의존성 함수 호출 확인
    expect(crypto.subtle.digest).toHaveBeenCalledWith('SHA-256', expect.any(ArrayBuffer));
  });
  
  test('코드 검증기와 코드 챌린지 쌍이 올바르게 생성되는지 검증', async () => {
    // 모듈 가져오기
    const { generateCodeVerifier, generateCodeChallenge } = await importAuth();
    
    // 예측 가능한 랜덤 값 및 해시 결과를 위한 모킹
    crypto.getRandomValues.mockImplementation((buffer: Uint8Array) => {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = i % 256;
      }
      return buffer;
    });
    
    crypto.subtle.digest.mockImplementation(async (_, data) => {
      // 입력값에 따른 고정 해시
      const buffer = new Uint8Array(32);
      const view = new DataView(data);
      
      // 간단한 해시 시뮬레이션
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = view.getUint8(i % view.byteLength);
      }
      
      return buffer.buffer;
    });
    
    // 함수 실행 및 검증
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // 동일한 코드 검증기로 두 번 호출하면 같은 코드 챌린지가 생성되어야 함
    const secondCodeChallenge = await generateCodeChallenge(codeVerifier);
    expect(secondCodeChallenge).toBe(codeChallenge);
    
    // 다른 코드 검증기로 호출하면 다른 코드 챌린지가 생성되어야 함
    const secondCodeVerifier = generateCodeVerifier();
    const thirdCodeChallenge = await generateCodeChallenge(secondCodeVerifier);
    expect(thirdCodeChallenge).not.toBe(codeChallenge);
  });
  
  test('구글 OAuth 로그인 함수가 코드 검증기를 생성하고 로컬 스토리지에 저장하는지 검증', async () => {
    // 모듈 가져오기
    const { googleLogin } = await importAuth();
    const authStorage = await import('../../lib/auth-storage');
    
    // 스파이 설정
    const setAuthDataSpy = vi.spyOn(authStorage, 'setAuthData');
    const generateCodeVerifierSpy = vi.spyOn(await vi.importActual('../../lib/auth'), 'generateCodeVerifier');
    const generateCodeChallengeSpy = vi.spyOn(await vi.importActual('../../lib/auth'), 'generateCodeChallenge');
    
    // window.location.href 모킹
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });
    
    // 함수 실행
    await googleLogin();
    
    // 결과 검증
    expect(generateCodeVerifierSpy).toHaveBeenCalled();
    expect(generateCodeChallengeSpy).toHaveBeenCalled();
    expect(setAuthDataSpy).toHaveBeenCalledWith(
      expect.stringContaining('CODE_VERIFIER'),
      expect.any(String)
    );
    
    // URL에 code_challenge와 code_challenge_method가 포함되어 있는지 확인
    expect(window.location.href).toContain('code_challenge=');
    expect(window.location.href).toContain('code_challenge_method=S256');
  });
  
  test('세션 교환 함수가 저장된 코드 검증기를 사용하여 요청하는지 검증', async () => {
    // 이 테스트는 복잡한 세션 교환 프로세스를 검증하므로 
    // 필요한 함수와 서비스를 모두 모킹합니다.
    
    // 모듈 가져오기
    const { exchangeCodeForSession } = await importAuth();
    const authStorage = await import('../../lib/auth-storage');
    
    // 테스트 데이터
    const code = 'test-authorization-code';
    const codeVerifier = 'test-code-verifier';
    
    // 스파이 설정
    const getAuthDataSpy = vi.spyOn(authStorage, 'getAuthData').mockReturnValue(codeVerifier);
    const removeAuthDataSpy = vi.spyOn(authStorage, 'removeAuthData');
    
    // fetch 함수 모킹
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        access_token: 'test-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'test-refresh-token',
        id_token: 'test-id-token'
      })
    });
    
    // 함수 실행
    await exchangeCodeForSession(code);
    
    // 결과 검증
    expect(getAuthDataSpy).toHaveBeenCalledWith(expect.stringContaining('CODE_VERIFIER'));
    expect(removeAuthDataSpy).toHaveBeenCalledWith(expect.stringContaining('CODE_VERIFIER'));
    
    // fetch 호출이 code_verifier 파라미터를 포함하는지 확인
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining(`code_verifier=${codeVerifier}`)
      })
    );
  });
}); 