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
 * 수정일: 2024-06-28 : 디버깅을 위한 console.log 추가
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
  ReactFlowInstance
} from '@xyflow/react';

import { SafeRef } from '@/components/ideamap/types/ideamap-types';
import { NODE_TYPES, EDGE_TYPES } from '@/lib/flow-constants';
import { IdeaMapSettings } from '@/lib/ideamap-utils';
// 노드 타입과 엣지 타입 컴포넌트 직접 가져오기
// import CardNode from '@/components/ideamap/nodes/CardNode';
// import CustomEdge from '@/components/ideamap/nodes/CustomEdge';
// 노드 타입 직접 가져오기 대신 flow-constants에서 가져오기
import { cn } from '@/lib/utils';
// 삭제 3/29
// import BoardControls from './BoardControls';

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
  ideaMapSettings: IdeaMapSettings;
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
  // 컴포넌트 내부에 노드 및 엣지 타입 직접 정의 -> 제거 
  // const nodeTypes = useMemo(() => ({
  //   card: CardNode,
  //   nodeInspect: NodeInspect,
  //   default: CardNode
  // }), []);

  // const edgeTypes = useMemo(() => ({
  //   custom: CustomEdge,
  //   default: CustomEdge
  // }), []);

  // 로그 변경

  // console.log('[BoardCanvas] 노드 및 엣지 타입 사용:', { nodeTypes, edgeTypes });

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
    console.log('[IdeaMapCanvas] 기본 엣지 옵션 생성:', options);
    return options;
  }, [ideaMapSettings]);

  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // 컴포넌트 마운트/언마운트 로깅
  useEffect(() => {
    console.log('[IdeaMapCanvas] 컴포넌트 마운트, 노드 수:', nodes.length, '엣지 수:', edges.length);
    return () => {
      console.log('[IdeaMapCanvas] 컴포넌트 언마운트');
    };
  }, [nodes.length, edges.length]);

  // 노드와 엣지 변경 시 로깅
  useEffect(() => {
    console.log('[IdeaMapCanvas] 노드 변경 감지:', { nodeCount: nodes.length, firstNode: nodes[0] });
  }, [nodes]);

  useEffect(() => {
    console.log('[IdeaMapCanvas] 엣지 변경 감지:', { edgeCount: edges.length });
  }, [edges]);

  // ReactFlow 초기화 핸들러
  const onInit = useCallback((instance: ReactFlowInstance) => {
    console.log('[IdeaMapCanvas] ReactFlow 인스턴스 초기화 시작');
    reactFlowInstance.current = instance;
    console.log('[IdeaMapCanvas] ReactFlow 인스턴스 초기화 완료', {
      viewport: instance.getViewport(),
      nodes: instance.getNodes().length,
      edges: instance.getEdges().length
    });

    // 노드가 있는 경우 자동으로 뷰에 맞추기
    if (nodes.length > 0) {
      console.log('[IdeaMapCanvas] 노드가 있습니다. 뷰에 맞추기 실행', {
        nodesCount: nodes.length,
        firstNode: nodes[0],
      });
      setTimeout(() => {
        instance.fitView({
          padding: 0.5,
          includeHiddenNodes: false,
          minZoom: 0.5,
          maxZoom: 1.5,
        });
        console.log('[IdeaMapCanvas] fitView 실행 완료', {
          viewport: instance.getViewport()
        });
      }, 300);
    } else {
      console.log('[IdeaMapCanvas] 노드가 없습니다. 기본 뷰포트 설정');
    }
  }, [nodes]);

  // 뷰포트 관리 기능이 추가된 노드 변경 핸들러
  const handleNodeChangesWithViewport = useCallback(
    (changes: NodeChange[]) => {
      console.log('[IdeaMapCanvas] handleNodeChangesWithViewport 호출:', {
        changesCount: changes.length,
        changeTypes: changes.map(c => c.type).join(', ')
      });

      const hasPositionChanges = changes.some(
        (change) => change.type === 'position'
      );

      // 위치 변경이 있는 경우 로깅
      if (hasPositionChanges) {
        const positionChanges = changes.filter(c => c.type === 'position');
        console.log('[IdeaMapCanvas] 노드 위치 변경:', {
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

          console.log('[IdeaMapCanvas] 현재 뷰포트 경계:', viewportBounds);

          // 노드가 뷰포트를 벗어났는지 확인
          const nodesOutsideViewport = nodes.some(node =>
            node.position.x < viewportBounds.minX ||
            node.position.y < viewportBounds.minY ||
            node.position.x > viewportBounds.maxX ||
            node.position.y > viewportBounds.maxY
          );

          if (nodesOutsideViewport) {
            console.log('[IdeaMapCanvas] 노드가 뷰포트를 벗어남. 뷰에 맞추기 재실행');
            reactFlowInstance.current.fitView({
              padding: 0.3,
              includeHiddenNodes: false,
              minZoom: 0.5,
              maxZoom: 1.5,
            });
          } else {
            console.log('[IdeaMapCanvas] 모든 노드가 뷰포트 내에 있음. 조정 필요 없음');
          }
        }, 300);
      }
    },
    [onNodesChange, nodes]
  );

  // 엣지 변경 핸들러에 로깅 추가
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    console.log('[IdeaMapCanvas] 엣지 변경 감지:', {
      changesCount: changes.length,
      changes: changes.map(c => ({
        type: c.type,
        // type-safe한 방식으로 id에 접근
        id: 'id' in c ? c.id : '알 수 없음'
      }))
    });
    onEdgesChange(changes);
  }, [onEdgesChange]);

  // 연결 핸들러에 로깅 추가
  const handleConnect = useCallback((connection: Connection) => {
    console.log('[IdeaMapCanvas] 연결 생성:', connection);
    onConnect(connection);
  }, [onConnect]);

  // 뷰포트 변경 핸들러
  const handleViewportChange = useCallback((viewport: Viewport) => {
    console.log('[IdeaMapCanvas] 뷰포트 변경:', viewport);
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
          console.log('[IdeaMapCanvas] 연결 시작:', params);
          onConnectStart(event, params);
        }}
        onConnectEnd={(event, params) => {
          console.log('[IdeaMapCanvas] 연결 종료:', params);
          onConnectEnd(event, params);
        }}
        onNodeClick={(event, node) => {
          console.log('[IdeaMapCanvas] 노드 클릭:', node.id);
          onNodeClick(event, node);
        }}
        onPaneClick={(event) => {
          console.log('[IdeaMapCanvas] 빈 공간 클릭');
          onPaneClick(event);
        }}
        onViewportChange={handleViewportChange}
        // 노드 타입 버그 수정
        // nodeTypes={nodeTypes}
        // edgeTypes={edgeTypes}
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

            {/* 삭제 3/29 */}
            {/* <BoardControls
              boardSettings={boardSettings}
              onBoardSettingsChange={onBoardSettingsChange}
              onLayoutChange={onLayoutChange}
              onAutoLayout={onAutoLayout}
              onSaveLayout={onSaveLayout}
              onCreateCard={onCreateCard}
              isAuthenticated={isAuthenticated}
              userId={userId}
            /> */}
          </>
        )}
      </ReactFlow>
    </div>
  );
} 