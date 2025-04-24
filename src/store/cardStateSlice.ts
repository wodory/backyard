/**
 * 파일명: src/store/cardStateSlice.ts
 * 목적: 카드 선택 및 확장 상태를 관리하는 Zustand 슬라이스
 * 역할: 카드 선택(selectedCardIds) 및 확장(expandedCardId) 상태와 관련 액션 관리
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : Zustand v5 문법에 맞게 StateCreator 시그니처 수정
 */

import { StateCreator } from 'zustand';

/**
 * 카드 상태 슬라이스 인터페이스 정의
 */
export interface CardStateState {
  // 현재 선택된 카드들의 ID 목록 (멀티선택 지원)
  selectedCardIds: string[];
  
  // 현재 확장된 카드 ID (하나만 가능)
  expandedCardId: string | null;
  
  // 선택된 카드 ID (단일 선택 지원, 첫 번째 선택된 카드 ID)
  selectedCardId: string | null;

  // 액션
  // 여러 카드 선택 설정 (기존 선택 교체)
  selectCards: (ids: string[]) => void;
  
  // 단일 카드 선택 (기존 선택 교체)
  selectCard: (id: string | null) => void;
  
  // 카드 선택 토글 (있으면 제거, 없으면 추가)
  toggleSelectedCard: (id: string) => void;
  
  // 선택 해제 (모든 카드)
  clearSelectedCards: () => void;
  
  // 카드 확장 토글 (같은 ID 호출 시 닫힘)
  toggleExpandCard: (id: string) => void;
}

/**
 * createCardStateSlice: 카드 선택 상태 관련 Zustand 슬라이스 생성
 * @param set - Zustand 상태 설정 함수
 * @param get - Zustand 상태 가져오기 함수
 * @returns CardStateState 객체
 */
export const createCardStateSlice: StateCreator<CardStateState> = (set, get) => ({
  // 초기 상태
  selectedCardIds: [],
  expandedCardId: null,
  selectedCardId: null,
  
  // 액션
  /**
   * selectCards: 여러 카드 선택 설정
   * @param ids - 선택할 카드 ID 배열
   */
  selectCards: (ids) => set({ 
    selectedCardIds: ids,
    selectedCardId: ids.length > 0 ? ids[0] : null 
  }),
  
  /**
   * selectCard: 단일 카드 선택
   * @param id - 선택할 카드 ID 또는 null (선택 해제)
   */
  selectCard: (id) => set({ 
    selectedCardIds: id ? [id] : [],
    selectedCardId: id 
  }),
  
  /**
   * toggleSelectedCard: 카드 선택 상태 토글
   * @param id - 토글할 카드 ID
   */
  toggleSelectedCard: (id) => set(state => {
    const currentlySelected = state.selectedCardIds;
    const isSelected = currentlySelected.includes(id);
    
    // ID 제거 또는 추가
    const newSelectedIds = isSelected 
      ? currentlySelected.filter(cardId => cardId !== id) 
      : [...currentlySelected, id];
    
    return {
      selectedCardIds: newSelectedIds,
      // 첫 번째 선택된 카드를 selectedCardId로 설정
      selectedCardId: newSelectedIds.length > 0 ? newSelectedIds[0] : null
    };
  }),
  
  /**
   * clearSelectedCards: 모든 카드 선택 해제
   */
  clearSelectedCards: () => set({ 
    selectedCardIds: [],
    selectedCardId: null 
  }),
  
  /**
   * toggleExpandCard: 카드 확장/축소 토글
   * @param id - 토글할 카드 ID
   */
  toggleExpandCard: (id) => set(state => ({
    expandedCardId: state.expandedCardId === id ? null : id
  })),
}); 