/**
 * 파일명: route.test.ts
 * 목적: 로그 조회 API 엔드포인트 테스트
 * 역할: GET /api/logs/view 엔드포인트에 대한 다양한 시나리오의 단위 테스트
 * 작성일: 2024-05-23
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// 모의된 응답 타입
type MockedResponse = {
  body: any;
  options?: { status?: number };
};

// 모의된 요청 타입
type MockRequest = {
  url: string;
  nextUrl: {
    searchParams: URLSearchParams;
  };
};

// fs 모듈 모킹
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn()
  },
  existsSync: vi.fn(),
  readFileSync: vi.fn()
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
    json: vi.fn((body, options) => ({ body, options }))
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
import fs from 'fs';
import { NextResponse } from 'next/server';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';

// 환경 변수 모킹 - 직접 process.env를 수정하지 않고 vi.stubEnv 사용
describe('로그 조회 API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 환경 변수 모킹
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('LOG_DIR', 'logs');
  });

  afterAll(() => {
    // 환경 변수 모킹 제거
    vi.unstubAllEnvs();
  });

  describe('GET /api/logs/view', () => {
    it('개발 환경에서 로그 파일이 없는 경우 404를 반환한다', async () => {
      // 로그 파일이 없는 상황 설정
      (fs.existsSync as any).mockReturnValue(false);
      
      // API 요청 실행
      const request: MockRequest = {
        url: 'http://localhost/api/logs/view',
        nextUrl: { searchParams: new URLSearchParams() }
      };
      const response = await GET(request as any) as unknown as MockedResponse;
      
      // 결과 확인
      expect(fs.existsSync).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: '로그 파일이 존재하지 않습니다.' },
        { status: 404 }
      );
      expect(response.body).toEqual({ error: '로그 파일이 존재하지 않습니다.' });
      expect(response.options).toEqual({ status: 404 });
    });
    
    it('로그 파일을 성공적으로 읽고 필터링 없이 반환한다', async () => {
      // 로그 파일 존재
      (fs.existsSync as any).mockReturnValue(true);
      
      // 샘플 로그 데이터
      const sampleLogs = [
        { module: 'auth', level: 'info', timestamp: '2024-05-23T10:00:00Z', message: '로그인 성공', sessionId: 'session1' },
        { module: 'api', level: 'error', timestamp: '2024-05-23T09:00:00Z', message: 'API 오류', sessionId: 'session1' },
        { module: 'auth', level: 'warn', timestamp: '2024-05-23T08:00:00Z', message: '인증 만료', sessionId: 'session2' }
      ];
      
      // 로그 파일 읽기
      (fs.readFileSync as any).mockReturnValue(JSON.stringify(sampleLogs));
      
      // API 요청 실행
      const request: MockRequest = {
        url: 'http://localhost/api/logs/view',
        nextUrl: { searchParams: new URLSearchParams() }
      };
      const response = await GET(request as any) as unknown as MockedResponse;
      
      // 결과 확인
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalled();
      
      // 정렬된 로그 (최신순)
      const expectedLogs = [
        { module: 'auth', level: 'info', timestamp: '2024-05-23T10:00:00Z', message: '로그인 성공', sessionId: 'session1' },
        { module: 'api', level: 'error', timestamp: '2024-05-23T09:00:00Z', message: 'API 오류', sessionId: 'session1' },
        { module: 'auth', level: 'warn', timestamp: '2024-05-23T08:00:00Z', message: '인증 만료', sessionId: 'session2' }
      ];
      
      expect(response.body).toEqual({
        logs: expectedLogs,
        total: 3,
        filtered: 3,
        modules: ['auth', 'api'],
        sessionIds: ['session1', 'session2']
      });
    });
    
    it('모듈 파라미터로 로그를 필터링한다', async () => {
      // 로그 파일 존재
      (fs.existsSync as any).mockReturnValue(true);
      
      // 샘플 로그 데이터
      const sampleLogs = [
        { module: 'auth', level: 'info', timestamp: '2024-05-23T10:00:00Z', message: '로그인 성공', sessionId: 'session1' },
        { module: 'api', level: 'error', timestamp: '2024-05-23T09:00:00Z', message: 'API 오류', sessionId: 'session1' },
        { module: 'auth', level: 'warn', timestamp: '2024-05-23T08:00:00Z', message: '인증 만료', sessionId: 'session2' }
      ];
      
      // 로그 파일 읽기
      (fs.readFileSync as any).mockReturnValue(JSON.stringify(sampleLogs));
      
      // 모듈 필터링 URL 파라미터 설정
      const searchParams = new URLSearchParams();
      searchParams.set('module', 'auth');
      
      // API 요청 실행
      const request: MockRequest = {
        url: 'http://localhost/api/logs/view?module=auth',
        nextUrl: { searchParams }
      };
      const response = await GET(request as any) as unknown as MockedResponse;
      
      // 결과 확인
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalled();
      
      // auth 모듈만 필터링된 로그 (최신순)
      const expectedLogs = [
        { module: 'auth', level: 'info', timestamp: '2024-05-23T10:00:00Z', message: '로그인 성공', sessionId: 'session1' },
        { module: 'auth', level: 'warn', timestamp: '2024-05-23T08:00:00Z', message: '인증 만료', sessionId: 'session2' }
      ];
      
      expect(response.body).toEqual({
        logs: expectedLogs,
        total: 3,
        filtered: 2,
        modules: ['auth', 'api'],
        sessionIds: ['session1', 'session2']
      });
    });
    
    it('프로덕션 환경에서 인증되지 않은 경우 401을 반환한다', async () => {
      // 프로덕션 환경 모킹
      vi.stubEnv('NODE_ENV', 'production');
      
      // 인증되지 않은 세션
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: null } })
        }
      };
      (createBrowserSupabaseClient as any).mockReturnValue(mockSupabase);
      
      // API 요청 실행
      const request: MockRequest = {
        url: 'http://localhost/api/logs/view',
        nextUrl: { searchParams: new URLSearchParams() }
      };
      const response = await GET(request as any) as unknown as MockedResponse;
      
      // 결과 확인
      expect(mockSupabase.auth.getSession).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
      expect(response.body).toEqual({ error: '인증이 필요합니다.' });
      expect(response.options).toEqual({ status: 401 });
    });
    
    it('파일 읽기 중 오류 발생 시 500 오류를 반환한다', async () => {
      // 로그 파일 존재
      (fs.existsSync as any).mockReturnValue(true);
      
      // 파일 읽기 오류 설정
      const errorMessage = '파일을 읽을 수 없습니다';
      (fs.readFileSync as any).mockImplementation(() => {
        throw new Error(errorMessage);
      });
      
      // 콘솔 에러 모킹
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // API 요청 실행
      const request: MockRequest = {
        url: 'http://localhost/api/logs/view',
        nextUrl: { searchParams: new URLSearchParams() }
      };
      const response = await GET(request as any) as unknown as MockedResponse;
      
      // 결과 확인
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('로그 조회 오류:', expect.any(Error));
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: `로그 조회 중 오류가 발생했습니다: ${errorMessage}` },
        { status: 500 }
      );
      expect(response.body).toEqual({ error: `로그 조회 중 오류가 발생했습니다: ${errorMessage}` });
      expect(response.options).toEqual({ status: 500 });
      
      // 스파이 정리
      consoleSpy.mockRestore();
    });
  });
}); 