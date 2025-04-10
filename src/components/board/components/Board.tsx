/**
 * 파일명: Board.tsx
 * 목적: 보드 메인 컨테이너 컴포넌트
 * 역할: 보드 기능의 메인 UI 컴포넌트로, React Flow와 관련 훅을 조합하여 완전한 보드 환경 제공
 * 작성일: 2025-03-28
 * 수정일: 2025-04-08
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  useReactFlow,
  useUpdateNodeInternals,
  Position,
  Viewport,
  ViewportHelperFunctions
} from '@xyflow/react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/store/useAppStore';

// 보드 관련 컴포넌트 임포트
import CreateCardModal from '@/components/cards/CreateCardModal';
import BoardCanvas from './BoardCanvas';

// 보드 관련 훅 임포트
import { useNodes } from '../hooks/useNodes';
import { useEdges } from '../hooks/useEdges';
import { useBoardUtils } from '../hooks/useBoardUtils';
import { useBoardData } from '../hooks/useBoardData';
import { useAddNodeOnEdgeDrop } from '@/hooks/useAddNodeOnEdgeDrop';

// 타입 임포트
import { BoardComponentProps, XYPosition } from '../types/board-types';
import { Node } from '@xyflow/react';
import { NodeInspector } from '../nodes/NodeInspector';
import { Card } from '@/store/useAppStore';

/**
 * Board: 보드 메인 컨테이너 컴포넌트
 * @param onSelectCard 카드 선택 시 호출될 콜백 함수
 * @param className 추가 CSS 클래스
 * @param showControls 컨트롤 표시 여부
 */
