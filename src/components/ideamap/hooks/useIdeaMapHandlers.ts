/**
 * 파일명: useBoardHandlers.ts
 * 목적: 보드 이벤트 핸들러 관련 로직 분리
 * 역할: 보드 드래그, 드롭, 선택 등 이벤트 처리 로직을 관리
 * 작성일: 2025-03-28
 * 수정일: 2025-04-11
 */

import { useCallback } from 'react';

import { Node, Edge, XYPosition } from '@xyflow/react';

import { useAppStore } from '@/store/useAppStore';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';

import { CardData } from '../types/ideamap-types';

/**
 * useIdeaMapHandlers: 아이디어맵 이벤트 핸들러 관련 로직을 관리하는 훅
 * @param reactFlowWrapper ReactFlow 래퍼 참조
 * @param reactFlowInstance ReactFlow 인스턴스
 * @param fetchCards 카드 데이터를 다시 불러오는 함수
 * @returns 아이디어맵 이벤트 핸들러 함수들
 */
export function useIdeaMapHandlers({
  reactFlowWrapper,
  reactFlowInstance,
  fetchCards
}: {
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  reactFlowInstance: any;
  fetchCards: () => Promise<{ nodes: Node<CardData>[]; edges: Edge[] }>;
}) {
  // 전역 상태에서 선택된 카드 정보 및 액션 가져오기
  const { selectCards } = useAppStore();
  
  // 아이디어맵 스토어에서 노드 추가 관련 액션 가져오기
  const addNodeAtPosition = useIdeaMapStore(state => state.addNodeAtPosition);
  const addCardAtCenterPosition = useIdeaMapStore(state => state.addCardAtCenterPosition);
  const createEdgeAndNodeOnDrop = useIdeaMapStore(state => state.createEdgeAndNodeOnDrop);

  /**
   * ReactFlow 선택 변경 이벤트 핸들러
   * @param selection 현재 선택된 노드와 엣지 정보
   */
  const handleSelectionChange = useCallback(({ nodes }: { nodes: Node<CardData>[]; edges: Edge[] }) => {
    console.log('[IdeaMapComponent] 선택 변경 감지:', { 
      선택된_노드_수: nodes.length,
      선택된_노드_ID: nodes.map(node => node.data.id)
    });

    // 선택된 노드 ID 배열 추출
    const selectedNodeIds = nodes.map(node => node.data.id);
    
    // 전역 상태 업데이트
    selectCards(selectedNodeIds);
  }, [selectCards]);

  /**
   * 드래그 오버 이벤트 핸들러
   * @param event 드래그 이벤트
   */
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  /**
   * 드롭 이벤트 핸들러
   * @param event 드롭 이벤트
   */
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    // React Flow 래퍼 요소가 없으면 중단
    if (!reactFlowWrapper.current || !reactFlowInstance) {
      return;
    }

    // 드래그된 데이터 확인
    const reactFlowData = event.dataTransfer.getData('application/reactflow');
    if (!reactFlowData) return;

    try {
      // 데이터 파싱
      const cardData = JSON.parse(reactFlowData);
      
      // 드롭된 위치 계산
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Zustand 스토어 액션 호출
      addNodeAtPosition('card', position, cardData);
    } catch (error) {
      console.error('드롭된 데이터 처리 중 오류 발생:', error);
    }
  }, [reactFlowInstance, reactFlowWrapper, addNodeAtPosition]);

  /**
   * 카드 생성 완료 핸들러
   * @param cardData 생성된 카드 데이터
   */
  const handleCardCreated = useCallback((cardData: any) => {
    // Zustand 스토어 액션 호출
    addCardAtCenterPosition(cardData);
  }, [addCardAtCenterPosition]);

  /**
   * 엣지 드롭 시 카드 생성 핸들러
   * @param cardData 생성된 카드 데이터
   * @param position 생성 위치
   * @param connectingNodeId 연결할 노드 ID
   * @param handleType 핸들 타입 (source 또는 target)
   */
  const handleEdgeDropCardCreated = useCallback((
    cardData: any, 
    position: XYPosition, 
    connectingNodeId: string, 
    handleType: 'source' | 'target'
  ) => {
    // Zustand 스토어 액션 호출 - React Query 캐시 무효화에 의존하여 노드 동기화
    createEdgeAndNodeOnDrop(cardData, position, connectingNodeId, handleType);
  }, [createEdgeAndNodeOnDrop]);

  return {
    handleSelectionChange,
    onDragOver,
    onDrop,
    handleCardCreated,
    handleEdgeDropCardCreated
  };
} 