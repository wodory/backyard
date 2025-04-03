/**
 * 파일명: test-utils.ts
 * 목적: 레이아웃 컴포넌트 테스트를 위한 유틸리티 함수 및 모킹 객체 제공
 * 역할: 테스트 설정, 정리, 모킹된 액션 제공
 * 작성일: 2024-03-31
 */

import { vi } from 'vitest';
import { toast } from 'sonner';

// 모킹된 액션들
export const mockActions = {
  // MainToolbar 액션
  applyLayout: vi.fn(),
  createCard: vi.fn(() => Promise.resolve({ id: 'new-card-id' })),
  updateBoardSettings: vi.fn(() => Promise.resolve()),

  // ShortcutToolbar 액션
  toggleSidebar: vi.fn(),
  // Promise를 명시적으로 반환하는 모킹 함수
  signOut: vi.fn().mockImplementation(() => Promise.resolve()),
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
};

/**
 * setupMainToolbarTests: MainToolbar 테스트를 위한 환경을 설정
 */
export const setupMainToolbarTests = () => {
  // 모든 모킹된 함수 초기화
  vi.clearAllMocks();

  // Sonner 토스트 모킹
  vi.mock('sonner', () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }));
};

/**
 * setupShortcutToolbarTests: ShortcutToolbar 테스트를 위한 환경을 설정
 */
export const setupShortcutToolbarTests = () => {
  // 모든 모킹된 함수 초기화
  vi.clearAllMocks();

  // Sonner 토스트 모킹
  vi.mock('sonner', () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }));
};

/**
 * teardownMainToolbarTests: 테스트 후 정리 작업 수행
 */
export const teardownMainToolbarTests = () => {
  vi.clearAllMocks();
  vi.resetModules();
};

/**
 * teardownShortcutToolbarTests: 테스트 후 정리 작업 수행
 */
export const teardownShortcutToolbarTests = () => {
  vi.clearAllMocks();
  vi.resetModules();
}; 