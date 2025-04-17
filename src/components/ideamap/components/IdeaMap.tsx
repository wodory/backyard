/**
 * 파일명: src/components/ideamap/components/IdeaMap.tsx
 * 목적: 보드 메인 컨테이너 컴포넌트
 * 역할: 보드 기능의 메인 UI 컴포넌트로, React Flow와 관련 훅을 조합하여 완전한 보드 환경 제공
 * 작성일: 2025-03-28
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

import { useReactFlow } from '@xyflow/react';

import CreateCardModal from '@/components/cards/CreateCardModal';
import { useAuth } from '@/contexts/AuthContext';
import { useAddNodeOnEdgeDrop } from '@/hooks/useAddNodeOnEdgeDrop';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/store/useAppStore';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';

// 보드 관련 컴포넌트 임포트
import IdeaMapCanvas from './IdeaMapCanvas';
// 보드 관련 훅 임포트
import { useEdges } from '../hooks/useEdges';
import { useIdeaMapData } from '../hooks/useIdeaMapData';
import { useIdeaMapHandlers } from '../hooks/useIdeaMapHandlers';
import { useNodeClickHandlers } from '../hooks/useNodes';
// 타입 임포트
import { NodeInspector } from '../nodes/NodeInspector';
import {
  IdeaMapComponentProps,
  XYPosition,
  SafeRef,
  IdeaMapSettings,
  NodeChange
} from '../types/ideamap-types';

/**
 * IdeaMap: 아이디어맵 메인 컨테이너 컴포넌트
 * @param onSelectCard 카드 선택 시 호출될 콜백 함수
 * @param className 추가 CSS 클래스
 * @param showControls 컨트롤 표시 여부
 */
