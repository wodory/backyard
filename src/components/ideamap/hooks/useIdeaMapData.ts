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
 */

import { Edge } from '@xyflow/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Node } from '@xyflow/react';
import { useAppStore } from '@/store/useAppStore';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import { useAuthStore, selectUserId } from '@/store/useAuthStore';
import { useEdges } from '@/hooks/useEdges';
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
  // logger.debug('훅 초기화');
  
  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // 초기 데이터 로드 완료 여부 추적
  const initialLoadCompleteRef = useRef(false);
  // 개발 환경에서 Strict Mode로 인한 이중 실행 방지를 위한 ref
  const didFetch = useRef(false);
  // DB 엣지 로드 완료 여부 추적
  const edgesLoadedRef = useRef(false);
  
  // 아이디어맵 스토어에서 필요한 상태와 액션만 선택적으로 가져오기
  const nodes = useIdeaMapStore(state => state.nodes);
  const edges = useIdeaMapStore(state => state.edges);
  const setEdges = useIdeaMapStore(state => state.setEdges);
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
  
  // TanStack Query로 엣지 데이터 조회
  const { 
    data: dbEdges, 
    isLoading: isEdgesLoading, 
    isSuccess: isEdgesSuccess,
    error: edgesError 
  } = useEdges(userId || undefined, activeProjectId || undefined);
  
  // DB 엣지 데이터를 스토어에 저장
  useEffect(() => {
    if (isEdgesSuccess && dbEdges && !edgesLoadedRef.current) {
      logger.debug(`DB에서 로드한 엣지 데이터(${dbEdges.length}개)를 스토어에 설정`);
      setEdges(dbEdges);
      edgesLoadedRef.current = true;
    }
    
    if (edgesError) {
      logger.error('엣지 데이터 로드 중 오류 발생:', edgesError);
      setError(edgesError instanceof Error ? edgesError : new Error('엣지 데이터 로드 중 오류가 발생했습니다'));
    }
  }, [dbEdges, isEdgesSuccess, edgesError, setEdges]);
  
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
      
      // 전역 상태에 카드 데이터 저장 - 안전하게 처리
      if (cardData) {
        setCards(cardData);
      } else {
        // 데이터가 null이거나 undefined인 경우 빈 배열로 처리
        setCards([]);
        logger.warn('API에서 반환된 카드 데이터가 없거나 유효하지 않습니다. 빈 배열로 설정합니다.');
      }
      
      // 아이디어맵 스토어에서 노드/엣지 데이터 로드
      logger.debug('아이디어맵 스토어의 loadIdeaMapData 함수 호출');
      await loadIdeaMapData();
      
      // 엣지 데이터는 useEdges 훅을 통해 별도로 로드됨
      
      setIsLoading(false);
      logger.info('데이터 로드 완료', { 
        노드수: nodes.length
      });
      initialLoadCompleteRef.current = true;
      
    } catch (err) {
      logger.error('데이터 로드 중 오류 발생:', err);
      setError(err instanceof Error ? err : new Error('데이터 로드 중 오류가 발생했습니다'));
      setIsLoading(false);
    }
  }, [setCards, loadIdeaMapData, isLoading, nodes.length]);
  
  // 컴포넌트 마운트 시 데이터 로드 (의존성 배열에 모든 변수를 명시)
  useEffect(() => {
    logger.debug('초기 데이터 로드 Effect 실행, 로드 완료 상태:', initialLoadCompleteRef.current);
    
    // Strict Mode 이중 실행 방지 (개발 환경에서만)
    // if (process.env.NODE_ENV === 'development' && didFetch.current) {
    //   logger.debug('Strict Mode 이중 실행 방지됨');
    //   return;
    // }
    didFetch.current = true;
    
    if (!initialLoadCompleteRef.current) {
      loadNodesAndEdges();
    }
  }, [loadNodesAndEdges]);
  
  // DB 데이터 로드 상태 통합
  const isDataLoading = isLoading || isEdgesLoading;
  const dataError = error || edgesError;
  
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
    isLoading: isDataLoading,
    error: dataError,
    handleNodeClick,
    loadNodesAndEdges,
    loadedViewport,
    needsFitView
  };
} 