/**
 * 파일명: server.ts
 * 목적: MSW 테스트 서버 설정
 * 역할: API 요청을 모킹하기 위한 MSW 서버 제공
 * 작성일: 2024-03-31
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import createLogger from '@/lib/logger';

// 로거 생성
const logger = createLogger('MSWServer');

// MSW 서버 설정
export const server = setupServer();

/**
 * setupMSW: 테스트에서 MSW 서버 설정
 * @returns 정리 함수
 */
export function setupMSW() {
  // 테스트 전 서버 시작
  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'warn' });
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