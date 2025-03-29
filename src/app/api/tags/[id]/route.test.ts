/// <reference types="vitest" />
import { NextRequest, NextResponse } from 'next/server';
import { DELETE } from './route';
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import prisma from '@/lib/prisma';
import type { Mock } from 'vitest';

// NextResponse.json 모킹
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      json: vi.fn().mockImplementation((data: any, options: { status?: number } = {}) => {
        return {
          status: options.status || 200,
          body: data,
          json: () => Promise.resolve(data)
        };
      })
    }
  };
});

// Prisma 모킹
vi.mock('@/lib/prisma', () => ({
  default: {
    tag: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    cardTag: {
      count: vi.fn(),
    },
  },
}));

describe('태그 API - DELETE', () => {
  const mockTagId = 'test-tag-id';
  const mockContext = { params: { id: mockTagId } };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('성공적으로 태그를 삭제해야 함', async () => {
    // 태그 존재 확인 모킹
    (prisma.tag.findUnique as Mock).mockResolvedValueOnce({
      id: mockTagId,
      name: '테스트 태그',
    });

    // 카드 태그 카운트 모킹
    (prisma.cardTag.count as Mock).mockResolvedValueOnce(2);

    // 태그 삭제 모킹
    (prisma.tag.delete as Mock).mockResolvedValueOnce({
      id: mockTagId,
      name: '테스트 태그',
    });

    const request = new NextRequest('http://localhost:3000/api/tags/' + mockTagId);
    const response = await DELETE(request, mockContext);

    // 응답 검증
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: '태그가 성공적으로 삭제되었습니다.',
      affectedCards: 2,
    });

    // Prisma 호출 검증
    expect(prisma.tag.findUnique).toHaveBeenCalledWith({
      where: { id: mockTagId },
    });
    expect(prisma.cardTag.count).toHaveBeenCalledWith({
      where: { tagId: mockTagId },
    });
    expect(prisma.tag.delete).toHaveBeenCalledWith({
      where: { id: mockTagId },
    });
  });

  it('존재하지 않는 태그에 대해 404 오류를 반환해야 함', async () => {
    // 태그가 존재하지 않는 상황 모킹
    (prisma.tag.findUnique as Mock).mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/tags/' + mockTagId);
    const response = await DELETE(request, mockContext);

    // 응답 검증
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: '태그를 찾을 수 없습니다.',
    });

    // Prisma 호출 검증
    expect(prisma.tag.findUnique).toHaveBeenCalledWith({
      where: { id: mockTagId },
    });
    expect(prisma.tag.delete).not.toHaveBeenCalled();
  });
  
  it('서버 오류 발생 시 500 에러를 반환해야 함', async () => {
    const tagId = '1';
    const mockTag = { 
      id: tagId, 
      name: '테스트 태그',
      _count: { cardTags: 2 }
    };
    
    // prisma 모킹 설정
    (prisma.tag.findUnique as any).mockResolvedValue(mockTag);
    (prisma.tag.delete as any).mockRejectedValue(new Error('데이터베이스 오류'));
    
    // DELETE 요청 시뮬레이션
    const request = new NextRequest(`http://localhost:3000/api/tags/${tagId}`, {
      method: 'DELETE'
    });
    
    const response = await DELETE(request, {
      params: { id: tagId }
    });
    
    // 응답 검증
    expect(response.status).toBe(500);
    const responseData = await response.json();
    expect(responseData).toEqual({
      error: '태그를 삭제하는 중 오류가 발생했습니다.'
    });
  });
}); 