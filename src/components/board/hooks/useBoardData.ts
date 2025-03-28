/**
 * 파일명: useBoardData.ts
 * 목적: 보드 데이터 로드 및 관리를 위한 커스텀 훅
 * 역할: API에서 카드 데이터를 가져와 React Flow 노드와 엣지로 변환하는 로직 제공
 * 작성일: 2024-05-30
 */

import { useState, useCallback, useEffect } from 'react';
import { Edge, ReactFlowInstance } from '@xyflow/react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';
import { Node, CardData } from '../types/board-types';

/**
 * useBoardData: 보드 데이터 로드 및 관리를 위한 커스텀 훅
 * @param onSelectCard 노드 선택 시 호출될 콜백 함수
 * @returns 데이터 로드 상태 및 관련 함수
 */
export function useBoardData(onSelectCard?: (cardId: string | null) => void) {
  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node<CardData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  // useAppStore에서 필요한 함수 가져오기
  const setCards = useAppStore(state => state.setCards);
  
  /**
   * fetchBoardData: API에서 카드 데이터를 가져와 노드와 엣지로 변환하는 함수
   * @param reactFlowInstance React Flow 인스턴스 (뷰 조정용)
   * @returns 노드와 엣지 데이터
   */
  const fetchBoardData = useCallback(async (reactFlowInstance?: ReactFlowInstance) => {
    try {
      setIsLoading(true);
      
      // API에서 카드 불러오기
      const response = await fetch('/api/cards');
      if (!response.ok) {
        throw new Error('데이터 불러오기 실패');
      }
      
      const cards = await response.json();
      console.log('[useBoardData] API에서 가져온 카드 데이터:', cards);
      
      // 전역 상태에 카드 목록 저장
      setCards(cards);
      
      // 이전에 저장된 위치 정보 가져오기
      let nodePositions: Record<string, { position: { x: number, y: number } }> = {};
      try {
        const savedPositions = localStorage.getItem(STORAGE_KEY);
        if (savedPositions) {
          nodePositions = JSON.parse(savedPositions);
          console.log('[useBoardData] 저장된 노드 위치:', nodePositions);
        }
      } catch (err) {
        console.error('저장된 위치 불러오기 실패:', err);
      }
      
      // 카드 데이터를 노드로 변환
      const initialNodes = cards.map((card: any, index: number) => {
        // ID에 해당하는 위치 정보가 있으면 사용, 없으면 기본 위치 설정
        const savedPosition = nodePositions[card.id]?.position || { x: index * 250, y: 50 };
        
        // 태그 처리 (카드에 cardTags가 있는 경우와 없는 경우 모두 처리)
        const tags = card.cardTags && card.cardTags.length > 0
          ? card.cardTags.map((cardTag: any) => cardTag.tag.name)
          : (card.tags || []);
        
        return {
          id: card.id,
          type: 'card',
          position: savedPosition,
          data: {
            id: card.id,
            title: card.title,
            content: card.content,
            tags,
            onSelect: onSelectCard,
          },
        };
      });
      
      console.log('[useBoardData] 생성된 노드 데이터:', initialNodes);
      
      // 이전에 저장된 엣지 정보 가져오기
      let initialEdges: Edge[] = [];
      try {
        const savedEdges = localStorage.getItem(EDGES_STORAGE_KEY);
        if (savedEdges) {
          // JSON 파싱된 엣지 데이터
          const parsedEdges = JSON.parse(savedEdges);
          
          // 각 엣지를 순회하면서 type 속성 확인 및 설정
          initialEdges = parsedEdges.map((edge: any) => {
            // 기본 엣지 속성 업데이트
            const updatedEdge = {
              ...edge,
              type: 'custom',  // 명시적으로 custom 타입 지정
            };
            
            // 소스 핸들 ID 업데이트 (예: 'right' -> 'right-source')
            if (edge.sourceHandle) {
              // 핸들 ID가 이미 새 형식(~-source)인지 확인
              if (!edge.sourceHandle.endsWith('-source')) {
                // 기존 핸들 ID에 -source 접미사 추가
                updatedEdge.sourceHandle = `${edge.sourceHandle}-source`;
              }
            }
            
            // 타겟 핸들 ID 업데이트 (예: 'left' -> 'left-target')
            if (edge.targetHandle) {
              // 핸들 ID가 이미 새 형식(~-target)인지 확인
              if (!edge.targetHandle.endsWith('-target')) {
                // 기존 핸들 ID에 -target 접미사 추가
                updatedEdge.targetHandle = `${edge.targetHandle}-target`;
              }
            }
            
            // 이전에 핸들 ID가 없는 경우 기본값 설정
            if (!updatedEdge.sourceHandle) {
              updatedEdge.sourceHandle = 'right-source';
            }
            
            if (!updatedEdge.targetHandle) {
              updatedEdge.targetHandle = 'left-target';
            }
            
            console.log(`[useBoardData] 엣지 ID ${edge.id} 핸들 ID 업데이트: sourceHandle=${updatedEdge.sourceHandle}, targetHandle=${updatedEdge.targetHandle}`);
            
            return updatedEdge;
          });
          
          console.log('[useBoardData] 저장된 엣지 데이터 (타입 검증 후):', initialEdges);
        }
      } catch (err) {
        console.error('저장된 엣지 불러오기 실패:', err);
      }
      
      // 저장된 위치 그대로 사용
      const layoutedNodes = [...initialNodes];
      const layoutedEdges = [...initialEdges];
      
      console.log('[useBoardData] 최종 노드와 엣지:', { nodes: layoutedNodes, edges: layoutedEdges });
      
      // 상태 업데이트
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setIsLoading(false);
      setError(null);
      
      // 모든 노드가 뷰에 맞도록 조정 (Fit to View)
      if (reactFlowInstance) {
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: false });
          console.log('[useBoardData] 뷰에 맞게 화면을 조정했습니다');
        }, 100);
      }
      
      return { nodes: layoutedNodes, edges: layoutedEdges };
    } catch (error) {
      console.error('카드 데이터 불러오기 실패:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다');
      setIsLoading(false);
      setNodes([]);
      setEdges([]);
      return { nodes: [], edges: [] };
    }
  }, [onSelectCard, setCards]);
  
  /**
   * applyStoredLayout: 저장된 레이아웃을 카드 데이터에 적용하는 함수
   * @param cardsData 카드 데이터
   * @param storedLayout 저장된 레이아웃 정보
   * @returns 위치 정보가 적용된 노드 배열
   */
  const applyStoredLayout = useCallback((cardsData: any[], storedLayout: any[]) => {
    return cardsData.map((card: any, index: number) => {
      const cardId = card.id.toString();
      // 저장된 레이아웃에서 해당 카드의 위치 정보 찾기
      const storedPosition = storedLayout.find(item => item.id === cardId)?.position;
      
      // 저장된 위치가 있으면 사용, 없으면 기본 그리드 위치 사용
      const position = storedPosition || {
        x: (index % 3) * 350 + 50,
        y: Math.floor(index / 3) * 250 + 50,
      };
      
      // 카드 태그 준비
      const tags = card.cardTags && card.cardTags.length > 0
        ? card.cardTags.map((cardTag: any) => cardTag.tag.name)
        : [];
      
      return {
        id: cardId,
        type: 'card',
        data: { 
          id: card.id,
          title: card.title,
          content: card.content,
          tags: tags
        },
        position,
      };
    });
  }, []);
  
  /**
   * loadNodesAndEdges: 노드와 엣지 데이터를 로드하는 함수
   * @param reactFlowInstance React Flow 인스턴스
   */
  const loadNodesAndEdges = useCallback(async (reactFlowInstance?: ReactFlowInstance) => {
    try {
      const { nodes, edges } = await fetchBoardData(reactFlowInstance);
      if (nodes.length === 0) {
        toast.info('카드가 없습니다. 새 카드를 추가해보세요.', {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('노드 및 엣지 데이터 로드 실패:', error);
      toast.error('보드 데이터 로드에 실패했습니다.');
    }
  }, [fetchBoardData]);

  // 노드 및 엣지 반환
  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    isLoading,
    error,
    fetchBoardData,
    loadNodesAndEdges,
    applyStoredLayout
  };
} 