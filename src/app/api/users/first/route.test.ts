/**
 * 파일명: src/app/api/users/first/route.test.ts
 * 목적: 첫 번째 사용자 API 엔드포인트 테스트
 * 역할: GET 메서드의 정상 작동 및 에러 처리 검증
 * 작성일: 2024-05-28
 */

import { NextResponse } from 'next/server';

import { expect, describe, it, vi, beforeEach, afterEach, afterAll } from 'vitest';

import prisma from '@/lib/prisma';

import { GET } from './route';

// NextResponse 모킹
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((data, options) => {
        return { data, options } as unknown;
      })
    }
  };
});

// Prisma 모킹
vi.mock('@/lib/prisma', () => {
  return {
    default: {
      user: {
        findFirst: vi.fn()
      }
    }
  };
});

// User 타입 정의
interface User {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

describe('GET users/first', () => {
  // 테스트 전 설정
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 테스트 후 정리
  afterEach(() => {
    vi.resetAllMocks();
  });

  // 모든 테스트 종료 후 정리
  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('사용자가 존재하는 경우 사용자 정보를 반환한다', async () => {
    // Given
    const mockUser: User = {
      id: 'test-id',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(mockUser);
    
    // When
    await GET();
    
    // Then
    expect(prisma.user.findFirst).toHaveBeenCalledTimes(1);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    expect(NextResponse.json).toHaveBeenCalledWith(mockUser);
  });

  it('사용자가 존재하지 않는 경우 404 상태코드를 반환한다', async () => {
    // Given
    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(null);
    
    // When
    await GET();
    
    // Then
    expect(prisma.user.findFirst).toHaveBeenCalledTimes(1);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: '사용자를 찾을 수 없습니다.' },
      { status: 404 }
    );
  });

  it('서버 오류 발생 시 500 상태코드를 반환한다', async () => {
    // Given
    const mockError = new Error('Database error');
    vi.mocked(prisma.user.findFirst).mockRejectedValueOnce(mockError);
    
    // Console.error 모킹
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // When
    await GET();
    
    // Then
    expect(prisma.user.findFirst).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: '사용자 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
    
    // 스파이 복원
    consoleErrorSpy.mockRestore();
  });
}); 