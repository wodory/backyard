/**
 * 파일명: src/types/vitest.d.ts
 * 목적: Vitest와 Testing Library 타입 확장 선언
 * 역할: 전역 타입 확장 및 테스트 관련 타입 정의
 * 작성일: 2025-05-15
 * 수정일: 2023-10-27 : ESLint 오류 수정 (미사용 import 제거, 빈 인터페이스 수정)
 */

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare global {
  namespace Vi {
    // jest.Matchers 타입을 상속받아 JestAssertion 확장
    interface JestAssertion<T = unknown> extends jest.Matchers<void, T> {
      // 추가 확장 기능이 필요한 경우 여기에 구현
      toBeSomething(): void;
    }
  }

  // @testing-library/jest-dom 확장
  interface Matchers<R = void> extends TestingLibraryMatchers<typeof expect.stringContaining, R> {
    // 추가 확장 기능이 필요한 경우 여기에 구현
    toBeSomethingElse(): R;
  }
} 