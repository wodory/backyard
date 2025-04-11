/**
 * 파일명: Board.tsx
 * 목적: 보드 메인 컨테이너 컴포넌트
 * 역할: 보드 기능의 메인 UI 컴포넌트로, React Flow와 관련 훅을 조합하여 완전한 보드 환경 제공
 * 작성일: 2025-03-28
 * 수정일: 2025-04-11
 */

'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { useBoardStore } from '@/store/useBoardStore';

// 보드 관련 컴포넌트 임포트
import CreateCardModal from '@/components/cards/CreateCardModal';
import BoardCanvas from './BoardCanvas';

// 보드 관련 훅 임포트
import { useNodeClickHandlers } from '../hooks/useNodes';
import { useEdges } from '../hooks/useEdges';
import { useBoardData } from '../hooks/useBoardData';
import { useAddNodeOnEdgeDrop } from '@/hooks/useAddNodeOnEdgeDrop';
import { useBoardHandlers } from '../hooks/useBoardHandlers';

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

  // useBoardStore에서 보드 데이터 관련 상태와 액션 가져오기
  const {
    nodes: boardStoreNodes,
    edges: boardStoreEdges,
    isBoardLoading,
    boardError,
    loadBoardData,
    loadedViewport,
    needsFitView,
    viewportToRestore,
    hasUnsavedChanges,
    saveViewport,
    restoreViewport,
    saveAllLayoutData,
    applyLayout: applyBoardLayout,
    applyGridLayout,
    loadAndApplyBoardSettings,
    updateAndSaveBoardSettings,
    saveBoardState,
    applyNodeChangesAction,
    deleteNodeAction,
    saveNodesAction,
    // 엣지 관련 액션 추가
    applyEdgeChangesAction,
    connectNodesAction,
    saveEdgesAction,
    updateAllEdgeStylesAction,
    createEdgeOnDropAction
  } = useBoardStore();

  // 보드 데이터 훅 사용 (하위 호환성을 위해 유지)
  const {
    nodes: _nodes,
    edges: _edges,
    isLoading,
    error,
    loadNodesAndEdges
  } = useBoardData(onSelectCard);

  // 커스텀 훅 사용
  const {
    handleNodeClick,
    handlePaneClick
  } = useNodeClickHandlers({
    onSelectCard,
    onNodeDoubleClick: (node) => {
      // 노드 더블 클릭 처리 로직 (필요한 경우)
      console.log('노드 더블 클릭:', node.id);
    }
  });

  // 기존 useEdges 훅 사용 (하위 호환성 유지를 위해 일단 남겨둠)
  // 내부적으로는 이미 useBoardStore 액션들을 호출하고 있음
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
    nodes: boardStoreNodes,
    initialEdges: boardStoreEdges
  });

  // BoardSettings 변경 핸들러 래퍼
  const handleBoardSettingsChangeWrapper = useCallback((newSettings: any) => {
    updateAndSaveBoardSettings(newSettings, user?.id);
  }, [updateAndSaveBoardSettings, user?.id]);

  // 레이아웃 변경 핸들러
  const handleLayoutChange = useCallback((direction: 'horizontal' | 'vertical') => {
    applyBoardLayout(direction);
  }, [applyBoardLayout]);

  // useBoardHandlers 훅 사용
  const {
    handleSelectionChange,
    onDragOver,
    onDrop,
    handleCardCreated,
    handleEdgeDropCardCreated: handleEdgeDropCardCreatedFromHook
  } = useBoardHandlers({
    reactFlowWrapper,
    reactFlowInstance,
    fetchCards: loadNodesAndEdges
  });

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
    loadBoardData(); // useBoardStore의 액션 직접 호출
  }, [loadBoardData]);

  // 뷰포트 복원 Effect
  useEffect(() => {
    if (!reactFlowInstance) return;

    if (loadedViewport) {
      // 저장된 뷰포트가 있으면 복원
      reactFlowInstance.setViewport(loadedViewport, { duration: 0 });
      console.log('[Board] 저장된 뷰포트 복원:', loadedViewport);

      // 복원 후 상태 초기화
      useBoardStore.setState({ loadedViewport: null });
    } else if (needsFitView) {
      // fitView 실행 필요
      reactFlowInstance.fitView({ duration: 200, padding: 0.2 });
      console.log('[Board] 뷰에 맞게 화면 조정');

      // 실행 후 상태 초기화
      useBoardStore.setState({ needsFitView: false });
    }
  }, [reactFlowInstance, loadedViewport, needsFitView]);

  // viewportToRestore가 변경되면 뷰포트 복원
  useEffect(() => {
    if (reactFlowInstance && viewportToRestore) {
      reactFlowInstance.setViewport(viewportToRestore);
      useBoardStore.setState({ viewportToRestore: null });
      console.log('[Board] 저장된 뷰포트 위치로 이동:', viewportToRestore);
    }
  }, [reactFlowInstance, viewportToRestore]);

  // 인증 상태 변경 시 보드 설정 로드
  useEffect(() => {
    if (!isAuthLoading && user?.id) {
      loadAndApplyBoardSettings(user.id);
    }
  }, [isAuthLoading, loadAndApplyBoardSettings, user]);

  // 보드 설정 변경 시 엣지 스타일 업데이트
  useEffect(() => {
    if (!isLoading && edges.length > 0) {
      updateEdgeStyles(boardSettings);
    }
  }, [boardSettings, isLoading, updateEdgeStyles, edges.length]);

  // 전역 상태의 카드가 업데이트되면 노드 데이터 업데이트
  useEffect(() => {
    if (storeCards.length === 0 || boardStoreNodes.length === 0 || isLoading) return;

    // 노드 데이터 업데이트 (카드 ID가 일치하는 노드들만)
    setEdges(currentEdges => {
      return currentEdges.map(edge => {
        // 대응되는 카드 데이터 찾기
        const cardData = storeCards.find(card => card.id === edge.id);

        // 카드 데이터가 존재하면 노드 데이터 업데이트
        if (cardData) {
          return {
            ...edge,
            data: {
              ...edge.data,
              title: cardData.title,
              // null이 될 수 있는 content를 빈 문자열로 변환하여 타입 오류 방지
              content: cardData.content ?? '',
              // 태그 처리 (카드에 cardTags가 있는 경우와 없는 경우 모두 처리)
              tags: cardData.cardTags
                ? cardData.cardTags.map((cardTag: any) => cardTag.tag.name)
                : (cardData.tags || [])
            }
          };
        }

        return edge;
      });
    });
  }, [storeCards, setEdges, isLoading, boardStoreNodes.length]);

  // 로드 후 node internals 업데이트 (핸들 위치 등)
  useEffect(() => {
    if (!isLoading && boardStoreNodes.length > 0) {
      boardStoreNodes.forEach(node => {
        updateNodeInternals(node.id);
      });
    }
  }, [isLoading, boardStoreNodes, updateNodeInternals]);

  // 페이지 이탈 시 저장되지 않은 변경사항 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || hasUnsavedEdgesChanges) {
        saveAllLayoutData();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveAllLayoutData, hasUnsavedChanges, hasUnsavedEdgesChanges]);

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

    // useBoardHandlers의 handleEdgeDropCardCreated 호출
    handleEdgeDropCardCreatedFromHook(
      cardData,
      edgeDropPosition,
      edgeDropNodeId,
      edgeDropHandleType
    );

    // 모달 닫기 및 상태 초기화
    setIsEdgeDropModalOpen(false);
    setEdgeDropPosition(null);
    setEdgeDropNodeId(null);
    setEdgeDropHandleType(null);
  }, [reactFlowInstance, edgeDropPosition, edgeDropNodeId, edgeDropHandleType, handleEdgeDropCardCreatedFromHook]);

  // 자동 저장 기능
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges || hasUnsavedEdgesChanges) {
        saveAllLayoutData();
        toast.success('변경사항이 자동 저장되었습니다.');
      }
    }, 30000); // 30초마다 자동 저장

    return () => clearInterval(autoSaveInterval);
  }, [saveAllLayoutData, hasUnsavedChanges, hasUnsavedEdgesChanges]);

  // 수동 저장 핸들러
  const handleSaveLayout = useCallback(() => {
    if (saveBoardState()) {
      toast.success('보드 레이아웃이 저장되었습니다.');
    } else {
      toast.error('보드 레이아웃 저장에 실패했습니다.');
    }
  }, [saveBoardState]);

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
      saveViewport();
      viewportChangeTimer.current = null;
    }, 500); // 500ms 디바운스
  }, [saveViewport]);

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
        nodes={boardStoreNodes}
        edges={edges}
        onNodesChange={applyNodeChangesAction}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        layoutDirection={layoutDirection as 'horizontal' | 'vertical'}
        boardSettings={boardSettings}
        onBoardSettingsChange={handleBoardSettingsChangeWrapper}
        onLayoutChange={handleLayoutChange}
        onAutoLayout={applyGridLayout}
        onSaveLayout={handleSaveLayout}
        onCreateCard={() => setIsCreateModalOpen(true)}
        showControls={showControls}
        wrapperRef={reactFlowWrapper as any}
        className={className}
        isAuthenticated={!!user}
        userId={user?.id}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onViewportChange={onViewportChange}
      />

      {/* 노드 인스펙터 컴포넌트 */}
      <NodeInspector nodes={boardStoreNodes} />

      {/* 일반 카드 생성 모달 */}
      {isCreateModalOpen && (
        <CreateCardModal
          onClose={() => setIsCreateModalOpen(false)}
          onCardCreated={handleCardCreated}
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