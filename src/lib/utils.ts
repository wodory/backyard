import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 날짜 문자열을 포맷팅합니다.
 * @param {string | Date} dateInput - 날짜 문자열 또는 Date 객체
 * @returns {string} 포맷팅된 날짜 문자열
 */
export function formatDate(dateInput: string | Date): string {
  if (!dateInput) return '';
  
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      return String(dateInput);
    }
    
    // YYYY년 MM월 DD일 형식으로 변환
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return String(dateInput);
  }
}

// 텍스트에서 태그 추출 (#태그 형식)
export function extractTags(text: string): string[] {
  const tagPattern = /#([a-zA-Z0-9가-힣_\-]+)/g;
  const matches = text.match(tagPattern);
  
  if (!matches) return [];
  
  return matches.map(tag => tag.slice(1)); // # 제거
}

// 텍스트에서 태그를 변환 (#태그 -> Badge 컴포넌트로 변환하기 위한 준비)
export function parseTagsInText(text: string): { text: string, tags: string[] } {
  const tags = extractTags(text);
  return { text, tags };
}

/**
 * hexToHsl: 16진수 색상 코드를 HSL 색상값으로 변환
 * @param {string} hex - 16진수 색상 코드 (예: "#ff0000")
 * @returns {{ h: number, s: number, l: number } | null} HSL 색상값 또는 변환 실패 시 null
 */
export function hexToHsl(hex: string): { h: number, s: number, l: number } | null {
  if (!hex) return null;
  
  // hex를 RGB로 변환
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * hslToHex: HSL 색상값을 16진수 색상 코드로 변환
 * @param {number} h - 색조 (0-360)
 * @param {number} s - 채도 (0-100)
 * @param {number} l - 명도 (0-100)
 * @returns {string} 16진수 색상 코드 (예: "#ff0000")
 */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
