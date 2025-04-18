/**
 * 파일명: useIdeaMapData.ts
 * 목적: 아이디어맵 데이터 로드 및 관리를 위한 커스텀 훅
 * 역할: useIdeaMapStore에서 아이디어맵 데이터와 로딩 상태를 가져오는 래퍼 훅
 * 작성일: 2025-03-28
 * 수정일: 2025-04-10
 * 수정일: 2025-04-17 : 렌더링 최적화 (불필요한 리렌더링 방지)
 * 수정일: 2025-04-19 : 로그 최적화 - 과도한 콘솔 로그 제거 및 logger.debug로 변경
 * 수정일: 2025-04-19 : 개발 환경에서 useEffect 이중 실행 방지 로직 추가
 */

import { Edge } from '@xyflow/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Node } from '@xyflow/react';
import { useAppStore } from '@/store/useAppStore';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import createLogger from '@/lib/logger';

import { Node as NodeType, CardData } from '../types/ideamap-types';

// 로거 생성
const logger = createLogger('useIdeaMapData');

/**
 * useIdeaMapData: 아이디어맵 데이터를 로드하고 관리하는 훅
 * @param onSelectCard 카드 선택 시 호출될 콜백 함수
 * @returns {Object} 아이디어맵 데이터 관련 상태와 함수들
 */
export function useIdeaMapData(onSelectCard: (cardId: string) => void) {
  logger.debug('훅 초기화');
  
  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // 초기 데이터 로드 완료 여부 추적
  const initialLoadCompleteRef = useRef(false);
  // 개발 환경에서 Strict Mode로 인한 이중 실행 방지를 위한 ref
  const didFetch = useRef(false);
  
  // 아이디어맵 스토어에서 필요한 상태와 액션만 선택적으로 가져오기
  const nodes = useIdeaMapStore(state => state.nodes);
  const edges = useIdeaMapStore(state => state.edges);
  const isIdeaMapLoading = useIdeaMapStore(state => state.isIdeaMapLoading);
  const ideaMapError = useIdeaMapStore(state => state.ideaMapError);
  const loadIdeaMapData = useIdeaMapStore(state => state.loadIdeaMapData);
  const loadedViewport = useIdeaMapStore(state => state.loadedViewport);
  const needsFitView = useIdeaMapStore(state => state.needsFitView);
  
  // 앱 스토어에서 필요한 액션만 선택적으로 가져오기
  const setCards = useAppStore(state => state.setCards);
  
  /**
   * 노드와 엣지 데이터 로드 함수
   */
  const loadNodesAndEdges = useCallback(async () => {
    logger.debug('loadNodesAndEdges 함수 호출');
    
    // 이미 로드 완료된 상태면 중복 호출 방지
    if (initialLoadCompleteRef.current && !isLoading) {
      logger.debug('이미 데이터 로드 완료, 중복 호출 방지');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      logger.debug('아이디어맵 데이터 로드 시작');
      // 카드 데이터 API에서 가져오기
      const response = await fetch('/api/cards');
      
      if (!response.ok) {
        throw new Error(`데이터 로드 실패 (상태: ${response.status})`);
      }
      
      const cardData = await response.json();
      logger.debug('API에서 카드 데이터 로드 완료:', { 카드수: cardData.length });
      
      // 전역 상태에 카드 데이터 저장
      setCards(cardData);
      
      // 아이디어맵 스토어에서 노드/엣지 데이터 로드
      logger.debug('아이디어맵 스토어의 loadIdeaMapData 함수 호출');
      await loadIdeaMapData();
      
      setIsLoading(false);
      logger.info('데이터 로드 완료', { 
        노드수: nodes.length, 
        엣지수: edges.length 
      });
      initialLoadCompleteRef.current = true;
      
    } catch (err) {
      logger.error('데이터 로드 중 오류 발생:', err);
      setError(err instanceof Error ? err : new Error('데이터 로드 중 오류가 발생했습니다'));
      setIsLoading(false);
    }
  }, [setCards, loadIdeaMapData, isLoading, nodes.length, edges.length]);
  
  // 컴포넌트 마운트 시 데이터 로드 (의존성 배열에 모든 변수를 명시)
  useEffect(() => {
    logger.debug('초기 데이터 로드 Effect 실행, 로드 완료 상태:', initialLoadCompleteRef.current);
    
    // Strict Mode 이중 실행 방지 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development' && didFetch.current) {
      logger.debug('Strict Mode 이중 실행 방지됨');
      return;
    }
    didFetch.current = true;
    
    if (!initialLoadCompleteRef.current) {
      loadNodesAndEdges();
    }
  }, [loadNodesAndEdges]);
  
  // 노드 변경 감지 Effect
  useEffect(() => {
    logger.debug('노드 변경 감지 Effect, 노드 수:', nodes.length);
    
    if (nodes.length > 0 && isLoading) {
      logger.debug('노드가 로드됨, 로딩 상태 false로 변경');
      setIsLoading(false);
    }
  }, [nodes.length, isLoading]);
  
  // 노드 클릭 핸들러
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    logger.debug('노드 클릭:', { nodeId: node.id, nodeType: node.type });
    
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