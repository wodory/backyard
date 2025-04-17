/**
 * 파일명: useIdeaMapData.ts
 * 목적: 아이디어맵 데이터 로드 및 관리를 위한 커스텀 훅
 * 역할: useIdeaMapStore에서 아이디어맵 데이터와 로딩 상태를 가져오는 래퍼 훅
 * 작성일: 2025-03-28
 * 수정일: 2025-04-10
 */

import { Edge } from '@xyflow/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Node } from '@xyflow/react';
import { useAppStore } from '@/store/useAppStore';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';

import { Node as NodeType, CardData } from '../types/ideamap-types';

/**
 * useIdeaMapData: 아이디어맵 데이터를 로드하고 관리하는 훅
 * @param onSelectCard 카드 선택 시 호출될 콜백 함수
 * @returns {Object} 아이디어맵 데이터 관련 상태와 함수들
 */
export function useIdeaMapData(onSelectCard: (cardId: string) => void) {
  console.log('[useIdeaMapData] 훅 초기화');
  
  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // 초기 데이터 로드 완료 여부 추적
  const initialLoadCompleteRef = useRef(false);
  
  // 아이디어맵 스토어에서 필요한 상태와 액션 가져오기
  const nodes = useIdeaMapStore(state => state.nodes);
  const edges = useIdeaMapStore(state => state.edges);
  const isIdeaMapLoading = useIdeaMapStore(state => state.isIdeaMapLoading);
  const ideaMapError = useIdeaMapStore(state => state.ideaMapError);
  const loadIdeaMapData = useIdeaMapStore(state => state.loadIdeaMapData);
  const loadedViewport = useIdeaMapStore(state => state.loadedViewport);
  const needsFitView = useIdeaMapStore(state => state.needsFitView);
  
  // 앱 스토어에서 필요한 상태와 액션 가져오기
  const setCards = useAppStore(state => state.setCards);
  
  /**
   * 노드와 엣지 데이터 로드 함수
   */
  const loadNodesAndEdges = useCallback(async () => {
    console.log('[useIdeaMapData] loadNodesAndEdges 함수 호출');
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[useIdeaMapData] 아이디어맵 데이터 로드 시작');
      // 카드 데이터 API에서 가져오기
      const response = await fetch('/api/cards');
      
      if (!response.ok) {
        throw new Error(`데이터 로드 실패 (상태: ${response.status})`);
      }
      
      const cardData = await response.json();
      console.log('[useIdeaMapData] API에서 카드 데이터 로드 완료:', { 카드수: cardData.length });
      
      // 전역 상태에 카드 데이터 저장
      setCards(cardData);
      
      // 아이디어맵 스토어에서 노드/엣지 데이터 로드
      console.log('[useIdeaMapData] 아이디어맵 스토어의 loadIdeaMapData 함수 호출');
      await loadIdeaMapData();
      
      setIsLoading(false);
      console.log('[useIdeaMapData] 데이터 로드 완료', { 
        노드수: nodes.length, 
        엣지수: edges.length 
      });
      initialLoadCompleteRef.current = true;
      
    } catch (err) {
      console.error('[useIdeaMapData] 데이터 로드 중 오류 발생:', err);
      setError(err instanceof Error ? err : new Error('데이터 로드 중 오류가 발생했습니다'));
      setIsLoading(false);
    }
  }, [loadIdeaMapData, setCards, nodes, edges]);
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    console.log('[useIdeaMapData] 초기 데이터 로드 Effect 실행, 로드 완료 상태:', initialLoadCompleteRef.current);
    
    if (!initialLoadCompleteRef.current) {
      loadNodesAndEdges();
    }
  }, [loadNodesAndEdges]);
  
  // 노드 변경 감지 Effect
  useEffect(() => {
    console.log('[useIdeaMapData] 노드 변경 감지 Effect, 노드 수:', nodes.length);
    
    if (nodes.length > 0 && isLoading) {
      console.log('[useIdeaMapData] 노드가 로드됨, 로딩 상태 false로 변경');
      setIsLoading(false);
    }
  }, [nodes, isLoading]);
  
  // 노드 클릭 핸들러
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('[useIdeaMapData] 노드 클릭:', { nodeId: node.id, nodeType: node.type });
    
    // 카드 노드인 경우 콜백 호출
    if (node.type === 'card') {
      onSelectCard(node.id);
    }
  }, [onSelectCard]);
  
  return {
    nodes,
    edges,
    isLoading,
    error,
    handleNodeClick,
    loadNodesAndEdges,
    loadedViewport,
    needsFitView
  };
} 