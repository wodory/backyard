import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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
