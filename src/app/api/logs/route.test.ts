/**
 * 파일명: route.test.ts
 * 목적: 로그 API 엔드포인트 테스트
 * 역할: 클라이언트 로그를 서버에 저장하는 API 기능 검증
 * 작성일: 2024-04-01
 */

import { NextRequest, NextResponse } from 'next/server';
import { expect, vi, describe, it, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { POST } from './route';

// fs 모듈 모킹
vi.mock('fs', () => {
  const mockFunctions = {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
  
  return {
    ...mockFunctions,
    default: mockFunctions,
  };
});

// path 모듈 모킹 - 전체 모듈을 모킹하는 대신 필요한 메소드만 모킹
vi.mock('path', () => {
  return {
    join: vi.fn().mockImplementation((...args) => args.join('/')),
    // 다른 path 메소드가 필요하면 여기에 추가
    resolve: vi.fn().mockImplementation((...args) => args.join('/')),
    dirname: vi.fn().mockImplementation((p) => p.split('/').slice(0, -1).join('/')),
    basename: vi.fn().mockImplementation((p) => p.split('/').pop()),
    default: {
      join: vi.fn().mockImplementation((...args) => args.join('/')),
    }
  };
});

// Supabase 클라이언트 모킹
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: 'success', error: null }),
    }),
  }),
}));

// 환경 변수 모킹
vi.mock('process', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test-url.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    LOG_DIR: 'test-logs',
  },
  cwd: () => '/test-cwd',
}));

// NextResponse 모킹
vi.mock('next/server', () => {
  const actual = vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: vi.fn().mockImplementation((data, options = {}) => {
        return {
          status: options.status || 200,
          json: async () => data,
        };
      }),
    },
  };
});

