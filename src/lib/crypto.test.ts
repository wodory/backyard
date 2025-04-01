/**
 * 파일명: crypto.test.ts
 * 목적: crypto.ts의 암호화/복호화 기능 테스트
 * 역할: 토큰 암호화/복호화 함수의 정상 동작 검증
 * 작성일: 2024-04-01
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { encryptValue, decryptValue, encryptToken, decryptToken } from './crypto';

describe('crypto.ts', () => {
  describe('encryptValue()', () => {
    it('should encrypt a value with a given key', () => {
      const key = 'testKey';
      const value = 'testValue';
      const encrypted = encryptValue(key, value);
      
      expect(encrypted).toBe('encrypted_testValue');
      expect(encrypted).not.toBe(value);
    });

    it('should handle empty string value', () => {
      const key = 'testKey';
      const value = '';
      const encrypted = encryptValue(key, value);
      
      expect(encrypted).toBe('encrypted_');
    });

    it('should handle special characters', () => {
      const key = 'testKey';
      const value = '!@#$%^&*()';
      const encrypted = encryptValue(key, value);
      
      expect(encrypted).toBe('encrypted_!@#$%^&*()');
    });
  });

  describe('decryptValue()', () => {
    it('should decrypt an encrypted value with a given key', () => {
      const key = 'testKey';
      const value = 'testValue';
      const encrypted = encryptValue(key, value);
      const decrypted = decryptValue(key, encrypted);
      
      expect(decrypted).toBe(value);
    });

    it('should handle empty string value', () => {
      const key = 'testKey';
      const encrypted = 'encrypted_';
      const decrypted = decryptValue(key, encrypted);
      
      expect(decrypted).toBe('');
    });

    it('should handle special characters', () => {
      const key = 'testKey';
      const value = '!@#$%^&*()';
      const encrypted = encryptValue(key, value);
      const decrypted = decryptValue(key, encrypted);
      
      expect(decrypted).toBe(value);
    });

    it('should handle non-encrypted values gracefully', () => {
      const key = 'testKey';
      const value = 'nonEncryptedValue';
      const decrypted = decryptValue(key, value);
      
      expect(decrypted).toBe(value);
    });
  });

  describe('Token encryption aliases', () => {
    it('encryptToken should use "token" as key', () => {
      const token = 'myAuthToken';
      const encrypted = encryptToken(token);
      const manuallyEncrypted = encryptValue('token', token);
      
      expect(encrypted).toBe(manuallyEncrypted);
    });

    it('decryptToken should use "token" as key', () => {
      const token = 'myAuthToken';
      const encrypted = encryptToken(token);
      const decrypted = decryptToken(encrypted);
      const manuallyDecrypted = decryptValue('token', encrypted);
      
      expect(decrypted).toBe(manuallyDecrypted);
      expect(decrypted).toBe(token);
    });

    it('token encryption/decryption flow should work end-to-end', () => {
      const originalToken = 'myAuthToken123!@#';
      const encrypted = encryptToken(originalToken);
      const decrypted = decryptToken(encrypted);
      
      expect(encrypted).not.toBe(originalToken);
      expect(decrypted).toBe(originalToken);
    });
  });
}); 