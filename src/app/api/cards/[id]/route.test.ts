/**
 * @vitest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { GET, PUT, DELETE } from './route';
import prisma from '@/lib/prisma';
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';

// 모킹 설정
vi.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    card: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Request 객체 모킹 - 타입 오류 해결
if (!global.Request) {
  // @ts-ignore
  global.Request = function Request() {
    return {
      json: () => Promise.resolve({}),
    };
  };
}

// NextRequest, NextResponse 모킹
vi.mock('next/server', () => {
  return {
    __esModule: true,
    NextRequest: vi.fn().mockImplementation((url: string, options?: any) => {
      return {
        url,
        method: options?.method || 'GET',
        json: vi.fn().mockImplementation(async () => {
          return options?.body ? JSON.parse(options.body) : {};
        }),
      };
    }),
    NextResponse: {
      json: vi.fn().mockImplementation((data: any, options?: any) => {
        return {
          status: options?.status || 200,
          json: async () => data,
        };
      }),
    },
  };
});

// 컨텍스트 모킹 함수
const createMockContext = (id: string) => {
  return {
    params: { id },
  };
};

describe('Card Detail API', () => {
  // console.error 모킹 추가
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });
  
  // 테스트 후 원래 console.error 복원
  afterAll(() => {
    console.error = originalConsoleError;
  });

  describe('GET /api/cards/[id]', () => {
    it('존재하는 카드를 성공적으로 조회한다', async () => {
      // 모킹된 데이터
      const mockCard = {
        id: '1',
        title: '테스트 카드',
        content: '테스트 내용',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1',
      };

      // Prisma 응답 모킹
      (prisma.card.findUnique as vi.Mock).mockResolvedValue(mockCard);

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/1');
      const context = createMockContext('1');
      const response = await GET(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(200);
      expect(data).toEqual(mockCard);
      expect(prisma.card.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { user: { select: { id: true, name: true } } },
      });
    });

    it('존재하지 않는 카드 조회 시 404 응답을 반환한다', async () => {
      // Prisma 응답 모킹 (카드가 없음)
      (prisma.card.findUnique as vi.Mock).mockResolvedValue(null);

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/999');
      const context = createMockContext('999');
      const response = await GET(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
    });

    it('에러 발생 시 500 응답을 반환한다', async () => {
      // 에러 모킹
      (prisma.card.findUnique as vi.Mock).mockRejectedValue(new Error('DB 에러'));

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/1');
      const context = createMockContext('1');
      const response = await GET(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });

  describe('PUT /api/cards/[id]', () => {
    it('유효한 데이터로 카드를 업데이트한다', async () => {
      // 모킹된 데이터
      const mockUpdatedCard = {
        id: '1',
        title: '업데이트된 제목',
        content: '업데이트된 내용',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1',
      };

      // 요청 데이터
      const requestData = {
        title: '업데이트된 제목',
        content: '업데이트된 내용',
      };

      // Prisma 응답 모킹
      (prisma.card.findUnique as vi.Mock).mockResolvedValue({ id: '1' }); // 카드 존재 확인
      (prisma.card.update as vi.Mock).mockResolvedValue(mockUpdatedCard);

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/1', {
        method: 'PUT',
        body: JSON.stringify(requestData),
      });
      const context = createMockContext('1');
      const response = await PUT(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(200);
      expect(data).toEqual(mockUpdatedCard);
      expect(prisma.card.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: requestData,
      });
    });

    it('존재하지 않는 카드 업데이트 시 404 응답을 반환한다', async () => {
      // Prisma 응답 모킹 (카드가 없음)
      (prisma.card.findUnique as vi.Mock).mockResolvedValue(null);

      // 요청 데이터
      const requestData = {
        title: '업데이트된 제목',
        content: '업데이트된 내용',
      };

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/999', {
        method: 'PUT',
        body: JSON.stringify(requestData),
      });
      const context = createMockContext('999');
      const response = await PUT(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
      expect(prisma.card.update).not.toHaveBeenCalled();
    });

    it('유효하지 않은 데이터로 요청 시 400 응답을 반환한다', async () => {
      // 유효하지 않은 요청 데이터 (제목이 빈 문자열)
      const requestData = {
        title: '',
        content: '업데이트된 내용',
      };

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/1', {
        method: 'PUT',
        body: JSON.stringify(requestData),
      });
      const context = createMockContext('1');
      const response = await PUT(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(prisma.card.update).not.toHaveBeenCalled();
    });

    it('PUT 요청 중 DB 에러 발생 시 500 응답을 반환한다', async () => {
      // 요청 데이터
      const requestData = {
        title: '업데이트된 제목',
        content: '업데이트된 내용',
      };

      // Prisma 응답 모킹
      (prisma.card.findUnique as vi.Mock).mockResolvedValue({ id: '1' }); // 카드 존재 확인
      (prisma.card.update as vi.Mock).mockRejectedValue(new Error('DB 에러'));

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/1', {
        method: 'PUT',
        body: JSON.stringify(requestData),
      });
      const context = createMockContext('1');
      const response = await PUT(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });

  describe('DELETE /api/cards/[id]', () => {
    it('존재하는 카드를 성공적으로 삭제한다', async () => {
      // Prisma 응답 모킹
      (prisma.card.findUnique as vi.Mock).mockResolvedValue({ id: '1' }); // 카드 존재 확인
      (prisma.card.delete as vi.Mock).mockResolvedValue({ id: '1' });

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/1', {
        method: 'DELETE',
      });
      const context = createMockContext('1');
      const response = await DELETE(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('message');
      expect(prisma.card.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('존재하지 않는 카드 삭제 시 404 응답을 반환한다', async () => {
      // Prisma 응답 모킹 (카드가 없음)
      (prisma.card.findUnique as vi.Mock).mockResolvedValue(null);

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/999', {
        method: 'DELETE',
      });
      const context = createMockContext('999');
      const response = await DELETE(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
      expect(prisma.card.delete).not.toHaveBeenCalled();
    });

    it('에러 발생 시 500 응답을 반환한다', async () => {
      // Prisma 응답 모킹
      (prisma.card.findUnique as vi.Mock).mockResolvedValue({ id: '1' }); // 카드 존재 확인
      (prisma.card.delete as vi.Mock).mockRejectedValue(new Error('DB 에러'));

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards/1', {
        method: 'DELETE',
      });
      const context = createMockContext('1');
      const response = await DELETE(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });
}); 