/**
 * 파일명: src/components/ideamap/components/IdeaMap.tsx
 * 목적: 보드 메인 컨테이너 컴포넌트
 * 역할: 보드 기능의 메인 UI 컴포넌트로, React Flow와 관련 훅을 조합하여 완전한 보드 환경 제공
 * 작성일: 2025-03-28
 * 수정일: 2025-04-17 : 렌더링 최적화 (불필요한 리렌더링 방지)
 * 수정일: 2025-04-19 : 로그 최적화 - 과도한 콘솔 로그 제거 및 logger.debug로 변경
 */

'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { toast } from 'sonner';

import { useReactFlow } from '@xyflow/react';

import CreateCardModal from '@/components/cards/CreateCardModal';
import { useAuth } from '@/hooks/useAuth';
import { useAddNodeOnEdgeDrop } from '@/hooks/useAddNodeOnEdgeDrop';
import { useIdeaMapSync } from '@/hooks/useIdeaMapSync';
import { useAppStore } from '@/store/useAppStore';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import createLogger from '@/lib/logger';

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
import { IDEAMAP_EDGES_STORAGE_KEY } from '@/lib/ideamap-constants';
import { Node } from '@xyflow/react';

// 로거 생성
const logger = createLogger('IdeaMap');

/**
 * IdeaMap: 아이디어맵 메인 컨테이너 컴포넌트
 * @param onSelectCard 카드 선택 시 호출될 콜백 함수
 * @param className 추가 CSS 클래스
 * @param showControls 컨트롤 표시 여부
 */
