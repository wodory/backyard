/**
 * 파일명: src/hooks/useIdeaMapInteractions.ts
 * 목적: IdeaMap(React Flow) 상호작용 이벤트 핸들러 제공
 * 역할: IdeaMap에서 발생하는 각종 이벤트(노드 클릭, 배경 클릭, 드래그&드롭, 엣지 연결 등)를 처리하는 핸들러 함수들을 통합 관리
 * 작성일: 2025-04-21
 */

import { MouseEvent, DragEvent, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useCreateCard } from '@/hooks/useCardMutations';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import { 
  Node, 
  Edge, 
  Connection, 
  useReactFlow,
  addEdge,
  XYPosition,
  ReactFlowInstance
} from '@xyflow/react';

// 타입 정의
type NodeMouseHandler = (event: MouseEvent, node: Node) => void;
type PaneMouseEvent = MouseEvent<Element, globalThis.MouseEvent>;
type NodeDragHandler = (event: MouseEvent, node: Node, nodes: Node[]) => void;

/**
 * useIdeaMapInteractions: IdeaMap(React Flow) 상호작용을 위한 이벤트 핸들러 모음을 제공하는 훅
 * @returns {Object} 다양한 React Flow 이벤트에 대응하는 핸들러 함수들
 */
export function useIdeaMapInteractions() {
  // AppStore에서 카드 선택 관련 액션 가져오기
  const selectCards = useAppStore(state => state.selectCards);
  const toggleSelectedCard = useAppStore(state => state.toggleSelectedCard);
  const clearSelectedCards = useAppStore(state => state.clearSelectedCards);
  
  // 카드 생성 뮤테이션
  const { mutate: createCard } = useCreateCard();
  
  // IdeaMapStore에서 엣지 관련 액션 가져오기
  const setEdges = useIdeaMapStore(state => state.setEdges);
  const edges = useIdeaMapStore(state => state.edges);
  
  // ReactFlow 인스턴스 가져오기 (뷰포트 변환, 노드 위치 계산 등에 필요)
  const reactFlowInstance = useReactFlow();

  /**
   * onNodeClick: 노드 클릭 이벤트 핸들러
   * @param {MouseEvent} event - 마우스 이벤트
   * @param {Node} node - 클릭된 노드
   */
  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    event.stopPropagation(); // 이벤트 버블링 방지
    
    // Ctrl/Command 또는 Shift 키와 함께 클릭하면 다중 선택 토글
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      toggleSelectedCard(node.id);
    } else {
      // 일반 클릭은 단일 선택
      selectCards([node.id]);
    }
  }, [selectCards, toggleSelectedCard]);

  /**
   * onPaneClick: 배경(Pane) 클릭 이벤트 핸들러
   * @param {PaneMouseEvent} event - 마우스 이벤트
   */
  const onPaneClick = useCallback((event: PaneMouseEvent) => {
    // 배경 클릭시 모든 선택 해제
    clearSelectedCards();
  }, [clearSelectedCards]);

  /**
   * onDrop: 드래그 앤 드롭으로 새 카드 생성 핸들러
   * @param {DragEvent} event - 드래그 이벤트
   */
  const onDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    // 드래그 데이터 확인 (드래그 소스에 따라 다르게 처리 가능)
    const dragData = event.dataTransfer.getData('application/reactflow');
    const dragType = event.dataTransfer.getData('cardType') || '기본 카드';
    
    if (dragData || dragType) {
      // 드롭 위치를 ReactFlow 좌표로 변환
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      };

      // 화면 좌표를 ReactFlow 좌표로 변환
      const flowPosition = reactFlowInstance.screenToFlowPosition(position);

      // 새 카드 생성 (위치 정보 포함)
      createCard({
        title: '새 카드',
        // 위치 정보를 메타데이터 또는 별도 필드로 포함 가능
        x: flowPosition.x,
        y: flowPosition.y
      });
    }
  }, [createCard, reactFlowInstance]);

  /**
   * onDragOver: 드래그 오버 이벤트 핸들러 (드롭을 허용하기 위해 필요)
   * @param {DragEvent} event - 드래그 이벤트
   */
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  /**
   * onConnect: 엣지 연결 이벤트 핸들러
   * @param {Connection} connection - 연결 정보
   */
  const onConnect = useCallback((connection: Connection) => {
    // 현재 엣지와 새 연결로 생성된 엣지 배열을 직접 전달
    const newEdges = addEdge(connection, edges);
    setEdges(newEdges);
    
    // 서버에 엣지 저장이 필요하다면 아래 주석 해제
    /*
    createEdge({
      source: connection.source,
      target: connection.target,
      // 추가 속성 가능
    });
    */
  }, [edges, setEdges]);

  /**
   * onNodeDragStop: 노드 드래그 종료 이벤트 핸들러
   * @param {MouseEvent} event - 마우스 이벤트
   * @param {Node} node - 드래그된 노드
   * @param {Node[]} nodes - 모든 노드
   */
  const onNodeDragStop: NodeDragHandler = useCallback((event, node, nodes) => {
    // 노드 위치 변경 후 처리 (예: 레이아웃 저장)
    // 이 함수는 useIdeaMapLayout에서 더 상세히 구현할 수 있음
    console.log('Node position updated:', node.id, node.position);
    
    // 서버에 노드 위치 저장이 필요하다면 아래 주석 해제
    /*
    updateCardPosition({
      id: node.id,
      position: {
        x: node.position.x,
        y: node.position.y
      }
    });
    */
  }, []);

  // 모든 핸들러 함수 반환
  return {
    onNodeClick,
    onPaneClick,
    onDrop,
    onDragOver,
    onConnect,
    onNodeDragStop
  };
} 