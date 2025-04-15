/**
 * 파일명: useCardData.ts
 * 목적: 카드 데이터를 API에서 로드하고 관리하는 훅
 * 역할: API 호출 및 응답 처리, 데이터 캐싱, 전역 상태 업데이트 담당
 * 작성일: 2025-03-28
 */

import { useState, useEffect, useCallback } from 'react';

import { toast } from 'sonner';

import { useAppStore, Card } from '@/store/useAppStore';

interface UseCardDataOptions {
  autoLoad?: boolean;
  userId?: string | null;
  searchQuery?: string | null;
  tagFilter?: string | null;
}

/**
 * useCardData: 카드 데이터를 API에서 로드하고 관리하는 훅
 * @param options 데이터 로드 설정 옵션
 * @returns 카드 데이터 관련 상태 및 함수들
 */
export function useCardData({
  autoLoad = true,
  userId = null,
  searchQuery = null,
  tagFilter = null
}: UseCardDataOptions = {}) {
  // 로딩 및 에러 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<Date | null>(null);
  
  // useAppStore에서 카드 관련 상태 및 함수 가져오기
  const cards = useAppStore(state => state.cards);
  const setCards = useAppStore(state => state.setCards);
  
  /**
   * 카드 데이터 로드 함수
   * @param params 선택적 검색 매개변수
   */
  const loadCards = useCallback(async (params?: {
    userId?: string;
    q?: string;
    tag?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // URL 매개변수 구성
      const searchParams = new URLSearchParams();
      
      // 기본 옵션과 매개변수 병합
      const userId = params?.userId || null;
      const q = params?.q || searchQuery || null;
      const tag = params?.tag || tagFilter || null;
      
      // 선택적 매개변수 추가
      if (userId) searchParams.append('userId', userId);
      if (q) searchParams.append('q', q);
      if (tag) searchParams.append('tag', tag);
      
      // 엔드포인트 구성
      const queryString = searchParams.toString();
      const endpoint = `/api/cards${queryString ? `?${queryString}` : ''}`;
      
      console.log('[useCardData] API 요청:', endpoint);
      
      // fetch API 호출
      const response = await fetch(endpoint);
      
      // 응답 에러 처리
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`카드 조회 실패 (상태 코드: ${response.status}):`, errorText);
        throw new Error(`카드 목록을 불러오는데 실패했습니다. 상태 코드: ${response.status}`);
      }
      
      // 응답 데이터 파싱
      const data = await response.json();
      console.log(`[useCardData] ${data.length}개 카드 로드됨`);
      
      // 전역 상태에 카드 목록 저장
      setCards(data);
      
      // 마지막 로드 시간 업데이트
      setLastLoadedAt(new Date());
      
      return data;
    } catch (error) {
      console.error('[useCardData] 카드 로드 오류:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : '카드 목록을 불러오는데 실패했습니다.';
      
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, tagFilter, setCards]);
  
  /**
   * 단일 카드 상세 정보 로드 함수
   * @param cardId 카드 ID
   * @returns 카드 상세 정보
   */
  const loadCardDetails = useCallback(async (cardId: string) => {
    if (!cardId) {
      console.error('[useCardData] 카드 ID가 제공되지 않았습니다.');
      return null;
    }
    
    try {
      // 먼저 캐시된 카드 확인
      const cachedCard = cards.find(card => card.id === cardId);
      if (cachedCard) {
        console.log(`[useCardData] 카드 ID ${cardId} - 캐시에서 로드`);
        return cachedCard;
      }
      
      console.log(`[useCardData] 카드 ID ${cardId} - API에서 로드`);
      
      // API 요청에 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`/api/cards/${cardId}`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`카드 상세 조회 실패 (상태 코드: ${response.status}):`, errorText);
        throw new Error(`카드 정보를 불러오는데 실패했습니다. 상태 코드: ${response.status}`);
      }
      
      const cardData = await response.json();
      
      // 카드 목록 업데이트
      const updatedCards = [...cards];
      const cardIndex = updatedCards.findIndex(c => c.id === cardData.id);
      
      if (cardIndex >= 0) {
        // 기존 카드 업데이트
        updatedCards[cardIndex] = cardData;
      } else {
        // 새 카드 추가
        updatedCards.push(cardData);
      }
      
      // 직접 업데이트된 배열을 전달
      setCards(updatedCards);
      
      return cardData;
    } catch (error) {
      console.error('[useCardData] 카드 상세 로드 오류:', error);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        toast.error('요청 시간이 초과되었습니다.');
      } else {
        toast.error('카드 정보를 불러오는데 실패했습니다.');
      }
      
      return null;
    }
  }, [cards, setCards]);
  
  // 컴포넌트 마운트 시 자동 로드 옵션을 사용하는 경우
  useEffect(() => {
    if (autoLoad) {
      loadCards();
    }
  }, [autoLoad, loadCards]);
  
  return {
    cards,
    isLoading,
    error,
    lastLoadedAt,
    loadCards,
    loadCardDetails
  };
} 