/**
 * 파일명: auth-mock.ts
 * 목적: 인증 테스트를 위한 모킹 함수 제공
 * 역할: 테스트에 필요한 인증 관련 모킹 데이터 및 유틸리티 제공
 * 작성일: 2025-03-27
 */

/**
 * generateMockCodeVerifier: PKCE 코드 검증기를 모방하는 문자열 생성
 * @returns {string} 모의 코드 검증기 문자열
 */
export function generateMockCodeVerifier(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  
  // 96자 길이의 무작위 문자열 생성
  for (let i = 0; i < 96; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * generateMockAuthCode: OAuth 인증 코드를 모방하는 문자열 생성
 * @returns {string} 모의 인증 코드 문자열
 */
export function generateMockAuthCode(): string {
  return 'valid_code'; // 테스트에서 유효한 코드로 인식되는 특정 문자열
}

/**
 * mockSupabaseSession: Supabase 세션 객체 모킹
 * @param {string} userId 사용자 ID
 * @param {string} provider 인증 제공자 (기본값: 'google')
 * @returns {Object} 모의 세션 객체
 */
export function mockSupabaseSession(
  userId: string = 'test_user_id', 
  provider: string = 'google'
): {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    app_metadata: {
      provider: string;
    };
  };
} {
  return {
    access_token: 'test_access_token',
    refresh_token: 'test_refresh_token',
    user: {
      id: userId,
      app_metadata: {
        provider
      }
    }
  };
}

/**
 * mockAuthError: 인증 오류 객체 모킹
 * @param {string} message 오류 메시지
 * @param {number} status HTTP 상태 코드
 * @returns {Object} 모의 오류 객체
 */
export function mockAuthError(
  message: string = 'Auth error',
  status: number = 400
): {
  message: string;
  status: number;
} {
  return {
    message,
    status
  };
} 