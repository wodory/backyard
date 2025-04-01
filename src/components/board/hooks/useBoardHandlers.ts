/**
 * 파일명: useBoardHandlers.ts
 * 목적: 보드 이벤트 핸들러 관련 로직 분리
 * 역할: 보드 드래그, 드롭, 선택 등 이벤트 처리 로직을 관리
 * 작성일: 2024-05-11
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { Node, Edge, XYPosition } from '@xyflow/react';
import { useAppStore } from '@/store/useAppStore';
import { CardData } from '../types/board-types';

/**
 * useBoardHandlers: 보드 이벤트 핸들러 관련 로직을 관리하는 훅
 * @param saveLayout 레이아웃 저장 함수
 * @param nodes 현재 노드 배열
 * @param setNodes 노드 상태 설정 함수
 * @param reactFlowWrapper ReactFlow 래퍼 참조
 * @param reactFlowInstance ReactFlow 인스턴스
 * @returns 보드 이벤트 핸들러 함수들
 */
export function useBoardHandlers({
  saveLayout,
  nodes,
  setNodes,
  reactFlowWrapper,
  reactFlowInstance,
  fetchCards
}: {
  saveLayout: (nodesToSave?: Node<CardData>[]) => boolean;
  nodes: Node<CardData>[];
  setNodes: (updater: ((nodes: Node<CardData>[]) => Node<CardData>[]) | Node<CardData>[]) => void;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  reactFlowInstance: any;
  fetchCards: () => Promise<{ nodes: Node<CardData>[]; edges: Edge[] }>;
}) {
  // 전역 상태에서 선택된 카드 정보 가져오기
  const { selectedCardIds, selectCards } = useAppStore();

  /**
   * ReactFlow 선택 변경 이벤트 핸들러
   * @param selection 현재 선택된 노드와 엣지 정보
   */
  const handleSelectionChange = useCallback(({ nodes }: { nodes: Node<CardData>[]; edges: Edge[] }) => {
    console.log('[BoardComponent] 선택 변경 감지:', { 
      선택된_노드_수: nodes.length,
      선택된_노드_ID: nodes.map(node => node.data.id)
    });

    // 선택된 노드 ID 배열 추출
    const selectedNodeIds = nodes.map(node => node.data.id);
    
    // 전역 상태 업데이트
    selectCards(selectedNodeIds);
    
    // 선택된 노드가 있는 경우 토스트 메시지 표시
    if (selectedNodeIds.length > 1) {
      toast.info(`${selectedNodeIds.length}개 카드가 선택되었습니다.`);
    }
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

      // 노드 중복 확인
      const existingNode = nodes.find(n => n.id === cardData.id);
      if (existingNode) {
        // 이미 캔버스에 해당 카드가 있으면 위치만 업데이트
        const updatedNodes = nodes.map(n => {
          if (n.id === cardData.id) {
            return {
              ...n,
              position
            };
          }
          return n;
        });
        setNodes(updatedNodes);
        saveLayout(updatedNodes); // 레이아웃 저장
        toast.info('카드 위치가 업데이트되었습니다.');
      } else {
        // 새로운 노드 생성
        const newNode = {
          id: cardData.id,
          type: 'card',
          position,
          data: cardData.data,
        };

        // 노드 추가
        setNodes(nodes => [...nodes, newNode]);
        saveLayout([...nodes, newNode]); // 레이아웃 저장
        toast.success('카드가 캔버스에 추가되었습니다.');
      }
    } catch (error) {
      console.error('드롭된 데이터 처리 중 오류 발생:', error);
      toast.error('카드를 캔버스에 추가하는 중 오류가 발생했습니다.');
    }
  }, [reactFlowInstance, nodes, setNodes, saveLayout]);

  /**
   * 카드 생성 완료 핸들러
   * @param cardData 생성된 카드 데이터
   */
  const handleCardCreated = useCallback((cardData: any) => {
    // 뷰포트 중앙 또는 기본 위치에 새 카드 추가
    const centerPosition = reactFlowWrapper.current && reactFlowInstance ? {
      x: reactFlowWrapper.current.offsetWidth / 2 - 75, // 카드 너비의 절반 만큼 조정
      y: reactFlowWrapper.current.offsetHeight / 2 - 50  // 카드 높이의 절반 만큼 조정
    } : { x: 100, y: 100 };
      
    const newCard = {
      id: cardData.id,
      type: 'card',
      data: {
        ...cardData,
        title: cardData.title || '새 카드',
        content: cardData.content || ''
      },
      position: centerPosition
    };
      
    setNodes((nds) => [...nds, newCard]);
    
    // 노드 위치 저장
    saveLayout([...nodes, newCard]);
    
    toast.success('새 카드가 생성되었습니다.');
  }, [nodes, saveLayout, setNodes, reactFlowWrapper, reactFlowInstance]);

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
    // 새 카드 노드 생성
    const newNode = {
      id: cardData.id,
      type: 'card',
      data: {
        ...cardData,
        title: cardData.title || '새 카드',
        content: cardData.content || ''
      },
      position
    };
    
    // 노드 추가
    setNodes((nds) => [...nds, newNode]);
    
    // 노드 위치 저장
    saveLayout([...nodes, newNode]);
    
    toast.success('새 카드가 생성되었습니다.');
    
    // 카드 목록 업데이트를 위해 데이터 다시 불러오기
    setTimeout(() => {
      fetchCards();
    }, 500);
  }, [nodes, setNodes, saveLayout, fetchCards]);

  return {
    handleSelectionChange,
    onDragOver,
    onDrop,
    handleCardCreated,
    handleEdgeDropCardCreated
  };
} 