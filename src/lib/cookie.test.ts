/**
 * 파일명: cookie.test.ts
 * 목적: cookie.ts의 쿠키 관리 기능 테스트
 * 역할: 쿠키 설정, 조회, 삭제 기능의 정상 동작 검증
 * 작성일: 2025-04-01
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { setCookie, getCookie, deleteCookie, setAuthCookie, getAuthCookie, deleteAuthCookie } from './cookie';
import { createLogger } from './logger';

// Logger 모킹
vi.mock('./logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('cookie.ts', () => {
  // document 객체 모킹을 위한 설정
  let cookieStore: string[] = [];
  const mockDocument = {
    get cookie() {
      return cookieStore.join('; ');
    },
    set cookie(value: string) {
      cookieStore.push(value);
    },
  };

  beforeEach(() => {
    // 각 테스트 전에 초기화
    cookieStore = [];
    vi.stubGlobal('document', mockDocument);
  });

  afterEach(() => {
    // 각 테스트 후에 모킹 초기화
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('setCookie()', () => {
    it('should set a cookie with default options', () => {
      setCookie('testName', 'testValue');
      
      const lastCookie = cookieStore[cookieStore.length - 1];
      expect(lastCookie).toContain('testName=testValue');
      expect(lastCookie).toContain('path=/');
      expect(lastCookie).toContain('samesite=lax');
    });

    it('should set a cookie with custom options', () => {
      setCookie('testName', 'testValue', {
        days: 14,
        path: '/test',
        domain: 'example.com',
        sameSite: 'strict',
        secure: true,
      });

      const lastCookie = cookieStore[cookieStore.length - 1];
      expect(lastCookie).toContain('testName=testValue');
      expect(lastCookie).toContain('path=/test');
      expect(lastCookie).toContain('domain=example.com');
      expect(lastCookie).toContain('samesite=strict');
      expect(lastCookie).toContain('secure');
    });

    it('should handle special characters in name and value', () => {
      const name = 'test@name';
      const value = 'test value!@#$%';
      
      setCookie(name, value);
      
      const lastCookie = cookieStore[cookieStore.length - 1];
      expect(lastCookie).toContain(
        `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
      );
    });

    it('should force secure flag when sameSite is none', () => {
      setCookie('testName', 'testValue', {
        sameSite: 'none',
        secure: false, // Even if secure is false
      });

      const lastCookie = cookieStore[cookieStore.length - 1];
      expect(lastCookie).toContain('secure');
    });
  });

  describe('getCookie()', () => {
    it('should return null when cookie does not exist', () => {
      const value = getCookie('nonexistent');
      expect(value).toBeNull();
    });

    it('should return cookie value when cookie exists', () => {
      mockDocument.cookie = 'testName=testValue; path=/';
      const value = getCookie('testName');
      expect(value).toBe('testValue');
    });

    it('should handle multiple cookies', () => {
      mockDocument.cookie = 'first=value1; path=/';
      mockDocument.cookie = 'second=value2; path=/';
      
      expect(getCookie('first')).toBe('value1');
      expect(getCookie('second')).toBe('value2');
    });

    it('should handle encoded values', () => {
      const encodedValue = encodeURIComponent('test value!@#$%');
      mockDocument.cookie = `testName=${encodedValue}; path=/`;
      
      expect(getCookie('testName')).toBe('test value!@#$%');
    });
  });

  describe('deleteCookie()', () => {
    it('should delete a cookie by setting expired date', () => {
      // 먼저 쿠키 설정
      setCookie('testName', 'testValue');
      expect(cookieStore[cookieStore.length - 1]).toContain('testName=testValue');

      // 쿠키 삭제
      deleteCookie('testName');
      
      // 만료된 날짜가 설정되었는지 확인
      const lastCookie = cookieStore[cookieStore.length - 1];
      expect(lastCookie).toContain('expires=');
      expect(lastCookie).toContain('testName=');
    });

    it('should delete a cookie with custom path and domain', () => {
      deleteCookie('testName', {
        path: '/custom',
        domain: 'example.com',
      });

      const lastCookie = cookieStore[cookieStore.length - 1];
      expect(lastCookie).toContain('path=/custom');
      expect(lastCookie).toContain('domain=example.com');
    });
  });

  describe('Auth Cookie Functions', () => {
    it('setAuthCookie should set cookie with correct security options', () => {
      setAuthCookie('authToken', 'token123');
      
      const lastCookie = cookieStore[cookieStore.length - 1];
      expect(lastCookie).toContain('authToken=token123');
      expect(lastCookie).toContain('samesite=none');
      expect(lastCookie).toContain('secure');
      expect(lastCookie).toContain('path=/');
    });

    it('getAuthCookie should retrieve auth cookie value', () => {
      // Auth 쿠키 설정
      setAuthCookie('authToken', 'token123');
      
      const value = getAuthCookie('authToken');
      expect(value).toBe('token123');
    });

    it('deleteAuthCookie should remove auth cookie', () => {
      // 먼저 Auth 쿠키 설정
      setAuthCookie('authToken', 'token123');
      expect(cookieStore[cookieStore.length - 1]).toContain('authToken=token123');

      // Auth 쿠키 삭제
      deleteAuthCookie('authToken');
      
      // 만료된 날짜가 설정되었는지 확인
      const lastCookie = cookieStore[cookieStore.length - 1];
      expect(lastCookie).toContain('expires=');
      expect(lastCookie).toContain('path=/');
    });
  });

  describe('Browser Environment Handling', () => {
    beforeEach(() => {
      vi.unstubAllGlobals(); // document 객체 제거
      // @ts-ignore
      global.document = undefined;
    });

    it('should handle undefined document gracefully in setCookie', () => {
      setCookie('test', 'value');
      // 에러가 발생하지 않아야 함
    });

    it('should handle undefined document gracefully in getCookie', () => {
      const value = getCookie('test');
      expect(value).toBeNull();
    });

    it('should handle undefined document gracefully in deleteCookie', () => {
      deleteCookie('test');
      // 에러가 발생하지 않아야 함
    });
  });
}); 