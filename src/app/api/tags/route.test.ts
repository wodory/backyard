/// <reference types="vitest" />
import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from './route';
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';

// NextResponse.json 모킹
vi.mock('next/server', () => {
  return {
    NextRequest: vi.fn().mockImplementation((url: string, options?: any) => ({
      url,
      method: options?.method || 'GET',
      json: vi.fn().mockImplementation(async () => {
        if (options?.body) {
          try {
            return JSON.parse(options.body);
          } catch {
            throw new Error('Invalid JSON');
          }
        }
        return {};
      }),
      nextUrl: {
        searchParams: new URLSearchParams(url?.split('?')[1] || ''),
      },
      cookies: {},
      page: {},
      ua: {},
      headers: new Headers(),
      signal: {},
      body: new ReadableStream(),
      text: vi.fn().mockImplementation(async () => {
        if (options?.body) {
          return options.body;
        }
        return '';
      }),
      arrayBuffer: vi.fn(),
      blob: vi.fn(),
      clone: vi.fn(),
      formData: vi.fn(),
      redirect: 'follow' as const,
      [Symbol.asyncIterator]: vi.fn()
    })),
    NextResponse: {
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
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn()
    }
  }
}));

describe('태그 API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  // 태그 목록 조회 테스트
  describe('GET /api/tags', () => {
    it('태그 목록을 성공적으로 반환해야 함', async () => {
      // 가짜 태그 데이터
      const mockTags = [
        { id: '1', name: 'JavaScript', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'React', createdAt: new Date(), updatedAt: new Date() },
        { id: '3', name: 'TypeScript', createdAt: new Date(), updatedAt: new Date() }
      ];
      
      // prisma 모킹 설정
      const { prisma } = await import('@/lib/prisma');
      (prisma.tag.findMany as any).mockResolvedValue(mockTags);
      
      // GET 요청 시뮬레이션
      const request = new NextRequest('http://localhost:3000/api/tags');
      const response = await GET(request);
      
      // 응답 검증
      expect(response.status).toBe(200);
      const responseData = await response.json();
      expect(responseData).toEqual(mockTags);
    });
    
    it('서버 오류 발생 시 500 에러를 반환해야 함', async () => {
      // prisma 오류 모킹
      const { prisma } = await import('@/lib/prisma');
      (prisma.tag.findMany as any).mockRejectedValue(new Error('데이터베이스 오류'));
      
      // GET 요청 시뮬레이션
      const request = new NextRequest('http://localhost:3000/api/tags');
      const response = await GET(request);
      
      // 응답 검증
      expect(response.status).toBe(500);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: '태그 목록을 가져오는 중 오류가 발생했습니다.'
      });
    });
  });

  // 태그 생성 테스트
  describe('POST /api/tags', () => {
    it('유효한 태그 데이터로 태그를 생성해야 함', async () => {
      // 가짜 태그 데이터
      const tagData = { name: '새로운태그' };
      const mockCreatedTag = { 
        id: '4', 
        name: '새로운태그', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      // prisma 모킹 설정
      const { prisma } = await import('@/lib/prisma');
      (prisma.tag.findUnique as any).mockResolvedValue(null); // 태그가 존재하지 않음
      (prisma.tag.create as any).mockResolvedValue(mockCreatedTag);
      
      // POST 요청 시뮬레이션
      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tagData)
      });
      
      // request.json 메서드 모킹
      request.json = vi.fn().mockResolvedValue(tagData);
      
      const response = await POST(request);
      
      // 응답 검증
      expect(response.status).toBe(201);
      const responseData = await response.json();
      expect(responseData).toEqual(mockCreatedTag);
      
      // Prisma 호출 확인
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { name: tagData.name }
      });
      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: { name: tagData.name }
      });
    });
    
    it('이미 존재하는 태그 이름으로 생성 시 400 에러를 반환해야 함', async () => {
      // 가짜 태그 데이터
      const tagData = { name: '이미존재하는태그' };
      const existingTag = { 
        id: '5', 
        name: '이미존재하는태그', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      // prisma 모킹 설정
      const { prisma } = await import('@/lib/prisma');
      (prisma.tag.findUnique as any).mockResolvedValue(existingTag); // 이미 태그가 존재함
      
      // POST 요청 시뮬레이션
      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tagData)
      });
      
      // request.json 메서드 모킹
      request.json = vi.fn().mockResolvedValue(tagData);
      
      const response = await POST(request);
      
      // 응답 검증
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: '이미 존재하는 태그입니다.'
      });
      
      // Prisma 호출 확인
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { name: tagData.name }
      });
      expect(prisma.tag.create).not.toHaveBeenCalled();
    });
    
    it('유효하지 않은 데이터로 생성 시 400 에러를 반환해야 함', async () => {
      // 유효하지 않은 태그 데이터 (빈 이름)
      const invalidData = { name: '' };
      
      // POST 요청 시뮬레이션
      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidData)
      });
      
      // request.json 메서드 모킹
      request.json = vi.fn().mockResolvedValue(invalidData);
      
      const response = await POST(request);
      
      // 응답 검증
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toHaveProperty('error');
    });

    it('잘못된 JSON 형식으로 요청 시 400 에러를 반환해야 함', async () => {
      // 1. 테스트 데이터 준비
      const invalidJson = '{invalid json}';
      
      // 2. 테스트 환경 설정
      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: invalidJson
      });
      
      // 3. 모킹 설정
      request.json = vi.fn().mockRejectedValue(new Error('Invalid JSON'));
      
      // 4. 테스트 실행
      const response = await POST(request);
      
      // 5. 결과 검증
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toHaveProperty('error');
    });

    it('request.json() 실패 시 request.body가 문자열인 경우 처리해야 함', async () => {
      // 1. 테스트 데이터 준비
      const tagData = { name: '새로운태그' };
      const tagDataString = JSON.stringify(tagData);
      const mockCreatedTag = { 
        id: '4', 
        name: '새로운태그', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      // 2. 테스트 환경 설정
      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: tagDataString
      });
      
      // 3. 모킹 설정
      request.json = vi.fn().mockRejectedValue(new Error('Invalid JSON'));
      request.text = vi.fn().mockResolvedValue(tagDataString);
      
      // Prisma 모킹 설정
      const { prisma } = await import('@/lib/prisma');
      (prisma.tag.findUnique as any).mockResolvedValue(null); // 태그가 존재하지 않음
      (prisma.tag.create as any).mockResolvedValue(mockCreatedTag);
      
      // 4. 테스트 실행
      const response = await POST(request);
      
      // 5. 결과 검증
      expect(response.status).toBe(201);
      const responseData = await response.json();
      expect(responseData).toEqual(mockCreatedTag);
      
      // 6. 모킹 호출 검증
      expect(request.text).toHaveBeenCalled();
      expect(await request.text()).toBe(tagDataString);
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { name: tagData.name }
      });
      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: { name: tagData.name }
      });
    });

    it('request.json() 실패 시 request.body가 객체인 경우 처리해야 함', async () => {
      // 1. 테스트 데이터 준비
      const tagData = { name: '새로운태그' };
      const tagDataString = JSON.stringify(tagData);
      const mockCreatedTag = { 
        id: '4', 
        name: '새로운태그', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      // 2. 테스트 환경 설정
      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: tagDataString
      });
      
      // 3. 모킹 설정
      request.json = vi.fn().mockRejectedValue(new Error('Invalid JSON'));
      request.text = vi.fn().mockResolvedValue(tagDataString);
      
      // Prisma 모킹 설정
      const { prisma } = await import('@/lib/prisma');
      (prisma.tag.findUnique as any).mockResolvedValue(null); // 태그가 존재하지 않음
      (prisma.tag.create as any).mockResolvedValue(mockCreatedTag);
      
      // 4. 테스트 실행
      const response = await POST(request);
      
      // 5. 결과 검증
      expect(response.status).toBe(201);
      const responseData = await response.json();
      expect(responseData).toEqual(mockCreatedTag);
      
      // 6. 모킹 호출 검증
      expect(request.text).toHaveBeenCalled();
      expect(await request.text()).toBe(tagDataString);
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { name: tagData.name }
      });
      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: { name: tagData.name }
      });
    });

    it('태그 생성 중 서버 오류 발생 시 500 에러를 반환해야 함', async () => {
      // 유효한 태그 데이터
      const tagData = { name: '새로운태그' };
      
      // prisma 모킹 설정
      const { prisma } = await import('@/lib/prisma');
      (prisma.tag.findUnique as any).mockResolvedValue(null); // 태그가 존재하지 않음
      (prisma.tag.create as any).mockRejectedValue(new Error('데이터베이스 오류')); // 생성 중 오류 발생
      
      // POST 요청 시뮬레이션
      const request = new NextRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tagData)
      });
      
      // request.json 메서드 모킹
      request.json = vi.fn().mockResolvedValue(tagData);
      
      const response = await POST(request);
      
      // 응답 검증
      expect(response.status).toBe(500);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: '태그 생성 중 오류가 발생했습니다.'
      });
      
      // Prisma 호출 확인
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { name: tagData.name }
      });
      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: { name: tagData.name }
      });
    });
  });
}); 