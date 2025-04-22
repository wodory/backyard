/**
 * 파일명: src/hooks/mocks/node.ts
 * 목적: MSW 테스트 서버 설정
 * 역할: Node.js 환경에서 API 요청을 모킹하기 위한 MSW 서버 설정
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : 타입 오류 수정
 * 수정일: 2025-04-21 : 디버깅 로그 추가
 */

import { setupServer } from 'msw/node';
import { RequestHandler } from 'msw';
import { beforeEach, afterEach, afterAll } from 'vitest';
import { handlers } from './handlers';

// MSW 서버 설정
export const server = setupServer(...handlers);

// 요청 이벤트 리스닝 (디버깅용)
server.events.on('request:start', ({ request }) => {
  console.log(`🔄 MSW 요청 감지: ${request.method} ${request.url}`);
});

// 응답 이벤트 리스닝 (디버깅용)
server.events.on('response:mocked', ({ request, response }) => {
  console.log(`✅ MSW 응답 생성: ${request.method} ${request.url} - 상태: ${response.status}`);
});

// 처리되지 않은 요청 이벤트 리스닝 (디버깅용)
server.events.on('request:unhandled', ({ request }) => {
  console.log(`❌ MSW 처리되지 않은 요청: ${request.method} ${request.url}`);
});

/**
 * setupMSW: 테스트에서 MSW 서버 설정
 * @returns MSW 서버 제어 객체
 */
export function setupMSW() {
  // 테스트 전 서버 시작
  beforeEach(() => {
    server.listen({ 
      onUnhandledRequest: 'warn' // 처리되지 않은 요청을 경고로 출력
    });
    console.log('📡 MSW 서버 시작됨');
  });

  // 테스트 후 핸들러 초기화
  afterEach(() => {
    server.resetHandlers();
    console.log('🔄 MSW 핸들러 초기화됨');
  });

  // 모든 테스트 완료 후 서버 종료
  afterAll(() => {
    server.close();
    console.log('🛑 MSW 서버 종료됨');
  });

  return {
    // 서버 인스턴스 접근
    server,
    // 핸들러 추가
    use: (...additionalHandlers: RequestHandler[]) => {
      server.use(...additionalHandlers);
      console.log(`➕ MSW 추가 핸들러 등록됨 (${additionalHandlers.length}개)`);
    }
  };
} 