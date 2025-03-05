/// <reference types="vitest" />
import { NextRequest, NextResponse } from 'next/server';
import { DELETE } from './route';
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';

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
  prisma: {
    tag: {
      findUnique: vi.fn(),
      delete: vi.fn()
    },
    cardTag: {
      deleteMany: vi.fn()
    }
  }
}));

describe('태그 API - DELETE', () => {
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
    const tagId = '1';
    const mockTag = { 
      id: tagId, 
      name: '테스트 태그',
      _count: { cardTags: 2 }
    };

    // prisma 모킹 설정
    const { prisma } = await import('@/lib/prisma');
    (prisma.tag.findUnique as any).mockResolvedValue(mockTag);
    (prisma.cardTag.deleteMany as any).mockResolvedValue({ count: 2 });
    (prisma.tag.delete as any).mockResolvedValue(mockTag);
    
    // DELETE 요청 시뮬레이션
    const request = new NextRequest(`http://localhost:3000/api/tags/${tagId}`, {
      method: 'DELETE'
    });
    
    const response = await DELETE(request, {
      params: { id: tagId }
    });
    
    // 응답 검증
    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData).toEqual({
      message: '태그가 성공적으로 삭제되었습니다.'
    });
    
    // prisma 함수 호출 확인
    expect(prisma.tag.findUnique).toHaveBeenCalledWith({
      where: { id: tagId },
      include: { _count: { select: { cardTags: true } } }
    });
    expect(prisma.cardTag.deleteMany).toHaveBeenCalledWith({
      where: { tagId }
    });
    expect(prisma.tag.delete).toHaveBeenCalledWith({
      where: { id: tagId }
    });
  });

  it('존재하지 않는 태그에 대해 404 오류를 반환해야 함', async () => {
    const tagId = '999';
    
    // prisma 모킹 설정
    const { prisma } = await import('@/lib/prisma');
    (prisma.tag.findUnique as any).mockResolvedValue(null); // 태그가 존재하지 않음
    
    // DELETE 요청 시뮬레이션
    const request = new NextRequest(`http://localhost:3000/api/tags/${tagId}`, {
      method: 'DELETE'
    });
    
    const response = await DELETE(request, {
      params: { id: tagId }
    });
    
    // 응답 검증
    expect(response.status).toBe(404);
    const responseData = await response.json();
    expect(responseData).toEqual({
      error: '존재하지 않는 태그입니다.'
    });
    
    // prisma 함수 호출 확인
    expect(prisma.tag.findUnique).toHaveBeenCalledWith({
      where: { id: tagId },
      include: { _count: { select: { cardTags: true } } }
    });
    expect(prisma.cardTag.deleteMany).not.toHaveBeenCalled();
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
    const { prisma } = await import('@/lib/prisma');
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