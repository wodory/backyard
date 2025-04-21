/**
 * 파일명: /Users/wodory/Development/apps/backyard/src/lib/auth/server.ts
 * 목적: 서버 환경에서 사용할 인증 관련 유틸리티 함수 제공
 * 역할: 서버 액션에서 안전하게 호출할 수 있는 인증 기능 제공
 * 작성일: 2025-04-24
 */

'use server';

import createLogger from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';

// 로거 생성
const logger = createLogger('AuthServer');

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