/**
 * 파일명: environment.ts
 * 목적: 실행 환경 감지 유틸리티
 * 역할: 클라이언트/서버 환경 감지 및 환경별 코드 실행 제공
 * 작성일: 2025-03-27
 */

/**
 * isClient: 현재 코드가 클라이언트(브라우저) 환경에서 실행 중인지 확인
 * @returns {boolean} 클라이언트 환경 여부
 */
export const isClient = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * isServer: 현재 코드가 서버 환경에서 실행 중인지 확인
 * @returns {boolean} 서버 환경 여부
 */
export const isServer = (): boolean => {
  return typeof window === 'undefined';
};

/**
 * executeOnClient: 클라이언트 환경에서만 함수 실행
 * @param {Function} fn - 클라이언트에서 실행할 함수
 * @returns {any | undefined} 함수 실행 결과 또는 undefined
 */
export const executeOnClient = <T>(fn: () => T): T | undefined => {
  if (isClient()) {
    return fn();
  }
  return undefined;
};

/**
 * executeOnServer: 서버 환경에서만 함수 실행
 * @param {Function} fn - 서버에서 실행할 함수
 * @returns {any | undefined} 함수 실행 결과 또는 undefined
 */
export const executeOnServer = <T>(fn: () => T): T | undefined => {
  if (isServer()) {
    return fn();
  }
  return undefined;
};

/**
 * getEnvironment: 현재 실행 환경 반환
 * @returns {'client' | 'server'} 실행 환경 문자열
 */
export const getEnvironment = (): 'client' | 'server' => {
  return isClient() ? 'client' : 'server';
};

/**
 * runInEnvironment: 환경에 따라 적절한 함수 실행
 * @param {Object} options - 실행 옵션
 * @param {Function} options.client - 클라이언트에서 실행할 함수
 * @param {Function} options.server - 서버에서 실행할 함수
 * @returns {any} 환경에 맞는 함수의 실행 결과
 */
export const runInEnvironment = <C, S>({ 
  client, 
  server 
}: { 
  client?: () => C; 
  server?: () => S; 
}): C | S | undefined => {
  if (isClient() && client) {
    return client();
  } else if (isServer() && server) {
    return server();
  }
  return undefined;
}; 