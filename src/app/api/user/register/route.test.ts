/**
 * 파일명: route.test.ts
 * 목적: 사용자 등록 API 엔드포인트 테스트
 * 역할: API의 응답과 오류 처리 검증
 * 작성일: 2024-04-18
 * @vitest-environment node
 */

import { NextResponse } from 'next/server';
import { POST } from './route';
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';

// Request, NextResponse 모킹
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
  const userCreate = vi.fn();

  return {
    default: {
      user: {
        findUnique: userFindUnique,
        create: userCreate,
      }
    }
  };
});

// 요청 객체 생성 헬퍼 함수
function createMockRequest(body: any): Request {
  return {
    json: vi.fn().mockResolvedValue(body)
  } as unknown as Request;
}

describe('User Register API', () => {
  // console.error 모킹
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;
  let prismaMock: any;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    console.error = vi.fn();
    console.log = vi.fn();
    
    // 모든 테스트에서 사용할 prisma mock 설정
    const importedModule = await import('@/lib/prisma');
    prismaMock = vi.mocked(importedModule.default);
  });
  
  // 테스트 후 원래 console 함수 복원
  afterAll(() => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  describe('POST /api/user/register', () => {
    it('유효한 사용자 정보로 새 사용자 등록 시 성공한다', async () => {
      // 새 사용자 데이터
      const userData = {
        id: 'new-user-id',
        email: 'new@example.com',
        name: '새 사용자'
      };

      // 존재하지 않는 사용자 모킹
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      
      // 생성된 사용자 데이터 모킹
      const createdUser = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      prismaMock.user.create.mockResolvedValueOnce(createdUser);

      // API 호출
      const request = createMockRequest(userData);
      const response = await POST(request);
      
      // 검증
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        message: '사용자 등록 성공',
        user: createdUser
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: userData.id }
      });
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: userData
      });
      expect(console.log).toHaveBeenCalled();
    });

    it('이름이 제공되지 않을 때 이메일에서 이름을 추출한다', async () => {
      // 이름 없는 사용자 데이터
      const userData = {
        id: 'no-name-user-id',
        email: 'user.name@example.com',
        // name 필드 없음
      };

      // 예상되는 생성 데이터
      const expectedCreateData = {
        id: userData.id,
        email: userData.email,
        name: 'user.name', // 이메일의 @ 앞부분
      };

      // 존재하지 않는 사용자 모킹
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      
      // 생성된 사용자 데이터 모킹
      const createdUser = {
        ...expectedCreateData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      prismaMock.user.create.mockResolvedValueOnce(createdUser);

      // API 호출
      const request = createMockRequest(userData);
      const response = await POST(request);
      
      // 검증
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        message: '사용자 등록 성공',
        user: createdUser
      });
      
      // 올바른 이름 추출 검증
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expectedCreateData
      });
    });

    it('이미 존재하는 사용자 ID로 요청 시 기존 사용자를 반환한다', async () => {
      // 기존 사용자 데이터
      const existingUser = {
        id: 'existing-user-id',
        email: 'existing@example.com',
        name: '기존 사용자',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 기존 사용자 존재 모킹
      prismaMock.user.findUnique.mockResolvedValueOnce(existingUser);

      // API 호출
      const request = createMockRequest({
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name
      });
      const response = await POST(request);
      
      // 검증
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        message: '기존 사용자 확인됨',
        user: existingUser
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: existingUser.id }
      });
      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
    });

    it('ID나 이메일 누락 시 400 에러를 반환한다', async () => {
      // ID 누락 데이터
      const incompleteData = {
        // id가 없음
        email: 'incomplete@example.com',
        name: '불완전 데이터 사용자'
      };

      // API 호출
      const request = createMockRequest(incompleteData);
      const response = await POST(request);
      
      // 검증
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({
        error: '사용자 ID와 이메일은 필수입니다.'
      });
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('이메일만 누락된 경우 400 에러를 반환한다', async () => {
      // 이메일 누락 데이터
      const incompleteData = {
        id: 'user-id-without-email',
        // email이 없음
        name: '이메일 없는 사용자'
      };

      // API 호출
      const request = createMockRequest(incompleteData);
      const response = await POST(request);
      
      // 검증
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({
        error: '사용자 ID와 이메일은 필수입니다.'
      });
    });

    it('데이터베이스 오류 시 더미 사용자 데이터를 반환한다', async () => {
      // 사용자 데이터
      const userData = {
        id: 'error-user-id',
        email: 'error@example.com',
        name: '에러 테스트 사용자'
      };

      // 사용자가 없음 모킹
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      
      // DB 오류 시뮬레이션
      prismaMock.user.create.mockRejectedValueOnce(new Error('DB 연결 오류'));

      // API 호출
      const request = createMockRequest(userData);
      const response = await POST(request);
      
      // 검증
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        message: '사용자 등록은 성공했으나 데이터베이스 연결 실패',
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalled();
      expect(prismaMock.user.create).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it('데이터베이스 오류 시 이름이 없는 경우 이메일에서 이름을 추출한다', async () => {
      // 이름 없는 사용자 데이터
      const userData = {
        id: 'error-no-name-id',
        email: 'error.handler@example.com',
        // name 필드 없음
      };

      // 사용자가 없음 모킹
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      
      // DB 오류 시뮬레이션
      prismaMock.user.create.mockRejectedValueOnce(new Error('DB 연결 오류'));

      // API 호출
      const request = createMockRequest(userData);
      const response = await POST(request);
      
      // 검증
      expect(response.status).toBe(200);
      const data = await response.json();
      
      // 더미 사용자의 이름이 올바르게 추출되었는지 확인
      expect(data.user.name).toBe('error.handler');
      expect(console.error).toHaveBeenCalled();
    });

    it('요청 처리 중 예외 발생 시 500 에러를 반환한다', async () => {
      // 요청 객체 생성 시 오류 발생 시뮬레이션
      const request = {
        json: vi.fn().mockRejectedValueOnce(new Error('잘못된 JSON 형식'))
      } as unknown as Request;

      // API 호출
      const response = await POST(request);
      
      // 검증
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({
        error: '사용자 등록 실패: 잘못된 JSON 형식'
      });
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });
}); 