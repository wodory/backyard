/**
 * 파일명: layout-utils.ts
 * 목적: React Flow 노드 레이아웃 자동화
 * 역할: 그래프 레이아웃 계산 및 노드 배치 유틸리티 함수 제공
 * 작성일: 2025-03-06
 * 수정일: 2025-03-27
 * 수정일: 2025-04-21 : ThemeContext 대신 useAppStore(themeSlice) 사용으로 변경
 * 수정일: 2025-04-21 : uiOptions.json 구조 변경에 맞게 참조 경로 수정
 */

import { Node, Edge, Position } from '@xyflow/react';
import dagre from 'dagre';

import defaultSeetingJson from '../config/uiOptions.json';
import { useAppStore } from '@/store/useAppStore';

const ideamapSettings = defaultSeetingJson.DEFAULT_SETTINGS.ideamap;
// 기본 노드 크기 설정 (ThemeContext가 없을 때 폴백용)
const DEFAULT_NODE_WIDTH = ideamapSettings.cardNode.nodeSize.width || 130;
const DEFAULT_NODE_HEIGHT = ideamapSettings.cardNode.nodeSize.height || 48;

// 그래프 간격 설정 - 설정 파일에서 가져오기
const GRAPH_SETTINGS = {
  rankdir: 'LR', // 방향: LR(수평) 또는 TB(수직)
  nodesep: ideamapSettings.graphSettings.nodesep, // 같은 레벨의 노드 간 거리 (픽셀)
  ranksep: ideamapSettings.graphSettings.ranksep, // 레벨 간 거리 (픽셀)
  edgesep: ideamapSettings.graphSettings.edgesep, // 엣지 간 거리
  marginx: ideamapSettings.layout.defaultPadding || 20, // 가로 마진은 defaultPadding 사용
  marginy: ideamapSettings.layout.defaultPadding || 20  // 세로 마진은 defaultPadding 사용
};

/**
 * React 컴포넌트에서 사용할 수 있는 레이아웃 훅
 * useAppStore에서 노드 크기를 가져와 레이아웃을 계산합니다.
 */
export function useLayoutedElements() {
  // useAppStore에서 ideaMapSettings 가져오기
  const ideaMapSettings = useAppStore(state => state.ideaMapSettings);
  
  /**
   * dagre 라이브러리를 사용하여 노드와 엣지의 레이아웃을 재배치하는 함수
   * 
   * @param nodes 노드 배열
   * @param edges 엣지 배열
   * @param direction 배치 방향 ('horizontal' 또는 'vertical')
   * @returns 레이아웃이 적용된 노드와 엣지
   */
  const getLayoutedElements = (
    nodes: Node[],
    edges: Edge[],
    direction: 'horizontal' | 'vertical' = 'horizontal'
  ) => {
    // 노드나 엣지가 없는 경우 그대로 반환
    if (nodes.length === 0) return { nodes, edges };

    // useAppStore에서 노드 크기 가져오기
    const NODE_WIDTH = ideaMapSettings.nodeWidth || DEFAULT_NODE_WIDTH;
    const NODE_HEIGHT = ideaMapSettings.nodeSpacing || DEFAULT_NODE_HEIGHT;

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
  };

  /**
   * 격자형 레이아웃으로 노드를 배치하는 함수
   * 
   * @param nodes 노드 배열
   * @param cardsPerRow 한 행에 표시할 카드 수
   * @returns 배치된 노드 배열
   */
  const getGridLayout = (nodes: Node[], cardsPerRow: number = 3) => {
    // useAppStore에서 간격 값 가져오기
    const NODE_WIDTH = ideaMapSettings.nodeWidth || DEFAULT_NODE_WIDTH;
    const NODE_HEIGHT = ideaMapSettings.nodeSpacing || DEFAULT_NODE_HEIGHT;
    const horizontalSpacing = 30; // 기본 간격 값
    const verticalSpacing = 30;   // 기본 간격 값
    
    // 간격 계산
    const HORIZONTAL_GAP = NODE_WIDTH + horizontalSpacing;
    const VERTICAL_GAP = NODE_HEIGHT + verticalSpacing * 3;
    
    // 기본 마진 값
    const baseMargin = 20;
    
    return nodes.map((node, index) => ({
      ...node,
      // 모든 노드에 일관된 handle 위치 설정
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: (index % cardsPerRow) * HORIZONTAL_GAP + baseMargin,
        y: Math.floor(index / cardsPerRow) * VERTICAL_GAP + baseMargin,
      }
    }));
  };

  return {
    getLayoutedElements,
    getGridLayout,
  };
}

/**
 * 앱 스토어 없이 사용 가능한 레이아웃 함수들
 * (기존 코드 호환성을 위해 유지)
 */

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
    dagreGraph.setNode(node.id, { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT });
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
        x: nodeWithPosition.x - DEFAULT_NODE_WIDTH / 2,
        y: nodeWithPosition.y - DEFAULT_NODE_HEIGHT / 2,
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
  // 설정 파일에서 간격 값 가져오기
  const horizontalSpacing = ideamapSettings.layout.defaultSpacing.horizontal || 30;
  const verticalSpacing = ideamapSettings.layout.defaultSpacing.vertical || 30;
  
  // 간격 계산 - 상수 값 대신 설정 파일의 값을 기반으로 계산
  const HORIZONTAL_GAP = DEFAULT_NODE_WIDTH + horizontalSpacing;
  const VERTICAL_GAP = DEFAULT_NODE_HEIGHT + verticalSpacing * 3;
  
  // 기본 마진 값
  const baseMargin = ideamapSettings.layout.defaultPadding || 20;
  
  return nodes.map((node, index) => ({
    ...node,
    // 모든 노드에 일관된 handle 위치 설정
    targetPosition: Position.Top,
    sourcePosition: Position.Bottom,
    position: {
      x: (index % cardsPerRow) * HORIZONTAL_GAP + baseMargin,
      y: Math.floor(index / cardsPerRow) * VERTICAL_GAP + baseMargin,
    }
  }));
} 