/**
 * 파일명: src/components/ideamap/DagreNodePositioning.tsx
 * 목적: Dagre 레이아웃 알고리즘을 사용하여 노드 위치를 자동으로 계산
 * 역할: Idea Map의 노드 자동 배치 및 레이아웃 적용 컴포넌트
 * 작성일: 2023-04-10
 * 수정일: 2024-05-30 : prefer-const 린트 규칙 적용
 * 수정일: 2025-05-07 : 미사용 변수 제거 (nodesPositioned)
 * 수정일: 2025-04-21 : uiOptions.json 구조 변경에 맞게 참조 경로 수정
 * 수정일: 2025-04-21 : 가독성 개선을 위한 상수 추출
 */

import React, { useEffect } from 'react';

import { useReactFlow, Node, Edge, Position } from '@xyflow/react';
import dagre from 'dagre';

import defaultConfig from '../../config/uiOptions.json';

interface DagreNodePositioningProps {
  Options: { rankdir: 'TB' | 'LR' | 'BT' | 'RL' };
  Edges: Edge[];
  SetEdges: (edges: Edge[]) => void;
  SetNodes: (nodes: Node[]) => void;
  SetViewIsFit: (value: boolean) => void;
}

// 설정 상수 정의 - 가독성 개선
const ideamapSettings = defaultConfig.DEFAULT_SETTINGS.ideamap;

// 기본 CardNode의 크기 - 설정 파일에서 일관되게 가져오기
const nodeWidth = ideamapSettings.cardNode.nodeSize.width || 130;
const nodeHeight = ideamapSettings.cardNode.nodeSize.height || 48;

const DagreNodePositioning: React.FC<DagreNodePositioningProps> = ({ Options, Edges, SetEdges, SetNodes, SetViewIsFit }) => {
  const { fitView, getNodes } = useReactFlow();

  // React Flow 인스턴스에서 노드 직접 가져오기
  const flattenedNodes = getNodes();

  useEffect(() => {
    // 노드가 존재하는지 확인
    if (flattenedNodes.length > 0) {
      const dagreGraph = new dagre.graphlib.Graph();
      dagreGraph.setDefaultEdgeLabel(() => ({}));
      dagreGraph.setGraph(Options);

      // 모든 노드를 dagre 그래프에 등록 (기본값 사용)
      flattenedNodes.forEach((node) => {
        // 실제 측정된 크기가 없으므로 기본값 사용
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
      });

      // 엣지 등록
      Edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
      });

      // 레이아웃 계산
      dagre.layout(dagreGraph);

      // 각 노드의 위치를 업데이트
      const layoutedNodes = flattenedNodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        if (!nodeWithPosition) {
          return node;
        }

        const updatedNode = {
          ...node,
          position: {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2
          },
          data: { ...node.data }
        } as Node;

        // 레이아웃 방향에 따라 핸들 위치 지정
        if (Options.rankdir === 'TB' || Options.rankdir === 'BT') {
          updatedNode.targetPosition = Position.Top;
          updatedNode.sourcePosition = Position.Bottom;
        } else if (Options.rankdir === 'LR' || Options.rankdir === 'RL') {
          updatedNode.targetPosition = Position.Left;
          updatedNode.sourcePosition = Position.Right;
        }
        return updatedNode;
      });

      // 엣지 핸들 업데이트
      const layoutedEdges = Edges.map(edge => {
        const updatedEdge = { ...edge };

        // 방향에 따라 엣지 핸들 위치 설정
        if (Options.rankdir === 'TB' || Options.rankdir === 'BT') {
          updatedEdge.sourceHandle = 'bottom-source'; // 수직 레이아웃에서는 아래쪽이 소스
          updatedEdge.targetHandle = 'top-target';    // 수직 레이아웃에서는 위쪽이 타겟
        } else if (Options.rankdir === 'LR' || Options.rankdir === 'RL') {
          updatedEdge.sourceHandle = 'right-source';  // 수평 레이아웃에서는 오른쪽이 소스
          updatedEdge.targetHandle = 'left-target';   // 수평 레이아웃에서는 왼쪽이 타겟
        }

        return updatedEdge;
      });

      SetNodes(layoutedNodes);
      // 업데이트된 엣지 적용
      SetEdges(layoutedEdges);

      window.requestAnimationFrame(() => {
        fitView();
      });
      SetViewIsFit(true);
    }
  }, [flattenedNodes, Options, Edges, SetEdges, SetNodes, SetViewIsFit, fitView]);

  return null;
};

export default DagreNodePositioning; 