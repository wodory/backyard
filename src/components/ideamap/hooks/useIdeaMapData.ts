/**
 * 파일명: useIdeaMapData.ts
 * 목적: 아이디어맵 데이터 로드 및 관리를 위한 커스텀 훅
 * 역할: useIdeaMapStore에서 아이디어맵 데이터와 로딩 상태를 가져오는 래퍼 훅
 * 작성일: 2025-03-28
 * 수정일: 2025-04-10
 * 수정일: 2025-04-17 : 렌더링 최적화 (불필요한 리렌더링 방지)
 * 수정일: 2025-04-19 : 로그 최적화 - 과도한 콘솔 로그 제거 및 logger.debug로 변경
 * 수정일: 2025-04-19 : 개발 환경에서 useEffect 이중 실행 방지 로직 추가
 * 수정일: 2025-05-07 : setCards 호출 시 안전하게 처리하도록 수정
 * 수정일: 2025-04-21 : useEdges 훅을 사용하여 DB에서 엣지 데이터 로드 추가
 * 수정일: 2025-04-21 : 프로젝트 API에서 첫 번째 프로젝트 ID를 가져와 사용하도록 수정
 * 수정일: 2025-04-29 : 프로젝트 로딩 로직 제거 및 useAppStore의 activeProjectId 사용
 * 수정일: 2025-04-21 : 데이터 로딩 및 상태 동기화 시점 명확화 - 카드와 엣지 데이터가 모두 로드된 후 상태 일괄 업데이트
 */

import { Edge } from '@xyflow/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Node } from '@xyflow/react';
import { useAppStore } from '@/store/useAppStore';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import { useAuthStore, selectUserId } from '@/store/useAuthStore';
import { useEdges } from '@/hooks/useEdges';
import { useCards } from '@/hooks/useCards';
import createLogger from '@/lib/logger';
import { IDEAMAP_LAYOUT_STORAGE_KEY } from '@/lib/ideamap-constants';

import { Node as NodeType, CardData } from '../types/ideamap-types';

// 로거 생성
const logger = createLogger('useIdeaMapData');

/**
 * useIdeaMapData: 아이디어맵 데이터를 로드하고 관리하는 훅
 * @param onSelectCard 카드 선택 시 호출될 콜백 함수
 * @returns {Object} 아이디어맵 데이터 관련 상태와 함수들
 */
export function useIdeaMapData(onSelectCard: (cardId: string) => void) {
  // logger.debug('훅 초기화');
  
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
  const setNodes = useIdeaMapStore(state => state.setNodes);
  const setEdges = useIdeaMapStore(state => state.setEdges);
  const syncCardsWithNodes = useIdeaMapStore(state => state.syncCardsWithNodes);
  const isIdeaMapLoading = useIdeaMapStore(state => state.isIdeaMapLoading);
  const ideaMapError = useIdeaMapStore(state => state.ideaMapError);
  const loadIdeaMapData = useIdeaMapStore(state => state.loadIdeaMapData);
  const loadedViewport = useIdeaMapStore(state => state.loadedViewport);
  const needsFitView = useIdeaMapStore(state => state.needsFitView);
  
  // 앱 스토어에서 필요한 상태 가져오기
  const setCards = useAppStore(state => state.setCards);
  const activeProjectId = useAppStore(state => state.activeProjectId);
  
  // 인증 스토어에서 사용자 ID 가져오기
  const userId = useAuthStore(selectUserId);
  
  // TanStack Query로 카드 데이터 조회
  const { 
    data: cardsData,
    isLoading: isCardsLoading, 
    isSuccess: isCardsSuccess, 
    error: cardsError 
  } = useCards();
  
  // TanStack Query로 엣지 데이터 조회
  const { 
    data: edgesData, 
    isLoading: isEdgesLoading, 
    isSuccess: isEdgesSuccess,
    error: edgesError 
  } = useEdges(userId || undefined, activeProjectId || undefined);
  
  // 전체 로딩 상태 계산
  const isDataLoading = isCardsLoading || isEdgesLoading;
  const isSuccess = isCardsSuccess && isEdgesSuccess;
  const dataError = cardsError || edgesError;
  
  // 데이터 로딩 완료 시 상태 일괄 업데이트
  useEffect(() => {
    if (isSuccess && cardsData && edgesData) {
      logger.info('[useIdeaMapData] 모든 데이터 로드 완료. Zustand 스토어 업데이트 시작.');

      // 카드와 엣지 데이터가 모두 로드되었을 때 스토어 상태 업데이트
      syncCardsWithNodes(true); // 강제 새로고침 모드로 호출

      // 엣지 상태 업데이트
      setEdges(edgesData);
      
      logger.info('[useIdeaMapData] 노드와 엣지 상태 업데이트 완료.', { 
        cardCount: cardsData.length, 
        edgeCount: edgesData.length
      });
      
      // 로딩 상태 업데이트
      setIsLoading(false);
      initialLoadCompleteRef.current = true;
      
    } else if (dataError) {
      logger.error('[useIdeaMapData] 데이터 로드 중 오류 발생:', dataError);
      // 에러 처리 (예: 스토어 초기화, 에러 상태 설정)
      useIdeaMapStore.setState({ nodes: [], edges: [] });
      setError(dataError instanceof Error ? dataError : new Error('데이터 로드 중 오류가 발생했습니다'));
      setIsLoading(false);
    }
  }, [isSuccess, cardsData, edgesData, syncCardsWithNodes, setEdges, dataError]);
  
  // 앱 카드 상태 설정 (리팩토링 후 제거 가능)
  useEffect(() => {
    if (isCardsSuccess && cardsData) {
      // 전역 상태에 카드 데이터 저장 - 안전하게 처리
      if (cardsData) {
        setCards(cardsData);
        logger.debug('앱 스토어에 카드 데이터 설정 완료:', { 카드수: cardsData.length });
      } else {
        // 데이터가 null이거나 undefined인 경우 빈 배열로 처리
        setCards([]);
        logger.warn('API에서 반환된 카드 데이터가 없거나 유효하지 않습니다. 빈 배열로 설정합니다.');
      }
    }
  }, [isCardsSuccess, cardsData, setCards]);
  
  /**
   * 노드와 엣지 데이터 로드 함수 (기존 방식 유지 - 하위 호환성)
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
      
      // 각 Query 훅이 자동으로 로드되므로 별도 작업 불필요
      logger.debug('React Query 자동 데이터 로드 의존');
      
    } catch (err) {
      logger.error('데이터 로드 중 오류 발생:', err);
      setError(err instanceof Error ? err : new Error('데이터 로드 중 오류가 발생했습니다'));
      setIsLoading(false);
    }
  }, [isLoading]);
  
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
    isLoading: isDataLoading,
    error: dataError,
    handleNodeClick,
    loadNodesAndEdges,
    loadedViewport,
    needsFitView
  };
} 