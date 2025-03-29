/**
 * 파일명: auth-service.ts
 * 목적: 인증 관련 비즈니스 로직 분리
 * 역할: OAuth 콜백 처리와 인증 데이터 관리 서비스 제공
 * 작성일: 2024-10-12
 */

import { getAuthClient } from '@/lib/auth';
import { getAuthDataAsync, setAuthData, getAuthData, STORAGE_KEYS } from '@/lib/auth-storage';
import createLogger from '@/lib/logger';

// 로거 생성
const logger = createLogger('AuthService');

/**
 * 인증 처리 결과 인터페이스
 */
export interface AuthResult {
  status: 'success' | 'error' | 'loading';
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  provider?: string;
  error?: string;
  errorDescription?: string;
}

/**
 * AuthService: 인증 관련 비즈니스 로직 처리
 */
export class AuthService {
  /**
   * OAuth 콜백 URL에서 코드 파라미터 처리
   * @param url 현재 URL
   * @returns 인증 처리 결과
   */
  static async handleCallback(url: URL): Promise<AuthResult> {
    try {
      logger.info('콜백 URL 처리 시작', { pathname: url.pathname });
      
      // 에러 파라미터 확인
      const errorParam = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');
      
      if (errorParam) {
        logger.error('에러 파라미터 발견', { error: errorParam, description: errorDescription });
        return {
          status: 'error',
          error: errorParam,
          errorDescription: errorDescription || undefined
        };
      }
      
      // 인증 코드 확인
      const code = url.searchParams.get('code');
      if (!code) {
        logger.error('인증 코드가 없음');
        return {
          status: 'error',
          error: 'no_code',
          errorDescription: '인증 코드가 없습니다'
        };
      }
      
      logger.info('인증 코드 확인됨', { codeLength: code.length });
      
      // 코드 검증기 복구
      const codeVerifier = await getAuthDataAsync(STORAGE_KEYS.CODE_VERIFIER);
      
      if (!codeVerifier) {
        logger.warn('코드 검증기를 찾을 수 없음');
      } else {
        logger.info('코드 검증기 복구됨', { verifierLength: codeVerifier.length });
      }
      
      // Supabase 세션 교환
      const supabase = getAuthClient();
      logger.info('세션 교환 시작');
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error || !data.session) {
        logger.error('세션 교환 실패', { error: error?.message, status: error?.status });
        return {
          status: 'error',
          error: error?.message || 'session_exchange_failed',
          errorDescription: '세션 교환 실패'
        };
      }
      
      // 세션 정보 추출
      const { access_token, refresh_token, user } = data.session;
      
      logger.info('세션 교환 성공', { 
        accessTokenLength: access_token?.length,
        hasRefreshToken: !!refresh_token,
        userId: user?.id
      });
      
      // 성공 결과 반환
      return {
        status: 'success',
        accessToken: access_token,
        refreshToken: refresh_token,
        userId: user?.id,
        provider: user?.app_metadata?.provider
      };
    } catch (error) {
      logger.error('예기치 않은 오류 발생', error);
      return {
        status: 'error',
        error: 'unexpected_error',
        errorDescription: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }
  
  /**
   * 인증 데이터 저장
   * @param result 인증 결과
   * @returns 저장 성공 여부
   */
  static saveAuthData(result: AuthResult): boolean {
    if (result.status !== 'success') {
      logger.warn('실패한 인증 결과는 저장하지 않음', { status: result.status });
      return false;
    }
    
    try {
      logger.info('인증 데이터 저장 시작');
      
      // 토큰 저장
      if (result.accessToken) {
        setAuthData(STORAGE_KEYS.ACCESS_TOKEN, result.accessToken, { expiry: 60 * 60 * 24 });
        logger.debug('액세스 토큰 저장됨');
      }
      
      if (result.refreshToken) {
        setAuthData(STORAGE_KEYS.REFRESH_TOKEN, result.refreshToken, { expiry: 60 * 60 * 24 * 14 });
        logger.debug('리프레시 토큰 저장됨');
      }
      
      // 사용자 정보 저장
      if (result.userId) {
        setAuthData(STORAGE_KEYS.USER_ID, result.userId, { expiry: 60 * 60 * 24 });
        logger.debug('사용자 ID 저장됨');
      }
      
      if (result.provider) {
        setAuthData(STORAGE_KEYS.PROVIDER, result.provider, { expiry: 60 * 60 * 24 });
        logger.debug('인증 제공자 정보 저장됨');
      }
      
      logger.info('인증 데이터 저장 완료');
      return true;
    } catch (error) {
      logger.error('인증 데이터 저장 실패', error);
      return false;
    }
  }

  /**
   * 인증 데이터 확인
   * @returns 현재 저장된 인증 데이터
   */
  static checkAuthData(): {
    isAuthenticated: boolean;
    userId?: string;
    provider?: string;
  } {
    try {
      const accessToken = getAuthData(STORAGE_KEYS.ACCESS_TOKEN);
      const userId = getAuthData(STORAGE_KEYS.USER_ID);
      const provider = getAuthData(STORAGE_KEYS.PROVIDER);
      
      return {
        isAuthenticated: !!accessToken,
        userId: userId || undefined,
        provider: provider || undefined
      };
    } catch (error) {
      logger.error('인증 데이터 확인 실패', error);
      return { isAuthenticated: false };
    }
  }
} 