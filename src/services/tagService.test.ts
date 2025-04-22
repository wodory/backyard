/**
 * 파일명: src/services/tagService.test.ts
 * 목적: 태그 API 서비스 모듈 테스트
 * 역할: 태그 관련 API 호출 함수를 테스트
 * 작성일: 2025-04-21
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchTags, createTagAPI, deleteTagAPI, updateTagAPI, Tag, TagInput } from './tagService';

// Mock 데이터
const mockTags: Tag[] = [
  { id: '1', name: '개발', count: 5, createdAt: '2025-04-01T00:00:00Z' },
  { id: '2', name: '아이디어', count: 3, createdAt: '2025-04-02T00:00:00Z' },
  { id: '3', name: '프로젝트', count: 2, createdAt: '2025-04-03T00:00:00Z' }
];

// fetch 함수 모킹
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('tagService', () => {
  // 각 테스트 전에 mock 초기화
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // 각 테스트 후에 mock 내용 확인
  afterEach(() => {
    expect(mockFetch).toHaveBeenCalled();
  });

  describe('fetchTags', () => {
    it('태그 목록을 성공적으로 조회한다', async () => {
      // Mock 응답 설정
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTags
      });

      const result = await fetchTags();
      
      expect(mockFetch).toHaveBeenCalledWith('/api/tags');
      expect(result).toEqual(mockTags);
      expect(result.length).toBe(3);
    });

    it('API 조회 실패 시 에러를 throw 한다', async () => {
      // Mock 실패 응답 설정
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: '서버 오류'
      });

      await expect(fetchTags()).rejects.toThrow('서버 오류');
      expect(mockFetch).toHaveBeenCalledWith('/api/tags');
    });
  });

  describe('createTagAPI', () => {
    it('새 태그를 성공적으로 생성한다', async () => {
      const newTag: TagInput = { name: '새 태그' };
      const createdTag: Tag = { 
        id: '4', 
        name: '새 태그', 
        count: 0, 
        createdAt: '2025-04-21T00:00:00Z' 
      };

      // Mock 응답 설정
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createdTag
      });

      const result = await createTagAPI(newTag);
      
      expect(mockFetch).toHaveBeenCalledWith('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTag)
      });
      expect(result).toEqual(createdTag);
    });
  });

  describe('deleteTagAPI', () => {
    it('태그를 성공적으로 삭제한다', async () => {
      // Mock 응답 설정
      mockFetch.mockResolvedValueOnce({
        ok: true
      });

      await deleteTagAPI('1');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/tags/1', {
        method: 'DELETE'
      });
    });
  });

  describe('updateTagAPI', () => {
    it('태그를 성공적으로 수정한다', async () => {
      const tagInput: TagInput = { name: '수정된 태그' };
      const updatedTag: Tag = { 
        id: '1', 
        name: '수정된 태그', 
        count: 5, 
        createdAt: '2025-04-01T00:00:00Z' 
      };

      // Mock 응답 설정
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTag
      });

      const result = await updateTagAPI('1', tagInput);
      
      expect(mockFetch).toHaveBeenCalledWith('/api/tags/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tagInput)
      });
      expect(result).toEqual(updatedTag);
    });
  });
}); 