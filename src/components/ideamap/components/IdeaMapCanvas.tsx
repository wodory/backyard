/**
 * 파일명: src/components/ideamap/components/IdeaMapCanvas.tsx
 * 목적: ReactFlow 캔버스 렌더링 컴포넌트
 * 역할: Board 컴포넌트에서 ReactFlow 캔버스 관련 로직을 분리하여 렌더링을 담당
 * 작성일: 2025-03-28
 * 수정일: 2025-03-30
 * 수정일: 2023-10-27 : ESLint 오류 수정 (미사용 변수 제거, any 타입 수정)
 * 수정일: 2023-10-27 : wrapperRef 타입을 SafeRef로 수정
 * 수정일: 2023-10-27 : import 순서 수정 및 미사용 변수(ConnectionLineType) 제거
 * 수정일: 2023-10-27 : connectionLineType 타입을 ConnectionLineType으로 수정
 * 수정일: 2024-06-27 : fitView 옵션 개선 및 defaultViewport 설정 강화
 * 수정일: 2024-06-27 : 뷰포트 관리 로직 추가 및 자동 fitView 기능 개선
 * 수정일: 2025-04-21 : handleEdgesChange 함수를 수정하여 오직 applyEdgeChangesAction만 호출하도록 단순화
 * 수정일: 2025-04-29 : 무한 루프 방지를 위한 handleEdgesChange 최적화
 * 수정일: 2025-05-01 : TanStack Query 훅을 사용한 엣지 CRUD 연동
 * 수정일: 2025-05-21 : 다중 엣지 삭제 처리 기능 추가
 * 수정일: 2025-04-21 : 노드 삭제 시 CardNode 삭제 로직 추가
 * 수정일: 2025-04-21 : 노드 드래그 종료 시 CardNode 위치 업데이트 로직 추가
 * 수정일: 2025-05-21 : Three-Layer-Standard 준수를 위한 리팩토링 - useIdeaMapSettings 훅 사용
 * 수정일: 2025-05-23 : userId를 useAuthStore에서 직접 가져오도록 수정
 * 수정일: 2025-05-06 : React.memo 적용하여 불필요한 리렌더링 방지
 * 수정일: 2025-05-21 : Zustand Store 의존성 제거 - useIdeaMapSettings만 사용하도록 개선
 */

'use client';
import React, { useMemo, useRef, useCallback, useEffect } from 'react';

import {
  ReactFlow,
  Controls,
  Background,
  ConnectionMode,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  OnConnectStart,
  OnConnectEnd,
  MarkerType,
  Viewport,
  ConnectionLineType,
  ReactFlowInstance,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow
} from '@xyflow/react';

import { SafeRef } from '@/components/ideamap/types/ideamap-types';
import { NODE_TYPES, EDGE_TYPES } from '@/lib/flow-constants';
import { Settings, applyIdeaMapEdgeSettings } from '@/lib/ideamap-utils';
// 노드 타입과 엣지 타입 컴포넌트 직접 가져오기
// import CardNode from '@/components/ideamap/nodes/CardNode';
// import CustomEdge from '@/components/ideamap/nodes/CustomEdge';
// 노드 타입 직접 가져오기 대신 flow-constants에서 가져오기
import { cn } from '@/lib/utils';
// 삭제 3/29
// import BoardControls from './BoardControls';

import { createLogger } from '@/lib/logger';
import { useIdeaMapStore } from '@/store/useIdeaMapStore';
import { useAppStore, selectActiveProject } from '@/store/useAppStore';
import { useAuthStore, selectUserId } from '@/store/useAuthStore';
import { useCreateEdge, useDeleteEdge, useDeleteMultipleEdges } from '@/hooks/useEdges'; // useDeleteMultipleEdges 추가
import { useDeleteCardNode, useUpdateCardNodePosition } from '@/hooks/useCardNodes'; // CardNode 삭제 훅 및 위치 업데이트 훅 추가
import { useIdeaMapSettings } from '@/hooks/useIdeaMapSettings'; // 설정 정보를 가져오는 React Query 훅 추가
import { toast } from 'sonner';

