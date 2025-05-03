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
 * 수정일: 2025-04-21 : 프로젝트 로딩 로직 제거 및 useAppStore의 activeProjectId 사용
 * 수정일: 2025-04-21 : 데이터 로딩 및 상태 동기화 시점 명확화 - 카드와 엣지 데이터가 모두 로드된 후 상태 일괄 업데이트
 * 수정일: 2025-04-21 : useEdges 훅 호출 수정 - 첫 번째 인자(userId) 제거 및 activeProjectId만 전달하도록 변경
 * 수정일: 2025-04-21 : useCardNodes 훅 사용 추가 - DB에서 CardNode 데이터 로드하도록 수정
 * 수정일: 2025-04-21 : mergeCardsWithNodes 함수 구현 - CardNode와 Card 데이터를 병합하여 ReactFlow 노드 배열 생성
 * 수정일: 2025-04-30 : nodes와 syncCardsWithNodes 관련 참조 제거
 * 수정일: 2025-05-12 : useIdeaMapStore에서 setNodes 액션 추가 및 데이터 변경 시 노드 상태 업데이트 로직 구현
 * 수정일: 2025-05-12 : updateNodesSelectively 대신 setNodes 직접 호출로 변경하여 ReactFlow 인스턴스 의존성 제거
 * 수정일: 2025-05-21 : 데이터 로딩 및 상태 동기화 로직 개선 - cardsData, cardNodesData, edgesData가 모두 로드된 경우에만 setNodes/setEdges 호출
 */

import { Edge } from '@xyflow/react';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Node } from '@xyflow/react';
import { useAppStore } from '@/store/useAppStore';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import { useAuthStore, selectUserId } from '@/store/useAuthStore';
import { useEdges } from '@/hooks/useEdges';
import { useCards } from '@/hooks/useCards';
import { useCardNodes } from '@/hooks/useCardNodes';
import createLogger from '@/lib/logger';
import { CardNode } from '@prisma/client';

import { Node as NodeType, CardData } from '../types/ideamap-types';

// 로거 생성
const logger = createLogger('useIdeaMapData');

/**
 * mergeCardsWithNodes: CardNode와 Card 데이터를 병합하여 ReactFlow 노드 배열 생성
 * @param dbCardNodes CardNode 데이터 배열
 * @param cardsData Card 데이터 배열
 * @returns ReactFlow 노드 배열
 */
