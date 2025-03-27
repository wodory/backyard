/**
 * 파일명: route.test.ts
 * 목적: 첫 번째 사용자 조회 API 엔드포인트 테스트
 * 역할: GET /api/users/first 엔드포인트의 다양한 시나리오에 대한 단위 테스트
 * 작성일: 2024-05-23
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// 모의된 응답 타입
type MockedResponse = {
  body: any;
  options?: { status?: number };
};

// Prisma 클라이언트 모킹
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findFirst: vi.fn()
    }
  }
}));

// NextResponse 모킹 (직접 변수에 모킹 함수 할당하지 않고 객체로 모킹)
vi.mock('next/server', () => ({
  NextRequest: function(url: string) {
    return { url };
  },
  NextResponse: {
    json: vi.fn((body, options) => ({ body, options }))
  }
}));

// 필요한 모듈 임포트 - 모킹 후에 임포트해야 함
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

describe('첫 번째 사용자 조회 API', () => {
  // 각 테스트 전에 모든 모의 함수 초기화
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/users/first', () => {
    it('첫 번째 사용자를 성공적으로 반환한다', async () => {
      // Mock 사용자 데이터 설정
      const mockUser = {
        id: 'user-123',
        name: '테스트 사용자',
        email: 'test@example.com'
      };
      
      // Prisma findFirst 함수가 mock 사용자를 반환하도록 설정
      (prisma.user.findFirst as any).mockResolvedValue(mockUser);
      
      // API 요청 실행
      const request = { url: 'http://localhost/api/users/first' };
      const response = await GET(request as any) as unknown as MockedResponse;
      
      // 기대 결과 확인
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, email: true }
      });
      expect(NextResponse.json).toHaveBeenCalledWith(mockUser);
      expect(response.body).toEqual(mockUser);
    });
    
    it('사용자가 없을 경우 404 오류를 반환한다', async () => {
      // Prisma findFirst 함수가 null을 반환하도록 설정
      (prisma.user.findFirst as any).mockResolvedValue(null);
      
      // API 요청 실행
      const request = { url: 'http://localhost/api/users/first' };
      const response = await GET(request as any) as unknown as MockedResponse;
      
      // 기대 결과 확인
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, email: true }
      });
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
      expect(response.body).toEqual({ error: '사용자를 찾을 수 없습니다.' });
      expect(response.options).toEqual({ status: 404 });
    });
    
    it('데이터베이스 오류 시 500 오류를 반환한다', async () => {
      // Prisma findFirst 함수가 오류를 발생시키도록 설정
      (prisma.user.findFirst as any).mockRejectedValue(new Error('데이터베이스 연결 오류'));
      
      // 콘솔 에러 모킹
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // API 요청 실행
      const request = { url: 'http://localhost/api/users/first' };
      const response = await GET(request as any) as unknown as MockedResponse;
      
      // 기대 결과 확인
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, email: true }
      });
      expect(console.error).toHaveBeenCalledWith('사용자 조회 오류:', expect.any(Error));
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: '사용자 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
      expect(response.body).toEqual({ error: '사용자 조회 중 오류가 발생했습니다.' });
      expect(response.options).toEqual({ status: 500 });
      
      // 스파이 정리
      consoleSpy.mockRestore();
    });
  });
}); 