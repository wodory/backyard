import dagre from 'dagre';
import { Node, Edge } from 'reactflow';

// 노드 크기 설정
const NODE_WIDTH = 300;
const NODE_HEIGHT = 150;

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
  dagreGraph.setGraph({ rankdir: isHorizontal ? 'LR' : 'TB' });

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

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * 격자형 레이아웃으로 노드를 배치하는 함수
 * 
 * @param nodes 노드 배열
 * @param cardsPerRow 한 행에 표시할 카드 수
 * @returns 배치된 노드 배열
 */
export function getGridLayout(nodes: Node[], cardsPerRow: number = 3) {
  const HORIZONTAL_GAP = 350;
  const VERTICAL_GAP = 250;
  
  return nodes.map((node, index) => {
    return {
      ...node,
      position: {
        x: (index % cardsPerRow) * HORIZONTAL_GAP + 50,
        y: Math.floor(index / cardsPerRow) * VERTICAL_GAP + 50,
      }
    };
  });
} 