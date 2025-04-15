/**
 * 파일명: useIdeaMapData.ts
 * 목적: 아이디어맵 데이터 로드 및 관리를 위한 커스텀 훅
 * 역할: useIdeaMapStore에서 아이디어맵 데이터와 로딩 상태를 가져오는 래퍼 훅
 * 작성일: 2025-03-28
 * 수정일: 2025-04-10
 */

import { Edge } from '@xyflow/react';

import { useIdeaMapStore } from '@/store/useIdeaMapStore';

import { Node, CardData } from '../types/ideamap-types';

/**
 * useIdeaMapData: 아이디어맵 데이터 로드 및 관리를 위한 커스텀 훅
 * @param onSelectCard 노드 선택 시 호출될 콜백 함수
 * @returns 데이터 로드 상태 및 관련 함수
 */
export function useIdeaMapData(onSelectCard?: (cardId: string | null) => void) {
  // 아이디어맵 스토어에서 필요한 상태와 액션 가져오기
  const nodes = useIdeaMapStore(state => state.nodes);
  const edges = useIdeaMapStore(state => state.edges);
  const isIdeaMapLoading = useIdeaMapStore(state => state.isIdeaMapLoading);
  const ideaMapError = useIdeaMapStore(state => state.ideaMapError);
  const loadIdeaMapData = useIdeaMapStore(state => state.loadIdeaMapData);
  const loadedViewport = useIdeaMapStore(state => state.loadedViewport);
  const needsFitView = useIdeaMapStore(state => state.needsFitView);
  
  /**
   * 노드와 엣지 데이터 로드 함수 - 이제는 단순히 스토어 액션을 호출
   * 하위 호환성을 위해 함수 시그니처 유지
   */
  const loadNodesAndEdges = async (reactFlowInstance?: any) => {
    await loadIdeaMapData();
    return { nodes, edges };
  };
  
  // 이전과 동일한 인터페이스 유지
  return {
    nodes,
    edges,
    isLoading: isIdeaMapLoading,
    error: ideaMapError,
    loadNodesAndEdges,
    loadedViewport,
    needsFitView
  };
} 