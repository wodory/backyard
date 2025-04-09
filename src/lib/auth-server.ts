/**
 * 파일명: auth-server.ts
 * 목적: 서버 측 인증 기능 및 세션 처리
 * 역할: API 라우트에서 사용할 서버 측 인증 함수 제공
 * 작성일: 2024-03-30
 */

import { createClient } from './supabase/server';
import createLogger from './logger';

// 로거 생성
const logger = createLogger('AuthServer');

/**
 * auth: 서버 컴포넌트와 API 라우트에서 사용할 인증 함수
 * @returns 현재 인증된 세션 정보
 */
export const auth = async () => {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
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