/**
 * 파일명: test-utils.ts
 * 목적: 태그 관련 컴포넌트의 테스트 유틸리티
 * 역할: 테스트에 필요한 모킹과 헬퍼 함수 제공
 * 작성일: 2025-04-01
 * 수정일: 2025-04-03
 */

import { vi } from 'vitest';

// 모킹된 액션 객체
export const mockActions = {
  createTag: vi.fn(),
  deleteTag: vi.fn(),
  reload: vi.fn(),
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
};

// Sonner 토스트 모킹
vi.mock('sonner', () => ({
  default: {
    success: (...args: any[]) => mockActions.toast.success(...args),
    error: (...args: any[]) => mockActions.toast.error(...args),
  },
  toast: {
    success: (...args: any[]) => mockActions.toast.success(...args),
    error: (...args: any[]) => mockActions.toast.error(...args),
  },
}));

// 태그 폼 테스트 설정
export const setupTagFormTests = () => {
  // 모킹된 액션 초기화
  mockActions.createTag.mockReset();
  mockActions.deleteTag.mockReset();
  mockActions.reload.mockReset();
  mockActions.toast.success.mockReset();
  mockActions.toast.error.mockReset();

  // 기본 성공 응답으로 모킹
  mockActions.createTag.mockResolvedValue(new Response(JSON.stringify({}), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  }));
};

// 태그 폼 테스트 정리
export const teardownTagFormTests = () => {
  vi.resetModules();
  vi.clearAllMocks();
};

// 태그 리스트 테스트 설정
export const setupTagListTests = () => {
  // 모킹된 액션 초기화
  mockActions.createTag.mockReset();
  mockActions.deleteTag.mockReset();
  mockActions.reload.mockReset();
  mockActions.toast.success.mockReset();
  mockActions.toast.error.mockReset();

  // 기본 성공 응답으로 모킹
  mockActions.deleteTag.mockResolvedValue(new Response(JSON.stringify({}), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  }));
};

// 태그 리스트 테스트 정리
export const teardownTagListTests = () => {
  vi.resetModules();
  vi.clearAllMocks();
};

/**
 * waitForDomChanges: 비동기 작업의 안전한 완료를 위한 도우미 함수
 * @returns {Promise<void>} DOM 변경이 완료될 때까지 기다리는 Promise
 */
export const waitForDomChanges = () => new Promise(resolve => setTimeout(resolve, 0)); 