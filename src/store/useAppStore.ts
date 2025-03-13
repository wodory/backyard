import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BoardSettings, DEFAULT_BOARD_SETTINGS, saveBoardSettings as saveSettingsToLocalStorage } from '@/lib/board-utils';
import { ReactFlowInstance } from '@xyflow/react';

// 카드 타입 정의
export interface Card {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  [key: string]: any;
}

export interface AppState {
  // 선택된 카드 상태
  selectedCardId: string | null; // 이전 단일 선택 방식 (하위 호환성 유지)
  selectCard: (cardId: string | null) => void; // 이전 단일 선택 방식 (하위 호환성 유지)
  
  // 다중 선택 카드 상태
  selectedCardIds: string[];
  selectCards: (cardIds: string[]) => void;
  addSelectedCard: (cardId: string) => void;
  removeSelectedCard: (cardId: string) => void;
  toggleSelectedCard: (cardId: string) => void;
  clearSelectedCards: () => void;
  
  // 카드 데이터 상태
  cards: Card[]; // 현재 로드된 카드 목록
  setCards: (cards: Card[]) => void; // 카드 목록 설정
  updateCard: (updatedCard: Card) => void; // 단일 카드 업데이트
  
  // 사이드바 상태
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // 레이아웃 옵션 (수평/수직/자동배치/없음)
  layoutDirection: 'horizontal' | 'vertical' | 'auto' | 'none';
  setLayoutDirection: (direction: 'horizontal' | 'vertical' | 'auto' | 'none') => void;
  
  // 사이드바 너비
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  
  // 보드 설정
  boardSettings: BoardSettings;
  setBoardSettings: (settings: BoardSettings) => void;
  updateBoardSettings: (settings: Partial<BoardSettings>) => void;
  
  // React Flow 인스턴스
  reactFlowInstance: ReactFlowInstance | null;
  setReactFlowInstance: (instance: ReactFlowInstance | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // 이전 단일 선택 방식 (하위 호환성 유지)
      selectedCardId: null,
      selectCard: (cardId) => {
        set({ 
          selectedCardId: cardId,
          // 단일 선택 시 다중 선택 배열도 업데이트
          selectedCardIds: cardId ? [cardId] : []
        });
      },
      
      // 다중 선택 카드 상태 초기값 및 액션
      selectedCardIds: [],
      selectCards: (cardIds) => {
        set({ 
          selectedCardIds: cardIds,
          // 다중 선택 시 첫 번째 카드를 단일 선택 상태로 설정 (하위 호환성)
          selectedCardId: cardIds.length > 0 ? cardIds[0] : null
        });
      },
      addSelectedCard: (cardId) => 
        set((state) => {
          if (!cardId || state.selectedCardIds.includes(cardId)) return state;
          const newSelectedIds = [...state.selectedCardIds, cardId];
          return { 
            selectedCardIds: newSelectedIds,
            selectedCardId: newSelectedIds[0] // 첫 번째 카드를 단일 선택 상태로 설정
          };
        }),
      removeSelectedCard: (cardId) => 
        set((state) => {
          const newSelectedIds = state.selectedCardIds.filter(id => id !== cardId);
          return { 
            selectedCardIds: newSelectedIds,
            selectedCardId: newSelectedIds.length > 0 ? newSelectedIds[0] : null
          };
        }),
      toggleSelectedCard: (cardId) => 
        set((state) => {
          if (!cardId) return state;
          
          const isSelected = state.selectedCardIds.includes(cardId);
          let newSelectedIds;
          
          if (isSelected) {
            newSelectedIds = state.selectedCardIds.filter(id => id !== cardId);
          } else {
            newSelectedIds = [...state.selectedCardIds, cardId];
          }
          
          return { 
            selectedCardIds: newSelectedIds,
            selectedCardId: newSelectedIds.length > 0 ? newSelectedIds[0] : null
          };
        }),
      clearSelectedCards: () => set({ selectedCardIds: [], selectedCardId: null }),
      
      // 카드 데이터 상태 초기값 및 액션
      cards: [],
      setCards: (cards) => set({ cards }),
      updateCard: (updatedCard) => 
        set((state) => {
          // 카드 목록에서 해당 카드를 찾아 업데이트
          const updatedCards = state.cards.map(card => 
            card.id === updatedCard.id ? { ...card, ...updatedCard } : card
          );
          
          console.log('[AppStore] 카드 업데이트:', updatedCard.id);
          return { cards: updatedCards };
        }),
      
      // 사이드바 상태 초기값 및 액션
      isSidebarOpen: false,
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      
      // 레이아웃 옵션 초기값 및 액션
      layoutDirection: 'auto' as const,
      setLayoutDirection: (direction) => set({ layoutDirection: direction }),
      
      // 사이드바 너비 초기값 및 액션
      sidebarWidth: 320,
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      
      // 보드 설정 초기값 및 액션
      boardSettings: DEFAULT_BOARD_SETTINGS,
      setBoardSettings: (settings) => {
        console.log('[Zustand] setBoardSettings 호출됨:', settings);
        // 로컬 스토리지에 저장
        saveSettingsToLocalStorage(settings);
        // 상태 업데이트
        set({ boardSettings: settings });
        console.log('[Zustand] 상태 업데이트 완료:', settings);
      },
      updateBoardSettings: (partialSettings) => 
        set((state) => {
          console.log('[Zustand] updateBoardSettings 호출됨:', partialSettings);
          const newSettings = { ...state.boardSettings, ...partialSettings };
          // 로컬 스토리지에 저장
          saveSettingsToLocalStorage(newSettings);
          console.log('[Zustand] 새 설정으로 업데이트:', newSettings);
          return { boardSettings: newSettings };
        }),
      
      // React Flow 인스턴스 초기값 및 액션
      reactFlowInstance: null,
      setReactFlowInstance: (instance) => set({ reactFlowInstance: instance }),
    }),
    {
      name: 'backyard-app-storage', // localStorage에 저장될 키 이름
      partialize: (state) => {
        console.log('[Zustand] persist에 저장될 상태:', {
          isSidebarOpen: state.isSidebarOpen,
          sidebarWidth: state.sidebarWidth,
          boardSettings: state.boardSettings,
        });
        return {
          // 영구 저장할 상태만 선택
          isSidebarOpen: state.isSidebarOpen,
          sidebarWidth: state.sidebarWidth,
          boardSettings: state.boardSettings,
          // 선택 상태와 layoutDirection, reactFlowInstance는 세션별로 달라질 수 있으므로 저장하지 않음
        };
      },
    }
  )
) 