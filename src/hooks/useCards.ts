/**
 * 파일명: src/hooks/useCards.ts
 * 목적: 카드 목록 조회를 위한 React Query 훅
 * 역할: 카드 데이터를 조회하고 캐싱하는 React Query 훅 제공
 * 작성일: 2025-04-21
 */

import { useQuery } from '@tanstack/react-query';
import { fetchCards } from '../services/cardService';
import { Card } from '../types/card';

export interface CardQueryParams {
  q?: string;
  tag?: string;
  userId?: string;
  error?: string; // 테스트용 파라미터
}

/**
 * useCards: 카드 목록을 조회하는 React Query 훅
 * @param params - 조회 파라미터 (검색어, 태그, 사용자 ID)
 * @returns React Query 결과 (데이터, 로딩 상태, 에러 등)
 */
export function useCards(params?: CardQueryParams) {
  return useQuery<Card[], Error>({
    queryKey: ['cards', params],
    queryFn: () => fetchCards({ 
      q: params?.q, 
      tag: params?.tag, 
      userId: params?.userId 
    }),
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
  });
} 