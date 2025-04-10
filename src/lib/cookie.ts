/**
 * 파일명: src/lib/cookie.ts
 * 목적: 크로스 도메인 쿠키 관리 유틸리티 제공
 * 역할: 쿠키 설정, 조회, 삭제 기능 제공
 * 작성일: 2025-03-27
 */

import { createLogger } from './logger';

const logger = createLogger('Cookie');

/**
 * 쿠키 설정
 * @param name 쿠키 이름
 * @param value 쿠키 값
 * @param options 쿠키 옵션
 */
export function setCookie(
  name: string,
  value: string,
  options: {
    days?: number;
    path?: string;
    domain?: string;
    sameSite?: 'strict' | 'lax' | 'none';
    secure?: boolean;
  } = {}
): void {
  if (typeof document === 'undefined') {
    logger.warn('Document is not available - 쿠키를 설정할 수 없습니다');
    return;
  }

  const { days = 7, path = '/', domain, sameSite = 'lax', secure = false } = options;

  // 만료일 계산
  const expiresDate = new Date();
  expiresDate.setTime(expiresDate.getTime() + days * 24 * 60 * 60 * 1000);

  // 쿠키 문자열 구성
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expiresDate.toUTCString()}; path=${path}`;

  // 도메인 추가 (있는 경우)
  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  // SameSite 추가
  cookieString += `; samesite=${sameSite}`;

  // Secure 추가 (SameSite=None일 경우 필수)
  if (secure || sameSite === 'none') {
    cookieString += '; secure';
  }

  // 쿠키 설정
  document.cookie = cookieString;
  logger.debug(`쿠키 설정: ${name}`, { days, path, domain, sameSite, secure });
}

/**
 * 쿠키 값 조회
 * @param name 쿠키 이름
 * @returns 쿠키 값 또는 null
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    logger.warn('Document is not available - 쿠키를 조회할 수 없습니다');
    return null;
  }

  const nameEQ = encodeURIComponent(name) + '=';
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }

  return null;
}

/**
 * 쿠키 삭제
 * @param name 쿠키 이름
 * @param options 쿠키 옵션
 */
export function deleteCookie(
  name: string,
  options: {
    path?: string;
    domain?: string;
  } = {}
): void {
  if (typeof document === 'undefined') {
    logger.warn('Document is not available - 쿠키를 삭제할 수 없습니다');
    return;
  }

  const { path = '/', domain } = options;

  // 과거 날짜로 설정하여 삭제
  setCookie(name, '', {
    days: -1,
    path,
    domain,
    sameSite: 'lax',
  });

  logger.debug(`쿠키 삭제: ${name}`, { path, domain });
}

/**
 * 인증 관련 쿠키 설정 (크로스 도메인 지원)
 * @param name 쿠키 이름
 * @param value 쿠키 값
 * @param days 유효 기간 (일)
 */
export function setAuthCookie(name: string, value: string, days = 7): void {
  setCookie(name, value, {
    days,
    path: '/',
    sameSite: 'none', // 크로스 도메인 요청 허용
    secure: true, // HTTPS 필수
  });
}

/**
 * 인증 관련 쿠키 조회
 * @param name 쿠키 이름
 * @returns 쿠키 값 또는 null
 */
export function getAuthCookie(name: string): string | null {
  return getCookie(name);
}

/**
 * 인증 관련 쿠키 삭제
 * @param name 쿠키 이름
 */
export function deleteAuthCookie(name: string): void {
  deleteCookie(name, {
    path: '/',
  });
} 