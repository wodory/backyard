/**
 * 파일명: route.test.ts
 * 목적: 태그 API 엔드포인트 테스트
 * 역할: 태그 생성 및 조회 API의 기능 검증
 * 작성일: 2024-03-30
 */

/// <reference types="vitest" />
import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from './route';
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth-server';
import type { Mock } from 'vitest';

// NextRequest와 NextResponse 모킹
vi.mock('next/server', () => ({
  NextRequest: vi.fn().mockImplementation((url: string, options?: any) => ({
    url,
    method: options?.method || 'GET',
    json: vi.fn().mockResolvedValue(options?.body ? JSON.parse(options.body) : {}),
    nextUrl: {
      searchParams: new URLSearchParams(url?.split('?')[1] || ''),
    },
  })),
  NextResponse: {
    json: vi.fn().mockImplementation((data: any, options?: any) => ({
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}));

// prisma 모킹
vi.mock('@/lib/prisma', () => ({
  default: {
    tag: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// auth 모킹
vi.mock('@/lib/auth-server', () => ({
  auth: vi.fn(),
}));

describe('태그 API 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/tags', () => {
    it('기본 태그 목록을 반환', async () => {
      const mockTags = [
        { id: '1', name: '태그1', createdAt: new Date() },
        { id: '2', name: '태그2', createdAt: new Date() },
      ];

      (prisma.tag.findMany as Mock).mockResolvedValueOnce(mockTags);

      const request = new NextRequest('http://localhost:3000/api/tags');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockTags);
      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('사용 횟수를 포함한 태그 목록을 반환', async () => {
      const mockTags = [
        { 
          id: '1', 
          name: '태그1', 
          createdAt: new Date(),
          _count: { cardTags: 3 },
        },
        { 
          id: '2', 
          name: '태그2', 
          createdAt: new Date(),
          _count: { cardTags: 1 },
        },
      ];

      (prisma.tag.findMany as Mock).mockResolvedValueOnce(mockTags);

      const request = new NextRequest('http://localhost:3000/api/tags?includeCount=true');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockTags.map(tag => ({
        id: tag.id,
        name: tag.name,
        count: tag._count.cardTags,
        createdAt: tag.createdAt,
      })));
      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: { cardTags: true },
          },
        },
        orderBy: {
          name: 'asc',
        },
        where: {
          name: {
            contains: '',
          },
        },
      });
    });

    it('검색어로 태그를 필터링', async () => {
      const searchQuery = '태그1';
      const mockTags = [
        { id: '1', name: '태그1', createdAt: new Date() },
      ];

      (prisma.tag.findMany as Mock).mockResolvedValueOnce(mockTags);

      const request = new NextRequest(`http://localhost:3000/api/tags?q=${searchQuery}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockTags);
      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: searchQuery,
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('데이터베이스 오류 처리', async () => {
      (prisma.tag.findMany as Mock).mockRejectedValueOnce(new Error('DB 오류'));

      const request = new NextRequest('http://localhost:3000/api/tags');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('태그 목록을 불러오는데 실패했습니다');
    });
  });

  describe('POST /api/tags', () => {
    const mockUser = { id: '123', name: 'Test User' };

    it('새 태그를 생성', async () => {
      (auth as Mock).mockResolvedValueOnce({ user: mockUser });

      const tagName = '새로운태그';
      const mockTag = {
        id: '1',
        name: tagName,
        createdAt: new Date(),
      };

      (prisma.tag.findFirst as Mock).mockResolvedValueOnce(null);
      (prisma.tag.create as Mock).mockResolvedValueOnce(mockTag);

      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify({ name: tagName }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockTag);
      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: {
          name: tagName,
        },
      });
    });

    it('인증되지 않은 사용자 요청 처리', async () => {
      (auth as Mock).mockResolvedValueOnce(null);

      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify({ name: '새로운태그' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('인증이 필요합니다');
    });

    it('이미 존재하는 태그 처리', async () => {
      (auth as Mock).mockResolvedValueOnce({ user: mockUser });

      const existingTag = {
        id: '1',
        name: '기존태그',
        createdAt: new Date(),
      };

      (prisma.tag.findFirst as Mock).mockResolvedValueOnce(existingTag);

      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify({ name: '기존태그' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('이미 존재하는 태그입니다');
      expect(data.tag).toEqual(existingTag);
    });

    it('유효하지 않은 태그 이름 처리', async () => {
      (auth as Mock).mockResolvedValueOnce({ user: mockUser });

      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify({ name: '' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('유효한 태그 이름이 필요합니다');
    });

    it('데이터베이스 오류 처리', async () => {
      (auth as Mock).mockResolvedValueOnce({ user: mockUser });

      (prisma.tag.findFirst as Mock).mockResolvedValueOnce(null);
      (prisma.tag.create as Mock).mockRejectedValueOnce(new Error('DB 오류'));

      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify({ name: '새로운태그' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('태그 생성에 실패했습니다');
    });
  });
}); 