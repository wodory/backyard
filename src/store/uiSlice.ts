/**
 * 파일명: src/store/uiSlice.ts
 * 목적: UI 관련 전역 상태와 액션을 관리하는 Zustand 슬라이스
 * 역할: 사이드바 열림/닫힘, 너비 등 UI 관련 전역 상태 관리
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : Zustand v5 문법에 맞게 StateCreator 시그니처 수정
 */

import { StateCreator } from 'zustand';

// UI 상태 인터페이스 정의
export interface UiState {
  // 사이드바 상태
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // 사이드바 너비
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  
  // 로딩 상태
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // 에러 상태
  error: Error | null;
  setError: (error: Error | null) => void;
  clearError: () => void;
}

// UI 상태 슬라이스 생성 함수 (Zustand v5 문법)
export const createUiSlice: StateCreator<UiState> = (set) => ({
  // 사이드바 상태 초기값 및 액션
  isSidebarOpen: false,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  // 사이드바 너비 초기값 및 액션
  sidebarWidth: 300, // 기본값 설정
  setSidebarWidth: (width) => set({ sidebarWidth: width }),
  
  // 로딩 상태 초기값 및 액션
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  // 에러 상태 초기값 및 액션
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}); 