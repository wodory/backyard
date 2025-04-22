/**
 * 파일명: src/services/cardService.ts
 * 목적: 카드 관련 API 통신 서비스
 * 역할: 카드 데이터의 CRUD 작업을 위한 API 호출 함수 제공
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : 단건/소배치/대량 API 호출 구조 개선 및 비동기 작업 패턴 추가
 */

import { Card, CreateCardInput as CardInput, UpdateCardInput as CardPatch } from "@/types/card";
import createLogger from '@/lib/logger';

const logger = createLogger('cardService');

/**
 * fetchCards: 카드 목록을 조회하는 함수
 * @param {Object} params - 검색 파라미터 (검색어, 태그 등)
 * @returns {Promise<Card[]>} 카드 목록
 */
export async function fetchCards(params?: { q?: string; tag?: string; userId?: string }): Promise<Card[]> {
  try {
    // 쿼리 파라미터 생성
    const queryParams = new URLSearchParams();
    if (params?.q) queryParams.append('q', params.q);
    if (params?.tag) queryParams.append('tag', params.tag);
    if (params?.userId) queryParams.append('userId', params.userId);
    
    const queryString = queryParams.toString();
    const url = `/api/cards${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(response.statusText || '카드 목록을 가져오는 중 오류가 발생했습니다.');
    }
    
    return await response.json();
  } catch (error) {
    logger.error('카드 목록 조회 오류:', error);
    throw error;
  }
}

/**
 * fetchCardById: 특정 ID의 카드를 조회하는 함수
 * @param {string} id - 조회할 카드 ID
 * @returns {Promise<Card>} 카드 정보
 */
export async function fetchCardById(id: string): Promise<Card> {
  try {
    const response = await fetch(`/api/cards/${id}`);
    
    if (!response.ok) {
      throw new Error(response.statusText || '카드를 가져오는 중 오류가 발생했습니다.');
    }
    
    return await response.json();
  } catch (error) {
    logger.error(`카드 상세 조회 오류 (ID=${id}):`, error);
    throw error;
  }
}

/**
 * createCardsAPI: 단건 또는 소배치(≤50) 카드를 생성하는 함수
 * @param {CardInput | CardInput[]} input - 생성할 카드 데이터(단일 또는 배열)
 * @returns {Promise<Card[]>} 생성된 카드 정보 배열
 */
export async function createCardsAPI(input: CardInput | CardInput[]): Promise<Card[]> {
  try {
    const response = await fetch('/api/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    
    if (!response.ok) {
      throw new Error(response.statusText || '카드 생성 중 오류가 발생했습니다.');
    }
    
    return await response.json();
  } catch (error) {
    logger.error('카드 생성 오류:', error);
    throw error;
  }
}

/**
 * createCardsBulkAPI: 대량(>50) 카드를 비동기적으로 생성하는 함수
 * @param {CardInput[]} batch - 생성할 카드 데이터 배열
 * @returns {Promise<{token: string}>} 비동기 작업 토큰
 */
export async function createCardsBulkAPI(batch: CardInput[]): Promise<{ token: string }> {
  try {
    const response = await fetch('/api/cards/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
    });
    
    if (response.status !== 202) {
      throw new Error(response.statusText || '대량 카드 생성 요청 중 오류가 발생했습니다.');
    }
    
    const locationHeader = response.headers.get('Location');
    if (!locationHeader) {
      throw new Error('비동기 작업 추적을 위한 Location 헤더가 없습니다.');
    }
    
    // /api/bulk-status/{token} 형식에서 토큰 추출
    const token = locationHeader.split('/').pop() || '';
    return { token };
  } catch (error) {
    logger.error('대량 카드 생성 오류:', error);
    throw error;
  }
}

/**
 * updateCardAPI: 단건 카드를 부분 수정하는 함수
 * @param {string} id - 업데이트할 카드 ID
 * @param {CardPatch} patch - 업데이트할 카드 데이터
 * @returns {Promise<Card>} 업데이트된 카드 정보
 */
export async function updateCardAPI(id: string, patch: CardPatch): Promise<Card> {
  try {
    const response = await fetch(`/api/cards/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patch),
    });
    
    if (!response.ok) {
      throw new Error(response.statusText || '카드 업데이트 중 오류가 발생했습니다.');
    }
    
    return await response.json();
  } catch (error) {
    logger.error(`카드 업데이트 오류 (ID=${id}):`, error);
    throw error;
  }
}

/**
 * updateCardsBulkAPI: 대량의 카드를 비동기적으로 부분 수정하는 함수
 * @param {Array<{id: string, patch: CardPatch}>} patches - 업데이트할 카드 ID와 데이터 배열
 * @returns {Promise<{token: string}>} 비동기 작업 토큰
 */
export async function updateCardsBulkAPI(patches: Array<{id: string, patch: CardPatch}>): Promise<{ token: string }> {
  try {
    const response = await fetch('/api/cards/bulk', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patches),
    });
    
    if (response.status !== 202) {
      throw new Error(response.statusText || '대량 카드 업데이트 요청 중 오류가 발생했습니다.');
    }
    
    const locationHeader = response.headers.get('Location');
    if (!locationHeader) {
      throw new Error('비동기 작업 추적을 위한 Location 헤더가 없습니다.');
    }
    
    // /api/bulk-status/{token} 형식에서 토큰 추출
    const token = locationHeader.split('/').pop() || '';
    return { token };
  } catch (error) {
    logger.error('대량 카드 업데이트 오류:', error);
    throw error;
  }
}

/**
 * deleteCardAPI: 단건 카드를 삭제하는 함수
 * @param {string} id - 삭제할 카드 ID
 * @returns {Promise<void>} 
 */
export async function deleteCardAPI(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/cards/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(response.statusText || '카드 삭제 중 오류가 발생했습니다.');
    }
  } catch (error) {
    logger.error(`카드 삭제 오류 (ID=${id}):`, error);
    throw error;
  }
}

/**
 * deleteCardsAPI: 다건(≤100) 카드를 동기적으로 삭제하는 함수
 * @param {string[]} ids - 삭제할 카드 ID 배열
 * @returns {Promise<void>}
 */
export async function deleteCardsAPI(ids: string[]): Promise<void> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('ids', ids.join(','));
    
    const response = await fetch(`/api/cards?${queryParams.toString()}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(response.statusText || '다수 카드 삭제 중 오류가 발생했습니다.');
    }
  } catch (error) {
    logger.error('다수 카드 삭제 오류:', error);
    throw error;
  }
}

/**
 * deleteCardsBulkAPI: 대량의 카드를 비동기적으로 삭제하는 함수
 * @param {string[]} ids - 삭제할 카드 ID 배열
 * @returns {Promise<{token: string}>} 비동기 작업 토큰
 */
export async function deleteCardsBulkAPI(ids: string[]): Promise<{ token: string }> {
  try {
    const response = await fetch('/api/cards/bulk-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    
    if (response.status !== 202) {
      throw new Error(response.statusText || '대량 카드 삭제 요청 중 오류가 발생했습니다.');
    }
    
    const locationHeader = response.headers.get('Location');
    if (!locationHeader) {
      throw new Error('비동기 작업 추적을 위한 Location 헤더가 없습니다.');
    }
    
    // /api/bulk-status/{token} 형식에서 토큰 추출
    const token = locationHeader.split('/').pop() || '';
    return { token };
  } catch (error) {
    logger.error('대량 카드 삭제 오류:', error);
    throw error;
  }
} 