import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';

// 노드 크기 설정 - 실제 렌더링 크기에 맞게 조정
const NODE_WIDTH = 320;
const NODE_HEIGHT = 180;

// 그래프 간격 설정
const GRAPH_SETTINGS = {
  rankdir: 'LR', // 방향: LR(수평) 또는 TB(수직)
  nodesep: 100, // 같은 레벨의 노드 간 거리 (픽셀)
  ranksep: 150, // 레벨 간 거리 (픽셀)
  edgesep: 50, // 엣지 간 거리
};

/**
 * dagre 라이브러리를 사용하여 노드와 엣지의 레이아웃을 재배치하는 함수
 * 
 * @param nodes 노드 배열
 * @param edges 엣지 배열
 * @param direction 배치 방향 ('horizontal' 또는 'vertical')
 * @returns 레이아웃이 적용된 노드와 엣지
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'horizontal' | 'vertical' = 'horizontal'
) {
  // 노드나 엣지가 없는 경우 그대로 반환
  if (nodes.length === 0) return { nodes, edges };

  // 그래프 생성
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // 방향 설정 (LR: 왼쪽에서 오른쪽, TB: 위에서 아래)
  const isHorizontal = direction === 'horizontal';
  const settings = {
    ...GRAPH_SETTINGS,
    rankdir: isHorizontal ? 'LR' : 'TB',
  };
  
  dagreGraph.setGraph(settings);

  // 노드 추가
  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // 엣지 추가
  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // 레이아웃 계산
  dagre.layout(dagreGraph);

  // 계산된 위치로 노드 업데이트
  const layoutedNodes = nodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // 방향에 따라 handle 위치 조정
    return {
      ...node,
      // handle 위치: 수평 레이아웃이면 좌우, 수직 레이아웃이면 상하
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  // 엣지 핸들 위치 업데이트
  const layoutedEdges = edges.map(edge => {
    // 원래의 엣지 속성을 유지하면서 레이아웃 방향에 따라 핸들 위치 업데이트
    const updatedEdge = { ...edge };
    
    // 방향에 따라 소스/타겟 핸들 업데이트
    if (isHorizontal) {
      updatedEdge.sourceHandle = 'right-source';  // 수평 레이아웃에서는 오른쪽이 소스
      updatedEdge.targetHandle = 'left-target';   // 수평 레이아웃에서는 왼쪽이 타겟
    } else {
      updatedEdge.sourceHandle = 'bottom-source'; // 수직 레이아웃에서는 아래쪽이 소스
      updatedEdge.targetHandle = 'top-target';    // 수직 레이아웃에서는 위쪽이 타겟
    }
    
    return updatedEdge;
  });

  return { 
    nodes: layoutedNodes, 
    edges: layoutedEdges 
  };
}

/**
 * 격자형 레이아웃으로 노드를 배치하는 함수
 * 
 * @param nodes 노드 배열
 * @param cardsPerRow 한 행에 표시할 카드 수
 * @returns 배치된 노드 배열
 */
export function getGridLayout(nodes: Node[], cardsPerRow: number = 3) {
  const HORIZONTAL_GAP = 400;  // 좀 더 넓게 조정
  const VERTICAL_GAP = 250;
  
  return nodes.map((node, index) => ({
    ...node,
    // 모든 노드에 일관된 handle 위치 설정
    targetPosition: Position.Top,
    sourcePosition: Position.Bottom,
    position: {
      x: (index % cardsPerRow) * HORIZONTAL_GAP + 50,
      y: Math.floor(index / cardsPerRow) * VERTICAL_GAP + 50,
    }
  }));
} 