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
 * 수정일: 2024-05-30 : fitView 옵션을 개선하여 노드가 항상 보이도록 수정
 * 수정일: 2024-06-27 : fitView 옵션 개선 및 defaultViewport 설정 강화
 * 수정일: 2024-06-27 : 뷰포트 관리 로직 추가 및 자동 fitView 기능 개선
 * 수정일: 2024-06-28 : 디버깅을 위한 logger.info 추가
 * 수정일: 2024-07-18 : 엣지 관련 디버깅 로그 활성화 및 데이터 확인 로직 추가
 * 수정일: 2025-04-21 : handleEdgesChange 함수를 수정하여 오직 applyEdgeChangesAction만 호출하도록 단순화
 * 수정일: 2025-04-29 : 무한 루프 방지를 위한 handleEdgesChange 최적화
 * 수정일: 2025-05-01 : TanStack Query 훅을 사용한 엣지 CRUD 연동
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
import { useAppStore } from '@/store/useAppStore';
import { useCreateEdge, useDeleteEdge } from '@/hooks/useEdges'; // TanStack Query 훅 임포트
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
  /** 아이디어맵 설정 */
  ideaMapSettings: Settings;
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
export default function IdeaMapCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onConnectStart,
  onConnectEnd,
  onNodeClick,
  onPaneClick,
  ideaMapSettings,
  showControls = true,
  wrapperRef,
  className = "",
  onDragOver,
  onDrop,
  onViewportChange
}: IdeaMapCanvasProps) {

  // 엣지 데이터 확인을 위한 로그 추가
  useEffect(() => {
    logger.info('엣지 데이터 확인:', {
      edgeCount: edges.length,
      edges: edges
    });
  }, [edges]);

  // 기본 엣지 옵션 메모이제이션
  const defaultEdgeOptions = useMemo(() => {
    const options = {
      type: 'custom',
      animated: ideaMapSettings.animated,
      style: {
        strokeWidth: ideaMapSettings.strokeWidth,
        stroke: ideaMapSettings.edgeColor
      },
      markerEnd: ideaMapSettings.markerEnd ? {
        type: MarkerType.ArrowClosed,
        width: ideaMapSettings.markerSize,
        height: ideaMapSettings.markerSize,
      } : undefined
    };
    logger.info('기본 엣지 옵션 생성:', options);
    return options;
  }, [ideaMapSettings]);

  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

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

        // 추가 지연 후 노드가 뷰포트에 모두 포함되었는지 확인
        setTimeout(() => {
          if (!reactFlowInstance.current) return;

          const currentViewport = reactFlowInstance.current.getViewport();
          logger.info('최종 뷰포트 확인:', currentViewport);
        }, 600);
      }, fitViewDelay);
    }
    else {
      logger.info('노드가 없습니다. 기본 뷰포트 설정');
    }
  }, [nodes]);

  // 뷰포트 관리 기능이 추가된 노드 변경 핸들러
  const handleNodeChangesWithViewport = useCallback(
    (changes: NodeChange[]) => {
      // logger.info('handleNodeChangesWithViewport 호출:', {
      //   changesCount: changes.length,
      //   changeTypes: changes.map(c => c.type).join(', ')
      // });

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
    [onNodesChange, nodes]
  );

  // 엣지 삭제를 위한 TanStack Query 훅 (Three-Layer-Standard 준수)
  const deleteEdgeMutation = useDeleteEdge();

  // 엣지 생성을 위한 TanStack Query 훅 (Three-Layer-Standard 준수)
  const createEdgeMutation = useCreateEdge();

  // 활성 프로젝트 ID 가져오기
  const activeProjectId = useAppStore(state => state.activeProjectId);

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
      // 삭제된 각 엣지에 대해 DB 삭제 처리
      deleteChanges.forEach(change => {
        const edgeId = change.id;
        logger.info(`엣지 DB 삭제 요청: ${edgeId}`);

        // mutate 호출하여 DB에서 삭제
        deleteEdgeMutation.mutate({
          id: edgeId,
          projectId: activeProjectId
        }, {
          onSuccess: () => logger.info(`엣지 DB 삭제 성공: ${edgeId}`),
          onError: (error) => logger.error(`엣지 DB 삭제 실패: ${edgeId}`, error)
        });
      });
    } else if (deleteChanges.length > 0 && !activeProjectId) {
      logger.warn('프로젝트 ID가 없어 DB 동기화를 진행할 수 없습니다.');
    }

    // Zustand 스토어 상태 업데이트 (UI 상태)
    useIdeaMapStore.getState().applyEdgeChangesAction(changes);
  }, [deleteEdgeMutation, activeProjectId]); // 의존성 추가

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

  return (
    <div
      className={cn("h-full w-full flex flex-col relative", className)}
      ref={wrapperRef}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
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
        onViewportChange={handleViewportChange}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        connectionMode={ConnectionMode.Loose}
        connectionLineType={ideaMapSettings.connectionLineType as ConnectionLineType}
        snapToGrid={ideaMapSettings.snapToGrid}
        snapGrid={ideaMapSettings.snapGrid}
        fitView={nodes.length > 0}
        fitViewOptions={{
          padding: 0.3,
          includeHiddenNodes: false,
          minZoom: 0.5,
          maxZoom: 1.5
        }}
        minZoom={0.1}
        maxZoom={2.5}
        defaultViewport={{
          x: 0,
          y: 0,
          zoom: 1
        }}
        attributionPosition="bottom-right"
        defaultEdgeOptions={defaultEdgeOptions}
        onInit={onInit}
      >
        {showControls && (
          <>
            <Background />
            <Controls />
          </>
        )}
      </ReactFlow>
    </div>
  );
} 