function IdeaMap({
  onSelectCard,
  className = "",
  showControls = true
}: IdeaMapComponentProps) {
  // logger.debug('컴포넌트 렌더링 시작', { showControls });

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
  // logger.debug('인증 상태:', { userId: user?.id, isAuthLoading });

  // 레퍼런스 및 기타 훅
  const reactFlowWrapper = useRef<HTMLDivElement>(null) as SafeRef<HTMLDivElement>;
  const reactFlowInstance = useReactFlow();
  // logger.debug('ReactFlow 인스턴스 확인:', !!reactFlowInstance);

  // useAppStore에서 필요한 상태만 선택적으로 가져오기
  const ideaMapSettings = useAppStore(state => state.ideaMapSettings) as IdeaMapSettings;
  const setReactFlowInstance = useAppStore(state => state.setReactFlowInstance);

  // useIdeaMapStore에서 필요한 상태와 액션만 선택적으로 가져오기
  const ideaMapStoreNodes = useIdeaMapStore(state => state.nodes);
  const ideaMapStoreEdges = useIdeaMapStore(state => state.edges);
  const loadIdeaMapData = useIdeaMapStore(state => state.loadIdeaMapData);
  const loadedViewport = useIdeaMapStore(state => state.loadedViewport);
  const needsFitView = useIdeaMapStore(state => state.needsFitView);
  const viewportToRestore = useIdeaMapStore(state => state.viewportToRestore);
  const hasUnsavedChanges = useIdeaMapStore(state => state.hasUnsavedChanges);
  const saveViewport = useIdeaMapStore(state => state.saveViewport);
  const loadAndApplyIdeaMapSettings = useIdeaMapStore(state => state.loadAndApplyIdeaMapSettings);
  const applyNodeChangesAction = useIdeaMapStore(state => state.applyNodeChangesAction);
  const saveLayout = useIdeaMapStore(state => state.saveLayout);

  // 디버깅 주석 처리
  // logger.debug('IdeaMapStore 상태:', {
  //   nodeCount: ideaMapStoreNodes.length,
  //   edgeCount: ideaMapStoreEdges.length,
  //   hasLoadedViewport: !!loadedViewport,
  //   needsFitView,
  //   hasViewportToRestore: !!viewportToRestore,
  //   hasUnsavedChanges
  // });

  // useIdeaMapData 훅 사용 부분 수정 (타입 오류 해결)
  // 타입 안전성을 위해 onSelectCard를 항상 함수로 전달
  const handleSelectCard = useCallback((cardId: string) => {
    if (onSelectCard) {
      onSelectCard(cardId);
    }
  }, [onSelectCard]);

  // 보드 데이터 훅 사용 (하위 호환성을 위해 유지)
  const {
    isLoading,
    error,
    loadNodesAndEdges
  } = useIdeaMapData(handleSelectCard);

  // 디버깅 주석 처리
  // logger.debug('IdeaMapData 훅 상태:', { isLoading, hasError: !!error });

  // 커스텀 훅 사용
  const {
    handleNodeClick,
    handlePaneClick
  } = useNodeClickHandlers({
    onSelectCard,
    onNodeDoubleClick: useCallback((node: Node) => {
      // 노드 더블 클릭 처리 로직 (필요한 경우)
      logger.debug('노드 더블 클릭:', node.id);
    }, [])
  });

  // 기존 useEdges 훅 사용 (하위 호환성 유지를 위해 일단 남겨둠)
  // 내부적으로는 이미 useIdeaMapStore 액션들을 호출하고 있음
  const {
    edges,
    handleEdgesChange,
    onConnect,
    hasUnsavedChanges: hasUnsavedEdgesChanges,
    setEdges
  } = useEdges({
    ideaMapSettings,
    nodes: ideaMapStoreNodes,
    initialEdges: ideaMapStoreEdges
  });

  // loadNodesAndEdges 함수를 안전하게 래핑
  const fetchCards = useCallback(async () => {
    await loadNodesAndEdges();
    return { nodes: ideaMapStoreNodes, edges: ideaMapStoreEdges };
  }, [loadNodesAndEdges, ideaMapStoreNodes, ideaMapStoreEdges]);

  // useIdeaMapHandlers 훅 사용
  const {
    onDragOver,
    onDrop,
    handleCardCreated,
    handleEdgeDropCardCreated: handleEdgeDropCardCreatedFromHook
  } = useIdeaMapHandlers({
    reactFlowWrapper,
    reactFlowInstance,
    fetchCards // loadNodesAndEdges 대신 래핑한 fetchCards 사용
  });

  // 엣지에 새 노드 추가 기능
  const { onConnectStart, onConnectEnd } = useAddNodeOnEdgeDrop({
    onCreateNode: useCallback((position, connectingNodeId, handleType) => {
      // logger.debug('엣지에 새 노드 추가 요청:', { position, connectingNodeId, handleType });
      // 모달을 열기 위한 상태 설정
      setEdgeDropPosition(position);
      setEdgeDropNodeId(connectingNodeId);
      setEdgeDropHandleType(handleType);
      setIsEdgeDropModalOpen(true);
    }, [])
  });

  // 데이터 로드 추적을 위한 ref
  const initialDataLoadedRef = useRef(false);
  // 이전 userId 값을 추적하는 ref
  const previousUserIdRef = useRef<string | undefined>(undefined);

  // ReactFlow 인스턴스 저장
  useEffect(() => {
    if (reactFlowInstance) {
      logger.debug('ReactFlow 인스턴스 저장');
      setReactFlowInstance(reactFlowInstance);
    }
  }, [reactFlowInstance, setReactFlowInstance]);

  // React Query 카드 데이터와 ReactFlow 노드 간 자동 동기화 설정
  useIdeaMapSync();

  // 초기 데이터 로드 - 한 번만 실행되도록 의존성 배열 비움
  useEffect(() => {
    logger.debug('초기 데이터 로드 Effect 실행, 로드 상태:', initialDataLoadedRef.current);

    if (!initialDataLoadedRef.current) {
      logger.info('아이디어맵 데이터 초기 로딩 시작');
      loadIdeaMapData();
      initialDataLoadedRef.current = true;

      // 컴포넌트 마운트 시 카드-노드 동기화 강제 실행
      const timeoutId = setTimeout(() => {
        logger.debug('컴포넌트 마운트 후 카드-노드 동기화 실행');
        const { useIdeaMapStore } = require('@/store/useIdeaMapStore');
        useIdeaMapStore.getState().syncCardsWithNodes(true);
      }, 300); // ReactFlow 인스턴스가 초기화된 후 실행하기 위해 약간의 지연 추가

      return () => clearTimeout(timeoutId);
    }
  }, [loadIdeaMapData]);

  // 뷰포트 복원 Effect - 최적화
  useEffect(() => {
    if (!reactFlowInstance) return;
    logger.debug('뷰포트 복원 Effect 실행, 상태:', {
      hasLoadedViewport: !!loadedViewport,
      needsFitView,
      viewportToRestore
    });

    const updateViewport = () => {
      if (loadedViewport) {
        // 저장된 뷰포트가 있으면 복원
        reactFlowInstance.setViewport(loadedViewport, { duration: 0 });
        logger.debug('저장된 뷰포트 복원:', loadedViewport);

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
        logger.debug('뷰에 맞게 화면 조정');
      }
    };

    // 약간의 지연 후 실행하여 ReactFlow가 완전히 초기화된 후 적용되도록 함
    const timeoutId = setTimeout(updateViewport, 100);

    return () => clearTimeout(timeoutId);
  }, [reactFlowInstance, loadedViewport, needsFitView, saveViewport]);

  // ReactFlow 인스턴스 및 노드가 준비되었을 때 fitView 보장
  useEffect(() => {
    logger.debug('fitView 보장 Effect, 상태:', {
      hasReactFlowInstance: !!reactFlowInstance,
      nodeCount: ideaMapStoreNodes.length
    });

    // ReactFlow 인스턴스와 노드가 모두 있는 경우에만 실행
    if (reactFlowInstance && ideaMapStoreNodes.length > 0) {
      logger.debug('노드와 ReactFlow 인스턴스 모두 준비됨, fitView 실행');

      // 약간의 지연 후 fitView 호출 (DOM이 완전히 업데이트된 후)
      const timeoutId = setTimeout(() => {
        try {
          reactFlowInstance.fitView({
            padding: 0.3,
            includeHiddenNodes: true,
            minZoom: 0.5,
            duration: 300
          });
          logger.debug('fitView 실행 완료, 노드 수:', ideaMapStoreNodes.length);
        } catch (error) {
          logger.error('fitView 실행 중 오류:', error);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [reactFlowInstance, ideaMapStoreNodes.length]);

  // viewportToRestore가 변경되면 뷰포트 복원
  useEffect(() => {
    logger.debug('viewportToRestore 감시 Effect, 상태:', {
      hasReactFlowInstance: !!reactFlowInstance,
      viewportToRestore
    });

    if (reactFlowInstance && viewportToRestore) {
      // 지연 적용으로 여러 번 호출되는 것을 방지
      const timeoutId = setTimeout(() => {
        reactFlowInstance.setViewport(viewportToRestore);
        logger.debug('저장된 뷰포트로 복원:', viewportToRestore);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [reactFlowInstance, viewportToRestore]);

  // 카드-노드 동기화 - 기존 코드 개선
  useEffect(() => {
    logger.debug('카드-노드 동기화 Effect, 상태:', {
      nodeCount: ideaMapStoreNodes.length,
      hasReactFlowInstance: !!reactFlowInstance
    });

    // 초기 마운트시 노드 동기화
    if (reactFlowInstance && ideaMapStoreNodes.length === 0) {
      logger.debug('노드가 없음 - 데이터 동기화 시도');

      // 동기화 함수
      const syncNodesFromStore = () => {
        const { useIdeaMapStore } = require('@/store/useIdeaMapStore');
        useIdeaMapStore.getState().syncCardsWithNodes(true);
      };

      // 약간의 지연 후 동기화 실행
      const timeoutId = setTimeout(syncNodesFromStore, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [ideaMapStoreNodes.length, reactFlowInstance]);

  // 저장되지 않은 변경사항이 있을 때 페이지 이탈 경고
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || hasUnsavedEdgesChanges) {
        logger.debug('저장되지 않은 변경사항이 있음:', {
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
    logger.debug('사용자 변경 감지 Effect, 상태:', {
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
      logger.info('사용자 변경 감지, 레이아웃 데이터 로드:', currentUserId);
      loadIdeaMapData();
      loadAndApplyIdeaMapSettings(currentUserId);
      previousUserIdRef.current = currentUserId;
    }
  }, [user?.id, isAuthLoading, loadIdeaMapData, loadAndApplyIdeaMapSettings]);

  // 엣지 드롭 후 카드 생성 처리
  const handleEdgeDropCardCreated = useCallback((card: any) => {
    logger.debug('엣지 드롭 후 카드 생성:', {
      cardId: card.id,
      position: edgeDropPosition,
      nodeId: edgeDropNodeId,
      handleType: edgeDropHandleType
    });

    if (!edgeDropPosition || !edgeDropNodeId || !edgeDropHandleType) {
      logger.error('엣지 드롭 정보가 누락되었습니다.');
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
    // 디버깅을 위한 상세 로그 추가
    logger.debug('노드 변경 감지:', {
      changeCount: changes.length,
      changeTypes: changes.map(c => c.type).join(', '),
      changes: changes.map(c => ({
        type: c.type,
        id: 'id' in c ? c.id : 'unknown',
        dragging: 'dragging' in c ? c.dragging : 'N/A',
        position: 'position' in c ? c.position : 'N/A'
      }))
    });

    // position 타입의 변경이면서 dragging이 false인 변경 감지 (드래그 완료)
    const positionChanges = changes.filter(
      change => change.type === 'position'
    );

    const dragCompleted = positionChanges.some(
      change => 'dragging' in change && (change as any).dragging === false
    );

    // 노드 변경사항 적용 (상태 업데이트)
    applyNodeChangesAction(changes);

    // 드래그가 완료되면 레이아웃 저장
    if (dragCompleted) {
      logger.debug('노드 드래그 완료 감지, 레이아웃 저장 시도:', {
        노드수: ideaMapStoreNodes.length
      });

      // 약간의 딜레이 후 저장 (상태 업데이트가 완료된 후)
      setTimeout(() => {
        try {
          const saved = saveLayout();
          logger.debug('레이아웃 저장 결과:', saved);

          if (saved) {
            // 성공 알림 필요 없음 (사용자 경험 개선)
            // toast.success('노드 위치가 저장되었습니다.');
          } else {
            toast.error('노드 위치 저장에 실패했습니다.');
          }
        } catch (err) {
          logger.error('레이아웃 저장 중 오류:', err);
          toast.error('노드 위치 저장 중 오류가 발생했습니다.');
        }
      }, 200); // 200ms로 늘려 상태 업데이트가 확실히 완료된 후 저장
    }

    // 변경사항 중에 노드가 삭제된 경우에도 저장
    const hasNodeDeleted = changes.some(change => change.type === 'remove');
    if (hasNodeDeleted) {
      logger.debug('노드 삭제 감지, 레이아웃 저장');
      // 약간의 딜레이 후 저장 (상태 업데이트가 완료된 후)
      setTimeout(() => saveLayout(), 200); // 200ms로 늘림
    }
  }, [applyNodeChangesAction, saveLayout, ideaMapStoreNodes.length]);

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
        // logger.debug('뷰포트 변경 감지, 저장:', viewport);
        saveViewport();
      }
      viewportChangeTimer.current = null;
    }, 500);
  }, [reactFlowInstance, saveViewport]);

  // 카드 생성 모달 토글
  const toggleCreateModal = useCallback(() => {
    logger.debug('카드 생성 모달 토글');
    setIsCreateModalOpen(prev => !prev);
  }, []);

  // 카드 생성 후 처리
  const handleModalCardCreated = useCallback((card: any) => {
    logger.debug('모달에서 카드 생성:', { cardId: card.id, title: card.title });
    handleCardCreated(card);
    setIsCreateModalOpen(false);
  }, [handleCardCreated]);

  // useEffect를 사용하여 초기 엣지 데이터 검증 및 로딩
  useEffect(() => {
    logger.debug('엣지 데이터 검증 시작:', { edgesLength: edges.length });

    // 엣지가 비어있는 경우 로컬 스토리지에서 직접 로드 시도
    if (edges.length === 0) {
      logger.debug('엣지 배열이 비어있음. 로컬 스토리지에서 직접 로드 시도');
      try {
        const savedEdgesStr = localStorage.getItem(IDEAMAP_EDGES_STORAGE_KEY);
        if (savedEdgesStr) {
          const savedEdges = JSON.parse(savedEdgesStr);
          logger.debug('로컬 스토리지에서 엣지 로드 성공:', { edgesCount: savedEdges.length });

          // 로컬 스토리지에 엣지가 있으면 스토어에 설정
          if (savedEdges.length > 0) {
            // 타입 오류 해결: 명시적으로 Edge[] 타입으로 캐스팅
            setEdges(savedEdges);
            toast.success(`엣지 데이터 ${savedEdges.length}개를 복구했습니다.`);
          } else {
            logger.debug('로컬 스토리지에 저장된 엣지가 없음');
          }
        } else {
          logger.debug('로컬 스토리지에 저장된 엣지 데이터 없음');
        }
      } catch (err) {
        logger.error('로컬 스토리지에서 엣지 로드 중 오류:', err);
      }
    }
  }, [edges.length, setEdges]);

  // 오류 메시지가 있으면 표시
  if (error) {
    logger.info('오류 발생, 오류 UI 렌더링');
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
    // logger.info('로딩 중, 로딩 UI 렌더링');
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
  // 디버깅 주석 처리
  // logger.debug('메인 UI 렌더링, 노드/엣지 상태:', {
  //   nodeCount: ideaMapStoreNodes.length,
  //   edgeCount: edges.length
  // });

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

// React.memo로 컴포넌트 감싸기
export default memo(IdeaMap); 