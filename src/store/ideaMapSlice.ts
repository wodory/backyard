/**
 * 파일명: src/store/ideaMapSlice.ts
 * 목적: 아이디어맵 UI 상태를 관리하는 Zustand 슬라이스
 * 역할: 아이디어맵 UI 설정 및 ReactFlow 인스턴스 관리
 * 작성일: 2025-04-21
 */

import { ReactFlowInstance, ConnectionLineType, MarkerType } from '@xyflow/react';
import { StateCreator } from 'zustand';

import { IdeaMapSettings, DEFAULT_IDEAMAP_SETTINGS } from '@/lib/ideamap-utils';

/**
 * 아이디어맵 상태 인터페이스
 */
export interface IdeaMapState {
  // React Flow 인스턴스
  reactFlowInstance: ReactFlowInstance | null;
  setReactFlowInstance: (instance: ReactFlowInstance | null) => void;
  
  // 아이디어맵 설정 (UI 상태)
  ideaMapSettings: IdeaMapSettings;
  updateIdeaMapSettings: (settings: Partial<IdeaMapSettings>) => void;
  
  // 레이아웃 방향
  layoutDirection: 'horizontal' | 'vertical' | 'auto' | null;
  setLayoutDirection: (direction: 'horizontal' | 'vertical' | 'auto' | null) => void;
}

/**
 * createIdeaMapSlice: 아이디어맵 UI 상태를 관리하는 Zustand 슬라이스 생성
 */
export const createIdeaMapSlice: StateCreator<IdeaMapState> = (set) => ({
  // React Flow 인스턴스
  reactFlowInstance: null,
  setReactFlowInstance: (instance) => set({ reactFlowInstance: instance }),
  
  // 아이디어맵 설정 (UI 상태)
  ideaMapSettings: DEFAULT_IDEAMAP_SETTINGS,
  updateIdeaMapSettings: (newSettings) => set((state) => ({ 
    ideaMapSettings: { ...state.ideaMapSettings, ...newSettings } 
  })),
  
  // 레이아웃 방향
  layoutDirection: null,
  setLayoutDirection: (direction) => set({ layoutDirection: direction }),
}); 