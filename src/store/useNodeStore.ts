/**
 * 파일명: useNodeStore.ts
 * 목적: 노드 인스펙터 관련 상태 관리
 * 역할: 선택된 노드 정보와 인스펙터 UI 상태 관리
 * 작성일: 2025-03-28
 */

import { Node } from '@xyflow/react';
import { create } from 'zustand';

// 노드 스토어 상태 인터페이스
interface NodeStore {
  // 인스펙터 관련 상태
  inspectorOpen: boolean;
  inspectedNode: Node | null;
  
  // 상태 변경 함수
  setInspectorOpen: (open: boolean) => void;
  setInspectedNode: (node: Node | null) => void;
  
  // 노드 검사 함수
  inspectNode: (node: Node) => void;
  closeInspector: () => void;
}

/**
 * useNodeStore: 노드 인스펙터 관련 상태 관리 스토어
 */
export const useNodeStore = create<NodeStore>((set) => ({
  // 초기 상태
  inspectorOpen: false,
  inspectedNode: null,
  
  // 상태 변경 함수
  setInspectorOpen: (open) => set({ inspectorOpen: open }),
  setInspectedNode: (node) => set({ inspectedNode: node }),
  
  // 유틸리티 함수
  inspectNode: (node) => set({ 
    inspectedNode: node, 
    inspectorOpen: true 
  }),
  
  closeInspector: () => set({ 
    inspectorOpen: false 
  }),
})); 