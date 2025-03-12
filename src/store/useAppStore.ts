import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AppState {
  // 선택된 카드 상태
  selectedCardId: string | null;
  selectCard: (cardId: string | null) => void;
  
  // 사이드바 상태
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // 레이아웃 옵션 (수평/수직/자동배치)
  layoutDirection: 'horizontal' | 'vertical' | 'auto';
  setLayoutDirection: (direction: 'horizontal' | 'vertical' | 'auto') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // 선택된 카드 상태 초기값 및 액션
      selectedCardId: null,
      selectCard: (cardId) => set({ selectedCardId: cardId }),
      
      // 사이드바 상태 초기값 및 액션
      isSidebarOpen: true,
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      
      // 레이아웃 옵션 초기값 및 액션
      layoutDirection: 'auto' as const,
      setLayoutDirection: (direction) => set({ layoutDirection: direction }),
    }),
    {
      name: 'backyard-app-storage', // localStorage에 저장될 키 이름
      partialize: (state) => ({
        // 영구 저장할 상태만 선택
        isSidebarOpen: state.isSidebarOpen,
        layoutDirection: state.layoutDirection,
        // selectedCardId는 세션별로 달라질 수 있으므로 저장하지 않음
      }),
    }
  )
) 