describe('로그 API 테스트', () => {
  // 콘솔 모킹
  const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  // 테스트용 로그 데이터
  const validLogData = {
    module: 'TestModule',
    level: 'info',
    message: '테스트 로그 메시지',
    data: { test: 'data' },
    timestamp: '2024-04-01T12:00:00.000Z',
  };

  // 요청 객체 생성 함수
  const createRequest = (body: any) => {
    return {
      json: vi.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // 기본 파일 시스템 모킹 설정
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue(JSON.stringify([]));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('유효한 로그 데이터를 성공적으로 처리해야 함', async () => {
    const request = createRequest(validLogData);
    const response = await POST(request);
    const data = await response.json();

    // 응답 검증
    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });

    // 파일 저장 검증
    expect(fs.writeFileSync).toHaveBeenCalled();
    
    // 타입 단언을 사용하여 mock 속성에 접근
    const writeFileSyncMock = fs.writeFileSync as unknown as { mock: { calls: any[][] } };
    expect(writeFileSyncMock.mock.calls[0][1]).toContain(validLogData.message);
    
    // 콘솔 로그 검증
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  it('필수 필드가 누락된 로그 데이터는 400 오류를 반환해야 함', async () => {
    const invalidLogData = {
      // module 필드 누락
      level: 'error',
      message: '오류 메시지',
    };
    
    const request = createRequest(invalidLogData);
    const response = await POST(request);
    const data = await response.json();

    // 응답 검증
    expect(response.status).toBe(400);
    expect(data).toEqual({ error: '필수 필드가 누락되었습니다.' });
    
    // 파일 저장 호출 안됨
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('로그 디렉토리가 없는 경우 생성해야 함', async () => {
    // 디렉토리가 없는 상황 모킹
    (fs.existsSync as any)
      .mockReturnValueOnce(false) // 디렉토리 확인
      .mockReturnValueOnce(false); // 파일 확인
    
    const request = createRequest(validLogData);
    const response = await POST(request);
    const data = await response.json();

    // 응답 검증
    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    
    // 디렉토리 생성 확인 - 실제 호출된 경로 확인
    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('기존 로그 파일에 새 로그를 추가해야 함', async () => {
    // 기존 로그 파일 모킹
    const existingLogs = [
      { 
        module: 'OldModule',
        level: 'debug',
        message: '기존 로그 메시지',
        serverTimestamp: '2024-04-01T11:00:00.000Z'
      }
    ];
    
    (fs.readFileSync as any).mockReturnValue(JSON.stringify(existingLogs));
    
    const request = createRequest(validLogData);
    const response = await POST(request);
    
    // 응답 검증
    expect(response.status).toBe(200);
    
    // 파일 저장 검증
    expect(fs.writeFileSync).toHaveBeenCalled();
    
    // 타입 단언을 사용하여 mock 속성에 접근
    const writeFileSyncMock = fs.writeFileSync as unknown as { mock: { calls: any[][] } };
    const writtenData = JSON.parse(writeFileSyncMock.mock.calls[0][1]);
    expect(writtenData.length).toBe(2);
    expect(writtenData[0].message).toBe('기존 로그 메시지');
    expect(writtenData[1].message).toBe('테스트 로그 메시지');
  });

  it('로그 저장 중 오류 발생 시에도 성공 응답을 반환해야 함', async () => {
    // 파일 읽기/쓰기 오류 모킹
    (fs.readFileSync as any).mockImplementationOnce(() => {
      throw new Error('파일 읽기 오류');
    });
    
    const request = createRequest(validLogData);
    const response = await POST(request);
    const data = await response.json();
    
    // 원본 코드에서는 파일 저장 오류가 발생해도 POST 함수에서는 성공 응답을 반환
    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    
    // 콘솔 에러 호출 검증
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('요청 처리 중 예외 발생 시 500 오류를 반환해야 함', async () => {
    // 요청 파싱 오류 모킹
    const request = {
      json: vi.fn().mockRejectedValue(new Error('요청 파싱 오류')),
    } as unknown as NextRequest;
    
    const response = await POST(request);
    const data = await response.json();
    
    // 응답 검증
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: '로그 처리 중 오류가 발생했습니다.' });
    
    // 콘솔 에러 호출 검증
    expect(consoleErrorSpy).toHaveBeenCalledWith('로그 API 오류:', expect.any(Error));
  });

  it('Supabase 클라이언트 생성 실패 시에도 파일에는 로그를 저장해야 함', async () => {
    // Supabase 클라이언트 생성 오류 모킹
    (createClient as any).mockImplementationOnce(() => {
      throw new Error('Supabase 연결 오류');
    });
    
    const request = createRequest(validLogData);
    const response = await POST(request);
    const data = await response.json();
    
    // 응답 검증 - Supabase 오류가 있어도 성공 응답
    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    
    // 파일 저장은 성공
    expect(fs.writeFileSync).toHaveBeenCalled();
    
    // Supabase 오류 로깅
    expect(consoleErrorSpy).toHaveBeenCalledWith('Supabase 클라이언트 생성 오류:', expect.any(Error));
  });

  it('로그 크기가 1000개를 초과하면 오래된 로그를 제거해야 함', async () => {
    // 1001개의 기존 로그 생성
    const oldLogs = Array.from({ length: 1001 }, (_, i) => ({
      module: 'TestModule',
      level: 'info',
      message: `로그 ${i}`,
      serverTimestamp: `2024-04-01T${i.toString().padStart(2, '0')}:00:00.000Z`
    }));
    
    (fs.readFileSync as any).mockReturnValue(JSON.stringify(oldLogs));
    
    const request = createRequest(validLogData);
    await POST(request);
    
    // 파일 저장 검증
    expect(fs.writeFileSync).toHaveBeenCalled();
    
    // 타입 단언을 사용하여 mock 속성에 접근
    const writeFileSyncMock = fs.writeFileSync as unknown as { mock: { calls: any[][] } };
    const writtenData = JSON.parse(writeFileSyncMock.mock.calls[0][1]);
    expect(writtenData.length).toBe(1000);
    
    // 가장 오래된 로그가 제거되었는지 확인
    expect(writtenData[0].message).not.toBe('로그 0');
    expect(writtenData[999].message).toBe(validLogData.message);
  });
}); 