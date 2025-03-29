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
vi.mock('@/lib/supabase-browser', () => ({
  createBrowserSupabaseClient: vi.fn(() => ({
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
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';

describe('로그 조회 API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('LOG_DIR', 'logs');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  describe('GET /api/logs/view', () => {
    it('개발 환경에서 로그 파일이 없는 경우 404를 반환한다', async () => {
      (fs.existsSync as Mock).mockReturnValue(false);

      const request: MockRequest = {
        url: 'http://localhost/api/logs/view',
        nextUrl: { searchParams: new URLSearchParams() },
      };
      const response = await GET(request as any) as unknown as MockedResponse;

      expect(fs.existsSync).toHaveBeenCalled();
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: '로그 파일이 존재하지 않습니다.' });
    });

    it('로그 파일을 성공적으로 읽고 필터링 없이 반환한다', async () => {
      (fs.existsSync as Mock).mockReturnValue(true);

      const sampleLogs = [
        { module: 'auth', level: 'info', timestamp: '2024-03-30T10:00:00Z', message: '로그인 성공', sessionId: 'session1' },
        { module: 'api', level: 'error', timestamp: '2024-03-30T09:00:00Z', message: 'API 오류', sessionId: 'session1' },
        { module: 'auth', level: 'warn', timestamp: '2024-03-30T08:00:00Z', message: '인증 만료', sessionId: 'session2' },
      ];

      (fs.readFileSync as Mock).mockReturnValue(JSON.stringify(sampleLogs));

      const request: MockRequest = {
        url: 'http://localhost/api/logs/view',
        nextUrl: { searchParams: new URLSearchParams() },
      };
      const response = await GET(request as any) as unknown as MockedResponse;

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        logs: sampleLogs,
        total: 3,
        filtered: 3,
        modules: ['auth', 'api'],
        sessionIds: ['session1', 'session2'],
      });
    });

    it('모듈 파라미터로 로그를 필터링한다', async () => {
      (fs.existsSync as Mock).mockReturnValue(true);

      const sampleLogs = [
        { module: 'auth', level: 'info', timestamp: '2024-03-30T10:00:00Z', message: '로그인 성공', sessionId: 'session1' },
        { module: 'api', level: 'error', timestamp: '2024-03-30T09:00:00Z', message: 'API 오류', sessionId: 'session1' },
        { module: 'auth', level: 'warn', timestamp: '2024-03-30T08:00:00Z', message: '인증 만료', sessionId: 'session2' },
      ];

      (fs.readFileSync as Mock).mockReturnValue(JSON.stringify(sampleLogs));

      const searchParams = new URLSearchParams();
      searchParams.set('module', 'auth');

      const request: MockRequest = {
        url: 'http://localhost/api/logs/view?module=auth',
        nextUrl: { searchParams },
      };
      const response = await GET(request as any) as unknown as MockedResponse;

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        logs: sampleLogs.filter(log => log.module === 'auth'),
        total: 3,
        filtered: 2,
        modules: ['auth', 'api'],
        sessionIds: ['session1', 'session2'],
      });
    });

    it('파일 읽기 중 오류 발생 시 500 오류를 반환한다', async () => {
      (fs.existsSync as Mock).mockReturnValue(true);
      (fs.readFileSync as Mock).mockImplementation(() => {
        throw new Error('파일을 읽을 수 없습니다');
      });

      const request: MockRequest = {
        url: 'http://localhost/api/logs/view',
        nextUrl: { searchParams: new URLSearchParams() },
      };
      const response = await GET(request as any) as unknown as MockedResponse;

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: '로그 조회 중 오류가 발생했습니다: 파일을 읽을 수 없습니다',
      });
    });
  });
}); 