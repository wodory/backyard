import { cn, formatDate, extractTags, parseTagsInText } from './utils';
import { describe, it, expect } from 'vitest';

describe('유틸리티 함수', () => {
  describe('cn 함수', () => {
    it('클래스 이름을 병합해야 합니다', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('조건부 클래스를 처리해야 합니다', () => {
      const result = cn('class1', { class2: true, class3: false });
      expect(result).toBe('class1 class2');
    });

    it('중복된 클래스를 제거해야 합니다', () => {
      const result = cn('p-4 text-red-500', 'p-4 text-blue-500');
      expect(result).toBe('p-4 text-blue-500');
    });
  });
  
  describe('formatDate 함수', () => {
    it('Date 객체를 한국어 날짜 형식으로 변환해야 합니다', () => {
      const date = new Date(2023, 0, 15); // 2023-01-15
      const result = formatDate(date);
      expect(result).toBe('2023년 1월 15일');
    });
    
    it('문자열 날짜를 한국어 날짜 형식으로 변환해야 합니다', () => {
      const dateStr = '2023-02-20T12:00:00.000Z';
      const result = formatDate(dateStr);
      
      // 시간대에 따라 결과가 다를 수 있으므로 포맷만 확인
      expect(result).toMatch(/^\d{4}년 \d{1,2}월 \d{1,2}일$/);
    });
    
    it('다양한 날짜 입력에 대해 오류 없이 처리해야 합니다', () => {
      // 다양한 날짜 형식
      const dates = [
        new Date(), // 현재 날짜
        '2023-12-31',
        '2023/01/01',
        new Date(2000, 0, 1) // 2000-01-01
      ];
      
      dates.forEach(date => {
        const result = formatDate(date);
        expect(result).toMatch(/^\d{4}년 \d{1,2}월 \d{1,2}일$/);
      });
    });
  });
  
  describe('extractTags 함수', () => {
    it('텍스트에서 태그를 추출해야 합니다', () => {
      const text = '이것은 #자바스크립트 와 #리액트 에 관한 글입니다.';
      const result = extractTags(text);
      expect(result).toEqual(['자바스크립트', '리액트']);
    });
    
    it('태그가 없을 경우 빈 배열을 반환해야 합니다', () => {
      const text = '이것은 태그가 없는 글입니다.';
      const result = extractTags(text);
      expect(result).toEqual([]);
    });
    
    it('중복된 태그를 모두 포함해야 합니다', () => {
      const text = '#태그1 내용 #태그2 더 많은 내용 #태그1';
      const result = extractTags(text);
      expect(result).toEqual(['태그1', '태그2', '태그1']);
    });
    
    it('한글, 영어, 숫자, 특수문자가 포함된 태그를 추출해야 합니다', () => {
      const text = '다양한 태그 #한글태그 #English #숫자123 #특수_문자-태그';
      const result = extractTags(text);
      expect(result).toEqual(['한글태그', 'English', '숫자123', '특수_문자-태그']);
    });
    
    it('# 뒤에 공백이 있는 경우 태그로 인식되지 않아야 합니다', () => {
      const text = '이것은 # 태그가 아닙니다';
      const result = extractTags(text);
      expect(result).toEqual([]);
    });
  });
  
  describe('parseTagsInText 함수', () => {
    it('텍스트와 추출된 태그 목록을 반환해야 합니다', () => {
      const text = '이것은 #자바스크립트 와 #리액트 에 관한 글입니다.';
      const result = parseTagsInText(text);
      expect(result).toEqual({
        text: '이것은 #자바스크립트 와 #리액트 에 관한 글입니다.',
        tags: ['자바스크립트', '리액트']
      });
    });
    
    it('태그가 없는 텍스트에 대해 빈 태그 배열을 반환해야 합니다', () => {
      const text = '이것은 태그가 없는 글입니다.';
      const result = parseTagsInText(text);
      expect(result).toEqual({
        text: '이것은 태그가 없는 글입니다.',
        tags: []
      });
    });
    
    it('다양한 언어와 문자가 포함된 태그를 처리해야 합니다', () => {
      const text = 'Various tags: #한글태그 #EnglishTag #혼합Mix태그123 #특수_문자-태그';
      const result = parseTagsInText(text);
      expect(result).toEqual({
        text: 'Various tags: #한글태그 #EnglishTag #혼합Mix태그123 #특수_문자-태그',
        tags: ['한글태그', 'EnglishTag', '혼합Mix태그123', '특수_문자-태그']
      });
    });
    
    it('빈 문자열에 대해 빈 태그 배열을 반환해야 합니다', () => {
      const text = '';
      const result = parseTagsInText(text);
      expect(result).toEqual({
        text: '',
        tags: []
      });
    });
  });
}); 