function mergeCardsWithNodes(dbCardNodes: CardNode[], cardsData: CardData[]): Node<CardData>[] {
  logger.debug('CardNode와 Card 데이터 병합 시작', { 
    cardNodeCount: dbCardNodes.length, 
    cardCount: cardsData.length 
  });

  const cardsMap = new Map(cardsData.map(card => [card.id, card]));
  
  // dbCardNodes 배열을 순회하며 각 CardNode에 대해 ReactFlow 노드 객체 생성
  const reactFlowNodes = dbCardNodes.map(cardNode => {
    // cardNode.cardId와 일치하는 카드 찾기
    const card = cardsMap.get(cardNode.cardId);

    if (!card) {
      logger.warn(`CardNode(id: ${cardNode.id})에 연결된 Card(id: ${cardNode.cardId})를 찾을 수 없음`);
      return null;
    }

    // 카드 데이터로부터 노드 데이터 객체 생성
    const nodeData: CardData = {
      id: card.id,      // Card ID
      cardId: card.id,  // 명시적으로 cardId 필드 추가
      title: card.title,
      content: card.content,
      tags: card.tags || [],
      cardTags: card.cardTags || [],
      // CardNode의 스타일 정보와 추가 데이터
      styleJson: cardNode.styleJson || {},
      dataJson: cardNode.dataJson || {}
    };

    // ReactFlow 노드 객체 생성
    return {
      id: cardNode.id, // React Flow 노드의 ID는 이제 CardNode 테이블의 PK
      type: 'card', // 노드 타입
      position: { 
        x: cardNode.positionX, 
        y: cardNode.positionY 
      },
      data: nodeData,
      // 선택적: 노드 스타일링 (cardNode.styleJson에서 가져올 수 있음)
      style: {
        // 기본 스타일
        // 필요시 cardNode.styleJson에서 스타일 추가
      }
    };
  }).filter(Boolean) as Node<CardData>[]; // null 값 제거

  logger.debug('CardNode와 Card 데이터 병합 완료', { reactFlowNodesCount: reactFlowNodes.length });
  
  return reactFlowNodes;
}

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
  const edges = useIdeaMapStore(state => state.edges);
  const setEdges = useIdeaMapStore(state => state.setEdges);
  const setNodes = useIdeaMapStore(state => state.setNodes); // 노드 상태를 직접 업데이트하기 위한 함수 추가
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
    data: cardsData = [],
    isLoading: isCardsLoading, 
    isSuccess: isCardsSuccess, 
    error: cardsError 
  } = useCards();

  // TanStack Query로 CardNode 데이터 조회
  const {
    data: dbCardNodes = [],
    isLoading: isCardNodesLoading,
    isSuccess: isCardNodesSuccess,
    error: cardNodesError
  } = useCardNodes(activeProjectId || undefined);
  
  // TanStack Query로 엣지 데이터 조회
  const { 
    data: edgesData = [], 
    isLoading: isEdgesLoading, 
    isSuccess: isEdgesSuccess,
    error: edgesError 
  } = useEdges(activeProjectId || undefined);
  
  // 전체 로딩 상태 계산
  const isDataLoading = isCardsLoading || isEdgesLoading || isCardNodesLoading;
  const isSuccess = isCardsSuccess && isEdgesSuccess && isCardNodesSuccess;
  const dataError = cardsError || edgesError || cardNodesError;
  
  // 데이터 로딩 완료 시 상태 일괄 업데이트
  useEffect(() => {
    // 카드 및 카드 노드 데이터가 모두 성공적으로 로드된 경우에만 처리
    if (isCardNodesSuccess && isCardsSuccess && dbCardNodes && cardsData) {
      logger.debug('카드 및 카드노드 데이터 변경 감지', { 
        cardCount: cardsData.length, 
        cardNodeCount: dbCardNodes.length 
      });
      
      // CardNode와 Card 데이터를 병합하여 ReactFlow 노드 배열 생성
      const reactFlowNodes = mergeCardsWithNodes(dbCardNodes, cardsData);
      logger.debug('병합된 React Flow 노드 생성됨', { 
        count: reactFlowNodes.length, 
        nodeIds: reactFlowNodes.map(n => n.id).join(', ')
      });
      
      // Zustand 스토어의 setNodes 액션을 직접 호출하여 노드 상태 업데이트
      logger.debug('Zustand 스토어의 nodes 상태 업데이트 중...', { nodeCount: reactFlowNodes.length });
      setNodes(reactFlowNodes);
      logger.info('노드 상태 업데이트 완료', { nodeCount: reactFlowNodes.length });
    }
  }, [cardsData, dbCardNodes, isCardsSuccess, isCardNodesSuccess, setNodes]);
  
  // 엣지 데이터 로딩 완료 시 엣지 상태 업데이트
  useEffect(() => {
    // 엣지 데이터가 성공적으로 로드된 경우에만 처리
    if (isEdgesSuccess && edgesData) {
      logger.debug('엣지 데이터 변경 감지', { edgeCount: edgesData.length });
      
      // Zustand 스토어의 setEdges 액션을 직접 호출하여 엣지 상태 업데이트
      logger.debug('Zustand 스토어의 edges 상태 업데이트 중...', { edgeCount: edgesData.length });
      setEdges(edgesData);
      logger.info('엣지 상태 업데이트 완료', { edgeCount: edgesData.length });
    }
  }, [edgesData, isEdgesSuccess, setEdges]);
  
  // 모든 데이터 로딩 상태 관리
  useEffect(() => {
    if (isSuccess) {
      logger.info('[useIdeaMapData] 모든 데이터 로드 완료. 로딩 상태 업데이트.');
      
      // 로딩 상태 업데이트
      setIsLoading(false);
      initialLoadCompleteRef.current = true;
      
    } else if (dataError) {
      logger.error('[useIdeaMapData] 데이터 로드 중 오류 발생:', dataError);
      // 에러 처리 (예: 스토어 초기화, 에러 상태 설정)
      useIdeaMapStore.setState({ edges: [] });
      setError(dataError instanceof Error ? dataError : new Error('데이터 로드 중 오류가 발생했습니다'));
      setIsLoading(false);
    }
  }, [isSuccess, dataError]);
  
  // 앱 카드 상태 설정
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
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node<CardData>) => {
    logger.debug('노드 클릭:', { nodeId: node.id, nodeType: node.type });
    
    // 카드 노드인 경우 콜백 호출
    if (node.type === 'card') {
      // 중요: node.data.id는 이제 Card ID입니다 (node.id는 CardNode ID)
      onSelectCard(node.data.id);
    }
  }, [onSelectCard]);
  
  // 메모이제이션된 React Flow 노드 생성
  const reactFlowNodes = useMemo(() => {
    if (!isSuccess || !cardsData || !dbCardNodes) return [];
    
    return mergeCardsWithNodes(dbCardNodes, cardsData);
  }, [isSuccess, cardsData, dbCardNodes]);
  
  return {
    // 상태
    isLoading: isLoading || isDataLoading,
    error,
    loadIdeaMapData, // 실제로는 사용되지 않음
    // 아이디어맵 데이터
    nodes: reactFlowNodes,
    edges,
    // 함수들
    handleNodeClick,
    loadNodesAndEdges, // 하위 호환성 유지용
  };
} 