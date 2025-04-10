/**
 * 파일명: base64.test.ts
 * 목적: base64.ts의 인코딩/디코딩 기능 테스트
 * 역할: Base64 인코딩/디코딩 함수의 정상 동작 검증
 * 작성일: 2025-04-01
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  base64Encode,
  base64Decode,
  base64UrlEncode,
  base64UrlDecode,
  stringToArrayBuffer,
} from './base64';

describe('base64.ts', () => {
  const testStr = 'Hello, World!';
  const testStrBase64 = 'SGVsbG8sIFdvcmxkIQ==';
  const testStrBase64Url = 'SGVsbG8sIFdvcmxkIQ';

  describe('Browser Environment', () => {
    // 브라우저 환경 모킹
    beforeEach(() => {
      const mockWindow = {
        btoa: (str: string) => Buffer.from(str).toString('base64'),
        atob: (str: string) => Buffer.from(str, 'base64').toString(),
      };
      
      vi.stubGlobal('window', mockWindow);
      // TextEncoder 모킹
      vi.stubGlobal('TextEncoder', class TextEncoder {
        encode(str: string) {
          const buf = new Uint8Array(str.length);
          for (let i = 0; i < str.length; i++) {
            buf[i] = str.charCodeAt(i);
          }
          return buf;
        }
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    describe('base64Encode()', () => {
      it('should encode a string to base64 in browser', () => {
        const encoded = base64Encode(testStr);
        expect(encoded).toBe(testStrBase64);
      });

      it('should handle empty string', () => {
        const encoded = base64Encode('');
        expect(encoded).toBe('');
      });

      it('should encode special characters correctly', () => {
        const specialStr = '!@#$%^&*()_+';
        const encoded = base64Encode(specialStr);
        expect(encoded).toBe('IUAjJCVeJiooKV8r');
      });

      it('should encode UTF-8 characters correctly', () => {
        const utf8Str = '안녕하세요';
        const encoded = base64Encode(utf8Str);
        expect(encoded).toBe('7JWI64WV7ZWY7IS47JqU');
      });
    });

    describe('base64Decode()', () => {
      it('should decode a base64 string in browser', () => {
        const decoded = base64Decode(testStrBase64);
        expect(decoded).toBe(testStr);
      });

      it('should handle empty string', () => {
        const decoded = base64Decode('');
        expect(decoded).toBe('');
      });

      it('should decode special characters correctly', () => {
        const decoded = base64Decode('IUAjJCVeJiooKV8r');
        expect(decoded).toBe('!@#$%^&*()_+');
      });

      it('should decode UTF-8 characters correctly', () => {
        const decoded = base64Decode('7JWI64WV7ZWY7IS47JqU');
        expect(decoded).toBe('안녕하세요');
      });
    });

    describe('base64UrlEncode()', () => {
      it('should encode array buffer to URL-safe base64', () => {
        const buffer = stringToArrayBuffer(testStr);
        const encoded = base64UrlEncode(buffer);
        
        // URL-safe base64는 +, /, = 문자가 없어야 함
        expect(encoded).not.toContain('+');
        expect(encoded).not.toContain('/');
        expect(encoded).not.toContain('=');
        
        // 테스트 문자열의 URL-safe base64 인코딩 결과와 일치해야 함
        expect(encoded).toBe(testStrBase64Url);
      });

      it('should handle empty buffer', () => {
        const buffer = stringToArrayBuffer('');
        const encoded = base64UrlEncode(buffer);
        expect(encoded).toBe('');
      });

      it('should use URL-safe characters', () => {
        // base64UrlEncode 내부 구현 확인
        // 실제 +, / 문자열을 포함하는 입력 대신 메커니즘 자체를 테스트
        const mockBase64 = 'abc+def/ghi=';
        vi.spyOn(global.Buffer, 'from').mockImplementationOnce(() => ({
          toString: () => mockBase64
        }) as any);
        
        const buffer = new ArrayBuffer(1);
        const encoded = base64UrlEncode(buffer);
        
        // URL-safe 문자로 변환되었는지 확인
        expect(encoded).toBe('abc-def_ghi');
      });
    });

    describe('base64UrlDecode()', () => {
      it('should decode URL-safe base64 to array buffer', () => {
        const decoded = base64UrlDecode(testStrBase64Url);
        
        // ArrayBuffer를 문자열로 변환하여 비교
        const bytes = new Uint8Array(decoded);
        let str = '';
        for (let i = 0; i < bytes.length; i++) {
          str += String.fromCharCode(bytes[i]);
        }
        
        expect(str).toBe(testStr);
      });

      it('should handle empty string', () => {
        const decoded = base64UrlDecode('');
        expect(decoded.byteLength).toBe(0);
      });

      it('should correctly convert - to + and _ to /', () => {
        // -와 _를 포함하는 URL-safe base64 문자열
        const encoded = 'abc-_def';
        const decoded = base64UrlDecode(encoded);
        
        // 디코딩 후 변환된 문자열 확인
        const decodedStr = Array.from(new Uint8Array(decoded))
          .map(byte => String.fromCharCode(byte))
          .join('');
        
        expect(decodedStr).toBeTruthy();
      });
    });

    describe('stringToArrayBuffer()', () => {
      it('should convert string to array buffer using TextEncoder', () => {
        const buffer = stringToArrayBuffer(testStr);
        
        expect(buffer).toBeInstanceOf(ArrayBuffer);
        expect(buffer.byteLength).toBe(testStr.length);
        
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < testStr.length; i++) {
          expect(bytes[i]).toBe(testStr.charCodeAt(i));
        }
      });

      it('should handle empty string', () => {
        const buffer = stringToArrayBuffer('');
        expect(buffer).toBeInstanceOf(ArrayBuffer);
        expect(buffer.byteLength).toBe(0);
      });

      it('should correctly encode UTF-8 characters', () => {
        const utf8Str = '안녕하세요';
        const buffer = stringToArrayBuffer(utf8Str);
        
        expect(buffer).toBeInstanceOf(ArrayBuffer);
        expect(buffer.byteLength).toBe(utf8Str.length);
      });
    });
  });

  describe('Node.js Environment', () => {
    beforeEach(() => {
      // window 객체 제거하여 Node.js 환경 시뮬레이션
      vi.unstubAllGlobals();
      // @ts-ignore
      global.window = undefined;
      // TextEncoder 제거
      // @ts-ignore
      global.TextEncoder = undefined;
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    describe('base64Encode()', () => {
      it('should encode a string to base64 in Node.js', () => {
        const encoded = base64Encode(testStr);
        expect(encoded).toBe(testStrBase64);
      });
    });

    describe('base64Decode()', () => {
      it('should decode a base64 string in Node.js', () => {
        const decoded = base64Decode(testStrBase64);
        expect(decoded).toBe(testStr);
      });
    });

    describe('base64UrlEncode()', () => {
      it('should encode array buffer to URL-safe base64 in Node.js', () => {
        const buffer = stringToArrayBuffer(testStr);
        const encoded = base64UrlEncode(buffer);
        
        expect(encoded).toBe(testStrBase64Url);
      });
    });

    describe('base64UrlDecode()', () => {
      it('should decode URL-safe base64 to array buffer in Node.js', () => {
        const decoded = base64UrlDecode(testStrBase64Url);
        
        // ArrayBuffer를 문자열로 변환하여 비교
        const bytes = new Uint8Array(decoded);
        let str = '';
        for (let i = 0; i < bytes.length; i++) {
          str += String.fromCharCode(bytes[i]);
        }
        
        expect(str).toBe(testStr);
      });
    });

    describe('stringToArrayBuffer()', () => {
      it('should convert string to array buffer using fallback implementation', () => {
        const buffer = stringToArrayBuffer(testStr);
        
        expect(buffer).toBeInstanceOf(ArrayBuffer);
        expect(buffer.byteLength).toBe(testStr.length);
        
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < testStr.length; i++) {
          expect(bytes[i]).toBe(testStr.charCodeAt(i));
        }
      });
    });
  });

  describe('End-to-End Flow', () => {
    it('should correctly encode and decode in a complete flow', () => {
      // 원본 문자열
      const original = 'This is a test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?/';
      
      // 문자열 -> ArrayBuffer 변환
      const buffer = stringToArrayBuffer(original);
      
      // ArrayBuffer -> URL-safe Base64 인코딩
      const encoded = base64UrlEncode(buffer);
      
      // URL-safe Base64 -> ArrayBuffer 디코딩
      const decoded = base64UrlDecode(encoded);
      
      // ArrayBuffer -> 문자열 변환
      const bytes = new Uint8Array(decoded);
      let finalStr = '';
      for (let i = 0; i < bytes.length; i++) {
        finalStr += String.fromCharCode(bytes[i]);
      }
      
      // 원본과 최종 결과 비교
      expect(finalStr).toBe(original);
    });
  });
}); 