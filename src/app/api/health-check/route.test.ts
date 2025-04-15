/**
 * 파일명: route.test.ts
 * 목적: 헬스 체크 API 엔드포인트 테스트
 * 역할: 데이터베이스 연결 상태를 확인하는 API 기능 검증
 * 작성일: 2025-04-01
 * 수정일: 2024-06-19 : 사용하지 않는 NextResponse import 제거
 * 수정일: 2024-05-22 : createRequest 호출 수정
 * 수정일: 2024-06-21 : 인수가 필요하지 않은 HEAD() 및 GET() 함수 호출 수정
 * 수정일: 2024-06-22 : 사용하지 않는 NextRequest import 제거 및 any 타입 구체화
 */

import { expect, vi, describe, it, beforeEach, afterEach } from 'vitest';

import prisma from '@/lib/prisma';

import { GET, HEAD } from './route';

// Prisma 모듈 모킹
vi.mock('@/lib/prisma', () => ({
  default: {
    $queryRaw: vi.fn(),
  },
}));

// NextResponse 모킹
vi.mock('next/server', () => {
  const mockResponse = (body: unknown = null, init: { status?: number } = {}) => {
    return {
      status: init?.status || 200,
      json: async () => body,
    };
  };
  
  class MockNextResponse {
    status: number;
    body: unknown;
  
    constructor(body: unknown = null, init: { status?: number } = {}) {
      this.status = init?.status || 200;
      this.body = body;
    }
  
    json() {
      return Promise.resolve(this.body);
    }
  
    static json(data: unknown, init: { status?: number } = {}) {
      return mockResponse(data, init);
    }
  }
  
  return {
    NextRequest: vi.fn(),
    NextResponse: MockNextResponse,
  };
});

describe('헬스 체크 API 테스트', () => {
  // 콘솔 모킹
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('HEAD 메소드 테스트', () => {
    it('DB 연결 성공 시 200 상태 코드를 반환해야 함', async () => {
      // Prisma 쿼리 성공 모킹
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ 1: 1 }]);
      
      const response = await HEAD();
      
      // 응답 검증
      expect(response.status).toBe(200);
      
      // Prisma 호출 검증
      expect(prisma.$queryRaw).toHaveBeenCalled();
      
      // 콘솔 에러가 호출되지 않았는지 검증
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('DB 연결 실패 시 503 상태 코드를 반환해야 함', async () => {
      // Prisma 쿼리 실패 모킹
      (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(new Error('DB 연결 오류'));
      
      const response = await HEAD();
      
      // 응답 검증
      expect(response.status).toBe(503);
      
      // Prisma 호출 검증
      expect(prisma.$queryRaw).toHaveBeenCalled();
      
      // 콘솔 에러 호출 검증
      expect(consoleErrorSpy).toHaveBeenCalledWith('DB 연결 실패:', expect.any(Error));
    });
  });

  describe('GET 메소드 테스트', () => {
    it('DB 연결 성공 시 200 상태 코드와 성공 메시지를 반환해야 함', async () => {
      // Prisma 쿼리 성공 모킹
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ 1: 1 }]);
      
      const response = await GET();
      const data = await response.json();
      
      // 응답 검증
      expect(response.status).toBe(200);
      expect(data).toEqual({ 
        status: 'ok', 
        message: 'Database connection successful' 
      });
      
      // Prisma 호출 검증
      expect(prisma.$queryRaw).toHaveBeenCalled();
      
      // 콘솔 에러가 호출되지 않았는지 검증
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('DB 연결 실패 시 503 상태 코드와 오류 메시지를 반환해야 함', async () => {
      // Prisma 쿼리 실패 모킹
      (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(new Error('DB 연결 오류'));
      
      const response = await GET();
      const data = await response.json();
      
      // 응답 검증
      expect(response.status).toBe(503);
      expect(data).toEqual({ 
        status: 'error', 
        message: 'Database connection failed' 
      });
      
      // Prisma 호출 검증
      expect(prisma.$queryRaw).toHaveBeenCalled();
      
      // 콘솔 에러 호출 검증
      expect(consoleErrorSpy).toHaveBeenCalledWith('DB 연결 실패:', expect.any(Error));
    });
  });
}); 