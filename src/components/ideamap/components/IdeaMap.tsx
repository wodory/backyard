/**
 * 파일명: src/components/ideamap/components/IdeaMap.tsx
 * 목적: 보드 메인 컨테이너 컴포넌트
 * 역할: 보드 기능의 메인 UI 컴포넌트로, React Flow와 관련 훅을 조합하여 완전한 보드 환경 제공
 * 작성일: 2025-03-28
 * 수정일: 2025-04-17 : 렌더링 최적화 (불필요한 리렌더링 방지)
 * 수정일: 2025-04-19 : 로그 최적화 - 과도한 콘솔 로그 제거 및 logger.debug로 변경
 * 수정일: 2025-04-21 : useCreateEdge 훅을 사용하여 엣지 DB 연동 구현
 * 수정일: 2025-04-21 : onConnect 함수에서 낙관적 업데이트 제거하여 무한 루프 방지
 * 수정일: 2025-05-11 : useCreateEdge 훅 임포트 경로 수정 및 queryKey 일관성 확보
 * 수정일: 2025-05-12 : useEffect 의존성 배열 수정 및 빈 노드 상태 UI 개선
 * 수정일: 2025-05-12 : handleNodesChange useCallback 의존성 배열 수정으로 TypeError 방지
 * 수정일: 2025-04-21 : 카드 생성 시 아이디어맵에 노드 자동 배치 기능 추가
 * 수정일: 2025-05-21 : Zustand Store 의존성 제거 - React Query가 설정 데이터의 단일 진실 공급원으로 사용
 */

'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { toast } from 'sonner';

import { useReactFlow, Connection, addEdge } from '@xyflow/react';
import { useQueryClient } from '@tanstack/react-query';

import CreateCardModal from '@/components/cards/CreateCardModal';
import { useAuth } from '@/hooks/useAuth';
import { useAddNodeOnEdgeDrop } from '@/hooks/useAddNodeOnEdgeDrop';
import { useCreateEdge } from '@/hooks/useEdges';
import { useCreateCardNode } from '@/hooks/useCardNodes';
import { useIdeaMapSync } from '@/hooks/useIdeaMapSync';
import { useIdeaMapSettings } from '@/hooks/useIdeaMapSettings';
import { useAppStore } from '@/store/useAppStore';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import createLogger from '@/lib/logger';

