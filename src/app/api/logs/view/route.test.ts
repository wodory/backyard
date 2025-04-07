/**
 * 파일명: route.test.ts
 * 목적: 로그 조회 API 엔드포인트 테스트
 * 역할: GET /api/logs/view 엔드포인트에 대한 다양한 시나리오의 단위 테스트
 * 작성일: 2024-03-30
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { GET } from './route';
import fs from 'fs';
import type { Mock } from 'vitest';

// 타입 정의
interface MockedResponse {
  body: any;
  options?: { status?: number };
  status: number;
  json: () => Promise<any>;
}

interface MockRequest {
  url: string;
  nextUrl: {
    searchParams: URLSearchParams;
  };
}

// 콘솔 로그 모킹
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

// fs 모듈 모킹
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  },
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

// path 모듈 모킹
vi.mock('path', () => {
  const joinMock = vi.fn((...args) => args.join('/'));
  return {
    default: {
      join: joinMock
    },
    join: joinMock
  };
});

// next/server 모킹
vi.mock('next/server', () => ({
  NextRequest: function(this: any, url: string) {
    this.url = url;
    this.nextUrl = {
      searchParams: new URLSearchParams()
    };
    return this;
  },
  NextResponse: {
    json: vi.fn().mockImplementation((data: any, options?: any) => ({
      status: options?.status || 200,
      body: data,
      json: async () => data,
    })),
  }
}));

// Supabase 모킹
vi.mock('@/lib/supabase-instance', () => ({
  getSupabaseInstance: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } })
    }
  }))
}));

// process.cwd() 모킹
vi.mock('process', () => ({
  cwd: vi.fn(() => '/fake/cwd'),
  env: {
    NODE_ENV: 'development',
    LOG_DIR: 'logs'
  }
}));

// 모듈 임포트
import { getSupabaseInstance } from '@/lib/supabase-instance';

describe('로그 조회 API', () => {
  // 테스트 샘플 로그 데이터
  const sampleLogs = [
    { module: 'auth', level: 'info', timestamp: '2024-03-30T10:00:00Z', message: '로그인 성공', sessionId: 'session1' },
    { module: 'api', level: 'error', timestamp: '2024-03-30T09:00:00Z', message: 'API 오류', sessionId: 'session1' },
    { module: 'auth', level: 'warn', timestamp: '2024-03-30T08:00:00Z', message: '인증 만료', sessionId: 'session2' },
    { module: 'database', level: 'debug', timestamp: '2024-03-30T07:00:00Z', message: '쿼리 실행', sessionId: 'session3' },
    { module: 'api', level: 'info', timestamp: '2024-03-30T06:00:00Z', message: 'API 요청', sessionId: null },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('LOG_DIR', 'logs');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  /**
   * 요청 객체를 생성하는 헬퍼 함수
   */
  const createRequest = (searchParams: Record<string, string> = {}) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      params.set(key, value);
    });

    return {
      url: `http://localhost/api/logs/view${params.toString() ? '?' + params.toString() : ''}`,
      nextUrl: { searchParams: params },
    } as MockRequest;
  };

  describe('GET /api/logs/view', () => {
    it('개발 환경에서 로그 파일이 없는 경우 404를 반환한다', async () => {
      (fs.existsSync as Mock).mockReturnValue(false);

      const request = createRequest();
      const response = await GET(request as any) as unknown as MockedResponse;

      expect(fs.existsSync).toHaveBeenCalled();
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: '로그 파일이 존재하지 않습니다.' });
    });

    it('로그 파일을 성공적으로 읽고 필터링 없이 반환한다', async () => {
      (fs.existsSync as Mock).mockReturnValue(true);
      (fs.readFileSync as Mock).mockReturnValue(JSON.stringify(sampleLogs));

      const request = createRequest();
      const response = await GET(request as any) as unknown as MockedResponse;

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        logs: sampleLogs,
        total: 5,
        filtered: 5,
        modules: ['auth', 'api', 'database'],
        sessionIds: ['session1', 'session2', 'session3'],
      });
    });

    it('모듈 파라미터로 로그를 필터링한다', async () => {
      (fs.existsSync as Mock).mockReturnValue(true);
      (fs.readFileSync as Mock).mockReturnValue(JSON.stringify(sampleLogs));

      const request = createRequest({ module: 'auth' });
      const response = await GET(request as any) as unknown as MockedResponse;

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        logs: sampleLogs.filter(log => log.module === 'auth'),
        total: 5,
        filtered: 2,
        modules: ['auth', 'api', 'database'],
        sessionIds: ['session1', 'session2', 'session3'],
      });
    });

    it('레벨 파라미터로 로그를 필터링한다', async () => {
      (fs.existsSync as Mock).mockReturnValue(true);
      (fs.readFileSync as Mock).mockReturnValue(JSON.stringify(sampleLogs));

      const request = createRequest({ level: 'info' });
      const response = await GET(request as any) as unknown as MockedResponse;

      expect(response.status).toBe(200);
      expect(response.body.logs).toHaveLength(2);
      expect(response.body.logs.every((log: any) => log.level === 'info')).toBe(true);
      expect(response.body.filtered).toBe(2);
    });

    it('세션 ID 파라미터로 로그를 필터링한다', async () => {
      (fs.existsSync as Mock).mockReturnValue(true);
      (fs.readFileSync as Mock).mockReturnValue(JSON.stringify(sampleLogs));

      const request = createRequest({ sessionId: 'session1' });
      const response = await GET(request as any) as unknown as MockedResponse;

      expect(response.status).toBe(200);
      expect(response.body.logs).toHaveLength(2);
      expect(response.body.logs.every((log: any) => log.sessionId === 'session1')).toBe(true);
      expect(response.body.filtered).toBe(2);
    });

    it('여러 파라미터로 복합 필터링을 적용한다', async () => {
      (fs.existsSync as Mock).mockReturnValue(true);
      (fs.readFileSync as Mock).mockReturnValue(JSON.stringify(sampleLogs));

      const request = createRequest({
        module: 'auth',
        level: 'info',
      });
      const response = await GET(request as any) as unknown as MockedResponse;

      expect(response.status).toBe(200);
      expect(response.body.logs).toHaveLength(1);
      expect(response.body.logs[0].module).toBe('auth');
      expect(response.body.logs[0].level).toBe('info');
      expect(response.body.filtered).toBe(1);
    });

    it('limit 파라미터로 로그 개수를 제한한다', async () => {
      (fs.existsSync as Mock).mockReturnValue(true);
      (fs.readFileSync as Mock).mockReturnValue(JSON.stringify(sampleLogs));

      const request = createRequest({ limit: '2' });
      const response = await GET(request as any) as unknown as MockedResponse;

      expect(response.status).toBe(200);
      expect(response.body.logs).toHaveLength(2);
      // 타임스탬프 기준 최신 순으로 정렬되었는지 확인
      expect(response.body.logs[0].timestamp).toBe('2024-03-30T10:00:00Z');
      expect(response.body.logs[1].timestamp).toBe('2024-03-30T09:00:00Z');
    });

    it('파일 읽기 중 오류 발생 시 500 오류를 반환한다', async () => {
      (fs.existsSync as Mock).mockReturnValue(true);
      (fs.readFileSync as Mock).mockImplementation(() => {
        throw new Error('파일을 읽을 수 없습니다');
      });

      const request = createRequest();
      const response = await GET(request as any) as unknown as MockedResponse;

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: '로그 조회 중 오류가 발생했습니다: 파일을 읽을 수 없습니다',
      });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('프로덕션 환경에서 인증되지 않은 요청을 거부한다', async () => {
      // 프로덕션 환경 설정
      vi.stubEnv('NODE_ENV', 'production');
      
      // 인증되지 않은 세션 모킹
      const supabaseMock = getSupabaseInstance as Mock;
      supabaseMock.mockReturnValueOnce({
        auth: {
          getSession: vi.fn().mockResolvedValueOnce({ data: { session: null } })
        }
      });

      const request = createRequest();
      const response = await GET(request as any) as unknown as MockedResponse;

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: '인증이 필요합니다.' });
    });

    it('프로덕션 환경에서 인증된 요청을 허용한다', async () => {
      // 프로덕션 환경 설정
      vi.stubEnv('NODE_ENV', 'production');
      
      // 인증된 세션 모킹
      const supabaseMock = getSupabaseInstance as Mock;
      supabaseMock.mockReturnValueOnce({
        auth: {
          getSession: vi.fn().mockResolvedValueOnce({ 
            data: { 
              session: { 
                user: { id: 'test-user-id' } 
              } 
            } 
          })
        }
      });

      (fs.existsSync as Mock).mockReturnValue(true);
      (fs.readFileSync as Mock).mockReturnValue(JSON.stringify(sampleLogs));

      const request = createRequest();
      const response = await GET(request as any) as unknown as MockedResponse;

      expect(response.status).toBe(200);
      expect(response.body.logs).toBeDefined();
    });

    it('JSON 파싱 오류가 발생하면 500 오류를 반환한다', async () => {
      (fs.existsSync as Mock).mockReturnValue(true);
      // 유효하지 않은 JSON 문자열 반환
      (fs.readFileSync as Mock).mockReturnValue('{ 잘못된 JSON 형식 }');

      const request = createRequest();
      const response = await GET(request as any) as unknown as MockedResponse;

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('로그 조회 중 오류가 발생했습니다');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('빈 로그 배열에서도 올바르게 동작한다', async () => {
      (fs.existsSync as Mock).mockReturnValue(true);
      // 빈 로그 배열 반환
      (fs.readFileSync as Mock).mockReturnValue('[]');

      const request = createRequest();
      const response = await GET(request as any) as unknown as MockedResponse;

      expect(response.status).toBe(200);
      expect(response.body.logs).toEqual([]);
      expect(response.body.total).toBe(0);
      expect(response.body.filtered).toBe(0);
      expect(response.body.modules).toEqual([]);
      expect(response.body.sessionIds).toEqual([]);
    });
  });
}); 