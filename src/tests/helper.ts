/**
 * 파일명: src/tests/helper.ts
 * 목적: 테스트 유틸리티 함수 제공
 * 역할: 테스트 코드에서 사용되는 공통 유틸리티 함수 모음
 * 작성일: 2025-03-30
 */

/**
 * flushPromises: 비동기 작업이 처리될 수 있도록 이벤트 루프를 비웁니다.
 * @returns {Promise<void>} 비동기 작업이 완료된 후의 프로미스
 */
export const flushPromises = (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 0));
}; 