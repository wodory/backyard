/**
 * 파일명: src/lib/environment.test.ts
 * 목적: environment.ts 모듈의 환경 감지 및 조건부 실행 함수 테스트
 * 역할: 클라이언트/서버 환경 감지 및 각 환경별 코드 실행 로직 검증
 * 작성일: 2025-04-07
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  isClient,
  isServer,
  executeOnClient,
  executeOnServer,
  getEnvironment,
  runInEnvironment
} from './environment';

// 원본 전역 객체 백업 (테스트 후 복원을 위해)
const originalWindow = global.window;
const originalProcess = global.process;

describe('environment.ts', () => {
  // 환경 설정 초기화 및 복원
  afterEach(() => {
    // 테스트 간 독립성을 위해 모든 모킹과 전역 객체 초기화
    vi.unstubAllGlobals();
    vi.resetAllMocks();

    // 명시적 전역 객체 복원 (안전을 위해 추가)
    global.window = originalWindow;
  });

  describe('클라이언트 환경 시뮬레이션', () => {
    beforeEach(() => {
      // 클라이언트 환경 시뮬레이션 (window 객체 존재)
      vi.stubGlobal('window', { document: {} });
    });

    describe('isClient()', () => {
      it('window 객체가 존재하면 true를 반환해야 함', () => {
        expect(isClient()).toBe(true);
      });
    });

    describe('isServer()', () => {
      it('window 객체가 존재하면 false를 반환해야 함', () => {
        expect(isServer()).toBe(false);
      });
    });

    describe('getEnvironment()', () => {
      it('window 객체가 존재하면 "client"를 반환해야 함', () => {
        expect(getEnvironment()).toBe('client');
      });
    });

    describe('executeOnClient()', () => {
      it('클라이언트 환경에서 콜백 함수를 실행하고 결과를 반환해야 함', () => {
        const mockFn = vi.fn(() => 'client-result');
        
        const result = executeOnClient(mockFn);
        
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(result).toBe('client-result');
      });

      it('콜백이 값을 반환하지 않아도 정상 작동해야 함', () => {
        const mockFn = vi.fn(() => {
          // 반환값 없음
        });
        
        const result = executeOnClient(mockFn);
        
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(result).toBeUndefined();
      });
    });

    describe('executeOnServer()', () => {
      it('클라이언트 환경에서는 콜백 함수를 실행하지 않고 undefined를 반환해야 함', () => {
        const mockFn = vi.fn(() => 'server-result');
        
        const result = executeOnServer(mockFn);
        
        expect(mockFn).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
      });
    });

    describe('runInEnvironment()', () => {
      it('클라이언트 환경에서는 client 콜백을 실행해야 함', () => {
        const clientFn = vi.fn(() => 'client-result');
        const serverFn = vi.fn(() => 'server-result');
        
        const result = runInEnvironment({
          client: clientFn,
          server: serverFn
        });
        
        expect(clientFn).toHaveBeenCalledTimes(1);
        expect(serverFn).not.toHaveBeenCalled();
        expect(result).toBe('client-result');
      });

      it('client 콜백이 없으면 undefined를 반환해야 함', () => {
        const serverFn = vi.fn(() => 'server-result');
        
        const result = runInEnvironment({
          server: serverFn
        });
        
        expect(serverFn).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
      });

      it('빈 객체가 전달되면 undefined를 반환해야 함', () => {
        const result = runInEnvironment({});
        
        expect(result).toBeUndefined();
      });
    });
  });

  describe('서버 환경 시뮬레이션', () => {
    beforeEach(() => {
      // 서버 환경 시뮬레이션 (window 객체 제거)
      vi.stubGlobal('window', undefined);
      
      // Node.js 환경 시뮬레이션 (필요한 경우)
      vi.stubGlobal('process', { 
        versions: { node: 'v18.0.0' },
        env: {
          // 필요한 환경 변수 설정
        }
      });
    });

    describe('isClient()', () => {
      it('window 객체가 없으면 false를 반환해야 함', () => {
        expect(isClient()).toBe(false);
      });
    });

    describe('isServer()', () => {
      it('window 객체가 없으면 true를 반환해야 함', () => {
        expect(isServer()).toBe(true);
      });
    });

    describe('getEnvironment()', () => {
      it('window 객체가 없으면 "server"를 반환해야 함', () => {
        expect(getEnvironment()).toBe('server');
      });
    });

    describe('executeOnClient()', () => {
      it('서버 환경에서는 콜백 함수를 실행하지 않고 undefined를 반환해야 함', () => {
        const mockFn = vi.fn(() => 'client-result');
        
        const result = executeOnClient(mockFn);
        
        expect(mockFn).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
      });
    });

    describe('executeOnServer()', () => {
      it('서버 환경에서 콜백 함수를 실행하고 결과를 반환해야 함', () => {
        const mockFn = vi.fn(() => 'server-result');
        
        const result = executeOnServer(mockFn);
        
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(result).toBe('server-result');
      });

      it('콜백이 값을 반환하지 않아도 정상 작동해야 함', () => {
        const mockFn = vi.fn(() => {
          // 반환값 없음
        });
        
        const result = executeOnServer(mockFn);
        
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(result).toBeUndefined();
      });
    });

    describe('runInEnvironment()', () => {
      it('서버 환경에서는 server 콜백을 실행해야 함', () => {
        const clientFn = vi.fn(() => 'client-result');
        const serverFn = vi.fn(() => 'server-result');
        
        const result = runInEnvironment({
          client: clientFn,
          server: serverFn
        });
        
        expect(serverFn).toHaveBeenCalledTimes(1);
        expect(clientFn).not.toHaveBeenCalled();
        expect(result).toBe('server-result');
      });

      it('server 콜백이 없으면 undefined를 반환해야 함', () => {
        const clientFn = vi.fn(() => 'client-result');
        
        const result = runInEnvironment({
          client: clientFn
        });
        
        expect(clientFn).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
      });
    });
  });
}); 