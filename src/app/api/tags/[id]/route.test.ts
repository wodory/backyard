/// <reference types="vitest" />
import { NextRequest, NextResponse } from 'next/server';
import { DELETE, GET, PUT } from './route';
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import prisma from '@/lib/prisma';
import type { Mock } from 'vitest';

// NextResponse.json 모킹
vi.mock('next/server', async () => {
  const actual = await vi.importActual<typeof import('next/server')>('next/server');
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

// 콘솔 에러 모킹
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('태그 API', () => {
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

  describe('GET /api/tags/[id]', () => {
    it('존재하는 태그를 성공적으로 조회해야 함', async () => {
      const mockTag = {
        id: mockTagId,
        name: '테스트 태그',
        color: '#ff0000'
      };
      
      // 태그 조회 모킹
      (prisma.tag.findUnique as Mock).mockResolvedValueOnce(mockTag);
      
      const request = new NextRequest('http://localhost:3000/api/tags/' + mockTagId);
      const response = await GET(request, mockContext);
      
      // 응답 검증
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(mockTag);
      
      // Prisma 호출 검증
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { id: mockTagId }
      });
    });
    
    it('존재하지 않는 태그 조회 시 404 응답을 반환해야 함', async () => {
      // 태그가 존재하지 않는 상황 모킹
      (prisma.tag.findUnique as Mock).mockResolvedValueOnce(null);
      
      const request = new NextRequest('http://localhost:3000/api/tags/' + mockTagId);
      const response = await GET(request, mockContext);
      
      // 응답 검증
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toEqual({
        error: '태그를 찾을 수 없습니다.'
      });
      
      // Prisma 호출 검증
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { id: mockTagId }
      });
    });
    
    it('서버 오류 발생 시 500 응답을 반환해야 함', async () => {
      // DB 오류 모킹
      const dbError = new Error('데이터베이스 오류');
      (prisma.tag.findUnique as Mock).mockRejectedValueOnce(dbError);
      
      const request = new NextRequest('http://localhost:3000/api/tags/' + mockTagId);
      const response = await GET(request, mockContext);
      
      // 응답 검증
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({
        error: '태그를 조회하는 중 오류가 발생했습니다.'
      });
      
      // 콘솔 에러 호출 검증
      expect(consoleErrorSpy).toHaveBeenCalledWith('태그 조회 오류:', dbError);
    });
  });
  
  describe('PUT /api/tags/[id]', () => {
    const mockUpdateData = {
      name: '업데이트 태그',
      color: '#00ff00'
    };
    
    const mockRequestJSON = vi.fn();
    
    beforeEach(() => {
      mockRequestJSON.mockResolvedValue(mockUpdateData);
    });
    
    it('태그를 성공적으로 수정해야 함', async () => {
      const updatedTag = {
        id: mockTagId,
        ...mockUpdateData
      };
      
      // 기존 태그 존재 확인 모킹
      (prisma.tag.findUnique as Mock).mockResolvedValueOnce({
        id: mockTagId,
        name: '기존 태그',
        color: '#0000ff'
      });
      
      // 중복 태그 없음 모킹
      (prisma.tag.findFirst as Mock).mockResolvedValueOnce(null);
      
      // 태그 업데이트 모킹
      (prisma.tag.update as Mock).mockResolvedValueOnce(updatedTag);
      
      const request = new NextRequest('http://localhost:3000/api/tags/' + mockTagId, {
        method: 'PUT',
        body: JSON.stringify(mockUpdateData)
      });
      
      // Body 파싱 모킹
      Object.defineProperty(request, 'json', {
        value: mockRequestJSON
      });
      
      const response = await PUT(request, mockContext);
      
      // 응답 검증
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(updatedTag);
      
      // Prisma 호출 검증
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { id: mockTagId }
      });
      expect(prisma.tag.findFirst).toHaveBeenCalledWith({
        where: {
          name: mockUpdateData.name,
          id: { not: mockTagId }
        }
      });
      expect(prisma.tag.update).toHaveBeenCalledWith({
        where: { id: mockTagId },
        data: mockUpdateData
      });
    });
    
    it('존재하지 않는 태그 수정 시 404 응답을 반환해야 함', async () => {
      // 태그가 존재하지 않는 상황 모킹
      (prisma.tag.findUnique as Mock).mockResolvedValueOnce(null);
      
      const request = new NextRequest('http://localhost:3000/api/tags/' + mockTagId, {
        method: 'PUT',
        body: JSON.stringify(mockUpdateData)
      });
      
      // Body 파싱 모킹
      Object.defineProperty(request, 'json', {
        value: mockRequestJSON
      });
      
      const response = await PUT(request, mockContext);
      
      // 응답 검증
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toEqual({
        error: '태그를 찾을 수 없습니다.'
      });
      
      // Prisma 호출 검증
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { id: mockTagId }
      });
      expect(prisma.tag.update).not.toHaveBeenCalled();
    });
    
    it('중복된 태그 이름 사용 시 400 응답을 반환해야 함', async () => {
      const duplicateTag = {
        id: 'another-tag-id',
        name: mockUpdateData.name,
        color: '#ff00ff'
      };
      
      // 기존 태그 존재 확인 모킹
      (prisma.tag.findUnique as Mock).mockResolvedValueOnce({
        id: mockTagId,
        name: '기존 태그',
        color: '#0000ff'
      });
      
      // 중복 태그 존재 모킹
      (prisma.tag.findFirst as Mock).mockResolvedValueOnce(duplicateTag);
      
      const request = new NextRequest('http://localhost:3000/api/tags/' + mockTagId, {
        method: 'PUT',
        body: JSON.stringify(mockUpdateData)
      });
      
      // Body 파싱 모킹
      Object.defineProperty(request, 'json', {
        value: mockRequestJSON
      });
      
      const response = await PUT(request, mockContext);
      
      // 응답 검증
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({
        error: '이미 같은 이름의 태그가 존재합니다.'
      });
      
      // Prisma 호출 검증
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { id: mockTagId }
      });
      expect(prisma.tag.findFirst).toHaveBeenCalledWith({
        where: {
          name: mockUpdateData.name,
          id: { not: mockTagId }
        }
      });
      expect(prisma.tag.update).not.toHaveBeenCalled();
    });
    
    it('잘못된 데이터 형식 사용 시 400 응답을 반환해야 함', async () => {
      // 잘못된 데이터 요청 모킹
      mockRequestJSON.mockResolvedValueOnce({ name: '' }); // 빈 이름
      
      const request = new NextRequest('http://localhost:3000/api/tags/' + mockTagId, {
        method: 'PUT',
        body: JSON.stringify({ name: '' })
      });
      
      // Body 파싱 모킹
      Object.defineProperty(request, 'json', {
        value: mockRequestJSON
      });
      
      const response = await PUT(request, mockContext);
      
      // 응답 검증
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('유효하지 않은 데이터입니다.');
      expect(data.details).toBeDefined();
      
      // Prisma 호출 검증
      expect(prisma.tag.findUnique).not.toHaveBeenCalled();
      expect(prisma.tag.update).not.toHaveBeenCalled();
    });
    
    it('서버 오류 발생 시 500 응답을 반환해야 함', async () => {
      // DB 오류 모킹
      const dbError = new Error('데이터베이스 오류');
      (prisma.tag.findUnique as Mock).mockRejectedValueOnce(dbError);
      
      const request = new NextRequest('http://localhost:3000/api/tags/' + mockTagId, {
        method: 'PUT',
        body: JSON.stringify(mockUpdateData)
      });
      
      // Body 파싱 모킹
      Object.defineProperty(request, 'json', {
        value: mockRequestJSON
      });
      
      const response = await PUT(request, mockContext);
      
      // 응답 검증
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({
        error: '태그를 수정하는 중 오류가 발생했습니다.'
      });
      
      // 콘솔 에러 호출 검증
      expect(consoleErrorSpy).toHaveBeenCalledWith('태그 수정 오류:', dbError);
    });
  });

  describe('DELETE /api/tags/[id]', () => {
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
      const data = await response.json();
      expect(data).toEqual({
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
      const data = await response.json();
      expect(data).toEqual({
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
}); 