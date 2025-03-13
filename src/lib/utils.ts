import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 날짜 문자열을 포맷팅합니다.
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      return dateString;
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
    return dateString;
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
