/**
 * 파일명: src/hooks/useIdeaMapSync.ts
 * 목적: 아이디어맵의 서버-로컬 데이터 동기화를 위한 훅
 * 역할: 엣지와 카드 데이터를 동기화하여 아이디어맵에 표시
 * 작성일: 2024-07-01
 */

import { useEffect } from 'react';
import { toast } from 'sonner';

import { useCards } from '@/hooks/useCards';
import { useEdges } from '@/hooks/useEdges';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import { toReactFlowEdge } from '@/types/edge';
import createLogger from '@/lib/logger';

const logger = createLogger('useIdeaMapSync');

/**
 * useIdeaMapSync: 아이디어맵의 서버-로컬 데이터 동기화를 위한 훅
 * @returns {Object} 로딩 상태와 에러 정보
 */
export function useIdeaMapSync() {
  // 카드 데이터 조회
  const { data: cards = [], isLoading: isCardsLoading, error: cardsError } = useCards();
  
  // 엣지 데이터 조회 (추가)
  const { data: edges = [], isLoading: isEdgesLoading, error: edgesError } = useEdges();
  
  // 아이디어맵 스토어
  const {
    setNodes,
    setEdges,
    isIdeaMapLoading,
    ideaMapError
  } = useIdeaMapStore();

  // 카드 → 노드 변환 및 동기화
  useEffect(() => {
    if (!isCardsLoading && cards.length > 0) {
      logger.debug('카드 데이터를 노드로 변환 시작', { 카드수: cards.length });
      
      const nodes = cards.map((card, index) => {
        return {
          id: card.id,
          type: 'card',
          // 기본 위치 설정 (실제로는 별도 위치 정보와 함께 저장되어야 함)
          position: { 
            x: (index % 5) * 250, 
            y: Math.floor(index / 5) * 150 
          },
          data: {
            ...card,
            tags: card.cardTags ? card.cardTags.map(cardTag => cardTag.tag.name) : []
          }
        };
      });
      
      setNodes(nodes);
      logger.debug('노드 변환 및 설정 완료', { 노드수: nodes.length });
    }
  }, [cards, isCardsLoading, setNodes]);

  // 엣지 동기화 (추가)
  useEffect(() => {
    if (!isEdgesLoading && edges.length > 0) {
      logger.debug('엣지 데이터 동기화 시작', { 엣지수: edges.length });
      
      // 서버 엣지를 ReactFlow 엣지 형식으로 변환
      const reactFlowEdges = edges.map(edge => toReactFlowEdge(edge));
      
      // useIdeaMapStore에 엣지 설정
      setEdges(reactFlowEdges);
      logger.debug('엣지 변환 및 설정 완료', { 엣지수: reactFlowEdges.length });
    }
  }, [edges, isEdgesLoading, setEdges]);

  // 에러 처리
  useEffect(() => {
    if (cardsError) {
      toast.error('카드 데이터를 불러오는 중 오류가 발생했습니다');
      logger.error('카드 데이터 로드 오류:', cardsError);
    }
    
    if (edgesError) {
      toast.error('엣지 데이터를 불러오는 중 오류가 발생했습니다');
      logger.error('엣지 데이터 로드 오류:', edgesError);
    }
  }, [cardsError, edgesError]);

  return {
    isLoading: isCardsLoading || isEdgesLoading || isIdeaMapLoading,
    error: cardsError || edgesError || ideaMapError
  };
} 