export default function IdeaMap({
  onSelectCard,
  className = "",
  showControls = true
}: IdeaMapComponentProps) {
  console.log('[IdeaMap] 컴포넌트 렌더링 시작', { showControls });

  // 상태 관리
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 엣지 드롭 관련 상태
  const [isEdgeDropModalOpen, setIsEdgeDropModalOpen] = useState(false);
  const [edgeDropPosition, setEdgeDropPosition] = useState<XYPosition | null>(null);
  const [edgeDropNodeId, setEdgeDropNodeId] = useState<string | null>(null);
  const [edgeDropHandleType, setEdgeDropHandleType] = useState<'source' | 'target' | null>(null);

  // 뷰포트 변경 디바운스를 위한 타이머
  const viewportChangeTimer = useRef<NodeJS.Timeout | null>(null);

  // 인증 상태 가져오기
  const { user, isLoading: isAuthLoading } = useAuth();
  console.log('[IdeaMap] 인증 상태:', { userId: user?.id, isAuthLoading });

  // 레퍼런스 및 기타 훅
  const reactFlowWrapper = useRef<HTMLDivElement>(null) as SafeRef<HTMLDivElement>;
  const reactFlowInstance = useReactFlow();
  console.log('[IdeaMap] ReactFlow 인스턴스 확인:', !!reactFlowInstance);

  // useAppStore에서 상태 가져오기
  const ideaMapSettings = useAppStore(state => state.ideaMapSettings) as IdeaMapSettings;
  const setReactFlowInstance = useAppStore(state => state.setReactFlowInstance);

  // 전역 상태의 카드 목록 가져오기 (노드와 동기화를 위해)
  const storeCards = useAppStore(state => state.cards);
  console.log('[IdeaMap] 전역 상태 카드 목록:', { cardCount: storeCards.length });

  // useIdeaMapStore에서 보드 데이터 관련 상태와 액션 가져오기
  const {
    nodes: ideaMapStoreNodes,
    edges: ideaMapStoreEdges,
    loadIdeaMapData,
    loadedViewport,
    needsFitView,
    viewportToRestore,
    hasUnsavedChanges,
    saveViewport,
    loadAndApplyIdeaMapSettings,
    applyNodeChangesAction,
  } = useIdeaMapStore();

  console.log('[IdeaMap] IdeaMapStore 상태:', {
    nodeCount: ideaMapStoreNodes.length,
    edgeCount: ideaMapStoreEdges.length,
    hasLoadedViewport: !!loadedViewport,
    needsFitView,
    hasViewportToRestore: !!viewportToRestore,
    hasUnsavedChanges
  });

  // 보드 데이터 훅 사용 (하위 호환성을 위해 유지)
  const {
    isLoading,
    error,
    loadNodesAndEdges
  } = useIdeaMapData(onSelectCard);

  console.log('[IdeaMap] IdeaMapData 훅 상태:', { isLoading, hasError: !!error });

  // 커스텀 훅 사용
  const {
    handleNodeClick,
    handlePaneClick
  } = useNodeClickHandlers({
    onSelectCard,
    onNodeDoubleClick: (node) => {
      // 노드 더블 클릭 처리 로직 (필요한 경우)
      console.log('[IdeaMap] 노드 더블 클릭:', node.id);
    }
  });

  // 기존 useEdges 훅 사용 (하위 호환성 유지를 위해 일단 남겨둠)
  // 내부적으로는 이미 useIdeaMapStore 액션들을 호출하고 있음
  const {
    edges,
    handleEdgesChange,
    onConnect,
    hasUnsavedChanges: hasUnsavedEdgesChanges
  } = useEdges({
    ideaMapSettings,
    nodes: ideaMapStoreNodes,
    initialEdges: ideaMapStoreEdges
  });

  console.log('[IdeaMap] useEdges 훅 상태:', {
    edgeCount: edges.length,
    hasUnsavedEdgesChanges
  });

  // useIdeaMapHandlers 훅 사용
  const {
    onDragOver,
    onDrop,
    handleCardCreated,
    handleEdgeDropCardCreated: handleEdgeDropCardCreatedFromHook
  } = useIdeaMapHandlers({
    reactFlowWrapper,
    reactFlowInstance,
    fetchCards: loadNodesAndEdges
  });

  // 엣지에 새 노드 추가 기능
  const { onConnectStart, onConnectEnd } = useAddNodeOnEdgeDrop({
    onCreateNode: (position, connectingNodeId, handleType) => {
      console.log('[IdeaMap] 엣지에 새 노드 추가 요청:', { position, connectingNodeId, handleType });
      // 모달을 열기 위한 상태 설정
      setEdgeDropPosition(position);
      setEdgeDropNodeId(connectingNodeId);
      setEdgeDropHandleType(handleType);
      setIsEdgeDropModalOpen(true);
    }
  });

  // 데이터 로드 추적을 위한 ref
  const initialDataLoadedRef = useRef(false);
  // 이전 userId 값을 추적하는 ref
  const previousUserIdRef = useRef<string | undefined>(undefined);

  // ReactFlow 인스턴스 저장
  useEffect(() => {
    if (reactFlowInstance) {
      console.log('[IdeaMap] ReactFlow 인스턴스 저장');
      setReactFlowInstance(reactFlowInstance);
    }
  }, [reactFlowInstance, setReactFlowInstance]);

  // 초기 데이터 로드 - 한 번만 실행되도록 의존성 배열 비움
  useEffect(() => {
    console.log('[IdeaMap] 초기 데이터 로드 Effect 실행, 로드 상태:', initialDataLoadedRef.current);

    if (!initialDataLoadedRef.current) {
      console.log('[IdeaMap] 아이디어맵 데이터 초기 로딩 시작');
      loadIdeaMapData();
      initialDataLoadedRef.current = true;

      // 컴포넌트 마운트 시 카드-노드 동기화 강제 실행
      setTimeout(() => {
        console.log('[IdeaMap] 컴포넌트 마운트 후 카드-노드 동기화 실행');
        const { useIdeaMapStore } = require('@/store/useIdeaMapStore');
        useIdeaMapStore.getState().syncCardsWithNodes(true);
      }, 300); // ReactFlow 인스턴스가 초기화된 후 실행하기 위해 약간의 지연 추가
    }
  }, [loadIdeaMapData]);

  // 뷰포트 복원 Effect - 최적화
  useEffect(() => {
    if (!reactFlowInstance) return;
    console.log('[IdeaMap] 뷰포트 복원 Effect 실행, 상태:', {
      hasLoadedViewport: !!loadedViewport,
      needsFitView,
      viewportToRestore
    });

    const updateViewport = () => {
      if (loadedViewport) {
        // 저장된 뷰포트가 있으면 복원
        reactFlowInstance.setViewport(loadedViewport, { duration: 0 });
        console.log('[IdeaMap] 저장된 뷰포트 복원:', loadedViewport);

        // 복원 후 상태 초기화 - setState 직접 호출 대신 함수형 업데이트 사용
        // null 체크 후 사용
        if (typeof saveViewport === 'function') {
          // 상태 초기화를 위한 빈 작업
          // loadedViewport를 null로 설정하는 작업은 saveViewport 내부에서 처리됨
          saveViewport();
        }
      } else if (needsFitView) {
        // fitView 실행 필요
        reactFlowInstance.fitView({ duration: 200, padding: 0.2 });
        console.log('[IdeaMap] 뷰에 맞게 화면 조정');
      }
    };

    // 약간의 지연 후 실행하여 ReactFlow가 완전히 초기화된 후 적용되도록 함
    const timeoutId = setTimeout(updateViewport, 100);

    return () => clearTimeout(timeoutId);
  }, [reactFlowInstance, loadedViewport, needsFitView, saveViewport]);

  // ReactFlow 인스턴스 및 노드가 준비되었을 때 fitView 보장
  useEffect(() => {
    console.log('[IdeaMap] fitView 보장 Effect, 상태:', {
      hasReactFlowInstance: !!reactFlowInstance,
      nodeCount: ideaMapStoreNodes.length
    });

    // ReactFlow 인스턴스와 노드가 모두 있는 경우에만 실행
    if (reactFlowInstance && ideaMapStoreNodes.length > 0) {
      console.log('[IdeaMap] 노드와 ReactFlow 인스턴스 모두 준비됨, fitView 실행');

      // 약간의 지연 후 fitView 호출 (DOM이 완전히 업데이트된 후)
      const timeoutId = setTimeout(() => {
        try {
          reactFlowInstance.fitView({
            padding: 0.3,
            includeHiddenNodes: true,
            minZoom: 0.5,
            duration: 300
          });
          console.log('[IdeaMap] fitView 실행 완료, 노드 수:', ideaMapStoreNodes.length);
        } catch (error) {
          console.error('[IdeaMap] fitView 실행 중 오류:', error);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [reactFlowInstance, ideaMapStoreNodes.length]);

  // viewportToRestore가 변경되면 뷰포트 복원
  useEffect(() => {
    console.log('[IdeaMap] viewportToRestore 감시 Effect, 상태:', {
      hasReactFlowInstance: !!reactFlowInstance,
      viewportToRestore
    });

    if (reactFlowInstance && viewportToRestore) {
      // 지연 적용으로 여러 번 호출되는 것을 방지
      const timeoutId = setTimeout(() => {
        reactFlowInstance.setViewport(viewportToRestore);
        console.log('[IdeaMap] 저장된 뷰포트로 복원:', viewportToRestore);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [reactFlowInstance, viewportToRestore]);

  // 카드 목록 변경 감지 및 노드 업데이트 - 기존 코드 개선
  useEffect(() => {
    console.log('[IdeaMap] 카드-노드 동기화 Effect, 상태:', {
      cardCount: storeCards.length,
      nodeCount: ideaMapStoreNodes.length,
      hasReactFlowInstance: !!reactFlowInstance
    });

    // 카드와 노드 동기화 함수
    const syncCardsAndNodes = () => {
      console.log('[IdeaMap] 카드-노드 동기화 실행:',
        '카드:', storeCards.length,
        '노드:', ideaMapStoreNodes.length);

      const { useIdeaMapStore } = require('@/store/useIdeaMapStore');
      useIdeaMapStore.getState().syncCardsWithNodes(true);
    };

    // 컴포넌트가 마운트된 후 reactFlowInstance가 준비되었고 카드가 있는 경우
    if (reactFlowInstance && storeCards.length > 0) {
      // 동기화가 필요한 조건 확인
      const needsSync = ideaMapStoreNodes.length === 0 ||
        storeCards.length !== ideaMapStoreNodes.length;

      if (needsSync) {
        console.log('[IdeaMap] 카드-노드 동기화가 필요:', {
          cardCount: storeCards.length,
          nodeCount: ideaMapStoreNodes.length
        });
        // 약간의 지연 후 동기화 실행 (다른 상태 변경과의 충돌 방지)
        setTimeout(syncCardsAndNodes, 100);
      }
    }
  }, [storeCards, ideaMapStoreNodes, reactFlowInstance]);

  // 저장되지 않은 변경사항이 있을 때 페이지 이탈 경고
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || hasUnsavedEdgesChanges) {
        console.log('[IdeaMap] 저장되지 않은 변경사항이 있음:', {
          hasUnsavedChanges,
          hasUnsavedEdgesChanges
        });
        const message = '저장되지 않은 변경사항이 있습니다. 정말로 나가시겠습니까?';
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, hasUnsavedEdgesChanges]);

  // 사용자 변경 감지 - DB에서 해당 사용자의 레이아웃 데이터 가져오기
  useEffect(() => {
    const currentUserId = user?.id;
    console.log('[IdeaMap] 사용자 변경 감지 Effect, 상태:', {
      currentUserId,
      previousUserId: previousUserIdRef.current,
      isAuthLoading
    });

    // 처음 로드되거나 사용자가 변경되었을 때만 실행
    if (
      currentUserId &&
      previousUserIdRef.current !== currentUserId &&
      !isAuthLoading
    ) {
      console.log('[IdeaMap] 사용자 변경 감지, 레이아웃 데이터 로드:', currentUserId);
      loadIdeaMapData();
      loadAndApplyIdeaMapSettings(currentUserId);
      previousUserIdRef.current = currentUserId;
    }
  }, [user?.id, isAuthLoading, loadIdeaMapData, loadAndApplyIdeaMapSettings]);

  // 엣지 드롭 후 카드 생성 처리
  const handleEdgeDropCardCreated = useCallback((card: Card) => {
    console.log('[IdeaMap] 엣지 드롭 후 카드 생성:', {
      cardId: card.id,
      position: edgeDropPosition,
      nodeId: edgeDropNodeId,
      handleType: edgeDropHandleType
    });

    if (!edgeDropPosition || !edgeDropNodeId || !edgeDropHandleType) {
      console.error('[IdeaMap] 엣지 드롭 정보가 누락되었습니다.');
      return;
    }

    // 기존 핸들러 호출
    handleEdgeDropCardCreatedFromHook(card, edgeDropPosition, edgeDropNodeId, edgeDropHandleType);

    // 상태 초기화
    setIsEdgeDropModalOpen(false);
    setEdgeDropPosition(null);
    setEdgeDropNodeId(null);
    setEdgeDropHandleType(null);
  }, [
    edgeDropPosition,
    edgeDropNodeId,
    edgeDropHandleType,
    handleEdgeDropCardCreatedFromHook
  ]);

  // 노드 위치 변경 시 호출되는 React Flow의 onNodesChange 콜백을 래핑
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    console.log('[IdeaMap] 노드 변경 감지:', {
      changeCount: changes.length,
      changeTypes: changes.map(c => c.type).join(', ')
    });

    // 노드 변경사항 적용
    applyNodeChangesAction(changes);
  }, [applyNodeChangesAction]);

  // 뷰포트 변경 감지 및 저장 - 디바운스 적용
  const onViewportChange = useCallback(() => {
    // 이전 타이머 취소
    if (viewportChangeTimer.current) {
      clearTimeout(viewportChangeTimer.current);
    }

    // 새 타이머 설정 - 뷰포트 변경 종료 0.5초 후 저장
    viewportChangeTimer.current = setTimeout(() => {
      if (reactFlowInstance) {
        const viewport = reactFlowInstance.getViewport();
        console.log('[IdeaMap] 뷰포트 변경 감지, 저장:', viewport);
        saveViewport();
      }
      viewportChangeTimer.current = null;
    }, 500);
  }, [reactFlowInstance, saveViewport]);

  // 카드 생성 모달 토글
  const toggleCreateModal = useCallback(() => {
    console.log('[IdeaMap] 카드 생성 모달 토글');
    setIsCreateModalOpen(prev => !prev);
  }, []);

  // 카드 생성 후 처리
  const handleModalCardCreated = useCallback((card: Card) => {
    console.log('[IdeaMap] 모달에서 카드 생성:', { cardId: card.id, title: card.title });
    handleCardCreated(card);
    setIsCreateModalOpen(false);
  }, [handleCardCreated]);

  // 오류 메시지가 있으면 표시
  if (error) {
    console.log('[IdeaMap] 오류 발생, 오류 UI 렌더링');
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="bg-destructive text-white p-4 rounded shadow-lg">
          <h3 className="font-bold text-lg">오류 발생</h3>
          <p>{error.toString()}</p>
          <button
            className="mt-2 bg-white text-destructive px-4 py-2 rounded hover:bg-gray-100"
            onClick={() => loadNodesAndEdges()}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    console.log('[IdeaMap] 로딩 중, 로딩 UI 렌더링');
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="bg-card p-6 rounded-md shadow-lg animate-pulse">
          <div className="h-6 w-36 bg-muted rounded mb-4"></div>
          <div className="h-4 w-64 bg-muted rounded mb-2"></div>
          <div className="h-4 w-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  console.log('[IdeaMap] 메인 UI 렌더링, 노드/엣지 상태:', {
    nodeCount: ideaMapStoreNodes.length,
    edgeCount: edges.length
  });

  return (
    <div className={`w-full h-full relative ${className}`}>
      {/* 캔버스 컴포넌트 */}
      <IdeaMapCanvas
        nodes={ideaMapStoreNodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        ideaMapSettings={ideaMapSettings}
        onViewportChange={onViewportChange}
        showControls={showControls}
        wrapperRef={reactFlowWrapper}
        onDragOver={onDragOver}
        onDrop={onDrop}
      />

      {/* 노드 검사기 - 개발 모드일 때만 표시 */}
      {process.env.NODE_ENV === 'development' && <NodeInspector nodes={ideaMapStoreNodes} />}

      {/* 카드 생성 모달 */}
      <CreateCardModal
        autoOpen={isCreateModalOpen}
        onClose={toggleCreateModal}
        onCardCreated={handleModalCardCreated}
      />

      {/* 엣지 드롭 카드 생성 모달 */}
      <CreateCardModal
        autoOpen={isEdgeDropModalOpen}
        onClose={() => setIsEdgeDropModalOpen(false)}
        onCardCreated={handleEdgeDropCardCreated}
      />
    </div>
  );
} 