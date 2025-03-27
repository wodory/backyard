/**
 * 파일명: base64.ts
 * 목적: Base64 인코딩 유틸리티
 * 역할: 일반 및 URL-safe Base64 인코딩/디코딩 기능 제공
 * 작성일: 2024-03-26
 */

/**
 * base64Encode: 문자열을 Base64로 인코딩
 * @param {string} str - 인코딩할 문자열
 * @returns {string} Base64 인코딩된 문자열
 */
export const base64Encode = (str: string): string => {
  if (typeof window !== 'undefined') {
    // 브라우저 환경
    return window.btoa(str);
  } else {
    // Node.js 환경
    return Buffer.from(str).toString('base64');
  }
};

/**
 * base64Decode: Base64 문자열을 디코딩
 * @param {string} str - 디코딩할 Base64 문자열
 * @returns {string} 디코딩된 문자열
 */
export const base64Decode = (str: string): string => {
  if (typeof window !== 'undefined') {
    // 브라우저 환경
    return window.atob(str);
  } else {
    // Node.js 환경
    return Buffer.from(str, 'base64').toString();
  }
};

/**
 * base64UrlEncode: ArrayBuffer를 URL 안전한 Base64 문자열로 인코딩
 * - RFC 7636에 따라 code_challenge를 위한 포맷으로 인코딩
 * - `+` -> `-`, `/` -> `_`, 패딩 문자(`=`) 제거
 * @param {ArrayBufferLike} buffer - 인코딩할 ArrayBuffer
 * @returns {string} URL 안전한 Base64 문자열
 */
export const base64UrlEncode = (buffer: ArrayBufferLike): string => {
  let base64 = '';
  
  if (typeof window !== 'undefined') {
    // 브라우저 환경
    base64 = window.btoa(
      String.fromCharCode.apply(
        null,
        new Uint8Array(buffer) as unknown as number[]
      )
    );
  } else {
    // Node.js 환경
    base64 = Buffer.from(buffer).toString('base64');
  }
  
  // URL 안전 문자로 변경 (+, /, = 처리)
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * base64UrlDecode: URL 안전한 Base64 문자열을 디코딩하여 ArrayBuffer 반환
 * - `-` -> `+`, `_` -> `/`, 패딩 문자 복원
 * @param {string} base64Url - 디코딩할 URL 안전 Base64 문자열
 * @returns {ArrayBufferLike} 디코딩된 ArrayBuffer
 */
export const base64UrlDecode = (base64Url: string): ArrayBufferLike => {
  // 원래 Base64 형식으로 복원
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  
  // 패딩 복원
  while (base64.length % 4) {
    base64 += '=';
  }
  
  const binaryString = base64Decode(base64);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes.buffer;
};

/**
 * stringToArrayBuffer: UTF-8 문자열을 ArrayBuffer로 변환
 * @param {string} str - 변환할 문자열
 * @returns {ArrayBufferLike} 변환된 ArrayBuffer
 */
export const stringToArrayBuffer = (str: string): ArrayBufferLike => {
  if (typeof TextEncoder !== 'undefined') {
    // 모던 브라우저
    return new TextEncoder().encode(str).buffer;
  } 
  
  // 폴백: 수동 인코딩
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  
  for (let i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  
  return buf;
}; 