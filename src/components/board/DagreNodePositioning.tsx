import React, { useState, useEffect } from 'react';
import { useStore, useReactFlow, Node, Edge, ReactFlowState } from '@xyflow/react';
import dagre from 'dagre';
import defaultConfig from '../../config/cardBoardUiOptions.json';

interface DagreNodePositioningProps {
  Options: { rankdir: 'TB' | 'LR' | 'BT' | 'RL' };
  Edges: Edge[];
  SetEdges: (edges: Edge[]) => void;
  SetNodes: (nodes: Node[]) => void;
  SetViewIsFit: (value: boolean) => void;
}

// 기본 CardNode의 크기 - 설정 파일에서 가져오기
const nodeWidth = defaultConfig.layout.nodeSize.width;
const nodeHeight = defaultConfig.layout.nodeSize.height;

const DagreNodePositioning: React.FC<DagreNodePositioningProps> = ({ Options, Edges, SetEdges, SetNodes, SetViewIsFit }) => {
  const [nodesPositioned, setNodesPositioned] = useState(false);
  const { fitView } = useReactFlow();
  
  // 제네릭 타입 명시하여 Store 타입 오류 해결
  const store = useStore();
  const nodeInternals = store.getState().nodeInternals;
  const flattenedNodes = Array.from(nodeInternals.values()) as Node[];

  useEffect(() => {
    // 노드 크기가 감지되었는지 확인 (첫 번째 노드에 width 속성이 있을 때 실행)
    if (flattenedNodes.length > 0 && flattenedNodes[0]?.dimensions) {
      const dagreGraph = new dagre.graphlib.Graph();
      dagreGraph.setDefaultEdgeLabel(() => ({}));
      dagreGraph.setGraph(Options);

      // 모든 노드를 dagre 그래프에 등록 (실제 측정된 크기 사용하거나 기본값 사용)
      flattenedNodes.forEach((node) => {
        const width = node.dimensions?.width || nodeWidth;
        const height = node.dimensions?.height || nodeHeight;
        dagreGraph.setNode(node.id, { width, height });
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
        
        let updatedNode = {
          ...node,
          position: {
            x: nodeWithPosition.x - (node.dimensions?.width || nodeWidth) / 2,
            y: nodeWithPosition.y - (node.dimensions?.height || nodeHeight) / 2
          },
          data: { ...node.data }
        } as Node;

        // 레이아웃 방향에 따라 핸들 위치 지정
        if (Options.rankdir === 'TB' || Options.rankdir === 'BT') {
          updatedNode.targetPosition = 'top';
          updatedNode.sourcePosition = 'bottom';
        } else if (Options.rankdir === 'LR' || Options.rankdir === 'RL') {
          updatedNode.targetPosition = 'left';
          updatedNode.sourcePosition = 'right';
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
      
      setNodesPositioned(true);
      window.requestAnimationFrame(() => {
        fitView();
      });
      SetViewIsFit(true);
    }
  }, [flattenedNodes, Options, Edges, SetEdges, SetNodes, SetViewIsFit, fitView]);

  return null;
};

export default DagreNodePositioning; 