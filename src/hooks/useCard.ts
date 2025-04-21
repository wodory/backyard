/**
 * 파일명: src/hooks/useCard.ts
 * 목적: 특정 카드 ID의 상세 정보를 가져오는 훅
 * 역할: React Query를 사용하여 카드 상세 데이터를 조회하고 캐싱
 * 작성일: 2025-04-21
 */

import { useQuery } from '@tanstack/react-query';
import { fetchCardById } from '../services/cardService';
import type { Card } from '../types/card';

/**
 * useCard: 특정 카드 ID의 상세 정보를 가져오는 훅
 * @param {string | undefined} cardId - 조회할 카드의 ID
 * @returns {UseQueryResult} 카드 데이터와 로딩/에러 상태
 */
export function useCard(cardId?: string) {
  return useQuery<Card, Error>({
    queryKey: ['card', cardId],
    queryFn: () => fetchCardById(cardId as string),
    enabled: !!cardId, // cardId가 있을 때만 쿼리 실행
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
} 