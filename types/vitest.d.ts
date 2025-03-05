/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare global {
  namespace Vi {
    interface JestAssertion<T = any> 
      extends jest.Matchers<void, T>,
        TestingLibraryMatchers<T, void> {}
  }

  // 테스트 환경에서 전역 fetch를 사용할 수 있도록 설정
  var fetch: jest.Mock<Promise<Response>> & {
    mockResolvedValue: (value: any) => jest.Mock;
    mockRejectedValue: (error: any) => jest.Mock;
    mockImplementation: (fn: (...args: any[]) => any) => jest.Mock;
  };
}

// Prisma 모킹 타입 확장
declare module '@prisma/client' {
  interface PrismaClient {
    tag?: {
      findUnique: jest.Mock<any, any>;
      findMany: jest.Mock<any, any>; 
      create: jest.Mock<any, any>;
      delete: jest.Mock<any, any>;
      update: jest.Mock<any, any>;
    };
    cardTag?: {
      deleteMany: jest.Mock<any, any>;
      create: jest.Mock<any, any>;
      findMany: jest.Mock<any, any>;
    };
    card?: {
      findUnique: jest.Mock<any, any>;
      findMany: jest.Mock<any, any>;
      create: jest.Mock<any, any>;
      delete: jest.Mock<any, any>;
      update: jest.Mock<any, any>;
    };
  }
} 