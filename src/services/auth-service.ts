/**
 * 파일명: auth-service.ts
 * 목적: 인증 관련 비즈니스 로직 분리
 * 역할: OAuth 콜백 처리와 인증 데이터 관리 서비스 제공
 * 작성일: 2025-03-30
 * 수정일: 2025-04-09
 */

import { getAuthClient, STORAGE_KEYS } from '@/lib/auth';
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
      const codeVerifier = sessionStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);
      
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
        localStorage.setItem('access_token', result.accessToken);
        logger.debug('액세스 토큰 저장됨');
      }
      
      if (result.refreshToken) {
        localStorage.setItem('refresh_token', result.refreshToken);
        logger.debug('리프레시 토큰 저장됨');
      }
      
      // 사용자 정보 저장
      if (result.userId) {
        localStorage.setItem('user_id', result.userId);
        logger.debug('사용자 ID 저장됨');
      }
      
      if (result.provider) {
        localStorage.setItem('provider', result.provider);
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
      const accessToken = localStorage.getItem('access_token');
      const userId = localStorage.getItem('user_id');
      const provider = localStorage.getItem('provider');
      
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
  
  /**
   * 인증 결과에 따른 리디렉션 URL 생성
   * @param result 인증 결과
   * @returns 리디렉션 URL
   */
  static getRedirectUrl(result: AuthResult): string {
    if (result.status === 'success') {
      // 인증 성공 시 대시보드로 리디렉션
      return '/dashboard';
    } else {
      // 인증 실패 시 로그인 페이지로 오류 정보와 함께 리디렉션
      const params = new URLSearchParams();
      
      if (result.error) {
        params.set('error', result.error);
      }
      
      if (result.errorDescription) {
        params.set('error_description', result.errorDescription);
      }
      
      return `/login${params.toString() ? `?${params.toString()}` : ''}`;
    }
  }
} 