/**
 * 파일명: route.test.ts
 * 목적: 사용자 정보 조회 API 엔드포인트 테스트
 * 역할: API의 응답과 오류 처리 검증
 * 작성일: 2025-03-27
 * 수정일: 2024-05-29 : 린터 오류 수정(사용하지 않는 변수 제거)
 * @vitest-environment node
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

import { GET } from './route';

// NextResponse 모킹
vi.mock('next/server', () => {
  const NextResponseMock = {
    json: vi.fn().mockImplementation((data: any, options?: { status?: number }) => ({
      status: options?.status || 200,
      json: async () => data,
    }))
  };
  
  return {
    NextResponse: NextResponseMock
  };
});

// prisma 모킹
vi.mock('@/lib/prisma', () => {
  const userFindUnique = vi.fn();

  return {
    default: {
      user: {
        findUnique: userFindUnique,
      }
    }
  };
});

describe('User API [id]', () => {
  // console.error 모킹
  const originalConsoleError = console.error;
  let prismaMock: any;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    console.error = vi.fn();
    
    // 모든 테스트에서 사용할 prisma mock 설정
    const importedModule = await import('@/lib/prisma');
    prismaMock = vi.mocked(importedModule.default);
  });
  
  // 테스트 후 원래 console.error 복원
  afterAll(() => {
    console.error = originalConsoleError;
  });

  describe('GET /api/user/[id]', () => {
    it('유효한 ID로 사용자 조회 시 사용자 정보를 반환한다', async () => {
      // 모킹된 사용자 데이터
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: '테스트 사용자',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Prisma 응답 모킹
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser);

      // API 호출 - params 객체를 Mock으로 생성
      const params = { id: 'test-user-id' };
      const response = await GET({} as Request, { params: params as any });
      
      // 검증
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ user: mockUser });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-user-id' }
      });
    });

    it('존재하지 않는 ID로 조회 시 404 에러를 반환한다', async () => {
      // 사용자가 없는 경우 모킹
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      // API 호출
      const params = { id: 'non-existent-id' };
      const response = await GET({} as Request, { params: params as any });
      
      // 검증
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toEqual({ error: '사용자를 찾을 수 없습니다.' });
    });

    it('ID가 없는 요청에 대해 400 에러를 반환한다', async () => {
      // ID가 없는 경우
      const params = { id: '' };
      const response = await GET({} as Request, { params: params as any });
      
      // 검증
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({ error: '사용자 ID가 필요합니다.' });
    });

    it('데이터베이스 오류 시 더미 사용자 데이터를 반환한다', async () => {
      // DB 오류 시뮬레이션
      prismaMock.user.findUnique.mockRejectedValueOnce(new Error('DB 연결 오류'));

      // API 호출
      const userId = 'test-user-id';
      const params = { id: userId };
      const response = await GET({} as Request, { params: params as any });
      
      // 검증
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.user).toEqual({
        id: userId,
        email: 'user@example.com',
        name: '사용자',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(console.error).toHaveBeenCalled();
    });

    it('예외 발생 시 500 에러를 반환한다', async () => {
      // 예외 발생 시뮬레이션
      const error = new Error('예상치 못한 오류');
      
      // params를 사용할 때 오류 발생 시뮬레이션
      const mockParamsWithError = {
        get id() { throw error; }
      };

      // API 호출
      const response = await GET({} as Request, { params: mockParamsWithError as any });
      
      // 검증
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: `사용자 조회 실패: ${error.message}` });
      expect(console.error).toHaveBeenCalled();
    });
  });
}); 