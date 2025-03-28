/**
 * 파일명: graphUtils.ts
 * 목적: 그래프 관련 순수 함수 모음
 * 역할: 노드, 엣지 처리를 위한 순수 유틸리티 함수 제공
 * 작성일: 2024-05-31
 */

import { Node, Edge, XYPosition, Position, MarkerType } from '@xyflow/react';
import { BoardSettings } from '@/lib/board-utils';
import { STORAGE_KEY, EDGES_STORAGE_KEY } from '@/lib/board-constants';

/**
 * 레이아웃을 로컬 스토리지에 저장
 * @param nodes 저장할 노드 배열
 * @returns 성공 여부
 */
export const saveLayout = (nodes: Node[]): boolean => {
  try {
    // 노드 ID와 위치만 저장
    const nodePositions = nodes.reduce((acc: Record<string, { position: XYPosition }>, node: Node) => {
      acc[node.id] = { position: node.position };
      return acc;
    }, {});
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nodePositions));
    return true;
  } catch (err) {
    console.error('레이아웃 저장 실패:', err);
    return false;
  }
};

/**
 * 엣지를 로컬 스토리지에 저장
 * @param edges 저장할 엣지 배열
 * @returns 성공 여부
 */
export const saveEdges = (edges: Edge[]): boolean => {
  try {
    localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(edges));
    return true;
  } catch (err) {
    console.error('엣지 저장 실패:', err);
    return false;
  }
};

/**
 * 모든 레이아웃 데이터 저장 (노드와 엣지)
 * @param nodes 저장할 노드 배열
 * @param edges 저장할 엣지 배열
 * @returns 성공 여부
 */
export const saveAllLayoutData = (nodes: Node[], edges: Edge[]): boolean => {
  const layoutSaved = saveLayout(nodes);
  const edgesSaved = saveEdges(edges);
  
  return layoutSaved && edgesSaved;
};

/**
 * 삭제된 노드를 로컬 스토리지에서 제거
 * @param deletedNodeIds 삭제된 노드 ID 배열
 */
export const removeDeletedNodesFromStorage = (deletedNodeIds: string[]): void => {
  try {
    // 노드 위치 정보 처리
    const savedPositionsStr = localStorage.getItem(STORAGE_KEY);
    if (savedPositionsStr) {
      const savedPositions = JSON.parse(savedPositionsStr);
      
      // 삭제된 노드 ID를 제외한 새 위치 정보 객체 생성
      const updatedPositions = Object.fromEntries(
        Object.entries(savedPositions).filter(([id]) => !deletedNodeIds.includes(id))
      );
      
      // 업데이트된 위치 정보 저장
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPositions));
      
      // 엣지 정보도 업데이트 (삭제된 노드와 연결된 엣지 제거)
      const savedEdgesStr = localStorage.getItem(EDGES_STORAGE_KEY);
      if (savedEdgesStr) {
        const savedEdges = JSON.parse(savedEdgesStr);
        const updatedEdges = savedEdges.filter(
          (edge: Edge) => 
            !deletedNodeIds.includes(edge.source) && 
            !deletedNodeIds.includes(edge.target)
        );
        localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(updatedEdges));
      }
    }
  } catch (err) {
    console.error('노드 삭제 정보 저장 실패:', err);
  }
};

/**
 * 노드 데이터를 전역 상태의 카드 데이터로 업데이트
 * @param nodes 현재 노드 배열
 * @param storeCards 전역 상태의 카드 배열
 * @returns 업데이트된 노드 배열
 */
export const updateNodesWithCardData = (nodes: Node[], storeCards: any[]): Node[] => {
  return nodes.map(node => {
    // 대응되는 카드 데이터 찾기
    const cardData = storeCards.find(card => card.id === node.id);
    
    // 카드 데이터가 존재하면 노드 데이터 업데이트
    if (cardData) {
      return {
        ...node,
        data: {
          ...node.data,
          title: cardData.title,
          content: cardData.content,
          // 태그 처리 (카드에 cardTags가 있는 경우와 없는 경우 모두 처리)
          tags: cardData.cardTags 
            ? cardData.cardTags.map((cardTag: any) => cardTag.tag.name) 
            : (cardData.tags || [])
        }
      };
    }
    
    return node;
  });
};

/**
 * 저장된 레이아웃 적용
 * @param cardsData 카드 데이터 배열
 * @param storedLayout 저장된 레이아웃 정보
 * @returns 레이아웃이 적용된 노드 배열
 */
export const applyStoredLayout = (cardsData: any[], storedLayout: any[]): Node[] => {
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
        ...card,
        tags: tags
      },
      position,
    };
  });
};

/**
 * 뷰포트 중앙 위치 계산
 * @param reactFlowWrapper ReactFlow 래퍼 요소
 * @param reactFlowInstance ReactFlow 인스턴스
 * @returns 중앙 위치 좌표 또는 null
 */
export const calculateViewportCenter = (
  reactFlowWrapper: React.RefObject<HTMLDivElement>,
  reactFlowInstance: any
): XYPosition | null => {
  if (!reactFlowWrapper.current || !reactFlowInstance) {
    return null;
  }
  
  try {
    if (typeof reactFlowInstance.screenToFlowPosition !== 'function') {
      return null;
    }
    
    const rect = reactFlowWrapper.current.getBoundingClientRect();
    if (!rect || typeof rect.width !== 'number' || typeof rect.height !== 'number') {
      return null;
    }
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const position = { x: centerX, y: centerY };
    if (typeof position.x !== 'number' || typeof position.y !== 'number') {
      return null;
    }
    
    return reactFlowInstance.screenToFlowPosition(position);
  } catch (error) {
    console.error('Viewport center calculation failed:', error);
    return null;
  }
};

/**
 * 배열 비교 헬퍼 함수
 * @param a 첫번째 배열
 * @param b 두번째 배열
 * @returns 두 배열이 같은지 여부
 */
export const arraysEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
};

/**
 * 새 엣지 생성 함수
 * @param source 소스 노드 ID
 * @param target 타겟 노드 ID
 * @param boardSettings 보드 설정
 * @returns 새 엣지 객체
 */
export const createEdge = (source: string, target: string, boardSettings: BoardSettings): Edge => {
  // 엣지 ID 생성 - 소스ID-타겟ID-타임스탬프
  const edgeId = `${source}-${target}-${Date.now()}`;
  
  // 새 엣지 객체 생성
  return {
    id: edgeId,
    source,
    target,
    type: 'custom',
    animated: boardSettings.animated,
    style: {
      strokeWidth: boardSettings.strokeWidth,
      stroke: boardSettings.edgeColor,
    },
    // 방향 표시가 활성화된 경우에만 마커 추가
    markerEnd: boardSettings.markerEnd ? {
      type: MarkerType.ArrowClosed,
      width: boardSettings.strokeWidth * 2,
      height: boardSettings.strokeWidth * 2,
      color: boardSettings.edgeColor,
    } : undefined,
    data: {
      edgeType: boardSettings.connectionLineType,
      settings: { ...boardSettings }
    },
  };
};

/**
 * 레이아웃 방향에 따라 기본 핸들 ID 결정
 * @param isHorizontal 수평 레이아웃 여부
 * @returns 소스와 타겟 핸들 ID
 */
export const getDefaultHandles = (isHorizontal: boolean): { sourceHandle: string, targetHandle: string } => {
  return {
    sourceHandle: isHorizontal ? 'right' : 'bottom',
    targetHandle: isHorizontal ? 'left' : 'top'
  };
}; 