export default function Board({
  onSelectCard,
  className = "",
  showControls = true
}: BoardComponentProps) {
  // 상태 관리
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 엣지 드롭 관련 상태
  const [isEdgeDropModalOpen, setIsEdgeDropModalOpen] = useState(false);
  const [edgeDropPosition, setEdgeDropPosition] = useState<XYPosition | null>(null);
  const [edgeDropNodeId, setEdgeDropNodeId] = useState<string | null>(null);
  const [edgeDropHandleType, setEdgeDropHandleType] = useState<'source' | 'target' | null>(null);

  // 커넥팅 노드 관련 상태
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [connectingHandleType, setConnectingHandleType] = useState<'source' | 'target' | null>(null);
  const [connectingHandlePosition, setConnectingHandlePosition] = useState<Position | null>(null);

  // 뷰포트 변경 디바운스를 위한 타이머
  const viewportChangeTimer = useRef<NodeJS.Timeout | null>(null);

  // 인증 상태 가져오기
  const { user, isLoading: isAuthLoading } = useAuth();

  // 레퍼런스 및 기타 훅
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  // useAppStore에서 상태 가져오기
  const layoutDirection = useAppStore(state => state.layoutDirection);
  const boardSettings = useAppStore(state => state.boardSettings);
  const setBoardSettings = useAppStore(state => state.setBoardSettings);
  const setReactFlowInstance = useAppStore(state => state.setReactFlowInstance);
  const setCards = useAppStore(state => state.setCards);
  const { selectCards, selectedCardIds } = useAppStore();

  // 전역 상태의 카드 목록 가져오기 (노드와 동기화를 위해)
  const storeCards = useAppStore(state => state.cards);

  // 보드 데이터 훅 사용
  const {
    nodes: initialNodes,
    edges: initialEdges,
    isLoading,
    error,
    loadNodesAndEdges
  } = useBoardData(onSelectCard);

  // 커스텀 훅 사용
  const {
    nodes,
    setNodes,
    handleNodesChange,
    handleNodeClick,
    handlePaneClick,
    saveLayout,
    hasUnsavedChanges: hasUnsavedNodesChanges
  } = useNodes({
    onSelectCard,
    initialNodes: initialNodes
  });

  const {
    edges,
    setEdges,
    handleEdgesChange,
    onConnect,
    saveEdges,
    updateEdgeStyles,
    createEdgeOnDrop,
    hasUnsavedChanges: hasUnsavedEdgesChanges
  } = useEdges({
    boardSettings,
    nodes,
    initialEdges: initialEdges
  });

  const {
    loadBoardSettingsFromServerIfAuthenticated,
    saveAllLayoutData,
    handleBoardSettingsChange,
    handleLayoutChange,
    updateViewportCenter,
    handleAutoLayout,
    saveTransform,
    hasUnsavedChanges: hasBoardUtilsUnsavedChanges
  } = useBoardUtils({
    reactFlowWrapper,
    updateNodeInternals,
    saveLayout,
    saveEdges,
    nodes,
    edges,
    setNodes,
    setEdges
  });

  // BoardSettings 변경 핸들러 래퍼
  const handleBoardSettingsChangeWrapper = useCallback((newSettings: any) => {
    handleBoardSettingsChange(newSettings, !!user, user?.id);
  }, [handleBoardSettingsChange, user]);

  // 드래그 오버 이벤트 핸들러 추가
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 드롭 이벤트 핸들러 추가
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

  // 엣지에 새 노드 추가 기능
  const { onConnectStart, onConnectEnd } = useAddNodeOnEdgeDrop({
    onCreateNode: (position, connectingNodeId, handleType) => {
      // 모달을 열기 위한 상태 설정
      setEdgeDropPosition(position);
      setEdgeDropNodeId(connectingNodeId);
      setEdgeDropHandleType(handleType);
      setIsEdgeDropModalOpen(true);
    }
  });

  // ReactFlow 인스턴스 저장
  useEffect(() => {
    if (reactFlowInstance) {
      setReactFlowInstance(reactFlowInstance);
    }
  }, [reactFlowInstance, setReactFlowInstance]);

  // 초기 데이터 로드
  useEffect(() => {
    const initializeBoardData = async () => {
      try {
        // 노드와 엣지 데이터 로드
        await loadNodesAndEdges(reactFlowInstance);
      } catch (err) {
        console.error('초기 데이터 로드 실패:', err);
      }
    };

    initializeBoardData();
  }, [loadNodesAndEdges, reactFlowInstance]);

  // 인증 상태 변경 시 보드 설정 로드
  useEffect(() => {
    if (!isAuthLoading) {
      loadBoardSettingsFromServerIfAuthenticated(!!user, user?.id);
    }
  }, [isAuthLoading, loadBoardSettingsFromServerIfAuthenticated, user]);

  // 보드 설정 변경 시 엣지 스타일 업데이트
  useEffect(() => {
    if (!isLoading && edges.length > 0) {
      updateEdgeStyles(boardSettings);
    }
  }, [boardSettings, isLoading, updateEdgeStyles, edges.length]);

  // 전역 상태의 카드가 업데이트되면 노드 데이터 업데이트
  useEffect(() => {
    if (storeCards.length === 0 || nodes.length === 0 || isLoading) return;

    // 노드 데이터 업데이트 (카드 ID가 일치하는 노드들만)
    setNodes(currentNodes =>
      currentNodes.map(node => {
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
      })
    );
  }, [storeCards, setNodes, isLoading, nodes.length]);

  // 로드 후 node internals 업데이트 (핸들 위치 등)
  useEffect(() => {
    if (!isLoading && nodes.length > 0) {
      nodes.forEach(node => {
        updateNodeInternals(node.id);
      });
    }
  }, [isLoading, nodes, updateNodeInternals]);

  // 페이지 이탈 시 저장되지 않은 변경사항 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedNodesChanges.current || hasUnsavedEdgesChanges.current || hasBoardUtilsUnsavedChanges.current) {
        saveAllLayoutData();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveAllLayoutData, hasUnsavedNodesChanges, hasUnsavedEdgesChanges, hasBoardUtilsUnsavedChanges]);

  // 엣지 드롭 카드 생성 완료 핸들러
  const handleEdgeDropCardCreated = useCallback((cardData: Card) => {
    if (!reactFlowInstance) {
      console.error("React Flow 인스턴스가 없습니다.");
      return;
    }

    if (!edgeDropPosition || !edgeDropNodeId || !edgeDropHandleType) {
      console.error("엣지 드롭 정보가 누락되었습니다.");
      return;
    }

    const newNode: Node = {
      id: cardData.id,
      type: 'card',
      position: edgeDropPosition,
      data: { ...cardData, type: 'card' },
      origin: [0.5, 0.0],
      sourcePosition: Position.Top,
      targetPosition: Position.Bottom,
    };

    // 새 노드 추가
    reactFlowInstance.addNodes(newNode);

    // handleType에 따라 소스와 타겟 결정
    const sourceId = edgeDropHandleType === 'target' ? edgeDropNodeId : cardData.id;
    const targetId = edgeDropHandleType === 'target' ? cardData.id : edgeDropNodeId;

    // 엣지 생성
    createEdgeOnDrop(sourceId, targetId);

    // 모달 닫기 및 상태 초기화
    setIsEdgeDropModalOpen(false);
    setEdgeDropPosition(null);
    setEdgeDropNodeId(null);
    setEdgeDropHandleType(null);
  }, [reactFlowInstance, edgeDropPosition, edgeDropNodeId, edgeDropHandleType, createEdgeOnDrop]);

  // 자동 저장 기능
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedNodesChanges.current || hasUnsavedEdgesChanges.current) {
        saveAllLayoutData();
        toast.success('변경사항이 자동 저장되었습니다.');
      }
    }, 30000); // 30초마다 자동 저장

    return () => clearInterval(autoSaveInterval);
  }, [saveAllLayoutData, hasUnsavedNodesChanges, hasUnsavedEdgesChanges]);

  // 레이아웃 적용
  const applyLayout = useCallback(() => {
    handleLayoutChange(layoutDirection as 'horizontal' | 'vertical');
  }, [handleLayoutChange, layoutDirection]);

  // 그리드 레이아웃 적용
  const applyGridLayout = useCallback(() => {
    handleAutoLayout();
  }, [handleAutoLayout]);

  // 수동 저장 핸들러
  const handleSaveLayout = useCallback(() => {
    if (saveAllLayoutData()) {
      toast.success('보드 레이아웃이 저장되었습니다.');
    } else {
      toast.error('보드 레이아웃 저장에 실패했습니다.');
    }
  }, [saveAllLayoutData]);

  /**
   * 뷰포트 변경 핸들러 (확대/축소, 이동)
   * @param viewport 현재 뷰포트 상태
   */
  const onViewportChange = useCallback((viewport: Viewport) => {
    // 디바운싱: 연속적인 뷰포트 변경 중 마지막 이벤트만 처리
    if (viewportChangeTimer.current) {
      clearTimeout(viewportChangeTimer.current);
    }

    viewportChangeTimer.current = setTimeout(() => {
      // 변경된 뷰포트 저장
      saveTransform();
      viewportChangeTimer.current = null;
    }, 500); // 500ms 디바운스
  }, [saveTransform]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 p-8 rounded-lg">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">오류 발생</h2>
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <BoardCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeClick={handleNodeClick as any}
        onPaneClick={handlePaneClick}
        layoutDirection={layoutDirection as 'horizontal' | 'vertical'}
        boardSettings={boardSettings}
        onBoardSettingsChange={handleBoardSettingsChangeWrapper}
        onLayoutChange={handleLayoutChange as any}
        onAutoLayout={handleAutoLayout}
        onSaveLayout={handleSaveLayout}
        onCreateCard={() => setIsCreateModalOpen(true)}
        showControls={showControls}
        wrapperRef={reactFlowWrapper as React.RefObject<HTMLDivElement>}
        className={className}
        isAuthenticated={!!user}
        userId={user?.id}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onViewportChange={onViewportChange}
      />

      {/* 노드 인스펙터 컴포넌트 */}
      <NodeInspector nodes={nodes} />

      {/* 일반 카드 생성 모달 */}
      {isCreateModalOpen && (
        <CreateCardModal
          onClose={() => setIsCreateModalOpen(false)}
          onCardCreated={() => { /* 일반 생성 시 추가 작업 필요 시 여기에 구현 */ }}
        />
      )}

      {/* 엣지 드롭 카드 생성 모달 */}
      {isEdgeDropModalOpen && edgeDropPosition && edgeDropNodeId && edgeDropHandleType && (
        <CreateCardModal
          position={edgeDropPosition}
          connectingNodeId={edgeDropNodeId}
          handleType={edgeDropHandleType}
          onClose={() => setIsEdgeDropModalOpen(false)}
          onCardCreated={handleEdgeDropCardCreated}
        />
      )}
    </>
  );
} 