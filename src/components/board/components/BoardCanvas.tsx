/**
 * 파일명: BoardCanvas.tsx
 * 목적: ReactFlow 캔버스 렌더링 컴포넌트
 * 역할: Board 컴포넌트에서 ReactFlow 캔버스 관련 로직을 분리하여 렌더링을 담당
 * 작성일: 2025-03-28
 * 수정일: 2025-03-30
 */

'use client';

import React, { useMemo } from 'react';
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
  OnConnectStartParams,
  OnConnectStart,
  OnConnectEnd,
  MarkerType,
  Viewport
} from '@xyflow/react';
import { BoardSettings } from '@/lib/board-utils';
// 노드 타입과 엣지 타입 컴포넌트 직접 가져오기
// import CardNode from '@/components/board/nodes/CardNode';
// import CustomEdge from '@/components/board/nodes/CustomEdge';
// 노드 타입 직접 가져오기 대신 flow-constants에서 가져오기
import { NODE_TYPES, EDGE_TYPES } from '@/lib/flow-constants';
import NodeInspect from '@/components/board/nodes/NodeInspect';
import { cn } from '@/lib/utils';
// 삭제 3/29
// import BoardControls from './BoardControls';

interface BoardCanvasProps {
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
  /** 레이아웃 방향 */
  layoutDirection: 'horizontal' | 'vertical';
  /** 보드 설정 */
  boardSettings: BoardSettings;
  /** 보드 설정 변경 핸들러 */
  onBoardSettingsChange: (settings: BoardSettings, isAuthenticated: boolean, userId?: string) => void;
  /** 레이아웃 변경 핸들러 */
  onLayoutChange: (direction: 'horizontal' | 'vertical') => void;
  /** 자동 레이아웃 적용 핸들러 */
  onAutoLayout: () => void;
  /** 레이아웃 저장 핸들러 */
  onSaveLayout: () => void;
  /** 카드 생성 버튼 클릭 핸들러 */
  onCreateCard: () => void;
  /** 컨트롤 표시 여부 */
  showControls?: boolean;
  /** 래퍼 ref */
  wrapperRef: React.RefObject<HTMLDivElement>;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 사용자 인증 여부 */
  isAuthenticated: boolean;
  /** 사용자 ID */
  userId?: string;
  /** 드래그 오버 핸들러 (옵셔널) */
  onDragOver?: (event: React.DragEvent) => void;
  /** 드롭 핸들러 (옵셔널) */
  onDrop?: (event: React.DragEvent) => void;
  /** 뷰포트 변경 핸들러 (옵셔널) */
  onViewportChange?: (viewport: Viewport) => void;
}

/**
 * BoardCanvas: ReactFlow 캔버스 렌더링 컴포넌트
 * ReactFlow와 관련된 UI 렌더링을 담당하며, 실제 로직은 상위 컴포넌트(Board)에서 처리
 */
export default function BoardCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onConnectStart,
  onConnectEnd,
  onNodeClick,
  onPaneClick,
  layoutDirection,
  boardSettings,
  onBoardSettingsChange,
  onLayoutChange,
  onAutoLayout,
  onSaveLayout,
  onCreateCard,
  showControls = true,
  wrapperRef,
  className = "",
  isAuthenticated,
  userId,
  onDragOver,
  onDrop,
  onViewportChange
}: BoardCanvasProps) {
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
  const defaultEdgeOptions = useMemo(() => ({
    type: 'custom',
    animated: boardSettings.animated,
    style: {
      strokeWidth: boardSettings.strokeWidth,
      stroke: boardSettings.edgeColor
    },
    markerEnd: boardSettings.markerEnd ? {
      type: MarkerType.ArrowClosed,
      width: boardSettings.markerSize,
      height: boardSettings.markerSize,
    } : undefined
  }), [boardSettings]);

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
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onViewportChange={onViewportChange}
        // 노드 타입 버그 수정
        // nodeTypes={nodeTypes}
        // edgeTypes={edgeTypes}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        connectionMode={ConnectionMode.Loose}
        connectionLineType={boardSettings.connectionLineType as any}
        snapToGrid={boardSettings.snapToGrid}
        snapGrid={boardSettings.snapGrid}
        fitView
        attributionPosition="bottom-right"
        defaultEdgeOptions={defaultEdgeOptions}
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