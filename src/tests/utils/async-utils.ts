/**
 * 파일명: async-utils.ts
 * 목적: 비동기 테스트 유틸리티 제공
 * 역할: 비동기 테스트에 필요한 유틸리티 함수 제공
 * 작성일: 2024-10-12
 */

import { vi, expect } from 'vitest';

/**
 * flushPromises: 비동기 큐의 모든 프로미스를 해결
 * @returns {Promise<void>} 비동기 큐가 비워질 때까지 기다리는 프로미스
 */
export async function flushPromises(times = 1): Promise<void> {
  for (let i = 0; i < times; i++) {
    // 현재 큐의 모든 비동기 작업 실행
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

/**
 * runAllTimers: 모든 타이머를 즉시 실행
 * @returns {Promise<void>} 타이머 실행 완료 대기
 */
export async function runAllTimers(): Promise<void> {
  // 모든 타이머 즉시 실행
  vi.runAllTimers();
  
  // 타이머 이후 발생한 비동기 작업 처리
  await flushPromises();
}

/**
 * runTimersUntil: 특정 조건이 충족될 때까지 타이머 실행
 * @param condition 타이머 중단 조건
 * @param options 옵션 (최대 타이머, 타임아웃)
 */
export async function runTimersUntil(
  condition: () => boolean | Promise<boolean>,
  options: { maxTimers?: number; timeout?: number } = {}
): Promise<void> {
  const { maxTimers = 100, timeout = 5000 } = options;
  const startTime = Date.now();
  
  for (let i = 0; i < maxTimers; i++) {
    // 타임아웃 체크
    if (Date.now() - startTime > timeout) {
      throw new Error(`타임아웃: ${timeout}ms 안에 조건이 충족되지 않음`);
    }
    
    // 타이머 실행 및 비동기 큐 비우기
    vi.advanceTimersByTime(100);
    await flushPromises();
    
    // 조건 체크
    if (await condition()) {
      return;
    }
  }
  
  throw new Error(`최대 타이머 실행(${maxTimers}) 후에도 조건이 충족되지 않음`);
}

/**
 * pollUntil: 조건이 충족될 때까지 폴링
 * @param condition 폴링 중단 조건
 * @param options 옵션 (간격, 타임아웃, 최대 시도 횟수)
 */
export async function pollUntil<T>(
  condition: () => T | Promise<T>,
  options: { interval?: number; timeout?: number; maxTries?: number } = {}
): Promise<T> {
  const { interval = 50, timeout = 5000, maxTries = 100 } = options;
  const startTime = Date.now();
  let tries = 0;
  
  while (tries < maxTries) {
    tries++;
    
    // 타임아웃 체크
    if (Date.now() - startTime > timeout) {
      throw new Error(`폴링 타임아웃: ${timeout}ms 안에 조건이 충족되지 않음`);
    }
    
    try {
      // 조건 체크
      const result = await condition();
      if (result) {
        return result;
      }
    } catch (error) {
      // 조건이 충족되지 않음, 계속 진행
    }
    
    // 테스트 환경에 따라 지연 방법 선택
    if (vi.isFakeTimers()) {
      vi.advanceTimersByTime(interval);
      await flushPromises();
    } else {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  throw new Error(`최대 시도 횟수(${maxTries}) 후에도 조건이 충족되지 않음`);
}

/**
 * expectEventually: 비동기 단언이 최종적으로 통과하기를 기대
 * @param assertion 단언 함수
 * @param options 폴링 옵션
 */
export async function expectEventually(
  assertion: () => void | Promise<void>,
  options: { interval?: number; timeout?: number; maxTries?: number } = {}
): Promise<void> {
  await pollUntil<boolean>(
    async () => {
      try {
        await assertion();
        return true;
      } catch (error) {
        return false;
      }
    },
    options
  );
} 