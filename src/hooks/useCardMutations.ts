/**
 * 파일명: src/hooks/useCardMutations.ts
 * 목적: 카드 생성, 수정, 삭제를 위한 React Query mutation 훅 제공
 * 역할: 카드 관련 데이터 변경 요청을 처리하는 훅 구현
 * 작성일: 2025-04-21
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card } from '../types/card';

interface CreateCardData {
  title: string;
  content?: string;
  tags?: string[];
  x?: number;
  y?: number;
}

interface UpdateCardData {
  id: string;
  title?: string;
  content?: string;
  tags?: string[];
}

/**
 * createCard: 새 카드를 생성하는 API 호출 함수
 * @param {CreateCardData} cardData - 생성할 카드 데이터
 * @returns {Promise<Card>} 생성된 카드 객체
 */
const createCard = async (cardData: CreateCardData): Promise<Card> => {
  const response = await fetch('/api/cards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cardData),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || '카드 생성에 실패했습니다.');
  }

  return response.json();
};

/**
 * useCreateCard: 카드 생성을 위한 mutation 훅
 * @returns {UseMutationResult} 카드 생성 mutation 결과
 */
export function useCreateCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCard,
    onSuccess: (data) => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast.success('카드가 생성되었습니다.');
      return data;
    },
    onError: (error: Error) => {
      toast.error(`카드 생성 실패: ${error.message}`);
    },
  });
}

/**
 * updateCard: 카드를 수정하는 API 호출 함수
 * @param {UpdateCardData} cardData - 수정할 카드 데이터
 * @returns {Promise<Card>} 수정된 카드 객체
 */
const updateCard = async (cardData: UpdateCardData): Promise<Card> => {
  const { id, ...data } = cardData;
  
  const response = await fetch(`/api/cards/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || '카드 수정에 실패했습니다.');
  }

  return response.json();
};

/**
 * useUpdateCard: 카드 수정을 위한 mutation 훅
 * @returns {UseMutationResult} 카드 수정 mutation 결과
 */
export function useUpdateCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCard,
    onSuccess: (data) => {
      // 개별 카드 및 목록 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ['card', data.id] });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast.success('카드가 수정되었습니다.');
      return data;
    },
    onError: (error: Error) => {
      toast.error(`카드 수정 실패: ${error.message}`);
    },
  });
}

/**
 * deleteCard: 카드를 삭제하는 API 호출 함수
 * @param {string} id - 삭제할 카드의 ID
 * @returns {Promise<void>}
 */
const deleteCard = async (id: string): Promise<void> => {
  const response = await fetch(`/api/cards/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || '카드 삭제에 실패했습니다.');
  }
};

/**
 * useDeleteCard: 카드 삭제를 위한 mutation 훅
 * @returns {UseMutationResult} 카드 삭제 mutation 결과
 */
export function useDeleteCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCard,
    onSuccess: (_, id) => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.removeQueries({ queryKey: ['card', id] });
      toast.success('카드가 삭제되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(`카드 삭제 실패: ${error.message}`);
    },
  });
} 