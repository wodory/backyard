/**
 * 파일명: src/app/api/cards/[id]/route.test.ts
 * 목적: 카드 상세 API 엔드포인트 테스트
 * 역할: GET, PUT, DELETE 요청 핸들러의 기능 검증
 * 작성일: 2024-05-22
 * 수정일: 2024-05-22 : import 순서 수정
 * @vitest-environment node
 */

import { NextRequest } from 'next/server';

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import type { Mock } from 'vitest';

import prisma from '@/lib/prisma';

import { GET, PUT, DELETE, PATCH } from './route';

// 타입 정의
interface MockContext {
  params: {
    id: string;
  };
}

// 모킹 설정
vi.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    card: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    cardTag: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
    tag: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn().mockImplementation(async (callback) => {
      const mockTx = {
        card: {
          update: vi.fn().mockImplementation(async (args) => ({
            id: args.where.id,
            title: args.data.title || '업데이트된 제목',
            content: args.data.content || '업데이트된 내용',
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 'user1',
          })),
          findUnique: vi.fn().mockImplementation(async () => ({
            id: '1',
            title: '업데이트된 제목',
            content: '업데이트된 내용',
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 'user1',
            cardTags: [],
          })),
        },
        cardTag: {
          deleteMany: vi.fn(),
          create: vi.fn(),
        },
        tag: {
          findUnique: vi.fn(),
          create: vi.fn(),
        },
      };
      return callback(mockTx);
    }),
  },
}));

// Request 객체 모킹
const createMockRequest = (method: string, body?: Record<string, unknown>) => {
  const request = {
    method,
    url: 'http://localhost:3000/api/cards/1',
    nextUrl: { searchParams: new URLSearchParams() },
    json: async () => body,
  };
  return request as unknown as NextRequest;
};

// 컨텍스트 모킹 함수
const createMockContext = (id: string): MockContext => ({
  params: { id },
});

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
        userId: 'user1',
        createdAt: '2025-03-29T13:20:53.491Z',
        updatedAt: '2025-03-29T13:20:53.491Z',
        user: {
          id: 'user1',
          name: '테스트 사용자'
        },
        cardTags: []
      };

      // Prisma 응답 모킹
      (prisma.card.findUnique as Mock).mockResolvedValue(mockCard);

      // API 호출
      const request = createMockRequest('GET');
      const context = createMockContext('1');
      const response = await GET(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(200);
      expect(data).toEqual(mockCard);
      expect(prisma.card.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          user: { select: { id: true, name: true } },
          cardTags: {
            include: {
              tag: true,
            },
          },
        },
      });
    });

    it('존재하지 않는 카드 조회 시 404 응답을 반환한다', async () => {
      // Prisma 응답 모킹 (카드가 없음)
      (prisma.card.findUnique as Mock).mockResolvedValue(null);

      // API 호출
      const request = createMockRequest('GET');
      const context = createMockContext('999');
      const response = await GET(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
    });

    it('에러 발생 시 500 응답을 반환한다', async () => {
      // 에러 모킹
      (prisma.card.findUnique as Mock).mockRejectedValue(new Error('DB 에러'));

      // API 호출
      const request = createMockRequest('GET');
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
      // 요청 데이터
      const requestData = {
        title: '업데이트된 제목',
        content: '업데이트된 내용',
      };

      // Prisma 응답 모킹
      (prisma.card.findUnique as Mock).mockResolvedValue({ id: '1' }); // 카드 존재 확인

      // API 호출
      const request = createMockRequest('PUT', requestData);
      const context = createMockContext('1');
      const response = await PUT(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        id: '1',
        title: '업데이트된 제목',
        content: '업데이트된 내용',
      });
    });

    it('존재하지 않는 카드 업데이트 시 404 응답을 반환한다', async () => {
      // Prisma 응답 모킹 (카드가 없음)
      (prisma.card.findUnique as Mock).mockResolvedValue(null);

      // 요청 데이터
      const requestData = {
        title: '업데이트된 제목',
        content: '업데이트된 내용',
      };

      // API 호출
      const request = createMockRequest('PUT', requestData);
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
      const request = createMockRequest('PUT', requestData);
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
      (prisma.card.findUnique as Mock).mockResolvedValue({ id: '1' }); // 카드 존재 확인
      (prisma.$transaction as Mock).mockRejectedValue(new Error('DB 에러'));

      // API 호출
      const request = createMockRequest('PUT', requestData);
      const context = createMockContext('1');
      const response = await PUT(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });

  describe('PATCH /api/cards/[id]', () => {
    it('유효한 데이터로 카드 내용을 업데이트한다', async () => {
      // 요청 데이터
      const requestData = {
        content: '업데이트된 내용만',
      };

      // Prisma 응답 모킹
      (prisma.card.findUnique as Mock).mockResolvedValue({ id: '1' }); // 카드 존재 확인
      (prisma.card.update as Mock).mockResolvedValue({
        id: '1',
        title: '기존 제목',
        content: '업데이트된 내용만',
      });

      // API 호출
      const request = createMockRequest('PATCH', requestData);
      const context = createMockContext('1');
      const response = await PATCH(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        id: '1',
        content: '업데이트된 내용만',
      });
      expect(prisma.card.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { content: '업데이트된 내용만' },
        include: expect.any(Object)
      });
    });

    it('존재하지 않는 카드 업데이트 시 404 응답을 반환한다', async () => {
      // Prisma 응답 모킹 (카드가 없음)
      (prisma.card.findUnique as Mock).mockResolvedValue(null);

      // 요청 데이터
      const requestData = {
        content: '업데이트된 내용',
      };

      // API 호출
      const request = createMockRequest('PATCH', requestData);
      const context = createMockContext('999');
      const response = await PATCH(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
      expect(prisma.card.update).not.toHaveBeenCalled();
    });

    it('PATCH 요청 중 DB 에러 발생 시 500 응답을 반환한다', async () => {
      // 요청 데이터
      const requestData = {
        content: '업데이트된 내용',
      };

      // Prisma 응답 모킹
      (prisma.card.findUnique as Mock).mockResolvedValue({ id: '1' }); // 카드 존재 확인
      (prisma.card.update as Mock).mockRejectedValue(new Error('DB 에러'));

      // API 호출
      const request = createMockRequest('PATCH', requestData);
      const context = createMockContext('1');
      const response = await PATCH(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });

  describe('DELETE /api/cards/[id]', () => {
    it('존재하는 카드를 성공적으로 삭제한다', async () => {
      // Prisma 응답 모킹
      (prisma.card.findUnique as Mock).mockResolvedValue({ id: '1' }); // 카드 존재 확인
      (prisma.card.delete as Mock).mockResolvedValue({ id: '1' });

      // API 호출
      const request = createMockRequest('DELETE');
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
      (prisma.card.findUnique as Mock).mockResolvedValue(null);

      // API 호출
      const request = createMockRequest('DELETE');
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
      (prisma.card.findUnique as Mock).mockResolvedValue({ id: '1' }); // 카드 존재 확인
      (prisma.card.delete as Mock).mockRejectedValue(new Error('DB 에러'));

      // API 호출
      const request = createMockRequest('DELETE');
      const context = createMockContext('1');
      const response = await DELETE(request, context);
      const data = await response.json();

      // 검증
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });
}); 