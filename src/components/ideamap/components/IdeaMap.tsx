/**
 * 파일명: src/components/ideamap/components/IdeaMap.tsx
 * 목적: 보드 메인 컨테이너 컴포넌트
 * 역할: 보드 기능의 메인 UI 컴포넌트로, React Flow와 관련 훅을 조합하여 완전한 보드 환경 제공
 * 작성일: 2025-03-28
 * 수정일: 2025-04-11 : 사용 import와 변수 제거 및 import 순서 수정
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

  // 레퍼런스 및 기타 훅
  const reactFlowWrapper = useRef<HTMLDivElement>(null) as SafeRef<HTMLDivElement>;
  const reactFlowInstance = useReactFlow();

  // useAppStore에서 상태 가져오기
  const ideaMapSettings = useAppStore(state => state.ideaMapSettings) as IdeaMapSettings;
  const setReactFlowInstance = useAppStore(state => state.setReactFlowInstance);

  // 전역 상태의 카드 목록 가져오기 (노드와 동기화를 위해)
  const storeCards = useAppStore(state => state.cards);

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

  // 보드 데이터 훅 사용 (하위 호환성을 위해 유지)
  const {
    isLoading,
    error,
    loadNodesAndEdges
  } = useIdeaMapData(onSelectCard);

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
      setReactFlowInstance(reactFlowInstance);
    }
  }, [reactFlowInstance, setReactFlowInstance]);

  // 초기 데이터 로드 - 한 번만 실행되도록 의존성 배열 비움
  useEffect(() => {
    if (!initialDataLoadedRef.current) {
      loadIdeaMapData();
      initialDataLoadedRef.current = true;
    }
  }, [loadIdeaMapData]);

  // 뷰포트 복원 Effect - 최적화
  useEffect(() => {
    if (!reactFlowInstance) return;

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

  // viewportToRestore가 변경되면 뷰포트 복원
  useEffect(() => {
    if (reactFlowInstance && viewportToRestore) {
      // 지연 적용으로 여러 번 호출되는 것을 방지
      const timeoutId = setTimeout(() => {
        reactFlowInstance.setViewport(viewportToRestore);
        console.log('[IdeaMap] 저장된 뷰포트로 복원:', viewportToRestore);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [reactFlowInstance, viewportToRestore]);

  // 카드 목록 변경 감지 및 노드 업데이트
  useEffect(() => {
    // 무한 루프 방지 로직 구현 필요함
    if (storeCards.length > 0 && ideaMapStoreNodes.length > 0) {
      // 여기서 카드 데이터와 노드 동기화 로직 구현 가능
      // console.log('카드 목록 변경 감지:', storeCards.length, '노드:', ideaMapStoreNodes.length);
    }
  }, [storeCards, ideaMapStoreNodes]);

  // 저장되지 않은 변경사항이 있을 때 페이지 이탈 경고
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || hasUnsavedEdgesChanges) {
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
    setIsCreateModalOpen(prev => !prev);
  }, []);

  // 카드 생성 후 처리
  const handleModalCardCreated = useCallback((card: Card) => {
    handleCardCreated(card);
    setIsCreateModalOpen(false);
  }, [handleCardCreated]);

  // 오류 메시지가 있으면 표시
  if (error) {
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