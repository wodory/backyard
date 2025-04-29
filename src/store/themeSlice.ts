/**
 * 파일명: src/store/themeSlice.ts
 * 목적: 앱 테마 및 디자인 관련 상태 관리
 * 역할: 라이트/다크 모드, 노드 크기 등 테마 관련 전역 상태와 액션 관리
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : layoutDirection 속성 추가
 * 수정일: 2025-04-21 : StateCreator 시그니처를 Zustand v5에 맞게 수정
 * 수정일: 2025-04-21 : strokeWidth 속성 추가
 * 수정일: 2025-04-21 : connectionLineType, markerEnd 속성 추가 및 기존 속성들 확인
 * 수정일: 2025-04-21 : ideaMapSettings 타입을 Settings 인터페이스와 일치시킴
 * 수정일: 2025-04-21 : DEFAULT_SETTINGS를 lib/ideamap-utils에서 임포트하여 일관성 확보
 */

import { StateCreator } from 'zustand'
import { ConnectionLineType, MarkerType } from '@xyflow/react';
import { Settings, DEFAULT_SETTINGS } from '@/lib/ideamap-utils';

/**
 * 테마 상태 인터페이스 정의
 */
export interface ThemeState {
  // 테마 모드 (라이트/다크)
  themeMode: 'light' | 'dark' | 'system';
  
  // 아이디어맵 관련 설정
  ideaMapSettings: Settings & {
    [key: string]: any; // 추가 설정을 위한 인덱스 시그니처
  };
  
  // 레이아웃 옵션 (수평/수직/자동배치/없음)
  layoutDirection: 'horizontal' | 'vertical' | 'auto' | 'none';
  setLayoutDirection: (direction: 'horizontal' | 'vertical' | 'auto' | 'none') => void;
  
  // 액션
  toggleThemeMode: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  updateSettings: (settings: Partial<ThemeState['ideaMapSettings']>) => void;
  resetSettings: () => void;
}

/**
 * createThemeSlice: 테마 관련 Zustand 슬라이스 생성
 * @param set - Zustand 상태 설정 함수
 * @param get - Zustand 상태 가져오기 함수
 * @returns ThemeState 객체
 */
export const createThemeSlice: StateCreator<ThemeState> = (set, get) => ({
  // 초기 상태
  themeMode: 'system', // 기본값은 시스템 설정 따르기
  ideaMapSettings: { ...DEFAULT_SETTINGS },
  layoutDirection: 'auto', // 기본 레이아웃 방향
  
  // 액션
  /**
   * toggleThemeMode: 테마 모드를 토글 (라이트↔다크)
   */
  toggleThemeMode: () => {
    const currentMode = get().themeMode;
    let newMode: 'light' | 'dark' | 'system';
    
    if (currentMode === 'light') {
      newMode = 'dark';
    } else if (currentMode === 'dark') {
      newMode = 'system';
    } else {
      newMode = 'light';
    }
    
    set({ themeMode: newMode });
    
    // 테마 변경 시 HTML 요소에 데이터 속성 설정 (CSS 변수에 영향)
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      
      if (newMode === 'system') {
        html.removeAttribute('data-theme');
      } else {
        html.setAttribute('data-theme', newMode);
      }
    }
  },
  
  /**
   * setThemeMode: 특정 테마 모드로 직접 설정
   * @param mode - 설정할 테마 모드
   */
  setThemeMode: (mode) => {
    set({ themeMode: mode });
    
    // 테마 변경 시 HTML 요소에 데이터 속성 설정 (CSS 변수에 영향)
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      
      if (mode === 'system') {
        html.removeAttribute('data-theme');
      } else {
        html.setAttribute('data-theme', mode);
      }
    }
  },
  
  /**
   * setLayoutDirection: 레이아웃 방향 설정
   * @param direction - 설정할 레이아웃 방향
   */
  setLayoutDirection: (direction) => {
    set({ layoutDirection: direction });
  },
  
  /**
   * updateIdeaMapSettings: 아이디어맵 설정 업데이트
   * @param settings - 업데이트할 설정 객체 (일부만 포함 가능)
   */
  updateSettings: (settings) => {
    set((state) => ({
      ideaMapSettings: {
        ...state.ideaMapSettings,
        ...settings,
      },
    }));
  },
  
  /**
   * resetIdeaMapSettings: 아이디어맵 설정을 기본값으로 초기화
   */
  resetSettings: () => {
    set({
      ideaMapSettings: { ...DEFAULT_SETTINGS },
    });
  },
}); 