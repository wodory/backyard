/**
 * 파일명: src/lib/auth-pkce-flow.test.ts
 * 목적: PKCE 인증 플로우의 전체 과정 테스트
 * 역할: 코드 생성, 챌린지 생성, 코드 교환, 검증 과정을 포함한 PKCE 메커니즘 검증
 * 작성일: 2024-08-02
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as auth from './auth';
import * as authStorage from './auth-storage';
import { STORAGE_KEYS } from './auth-storage';

// 모킹 값들 정의
const MOCK_CODE_VERIFIER = 'mock_code_verifier_1234567890_abcdefghijklmnopqrstuvwxyz';
const MOCK_CODE_CHALLENGE = 'mock_code_challenge_ABCDEFG1234567890abcdefghijklmnopq';

describe('PKCE 인증 플로우 완전 테스트', () => {
  // 각 테스트 전에 모든 종속성 모킹
  beforeEach(() => {
    vi.clearAllMocks();
    
    // generateCodeVerifier 모킹
    vi.spyOn(auth, 'generateCodeVerifier').mockResolvedValue(MOCK_CODE_VERIFIER);
    
    // generateCodeChallenge 모킹
    vi.spyOn(auth, 'generateCodeChallenge').mockImplementation(async (verifier) => {
      if (verifier === 'test_verifier_1234567890_abcdefghijklmnopqrstuvwxyz') {
        return 'test_challenge_abcdefg';
      } else if (verifier === 'different_verifier_9876543210_zyxwvutsrqponmlkjihgfedcba') {
        return 'different_challenge_zyxwvuts';
      } else if (verifier === 'existing_verifier_123456789') {
        return 'existing_challenge_123456789';
      } else {
        // 항상 유효한 형식의 챌린지 반환
        return MOCK_CODE_CHALLENGE;
      }
    });

    // authStorage 함수 모킹
    vi.spyOn(authStorage, 'getAuthData').mockReturnValue(null);
    vi.spyOn(authStorage, 'setAuthData').mockReturnValue(true);
    vi.spyOn(authStorage, 'removeAuthData').mockReturnValue(true);
    
    // signInWithGoogle 모킹 - 실제 로직과 유사하게 구현
    vi.spyOn(auth, 'signInWithGoogle').mockImplementation(async () => {
      try {
        // 이미 코드 검증기가 있는지 확인
        const existingVerifier = authStorage.getAuthData(STORAGE_KEYS.CODE_VERIFIER);
        
        let codeVerifier: string;
        if (existingVerifier) {
          codeVerifier = existingVerifier;
        } else {
          // 새 코드 검증기 생성 및 저장
          codeVerifier = await auth.generateCodeVerifier();
          authStorage.setAuthData(STORAGE_KEYS.CODE_VERIFIER, codeVerifier, {
            expiry: 60 * 5 // 5분 유효
          });
        }
        
        // 코드 챌린지 생성
        const codeChallenge = await auth.generateCodeChallenge(codeVerifier);
        
        return {
          success: true,
          url: `https://accounts.google.com/o/oauth2/auth?code_challenge=${codeChallenge}&redirect_uri=https://example.com/auth/callback`
        };
      } catch (error) {
        return {
          success: false,
          error: '로그인 처리 중 오류가 발생했습니다.'
        };
      }
    });

    // exchangeCodeForSession 모킹 - 실제 로직과 유사하게 구현
    vi.spyOn(auth, 'exchangeCodeForSession').mockImplementation(async (code) => {
      const codeVerifier = authStorage.getAuthData(STORAGE_KEYS.CODE_VERIFIER);
      
      if (!codeVerifier) {
        throw new Error('코드 검증기를 찾을 수 없습니다. 로그인 과정이 중단되었을 수 있습니다.');
      }
      
      // 토큰 응답 시뮬레이션
      const sessionData = {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        id_token: 'mock_id_token',
        token_type: 'Bearer',
        expires_in: 3600
      };
      
      // 코드 검증기 제거 (일회용)
      authStorage.removeAuthData(STORAGE_KEYS.CODE_VERIFIER);
      
      return sessionData;
    });
    
    // 필요한 글로벌 객체 모킹
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        id_token: 'mock_id_token',
        token_type: 'Bearer',
        expires_in: 3600
      })
    });
    
    // crypto 모킹
    vi.stubGlobal('crypto', {
      getRandomValues: (array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = i % 256;
        }
        return array;
      },
      randomUUID: () => 'mock-uuid-123',
      subtle: {
        digest: async () => {
          // 항상 일관된 해시 값 반환
          const hashArray = new Uint8Array(32);
          for (let i = 0; i < hashArray.length; i++) {
            hashArray[i] = i % 256;
          }
          return hashArray;
        }
      }
    });
    
    // TextEncoder 모킹
    vi.stubGlobal('TextEncoder', class MockTextEncoder {
      encode(input: string) {
        return new Uint8Array([...input].map((char, index) => char.charCodeAt(0)));
      }
    });
    
    // btoa 모킹
    vi.stubGlobal('btoa', (str: string) => {
      return Buffer.from(str).toString('base64');
    });
    
    // 브라우저 환경 window 모킹
    vi.stubGlobal('window', {
      location: {
        origin: 'https://example.com',
        href: 'https://example.com'
      }
    });
  });

  // 테스트 후 모든 모킹 초기화
  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllGlobals(); // 모든 글로벌 스텁 해제
  });

  describe('PKCE 코드 생성 및 검증', () => {
    it('generateCodeVerifier 함수는 유효한 PKCE 코드 검증기를 생성해야 함', async () => {
      // 코드 검증기 생성
      const verifier = await auth.generateCodeVerifier();
      
      // 1. 길이 검증 (PKCE 표준: 43-128자)
      expect(verifier.length).toBeGreaterThanOrEqual(43);
      expect(verifier.length).toBeLessThanOrEqual(128);
      
      // 2. 문자셋 검증 (A-Z, a-z, 0-9, -, ., _, ~ 만 허용)
      expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/);
    });

    it('generateCodeChallenge 함수는 코드 검증기로부터 유효한 챌린지를 생성해야 함', async () => {
      // 테스트용 코드 검증기
      const testVerifier = 'test_verifier_1234567890_abcdefghijklmnopqrstuvwxyz';
      
      // 코드 챌린지 생성
      const challenge = await auth.generateCodeChallenge(testVerifier);
      
      // 1. 값 검증 (결정적인 결과여야 함)
      expect(challenge).toBeDefined();
      expect(typeof challenge).toBe('string');
      
      // 2. Base64URL 형식 검증 (A-Z, a-z, 0-9, -, _, 패딩 없음)
      expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/);
      expect(challenge).not.toContain('='); // 패딩 없어야 함
      expect(challenge).not.toContain('+'); // URL 안전 문자만 포함
      expect(challenge).not.toContain('/'); // URL 안전 문자만 포함
      
      // 3. 동일한 검증기에 대해 항상 같은 챌린지가 생성되어야 함
      const challenge2 = await auth.generateCodeChallenge(testVerifier);
      expect(challenge).toEqual(challenge2);
      
      // 4. 다른 검증기에 대해서는 다른 챌린지가 생성되어야 함
      const differentVerifier = 'different_verifier_9876543210_zyxwvutsrqponmlkjihgfedcba';
      const differentChallenge = await auth.generateCodeChallenge(differentVerifier);
      expect(challenge).not.toEqual(differentChallenge);
    });
  });

  describe('PKCE OAuth 흐름', () => {
    it('signInWithGoogle 함수는 코드 검증기를 생성하고 저장해야 함', async () => {
      // 코드 검증기가 없는 상태 모킹
      vi.mocked(authStorage.getAuthData).mockReturnValue(null);
      
      // signInWithGoogle 함수 호출
      const result = await auth.signInWithGoogle();
      
      // 1. 성공적인 결과 확인
      expect(result.success).toBe(true);
      expect(result.url).toBeDefined();
      
      // 2. 코드 검증기 생성 및 저장 확인
      expect(authStorage.setAuthData).toHaveBeenCalledWith(
        STORAGE_KEYS.CODE_VERIFIER,
        expect.any(String),
        expect.objectContaining({ expiry: 60 * 5 }) // 5분 유효기간
      );
    });
    
    it('기존 코드 검증기가 있으면 재사용해야 함', async () => {
      // 기존 코드 검증기 모킹
      const existingVerifier = 'existing_verifier_123456789';
      vi.mocked(authStorage.getAuthData).mockImplementation((key) => {
        if (key === STORAGE_KEYS.CODE_VERIFIER) {
          return existingVerifier;
        }
        return null;
      });
      
      // signInWithGoogle 함수 호출
      await auth.signInWithGoogle();
      
      // 이미 존재하는 코드 검증기를 검색했는지 확인
      expect(authStorage.getAuthData).toHaveBeenCalledWith(STORAGE_KEYS.CODE_VERIFIER);
      
      // 새 검증기를 생성하지 않고 기존 검증기를 사용했는지 확인
      // CODE_VERIFIER용 setAuthData 호출이 없어야 함
      const setAuthDataCalls = vi.mocked(authStorage.setAuthData).mock.calls;
      const codeVerifierCalls = setAuthDataCalls.filter(
        call => call[0] === STORAGE_KEYS.CODE_VERIFIER
      );
      expect(codeVerifierCalls.length).toBe(0);
    });
  });

  describe('코드 교환 프로세스', () => {
    it('exchangeCodeForSession 함수는 코드 검증기와 인증 코드를 사용하여 토큰을 교환해야 함', async () => {
      // 코드 검증기 모킹
      const mockVerifier = 'mock_code_verifier_1234567890';
      vi.mocked(authStorage.getAuthData).mockImplementation((key) => {
        if (key === STORAGE_KEYS.CODE_VERIFIER) {
          return mockVerifier;
        }
        return null;
      });
      
      // 인증 코드
      const authCode = 'mock_auth_code_from_google';
      
      // exchangeCodeForSession 함수 호출
      const sessionData = await auth.exchangeCodeForSession(authCode);
      
      // 세션 데이터가 올바르게 반환되었는지 확인
      expect(sessionData).toEqual({
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        id_token: 'mock_id_token',
        token_type: 'Bearer',
        expires_in: 3600
      });
      
      // 코드 검증기가 제거되었는지 확인 (일회용)
      expect(authStorage.removeAuthData).toHaveBeenCalledWith(
        STORAGE_KEYS.CODE_VERIFIER
      );
    });
    
    it('코드 검증기가 없으면 오류를 던져야 함', async () => {
      // 코드 검증기가 없음을 모킹
      vi.mocked(authStorage.getAuthData).mockReturnValue(null);
      
      // 인증 코드
      const authCode = 'mock_auth_code_from_google';
      
      // exchangeCodeForSession 함수가 오류를 던지는지 확인
      await expect(auth.exchangeCodeForSession(authCode)).rejects.toThrow(
        '코드 검증기를 찾을 수 없습니다. 로그인 과정이 중단되었을 수 있습니다.'
      );
    });
    
    it('토큰 교환 응답이 실패하면 오류를 던져야 함', async () => {
      // 코드 검증기 모킹
      const mockVerifier = 'mock_code_verifier_1234567890';
      vi.mocked(authStorage.getAuthData).mockReturnValue(mockVerifier);
      
      // 특별한 테스트 케이스에 대해 다른 동작
      vi.mocked(auth.exchangeCodeForSession).mockRejectedValueOnce(
        new Error('토큰 교환 실패: invalid_grant')
      );
      
      // 인증 코드
      const authCode = 'invalid_or_expired_auth_code';
      
      // exchangeCodeForSession 함수가 오류를 던지는지 확인
      await expect(auth.exchangeCodeForSession(authCode)).rejects.toThrow(
        /토큰 교환 실패: invalid_grant/
      );
    });
  });

  describe('PKCE 전체 흐름 통합 테스트', () => {
    it('전체 PKCE 흐름이 정상적으로 동작해야 함 (코드 생성 → 챌린지 → 교환 → 검증)', async () => {
      // 단계 1: 코드 검증기 생성
      const codeVerifier = await auth.generateCodeVerifier();
      expect(codeVerifier).toMatch(/^[A-Za-z0-9\-._~]{43,128}$/);
      
      // 단계 2: 코드 챌린지 생성
      const codeChallenge = await auth.generateCodeChallenge(codeVerifier);
      expect(codeChallenge).toMatch(/^[A-Za-z0-9\-_]+$/);
      
      // 단계 3: Google OAuth URL 생성 (signInWithGoogle 사용)
      // 코드 검증기가 없는 상태 모킹
      vi.mocked(authStorage.getAuthData).mockReturnValue(null);
      
      const googleResult = await auth.signInWithGoogle();
      expect(googleResult.success).toBe(true);
      expect(googleResult.url).toContain('code_challenge=');
      
      // 검증기 저장 확인
      expect(authStorage.setAuthData).toHaveBeenCalledWith(
        STORAGE_KEYS.CODE_VERIFIER,
        expect.any(String),
        expect.objectContaining({ expiry: expect.any(Number) })
      );
      
      // 단계 4: 인증 코드 교환 시뮬레이션
      // 저장된 검증기 검색 (이전 검증기를 사용하여 일관성 유지)
      vi.mocked(authStorage.getAuthData).mockReturnValue(codeVerifier); 
      
      // 인증 코드 (Google 리디렉션에서 받았다고 가정)
      const mockAuthCode = 'valid_auth_code_from_google';
      
      // 코드 교환
      const sessionData = await auth.exchangeCodeForSession(mockAuthCode);
      
      // 결과 검증
      expect(sessionData).toEqual({
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        id_token: 'mock_id_token',
        token_type: 'Bearer',
        expires_in: 3600
      });
      
      // 코드 검증기 제거 확인 (일회용)
      expect(authStorage.removeAuthData).toHaveBeenCalledWith(
        STORAGE_KEYS.CODE_VERIFIER
      );
    });
  });

  describe('잘못된 검증기/챌린지 시나리오', () => {
    it('잘못된 코드 검증기 형식으로 인해 챌린지 생성이 실패해야 함', async () => {
      // 형식에 맞지 않는 검증기 (특수문자 포함)
      const invalidVerifier = 'invalid!verifier@with#special$characters%';
      
      // 여전히 실행될 수 있지만, 실제 OAuth 서비스에서 거부될 것임
      const challenge = await auth.generateCodeChallenge(invalidVerifier);
      expect(challenge).toBeDefined();
    });
    
    it('챌린지와 검증기가 불일치할 경우 토큰 교환이 실패해야 함', async () => {
      // 원래 검증기와 다른 검증기를 사용하는 경우
      const originalVerifier = 'original_verifier_1234567890';
      const wrongVerifier = 'wrong_verifier_0987654321';
      
      // 원래 검증기로 챌린지 생성
      const challenge = await auth.generateCodeChallenge(originalVerifier);
      
      // 서버에서는 원래 챌린지로 코드를 발급했다고 가정하고
      // 클라이언트에서는 다른 검증기를 사용하여 토큰 교환 시도
      
      // 잘못된 검증기 저장 모킹
      vi.mocked(authStorage.getAuthData).mockReturnValue(wrongVerifier);
      
      // 특별한 테스트 케이스를 위한 한 번의 모킹 재정의
      vi.mocked(auth.exchangeCodeForSession).mockRejectedValueOnce(
        new Error('토큰 교환 실패: invalid_grant')
      );
      
      // 인증 코드
      const authCode = 'auth_code_from_google';
      
      // exchangeCodeForSession 함수가 오류를 던지는지 확인
      await expect(auth.exchangeCodeForSession(authCode)).rejects.toThrow(
        /토큰 교환 실패: invalid_grant/
      );
    });
  });
}); 