// 보드 관련 컴포넌트 임포트
import IdeaMapCanvas from './IdeaMapCanvas';
// 보드 관련 훅 임포트
import { useIdeaMapEdges } from '../hooks/useIdeaMapEdges';
import { useIdeaMapData } from '../hooks/useIdeaMapData';
import { useIdeaMapHandlers } from '../hooks/useIdeaMapHandlers';
import { useNodeClickHandlers } from '../hooks/useNodes';
import {
  IdeaMapComponentProps,
  XYPosition,
  SafeRef,
  IdeaMapSettings,
  NodeChange
} from '../types/ideamap-types';
import { IDEAMAP_EDGES_STORAGE_KEY } from '@/lib/ideamap-constants';
import { Node } from '@xyflow/react';
import { CardData } from '@/components/ideamap/types/ideamap-types';

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

  // TanStack Query를 통해 설정 정보 가져오기
  const { ideaMapSettings } = useIdeaMapSettings();

  // useAppStore에서 필요한 상태만 선택적으로 가져오기
  const setReactFlowInstance = useAppStore(state => state.setReactFlowInstance);
  // 현재의 프로젝트 아이디 가져오기
  const activeProjectId = useAppStore(state => state.activeProjectId);

  // useIdeaMapStore에서 필요한 상태와 액션만 선택적으로 가져오기
  const ideaMapStoreNodes = useIdeaMapStore(state => state.nodes);
  const ideaMapStoreEdges = useIdeaMapStore(state => state.edges);
  const loadIdeaMapData = useIdeaMapStore(state => state.loadIdeaMapData);
  const loadedViewport = useIdeaMapStore(state => state.loadedViewport);
  const needsFitView = useIdeaMapStore(state => state.needsFitView);
  const viewportToRestore = useIdeaMapStore(state => state.viewportToRestore);
  const hasUnsavedChanges = useIdeaMapStore(state => state.hasUnsavedChanges);
  const saveViewport = useIdeaMapStore(state => state.saveViewport);
  const applyNodeChangesAction = useIdeaMapStore(state => state.applyNodeChangesAction);
  // 노드 배치 요청 관련 상태 및 액션
  const nodePlacementRequest = useIdeaMapStore(state => state.nodePlacementRequest);
  const clearNodePlacementRequest = useIdeaMapStore(state => state.clearNodePlacementRequest);

  // TanStack Query 클라이언트
  const queryClient = useQueryClient();

  // 엣지 생성 mutation 훅 사용
  const createEdgeMutation = useCreateEdge();
  // 카드노드 생성 mutation 훅 사용
  const { mutate: createCardNode } = useCreateCardNode();

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
    onConnect: originalOnConnect,
    hasUnsavedChanges: hasUnsavedEdgesChanges,
    setEdges
  } = useIdeaMapEdges({
    ideaMapSettings: ideaMapSettings?.edge || {},
    nodes: ideaMapStoreNodes,
    initialEdges: ideaMapStoreEdges
  });

  // onConnect 함수를 재정의하여 useCreateEdge 뮤테이션 호출 추가
  const onConnect = useCallback((connection: Connection) => {
    logger.debug('새 엣지 생성 요청:', connection);

    // 유효성 검사
    if (!connection.source || !connection.target || !activeProjectId) {
      logger.warn('엣지 생성에 필요한 정보 부족:', {
        hasSource: !!connection.source,
        hasTarget: !!connection.target,
        hasProjectId: !!activeProjectId
      });
      return;
    }

    // TanStack Query의 useCreateEdge 뮤테이션 호출
    createEdgeMutation.mutate({
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle ?? undefined, // null을 undefined로 변환
      targetHandle: connection.targetHandle ?? undefined, // null을 undefined로 변환
      projectId: activeProjectId,
      // 추가 속성들은 useCreateEdge 내부에서 설정됨
      type: 'custom',
      data: {
        edgeType: 'smoothstep'
      }
    });

    logger.debug('엣지 생성 요청 전송 완료:', {
      source: connection.source,
      target: connection.target,
      projectId: activeProjectId
    });
  }, [activeProjectId, createEdgeMutation]);

  // 노드 배치 요청을 감지하고 처리하는 useEffect
  useEffect(() => {
    // 노드 배치 요청이 없는 경우 처리하지 않음
    if (!nodePlacementRequest) {
      return;
    }

    logger.debug('[IdeaMap] 노드 배치 요청 처리 시작:', {
      cardId: nodePlacementRequest.cardId,
      projectId: nodePlacementRequest.projectId,
      hasReactFlowInstance: !!reactFlowInstance,
      hasWrapper: !!reactFlowWrapper.current
    });

    // ReactFlow 인스턴스 및 wrapper가 없는 경우 처리하지 않음
    if (!reactFlowInstance || !reactFlowWrapper.current) {
      logger.warn('[IdeaMap] ReactFlow 인스턴스 또는 래퍼가 없어 노드 배치 요청을 처리할 수 없습니다.', {
        hasReactFlowInstance: !!reactFlowInstance,
        hasWrapper: !!reactFlowWrapper.current
      });
      clearNodePlacementRequest();
      return;
    }

    try {
      // 중앙 좌표 계산
      const { width, height } = reactFlowWrapper.current.getBoundingClientRect();
      const centerX = width / 2;
      const centerY = height / 2;

      logger.debug('[IdeaMap] 화면 중앙 좌표 계산:', { centerX, centerY, width, height });

      // 화면 좌표를 ReactFlow 좌표로 변환
      const flowPosition = reactFlowInstance.screenToFlowPosition({
        x: centerX,
        y: centerY
      });

      logger.debug('[IdeaMap] 화면 중앙 좌표를 Flow 좌표로 변환:', flowPosition);

      // 노드 생성 요청
      createCardNode({
        cardId: nodePlacementRequest.cardId,
        projectId: nodePlacementRequest.projectId,
        positionX: flowPosition.x,
        positionY: flowPosition.y
      }, {
        onSuccess: (newNode) => {
          logger.debug('[IdeaMap] 카드 노드 생성 성공:', newNode);
          // 노드 생성 성공 시 요청 정보 초기화
          clearNodePlacementRequest();

          // 포커스 조정 (필요 시)
          setTimeout(() => {
            if (reactFlowInstance) {
              reactFlowInstance.fitView({
                padding: 0.2,
                includeHiddenNodes: false,
              });
            }
          }, 100);
        },
        onError: (error) => {
          logger.error('[IdeaMap] 카드 노드 생성 실패:', error);
          toast.error('카드 노드 생성에 실패했습니다.');
          clearNodePlacementRequest();
        }
      });
    } catch (error) {
      logger.error('[IdeaMap] 노드 배치 처리 중 오류 발생:', error);
      toast.error('노드 배치 중 오류가 발생했습니다.');
      clearNodePlacementRequest();
    }
  }, [nodePlacementRequest, reactFlowInstance, createCardNode, clearNodePlacementRequest]);

  // 노드 변경 처리 핸들러
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // 노드 상태 업데이트 (Zustand 스토어 사용)
    applyNodeChangesAction(changes);

    // 삭제 변경인 경우 콘솔 로그
    const deleteChanges = changes.filter(change => change.type === 'remove');
    if (deleteChanges.length > 0) {
      logger.debug('노드 삭제 감지됨');
    }
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

  // 카드 생성 처리
  const handleCardCreated = useCallback((card: any) => {
    logger.debug('카드 생성됨:', card);
    // 필요시 추가 로직 구현
    if (activeProjectId && card.id) {
      // 노드 배치 요청은 별도 useEffect에서 처리됨
    }
  }, [activeProjectId]);

  // handleModalCardCreated 의존성 배열도 수정
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
            // toast.success(`엣지 데이터 ${savedEdges.length}개를 복구했습니다.`);
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

  // 엣지 드롭 위치에 카드 생성 처리
  const handleEdgeDropCardCreated = useCallback((card: any) => {
    logger.debug('엣지 드롭 위치에 카드 생성:', {
      cardId: card.id,
      title: card.title,
      dropPosition: edgeDropPosition,
      sourceNodeId: edgeDropNodeId,
      handleType: edgeDropHandleType
    });

    // 엣지 드롭 모달 닫기
    setIsEdgeDropModalOpen(false);

    // 추가 로직 구현 (필요시)
    if (activeProjectId && card.id && edgeDropPosition) {
      // 로직 추가
    }
  }, [activeProjectId, edgeDropPosition, edgeDropNodeId, edgeDropHandleType]);

  // 연결 시작 처리 - IdeaMapCanvas에 전달될 콜백
  const handleConnectStart = useCallback((event: any, params: any) => {
    // 연결 시작 시 처리
    logger.debug('연결 시작:', params);
  }, []);

  // 연결 종료 처리 - IdeaMapCanvas에 전달될 콜백
  const handleConnectEnd = useCallback((event: any, params: any) => {
    // 빈 공간에 연결 종료 시 처리 (새 노드 추가 옵션 등)
    logger.debug('연결 종료:', params);

    // MouseEvent인 경우에만 처리
    if (event instanceof MouseEvent) {
      setEdgeDropPosition({ x: event.clientX, y: event.clientY });

      // params가 있고 관련 속성이 있을 경우에만 처리
      if ('source' in params && params.source && typeof params.source === 'string') {
        setEdgeDropNodeId(params.source);
        setEdgeDropHandleType('source');
        setIsEdgeDropModalOpen(true);
      }
    }
  }, [setEdgeDropPosition, setEdgeDropNodeId, setEdgeDropHandleType, setIsEdgeDropModalOpen]);

  // 드래그 오버 처리 - IdeaMapCanvas에 전달될 콜백
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 드롭 처리 - IdeaMapCanvas에 전달될 콜백
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const cardData = event.dataTransfer.getData('application/json');
    if (cardData) {
      try {
        const parsedData = JSON.parse(cardData) as CardData;
        logger.debug('카드 드롭 감지:', parsedData);

        if (!reactFlowInstance || !reactFlowWrapper.current) {
          logger.warn('ReactFlow 인스턴스 또는 래퍼가 없어 드롭을 처리할 수 없습니다.');
          return;
        }

        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });

        logger.debug('드롭 위치(Flow 좌표):', position);

        if (!activeProjectId) {
          toast.error('프로젝트에 연결되어 있지 않아 노드를 생성할 수 없습니다.');
          return;
        }

        // 카드 노드 생성 요청
        createCardNode({
          cardId: parsedData.id,
          projectId: activeProjectId,
          positionX: position.x,
          positionY: position.y
        }, {
          onSuccess: (node) => {
            logger.debug('카드 노드 생성 성공:', node);
            toast.success(`카드 "${parsedData.title}" 노드가 생성되었습니다.`);
          },
          onError: (error) => {
            logger.error('카드 노드 생성 실패:', error);
            toast.error(`카드 노드 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
          }
        });
      } catch (error) {
        logger.error('카드 데이터 파싱 실패:', error);
        toast.error('잘못된 카드 데이터입니다.');
      }
    }
  }, [reactFlowInstance, activeProjectId, createCardNode, reactFlowWrapper]);

  // 렌더링 로직을 한 곳에 모아서 조기 반환 없이 조건부 렌더링으로 처리
  let content;

  if (error) {
    // 오류 화면
    logger.info('오류 발생, 오류 UI 렌더링');
    content = (
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
  } else if (isLoading) {
    // 로딩 화면
    logger.info('로딩 중, 로딩 UI 렌더링');
    content = (
      <div className="w-full h-full flex items-center justify-center">
        <div className="bg-background/80 p-4 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-center text-sm text-gray-600">아이디어맵 로딩 중...</p>
        </div>
      </div>
    );
  } else if (ideaMapStoreNodes && ideaMapStoreNodes.length === 0) {
    // 노드가 없을 때 표시되는 화면
    logger.info('노드가 없음, 안내 메시지 표시');
    content = (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 z-10">
        <p className="text-gray-500 text-lg font-medium mb-4">카드를 아이디어맵에 추가하세요</p>
        <button
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          onClick={toggleCreateModal}
        >
          카드 만들기
        </button>
      </div>
    );
  } else {
    // 정상 상태의 아이디어맵 캔버스
    content = (
      <IdeaMapCanvas
        nodes={ideaMapStoreNodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onConnectStart={handleConnectStart}
        onConnectEnd={handleConnectEnd}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        showControls={showControls}
        wrapperRef={reactFlowWrapper}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onViewportChange={onViewportChange}
      />
    );
  }

  // 항상 동일한 구조로 반환
  return (
    <div className={`w-full h-full relative ${className}`} ref={reactFlowWrapper}>
      {content}

      {/* 모달은 상태에 따라 항상 렌더링 */}
      <CreateCardModal
        autoOpen={isCreateModalOpen}
        onClose={toggleCreateModal}
        onCardCreated={handleModalCardCreated}
      />

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