const logger = createLogger('IdeaMapCanvas');

interface IdeaMapCanvasProps {
  /** ReactFlow 노드 배열 */
  nodes: Node[];
  /** ReactFlow 엣지 배열 */
  edges: Edge[];
  /** 노드 변경 핸들러 */
  onNodesChange: (changes: NodeChange[]) => void;
  /** 엣지 변경 핸들러 */
  onEdgesChange: (changes: EdgeChange[]) => void;
  /** 연결 생성 핸들러 */
  onConnect: (connection: Connection) => void;
  /** 연결 시작 핸들러 */
  onConnectStart: OnConnectStart;
  /** 연결 종료 핸들러 */
  onConnectEnd: OnConnectEnd;
  /** 노드 클릭 핸들러 */
  onNodeClick: (e: React.MouseEvent, node: Node) => void;
  /** 빈 공간 클릭 핸들러 */
  onPaneClick: (e: React.MouseEvent) => void;
  /** 컨트롤 표시 여부 */
  showControls?: boolean;
  /** 래퍼 ref */
  wrapperRef: SafeRef<HTMLDivElement>;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 드래그 오버 핸들러 (옵셔널) */
  onDragOver?: (event: React.DragEvent) => void;
  /** 드롭 핸들러 (옵셔널) */
  onDrop?: (event: React.DragEvent) => void;
  /** 뷰포트 변경 핸들러 (옵셔널) */
  onViewportChange?: (viewport: Viewport) => void;
}

/**
 * IdeaMapCanvas: ReactFlow 캔버스 렌더링 컴포넌트
 * ReactFlow와 관련된 UI 렌더링을 담당하며, 실제 로직은 상위 컴포넌트(IdeaMap)에서 처리
 */
function IdeaMapCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onConnectStart,
  onConnectEnd,
  onNodeClick,
  onPaneClick,
  showControls = true,
  wrapperRef,
  className = "",
  onDragOver,
  onDrop,
  onViewportChange
}: IdeaMapCanvasProps) {

  // 활성 프로젝트 ID 가져오기
  const activeProjectId = useAppStore(state => state.activeProjectId);
  const activeProject = useAppStore(selectActiveProject);

  // 인증된 사용자 ID 가져오기 (useAuthStore에서 직접)
  const userId = useAuthStore(selectUserId);

  // TanStack Query를 통해 설정 정보 가져오기
  const { ideaMapSettings, isLoading, isError, error } = useIdeaMapSettings();

  // 설정이 변경될 때마다 로그만 남기고 CustomEdge 컴포넌트가 자체적으로 설정을 적용하도록 함
  useEffect(() => {
    if (ideaMapSettings) {
      // 설정이 로드되었을 때 로그만 남김
      logger.debug('설정 변경 감지 (엣지 자동 업데이트됨)', {
        connectionLineType: ideaMapSettings.edge?.connectionLineType,
        strokeWidth: ideaMapSettings.edge?.strokeWidth,
        edgeColor: ideaMapSettings.edge?.edgeColor,
        edgeCount: edges.length
      });
    }
  }, [ideaMapSettings, edges.length]);

  // 엣지 데이터 확인을 위한 로그 추가
  useEffect(() => {
    logger.debug('엣지 데이터 확인:', {
      edgeCount: edges.length
    });
  }, [edges]);

  // 기본 엣지 옵션 메모이제이션
  const defaultEdgeOptions = useMemo(() => {
    // 설정 정보가 없으면 기본값 사용
    if (!ideaMapSettings || !ideaMapSettings.edge) {
      return {
        type: 'custom',
        animated: false,
        style: {
          strokeWidth: 2,
          stroke: '#C1C1C1'
        }
      };
    }

    const options = {
      type: 'custom',
      animated: ideaMapSettings.edge.animated,
      style: {
        strokeWidth: ideaMapSettings.edge.strokeWidth,
        stroke: ideaMapSettings.edge.edgeColor
      }
    };
    logger.debug('기본 엣지 옵션 생성:', options);
    return options;
  }, [ideaMapSettings]);

  // SVG 마커 정의
  const markers = useMemo(() => {
    if (!ideaMapSettings?.edge?.markerEnd) return null;

    const markerSize = ideaMapSettings.edge.markerSize || 20;
    const markerColor = ideaMapSettings.edge.edgeColor || '#C1C1C1';

    return (
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <marker
            id="marker-arrow"
            markerWidth={markerSize}
            markerHeight={markerSize}
            refX={markerSize}
            refY={markerSize / 2}
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path
              d={`M 0 0 L ${markerSize} ${markerSize / 2} L 0 ${markerSize} Z`}
              fill={markerColor}
            />
          </marker>
          <marker
            id="marker-arrowclosed"
            markerWidth={markerSize}
            markerHeight={markerSize}
            refX={markerSize}
            refY={markerSize / 2}
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path
              d={`M 0 0 L ${markerSize} ${markerSize / 2} L 0 ${markerSize} Z`}
              fill={markerColor}
              stroke={markerColor}
              strokeWidth="1"
            />
          </marker>
        </defs>
      </svg>
    );
  }, [ideaMapSettings?.edge?.markerEnd, ideaMapSettings?.edge?.markerSize, ideaMapSettings?.edge?.edgeColor]);

  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // 추가: useIdeaMapStore에서 setReactFlowInstance 가져오기
  const setReactFlowInstance = useIdeaMapStore(state => state.setReactFlowInstance);

  // 컴포넌트 마운트/언마운트 로깅
  useEffect(() => {
    logger.info('컴포넌트 마운트', { 노드수: nodes.length, 엣지수: edges.length });
    return () => {
      logger.info('컴포넌트 언마운트');
    };
  }, [nodes.length, edges.length]);

  // ReactFlow 초기화 핸들러
  const onInit = useCallback((instance: ReactFlowInstance) => {
    logger.info('ReactFlow 인스턴스 초기화 시작');
    reactFlowInstance.current = instance;

    // 추가: 스토어에 ReactFlow 인스턴스 저장
    setReactFlowInstance(instance);

    logger.info('ReactFlow 인스턴스 초기화 완료', {
      viewport: instance.getViewport(),
      nodes: instance.getNodes().length,
      edges: instance.getEdges().length
    });

    // 노드가 있는 경우 자동으로 뷰에 맞추기
    if (nodes.length > 0) {
      logger.info('노드가 있습니다. 뷰에 맞추기 실행', {
        nodesCount: nodes.length,
        firstNode: nodes[0],
      });

      // 노드 위치가 제대로 렌더링될 시간을 더 충분히 주기 위해 지연 증가
      const fitViewDelay = 500;

      setTimeout(() => {
        if (!reactFlowInstance.current) return;

        try {
          // 더 넓은 패딩으로 노드를 잘 볼 수 있게 함
          reactFlowInstance.current.fitView({
            padding: 0.8, // 패딩 증가
            includeHiddenNodes: false,
            minZoom: 0.5,
            maxZoom: 1.5,
            duration: 500, // 애니메이션 지속 시간 증가
          });
          logger.info('fitView 실행 완료', {
            viewport: reactFlowInstance.current.getViewport()
          });
        } catch (error) {
          logger.error('fitView 실행 중 오류:', error);
        }
      }, fitViewDelay);
    }
  }, [nodes, setReactFlowInstance]);

  // CardNode 삭제를 위한 TanStack Query 훅
  const deleteCardNodeMutation = useDeleteCardNode();

  // CardNode 위치 업데이트를 위한 TanStack Query 훅
  const updateCardNodePositionMutation = useUpdateCardNodePosition();

  // 뷰포트 관리 기능이 추가된 노드 변경 핸들러
  const handleNodeChangesWithViewport = useCallback(
    (changes: NodeChange[]) => {
      // logger.info('handleNodeChangesWithViewport 호출:', {
      //   changesCount: changes.length,
      //   changeTypes: changes.map(c => c.type).join(', ')
      // });

      // 노드 삭제 변경 감지
      const deleteChanges = changes.filter(change => change.type === 'remove');

      if (deleteChanges.length > 0 && activeProjectId) {
        // 삭제된 노드 ID 추출
        const deletedNodeIds = deleteChanges.map(change => change.id);

        logger.info(`노드 삭제 요청: ${deletedNodeIds.length}개`, {
          nodeIds: deletedNodeIds
        });

        // 각 노드에 대해 CardNode 삭제 뮤테이션 호출
        deletedNodeIds.forEach(nodeId => {
          deleteCardNodeMutation.mutate({
            id: nodeId,  // 이제 노드 ID는 CardNode 테이블의 ID
            projectId: activeProjectId
          }, {
            onSuccess: () => logger.info(`CardNode DB 삭제 성공: ${nodeId}`),
            onError: (error) => logger.error(`CardNode DB 삭제 실패: ${nodeId}`, error)
          });
        });
      } else if (deleteChanges.length > 0 && !activeProjectId) {
        logger.warn('프로젝트 ID가 없어 CardNode DB 동기화를 진행할 수 없습니다.');
      }

      const hasPositionChanges = changes.some(
        (change) => change.type === 'position'
      );

      // 드래그 완료된 위치 변경이 있는지 확인 (dragging이 false로 변경된 경우)
      const hasDragCompleted = changes.some(
        (change) => change.type === 'position' && 'dragging' in change && (change as any).dragging === false
      );

      // 위치 변경이 있는 경우 로깅
      if (hasPositionChanges) {
        const positionChanges = changes.filter(c => c.type === 'position');
        logger.info('노드 위치 변경:', {
          count: positionChanges.length,
          changes: positionChanges.map(c => ({
            id: c.id,
            dragging: (c as any).dragging,
            position: (c as any).position
          }))
        });
      }

      // 원래 상태 업데이트 로직 실행 (props로 받은 원래 함수 호출)
      onNodesChange(changes);

      // 드래그가 완료된 경우, 노드 위치를 localStorage에 저장
      if (hasDragCompleted) {
        logger.info('노드 드래그 완료, 위치 저장 시도');
        // 상위 컴포넌트의 saveLayout이 호출되므로 여기서는 추가 작업 필요 없음
      }

      // 위치 변경이 있고 노드가 있는 경우, 300ms 후 뷰포트 확인
      if (hasPositionChanges && nodes.length > 0 && reactFlowInstance.current) {
        // 노드 위치 변경 후 뷰포트에서 벗어난 노드 확인을 위한 딜레이
        setTimeout(() => {
          if (!reactFlowInstance.current) return;

          // 현재 뷰포트 영역 계산
          const { x, y, zoom } = reactFlowInstance.current.getViewport();
          const viewportWidth = window.innerWidth / zoom;
          const viewportHeight = window.innerHeight / zoom;

          // 뷰포트 경계 계산
          const viewportBounds = {
            minX: -x / zoom,
            minY: -y / zoom,
            maxX: (-x + viewportWidth) / zoom,
            maxY: (-y + viewportHeight) / zoom,
          };

          logger.info('현재 뷰포트 경계:', viewportBounds);

          // 노드가 뷰포트를 벗어났는지 확인
          const nodesOutsideViewport = nodes.some(node =>
            node.position.x < viewportBounds.minX ||
            node.position.y < viewportBounds.minY ||
            node.position.x > viewportBounds.maxX ||
            node.position.y > viewportBounds.maxY
          );

          if (nodesOutsideViewport) {
            logger.info('노드가 뷰포트를 벗어남. 뷰에 맞추기 재실행');
            reactFlowInstance.current.fitView({
              padding: 0.3,
              includeHiddenNodes: false,
              minZoom: 0.5,
              maxZoom: 1.5,
            });
          }
          else {
            logger.info('모든 노드가 뷰포트 내에 있음. 조정 필요 없음');
          }
        }, 300);
      }
    },
    [onNodesChange, nodes, activeProjectId, deleteCardNodeMutation]
  );

  // 엣지 삭제를 위한 TanStack Query 훅 (Three-Layer-Standard 준수)
  const deleteEdgeMutation = useDeleteEdge();

  // 다중 엣지 삭제를 위한 TanStack Query 훅 (Three-Layer-Standard 준수)
  const deleteMultipleEdgesMutation = useDeleteMultipleEdges();

  // 엣지 생성을 위한 TanStack Query 훅 (Three-Layer-Standard 준수)
  const createEdgeMutation = useCreateEdge();

  // 엣지 변경 핸들러에 TanStack Query 통합
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    logger.info('엣지 변경 감지:', {
      changesCount: changes.length,
      changes: changes.map(c => ({
        type: c.type,
        // type-safe한 방식으로 id에 접근
        id: 'id' in c ? c.id : '알 수 없음'
      }))
    });

    // 삭제 변경 감지하여 DB에서도 삭제
    const deleteChanges = changes.filter(change => change.type === 'remove');

    if (deleteChanges.length > 0 && activeProjectId) {
      // Task 1: 모든 삭제된 엣지 ID를 하나의 배열로 수집
      const deletedEdgeIds = deleteChanges.map(change => change.id);

      logger.info(`엣지 다중 삭제 요청: ${deletedEdgeIds.length}개`, {
        edgeIds: deletedEdgeIds
      });

      // 여러 엣지를 한 번에 삭제하는 뮤테이션 호출
      if (deletedEdgeIds.length === 1) {
        // 단일 엣지 삭제인 경우 기존 함수 사용
        deleteEdgeMutation.mutate({
          id: deletedEdgeIds[0],
          projectId: activeProjectId
        }, {
          onSuccess: () => logger.info(`엣지 DB 삭제 성공: ${deletedEdgeIds[0]}`),
          onError: (error) => logger.error(`엣지 DB 삭제 실패: ${deletedEdgeIds[0]}`, error)
        });
      } else {
        // 다중 엣지 삭제인 경우 새 함수 사용
        deleteMultipleEdgesMutation.mutate({
          ids: deletedEdgeIds,
          projectId: activeProjectId
        }, {
          onSuccess: () => logger.info(`엣지 다중 DB 삭제 성공: ${deletedEdgeIds.length}개 삭제됨`),
          onError: (error) => logger.error(`엣지 다중 DB 삭제 실패: ${deletedEdgeIds.length}개`, error)
        });
      }
    } else if (deleteChanges.length > 0 && !activeProjectId) {
      logger.warn('프로젝트 ID가 없어 DB 동기화를 진행할 수 없습니다.');
    }

    // Zustand 스토어 상태 업데이트 (UI 상태)
    useIdeaMapStore.getState().applyEdgeChangesAction(changes);
  }, [deleteEdgeMutation, deleteMultipleEdgesMutation, activeProjectId]); // 의존성 추가

  // 연결 핸들러에 로깅 추가 및 TanStack Query 통합
  const handleConnect = useCallback((connection: Connection) => {
    logger.info('연결 생성:', connection);

    // 유효성 검사 (필수 필드 확인)
    if (!connection.source || !connection.target) {
      logger.error('연결 생성 실패: 소스 또는 타겟 노드가 누락되었습니다.', {
        source: connection.source,
        target: connection.target
      });
      toast.error('연결에 필요한 노드 정보가 누락되었습니다.');
      return;
    }

    // UI 상태 업데이트만 수행 (onConnect 콜백을 통해)
    onConnect(connection);

    logger.info('연결 종료:', {
      isValid: true,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle
    });
  }, [onConnect]);

  // 뷰포트 변경 핸들러
  const handleViewportChange = useCallback((viewport: Viewport) => {
    // logger.info('뷰포트 변경:', viewport);
    if (onViewportChange) {
      onViewportChange(viewport);
    }
  }, [onViewportChange]);

  // 노드 드래그 종료 핸들러 - CardNode 위치 업데이트
  const handleNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    logger.info('노드 드래그 종료:', {
      nodeId: node.id,
      position: node.position
    });

    // 프로젝트 ID가 있는 경우에만 노드 위치 업데이트
    // TODO : 프로젝트 ID가 있는 경우 + 노드 좌표가 변경되었을 경우 노드 위치 업데이트
    if (activeProjectId) {
      updateCardNodePositionMutation.mutate(
        {
          id: node.id,
          projectId: activeProjectId,
          position: {
            x: node.position.x,
            y: node.position.y
          }
        },
        {
          onSuccess: () => {
            logger.info(`CardNode 위치 업데이트 성공: ${node.id}`, node.position);
          },
          onError: (error) => {
            logger.error(`CardNode 위치 업데이트 실패: ${node.id}`, error);
            toast.error(`노드 위치 저장에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
          }
        }
      );
    } else {
      logger.warn('프로젝트 ID가 없어 CardNode 위치 업데이트를 진행할 수 없습니다.');
    }
  }, [activeProjectId, updateCardNodePositionMutation]);

  // 설정 로딩 중이면 로딩 표시
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center" data-testid="loading-settings">
        <div className="bg-background/80 p-4 rounded-lg shadow-md">
          아이디어맵 설정 로딩 중...
        </div>
      </div>
    );
  }

  // 설정 로딩 중 에러가 발생했으면 에러 메시지 표시
  if (isError) {
    console.error("IdeaMap 설정 로드 오류:", error);
    return (
      <div className="h-full w-full flex items-center justify-center" data-testid="error-settings">
        <div className="bg-background/80 p-4 rounded-lg shadow-md text-red-500">
          아이디어맵 설정을 불러오는데 실패했습니다. 오류: {error instanceof Error ? error.message : '알 수 없는 오류'}
        </div>
      </div>
    );
  }

  // 데이터 없음 상태 처리 (로딩과 에러가 아닌 경우)
  if (!ideaMapSettings) {
    // userId가 없는 경우인지, API가 빈 객체를 반환한 경우인지 구분
    const reason = !userId
      ? "사용자 ID가 없습니다."
      : "설정 데이터를 사용할 수 없습니다.";

    console.warn("IdeaMap 설정 데이터를 사용할 수 없습니다.", {
      userId,
      projectId: activeProject?.id
    });

    return (
      <div className="h-full w-full flex items-center justify-center" data-testid="no-settings">
        <div className="bg-background/80 p-4 rounded-lg shadow-md text-amber-500">
          아이디어맵 설정 데이터를 사용할 수 없습니다. {reason} (Project ID: {activeProject?.id ?? '없음'})
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      style={{ width: '100%', height: '100%' }}
      className={cn("react-flow-wrapper", className)}
    >
      {markers}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodeChangesWithViewport}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onConnectStart={(event, params) => {
          logger.info('연결 시작:', params);
          onConnectStart(event, params);
        }}
        onConnectEnd={(event, params) => {
          logger.info('연결 종료:', params);
          onConnectEnd(event, params);
        }}
        onNodeClick={(event, node) => {
          logger.info('노드 클릭:', node.id);
          onNodeClick(event, node);
        }}
        onPaneClick={(event) => {
          logger.info('빈 공간 클릭');
          onPaneClick(event);
        }}
        onNodeDragStop={handleNodeDragStop}
        onViewportChange={handleViewportChange}
        onInit={onInit}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        onDragOver={onDragOver}
        onDrop={onDrop}
        proOptions={{ hideAttribution: true }}
      >
        {showControls && (
          <Controls />
        )}

        <Background />
      </ReactFlow>
    </div>
  );
}

export default React.memo(IdeaMapCanvas);

/**
 * mermaid 다이어그램:
 * ```mermaid
 * sequenceDiagram
 *   participant UI as IdeaMapCanvas
 *   participant TQ as useIdeaMapSettings
 *   participant Service as settingsService
 *   participant API as /api/settings
 *   participant DB as 데이터베이스
 *   participant RF as ReactFlow
 * 
 *   UI->>+TQ: useIdeaMapSettings(userId)
 *   TQ->>+Service: fetchSettings(userId)
 *   Service->>+API: GET /api/settings
 *   API->>+DB: 설정 조회
 *   DB-->>-API: 설정 데이터 반환
 *   API-->>-Service: 설정 데이터 응답
 *   Service-->>-TQ: 설정 데이터 반환
 *   TQ-->>-UI: 설정 데이터 반환
 *   UI->>+RF: 설정 적용 및 캔버스 렌더링
 *   RF-->>-UI: 렌더링 완료
 * ```
 */ 