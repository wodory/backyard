/**
 * 파일명: route.test.ts
 * 목적: 카드 API 엔드포인트 테스트
 * 역할: 카드 생성 및 조회 API의 기능 검증
 * 작성일: 2024-03-30
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from './route';
import prisma from '@/lib/prisma';
import type { Mock } from 'vitest';

// Prisma 모킹
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    card: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    cardTag: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
    tag: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

// NextRequest 모킹
const createMockRequest = (method: string, body?: any) => {
  const request = {
    method,
    url: 'http://localhost:3000/api/cards',
    nextUrl: { searchParams: new URLSearchParams() },
    json: async () => body,
  };
  return request as unknown as NextRequest;
};

// NextResponse 모킹
vi.mock('next/server', () => ({
  NextRequest: vi.fn().mockImplementation((url: string) => ({
    url,
    nextUrl: { searchParams: new URLSearchParams() },
    json: async () => ({}),
  })),
  NextResponse: {
    json: vi.fn().mockImplementation((data: any, options?: any) => ({
      status: options?.status || 200,
      body: data,
      json: async () => data,
    })),
  },
}));

describe('카드 API 테스트', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockCardData = {
    title: '테스트 카드',
    content: '테스트 내용',
    userId: mockUserId,
    tags: ['태그1', '태그2'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/cards', () => {
    it('유효한 데이터로 카드를 생성', async () => {
      // 사용자 존재 확인 모킹
      (prisma.user.findUnique as Mock).mockResolvedValueOnce({
        id: mockUserId,
        name: '테스트 사용자',
      });

      // 카드 생성 모킹
      const mockCard = {
        id: '456',
        ...mockCardData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.card.create as Mock).mockResolvedValueOnce(mockCard);

      // 태그 처리 모킹
      (prisma.tag.findUnique as Mock).mockResolvedValue(null);
      (prisma.tag.create as Mock).mockResolvedValue({ id: '789', name: '태그1' });
      (prisma.cardTag.create as Mock).mockResolvedValue({ cardId: '456', tagId: '789' });

      // 카드와 태그 조회 모킹
      (prisma.card.findUnique as Mock).mockResolvedValueOnce({
        ...mockCard,
        cardTags: [
          { tag: { id: '789', name: '태그1' } },
          { tag: { id: '790', name: '태그2' } },
        ],
      });

      const request = createMockRequest('POST', mockCardData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toMatchObject({
        id: '456',
        title: mockCardData.title,
        content: mockCardData.content,
        userId: mockCardData.userId,
      });
    });

    it('존재하지 않는 사용자로 카드 생성 시도', async () => {
      // 사용자가 존재하지 않는 상황 모킹
      (prisma.user.findUnique as Mock).mockResolvedValueOnce(null);

      const request = createMockRequest('POST', mockCardData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('존재하지 않는 사용자입니다.');
    });

    it('유효하지 않은 데이터로 카드 생성 시도', async () => {
      const invalidData = {
        title: '', // 빈 제목
        userId: mockUserId,
      };

      const request = createMockRequest('POST', invalidData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('유효하지 않은 데이터입니다.');
    });
  });

  describe('GET /api/cards', () => {
    it('데이터베이스 연결 확인', async () => {
      // 데이터베이스 연결 성공 모킹
      (prisma.$queryRaw as Mock).mockResolvedValueOnce([{ now: new Date() }]);
      (prisma.card.findMany as Mock).mockResolvedValueOnce([]);

      const request = createMockRequest('GET');
      const response = await GET(request);

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('데이터베이스 연결 실패', async () => {
      // 데이터베이스 연결 실패 모킹
      (prisma.$queryRaw as Mock).mockRejectedValueOnce(new Error('DB 연결 실패'));

      const request = createMockRequest('GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('데이터베이스 연결 실패. 관리자에게 문의하세요.');
    });
  });
}); 