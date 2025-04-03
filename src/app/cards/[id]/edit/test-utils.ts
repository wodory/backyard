/**
 * 파일명: test-utils.ts
 * 목적: 카드 편집 페이지 테스트를 위한 유틸리티 함수 및 모킹 객체 제공
 * 역할: 테스트 설정, 정리, 모킹된 액션 제공
 * 작성일: 2024-03-31
 */

import { vi } from 'vitest';

interface CardResponse {
  id: string;
  title: string;
  content: string;
  cardTags: Array<{ id: string; name: string; }>;
}

interface ErrorResponse {
  error: string;
}

type ApiResponse = CardResponse | ErrorResponse;

// API 응답 객체 타입
export interface MockApiResponse {
  ok: boolean;
  status: number;
  json: () => Promise<ApiResponse>;
}

// 모킹된 액션들
export const mockActions = {
  getCard: vi.fn().mockImplementation((id: string): Promise<MockApiResponse> => {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        id: 'test-card-123',
        title: '테스트 카드',
        content: '테스트 내용',
        cardTags: []
      } as CardResponse)
    });
  }),
  router: {
    back: vi.fn(),
    push: vi.fn()
  },
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
};

/**
 * setupEditCardPageTests: 카드 편집 페이지 테스트를 위한 환경을 설정
 */
export const setupEditCardPageTests = () => {
  // 모든 모킹된 함수 초기화
  vi.clearAllMocks();

  // Sonner 토스트 모킹
  vi.mock('sonner', () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn()
    }
  }));

  // next/navigation 모킹
  vi.mock('next/navigation', () => ({
    useRouter: () => mockActions.router,
    useParams: () => ({ id: 'test-card-123' })
  }));
};

/**
 * teardownEditCardPageTests: 카드 편집 페이지 테스트 후 정리 작업 수행
 */
export const teardownEditCardPageTests = () => {
  vi.clearAllMocks();
  vi.resetModules();
};

/**
 * waitForDomChanges: 비동기 작업의 안전한 완료를 위한 도우미 함수
 */
export const waitForDomChanges = () => new Promise(resolve => setTimeout(resolve, 50)); 