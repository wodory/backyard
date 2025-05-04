/**
 * 파일명: auth-server.ts
 * 목적: 서버 측 인증 기능 및 세션 처리
 * 역할: API 라우트에서 사용할 서버 측 인증 함수 제공
 * 작성일: 2025-03-27
 * 수정일: 2025-04-09
 * 수정일: 2024-05-19 : serverSignInWithGoogle 함수 추가
 * 수정일: 2025-05-21 : auth 함수에 디버깅 로그 추가
 * 
 * @rule   three-layer-standard
 * @layer  service
 * @tag    @service-msw serverSignInWithGoogle
 * 설명    서버에서 Google OAuth 인증 URL을 생성하는 서비스 함수 (Supabase API 호출, HTTP 경계 MSW로 테스트)
 */

import createLogger from './logger';
import { createClient } from './supabase/server';

// 로거 생성
const logger = createLogger('AuthServer');

/**
 * auth: 서버 컴포넌트와 API 라우트에서 사용할 인증 함수
 * @returns 현재 인증된 세션 정보
 */
export const auth = async () => {
  // console.log('--- [auth-server] auth() 함수 실행 시작 ---');
  try {
    const supabase = await createClient();
    // console.log('[auth-server] Supabase 서버 클라이언트 생성 완료');
    
    // console.log('[auth-server] supabase.auth.getSession() 호출 시작...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    // console.log('[auth-server] supabase.auth.getSession() 호출 완료');
    
    // if (sessionError) {
    //   console.error('[auth-server] 세션 가져오기 에러 발생:', sessionError);
    // } else {
    //   console.log('[auth-server] 가져온 세션 정보:', session ? `사용자 ID: ${session.user.id}` : '세션 없음');
    //   console.log('[auth-server] 가져온 세션 정보:', session);
    // }
    return session;
  } catch (error) {
    logger.error('서버 인증 오류:', error);
    return null;
  }
};

/**
 * getCurrentUser: 현재 인증된 사용자 정보를 반환
 * @returns 현재 인증된 사용자 또는 null
 */
export const getCurrentUser = async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    logger.error('사용자 정보 조회 오류:', error);
    return null;
  }
};

/**
 * serverSignInWithGoogle: 서버에서 Google OAuth 로그인 URL 생성
 * @returns {Promise<{ success: boolean; url?: string; error?: string }>} 로그인 결과
 */
export async function serverSignInWithGoogle(): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    logger.info('서버에서 Google 로그인 시작');
    
    // 현재 호스트 URL 추출 (서버 환경에서는 headers()를 통해 가져와야 함)
    const headers = new Headers();
    // 요청 헤더에서 호스트를 사용할 수 없으므로 환경 변수나 설정에서 가져옵니다
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // 리디렉션 URL 설정
    const redirectUrl = `${baseUrl}/auth/callback`;
    logger.info('리디렉션 URL 설정', { redirectUrl });
    
    // Supabase 클라이언트 생성
    const supabase = await createClient();
    
    // Google OAuth URL 생성
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });
    
    if (error) {
      logger.error('Google OAuth URL 생성 중 오류:', error);
      throw error;
    }
    
    if (!data.url) {
      logger.error('OAuth URL을 가져오는데 실패했습니다');
      throw new Error('OAuth URL을 가져오는데 실패했습니다.');
    }
    
    logger.info('서버에서 Google OAuth URL 획득 성공', { urlStart: data.url.substring(0, 30) + '...' });
    return { success: true, url: data.url };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    logger.error('서버에서 Google 로그인 처리 중 오류:', error);
    return { success: false, error: errorMessage };
  }
} 