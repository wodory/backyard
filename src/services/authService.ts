/**
 * 파일명: src/services/authService.ts
 * 목적: 인증 관련 서비스 함수 제공
 * 역할: 인증 관련 HTTP 요청 및 응답 처리를 담당하는 모듈
 * 작성일: 2025-04-21
 * @rule three-layer-standard
 * @layer service
 * @tag @service-msw logout
 */

'use client';

import { isClient } from '@/lib/environment';
import createLogger from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';

// 모듈별 로거 생성
const logger = createLogger('AuthService');

// 클라이언트 환경에서 Supabase 클라이언트 가져오기
const getAuthClient = () => {
  if (!isClient()) {
    throw new Error('브라우저 환경에서만 사용 가능합니다.');
  }
  
  return createClient();
};

/**
 * logout: 사용자 로그아웃 처리
 * @returns {Promise<void>}
 */
export async function logout(): Promise<void> {
  try {
    logger.info('로그아웃 서비스 함수 시작');
    
    // Supabase 로그아웃 - @supabase/ssr 미들웨어가 자동으로 쿠키를 관리합니다
    const supabase = getAuthClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.error('로그아웃 실패:', error);
      throw error;
    }
    
    logger.info('로그아웃 완료 (Supabase 세션 종료)');
  } catch (error) {
    logger.error('로그아웃 중 오류 발생:', error);
    throw error;
  }
}

// 필요에 따라 다른 인증 관련 서비스 함수들을 추가할 수 있습니다. 