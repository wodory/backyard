/**
 * 파일명: server.ts
 * 목적: MSW 테스트 서버 설정
 * 역할: API 요청을 모킹하기 위한 MSW 서버 제공
 * 작성일: 2025-03-30
 * 수정일: 2025-04-09
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import createLogger from '@/lib/logger';
import { HttpResponse } from 'msw';

// 로거 생성
const logger = createLogger('MSWServer');

// MSW 서버 설정
export const server = setupServer(...handlers);

// Node.js v20에서 문제가 발생하는 요청에 대한 즉각 응답 처리
server.events.on('request:start', ({ request }) => {
  try {
    // URL 패턴 검사
    const url = new URL(request.url);
    
    // 문제가 발생할 수 있는 URL 패턴 처리
    if (url.pathname.includes('problem-url')) {
      logger.warn('문제가 있는 URL 요청 감지, 즉시 응답 처리', { url: url.toString() });
      return HttpResponse.json({ error: 'Simulated error' }, { status: 500 });
    }
    
    // auth 관련 요청은 즉시 응답 처리하여 타임아웃 방지
    if (url.pathname.includes('/auth/v1/token')) {
      logger.debug('인증 관련 요청 감지, 빠른 응답 처리', { url: url.toString() });
      return HttpResponse.json({
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: 'test_user_id',
          app_metadata: { provider: 'google' },
          aud: 'authenticated',
          email: 'test@example.com'
        }
      });
    }
    
    return undefined;
  } catch (error) {
    logger.error('요청 처리 중 오류 발생', { error });
    return HttpResponse.json({ error: 'internal_error' }, { status: 500 });
  }
});

/**
 * setupMSW: 테스트에서 MSW 서버 설정
 * @returns 정리 함수
 */
export function setupMSW() {
  // 테스트 전 서버 시작
  beforeEach(() => {
    server.listen({ 
      onUnhandledRequest: 'bypass' // warn 대신 bypass 사용
    });
    logger.info('MSW 서버 시작됨');
  });

  // 테스트 후 핸들러 초기화
  afterEach(() => {
    server.resetHandlers();
    logger.info('MSW 핸들러 초기화됨');
  });

  // 모든 테스트 완료 후 서버 종료
  afterAll(() => {
    server.close();
    logger.info('MSW 서버 종료됨');
  });

  // 추가 핸들러 등록 함수 반환
  return {
    // 핸들러 추가
    use: (...handlers: Parameters<typeof server.use>) => {
      server.use(...handlers);
      logger.debug('추가 MSW 핸들러 등록됨');
    },
    // 서버 인스턴스 접근
    server
  };
}

export { handlers }; 