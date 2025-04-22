/**
 * 파일명: src/services/tagService.ts
 * 목적: 태그 관련 API 통신 서비스
 * 역할: 태그 데이터의 CRUD 작업을 위한 API 호출 함수 제공
 * 작성일: 2025-04-21
 */

import createLogger from '@/lib/logger';

// 태그 인터페이스 정의
export interface Tag {
  id: string;
  name: string;
  count?: number;
  createdAt: string;
}

export interface TagInput {
  name: string;
}

const logger = createLogger('tagService');

/**
 * fetchTags: 모든 태그 목록을 조회하는 함수
 * @returns {Promise<Tag[]>} 태그 목록
 */
export async function fetchTags(): Promise<Tag[]> {
  try {
    const response = await fetch('/api/tags');
    
    if (!response.ok) {
      throw new Error(response.statusText || '태그 목록을 가져오는 중 오류가 발생했습니다.');
    }
    
    return await response.json();
  } catch (error) {
    logger.error('태그 목록 조회 오류:', error);
    throw error;
  }
}

/**
 * createTagAPI: 새 태그를 생성하는 함수
 * @param {TagInput} tagInput - 생성할 태그 데이터
 * @returns {Promise<Tag>} 생성된 태그 정보
 */
export async function createTagAPI(tagInput: TagInput): Promise<Tag> {
  try {
    const response = await fetch('/api/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tagInput),
    });
    
    if (!response.ok) {
      throw new Error(response.statusText || '태그 생성 중 오류가 발생했습니다.');
    }
    
    return await response.json();
  } catch (error) {
    logger.error('태그 생성 오류:', error);
    throw error;
  }
}

/**
 * deleteTagAPI: 태그를 삭제하는 함수
 * @param {string} id - 삭제할 태그 ID
 * @returns {Promise<void>}
 */
export async function deleteTagAPI(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/tags/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(response.statusText || '태그 삭제 중 오류가 발생했습니다.');
    }
  } catch (error) {
    logger.error(`태그 삭제 오류 (ID=${id}):`, error);
    throw error;
  }
}

/**
 * updateTagAPI: 태그 이름을 수정하는 함수
 * @param {string} id - 수정할 태그 ID
 * @param {TagInput} tagInput - 수정할 태그 데이터
 * @returns {Promise<Tag>} 수정된 태그 정보
 */
export async function updateTagAPI(id: string, tagInput: TagInput): Promise<Tag> {
  try {
    const response = await fetch(`/api/tags/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tagInput),
    });
    
    if (!response.ok) {
      throw new Error(response.statusText || '태그 수정 중 오류가 발생했습니다.');
    }
    
    return await response.json();
  } catch (error) {
    logger.error(`태그 수정 오류 (ID=${id}):`, error);
    throw error;
  }
} 