/**
 * 파일명: route.test.ts
 * 목적: 헬스 체크 API 엔드포인트 테스트
 * 역할: 데이터베이스 연결 상태를 확인하는 API 기능 검증
 * 작성일: 2024-04-01
 */

import { NextRequest, NextResponse } from 'next/server';
import { expect, vi, describe, it, beforeEach, afterEach } from 'vitest';
import { GET, HEAD } from './route';
import prisma from '@/lib/prisma';

// Prisma 모듈 모킹
vi.mock('@/lib/prisma', () => ({
  default: {
    $queryRaw: vi.fn(),
  },
}));

// NextResponse 모킹
vi.mock('next/server', () => {
  const mockResponse = (body: any = null, init: any = {}) => {
    return {
      status: init?.status || 200,
      json: async () => body,
    };
  };
  
  class MockNextResponse {
    status: number;
    body: any;
  
    constructor(body: any = null, init: any = {}) {
      this.status = init?.status || 200;
      this.body = body;
    }
  
    json() {
      return Promise.resolve(this.body);
    }
  
    static json(data: any, init: any = {}) {
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

  // 요청 객체 생성
  const createRequest = () => ({} as NextRequest);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('HEAD 메소드 테스트', () => {
    it('DB 연결 성공 시 200 상태 코드를 반환해야 함', async () => {
      // Prisma 쿼리 성공 모킹
      (prisma.$queryRaw as any).mockResolvedValueOnce([{ 1: 1 }]);
      
      const request = createRequest();
      const response = await HEAD(request);
      
      // 응답 검증
      expect(response.status).toBe(200);
      
      // Prisma 호출 검증
      expect(prisma.$queryRaw).toHaveBeenCalled();
      
      // 콘솔 에러가 호출되지 않았는지 검증
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('DB 연결 실패 시 503 상태 코드를 반환해야 함', async () => {
      // Prisma 쿼리 실패 모킹
      (prisma.$queryRaw as any).mockRejectedValueOnce(new Error('DB 연결 오류'));
      
      const request = createRequest();
      const response = await HEAD(request);
      
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
      (prisma.$queryRaw as any).mockResolvedValueOnce([{ 1: 1 }]);
      
      const request = createRequest();
      const response = await GET(request);
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
      (prisma.$queryRaw as any).mockRejectedValueOnce(new Error('DB 연결 오류'));
      
      const request = createRequest();
      const response = await GET(request);
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