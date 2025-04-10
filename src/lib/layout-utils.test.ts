/**
 * 파일명: layout-utils.test.ts
 * 목적: 레이아웃 유틸리티 함수 테스트
 * 역할: 노드 배치 및 그래프 레이아웃 유틸리티 테스트
 * 작성일: 2025-04-01
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Node, Edge, Position } from '@xyflow/react';
import { getLayoutedElements, getGridLayout } from './layout-utils';

// 실제 dagre 모듈 모킹
vi.mock('dagre', () => {
  const mockGraph = {
    setGraph: vi.fn(),
    setDefaultEdgeLabel: vi.fn(),
    setNode: vi.fn(),
    setEdge: vi.fn(),
    node: vi.fn((id) => {
      // 모킹된 노드 위치 반환
      // id를 기반으로 다른 위치 생성 (테스트에서 같은 노드는 동일 위치, 다른 노드는 다른 위치)
      const idNum = parseInt(id.replace(/\D/g, '')) || 1;
      return {
        x: idNum * 100, 
        y: idNum * 80
      };
    }),
  };

  return {
    default: {
      graphlib: {
        Graph: vi.fn(() => mockGraph),
      },
      layout: vi.fn((graph) => graph),
    }
  };
});

// ThemeContext 모킹
vi.mock('../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      node: {
        width: 150,
        height: 60,
      },
      layout: {
        spacing: {
          horizontal: 40,
          vertical: 30,
        },
        padding: 25,
      }
    }
  })
}));

describe('@testcase.mdc 레이아웃 유틸리티 테스트', () => {
  describe('getLayoutedElements 함수', () => {
    it('수평 방향으로 노드와 엣지를 배치해야 함', () => {
      // 테스트 데이터
      const nodes: Node[] = [
        { id: 'node-1', position: { x: 0, y: 0 }, data: { label: '노드 1' } },
        { id: 'node-2', position: { x: 0, y: 0 }, data: { label: '노드 2' } },
      ];
      
      const edges: Edge[] = [
        { id: 'edge-1-2', source: 'node-1', target: 'node-2' },
      ];
      
      // 함수 실행
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, 'horizontal');
      
      // 노드 위치 및 핸들 확인
      expect(layoutedNodes).toHaveLength(2);
      expect(layoutedNodes[0].position.x).toBeDefined();
      expect(layoutedNodes[0].position.y).toBeDefined();
      expect(layoutedNodes[0].targetPosition).toBe(Position.Left);
      expect(layoutedNodes[0].sourcePosition).toBe(Position.Right);
      
      // node-1과 node-2가 다른 위치에 배치되었는지 확인
      expect(layoutedNodes[0].position).not.toEqual(layoutedNodes[1].position);
      
      // 엣지 핸들 확인
      expect(layoutedEdges).toHaveLength(1);
      expect(layoutedEdges[0].sourceHandle).toBe('right-source');
      expect(layoutedEdges[0].targetHandle).toBe('left-target');
    });
    
    it('수직 방향으로 노드와 엣지를 배치해야 함', () => {
      // 테스트 데이터
      const nodes: Node[] = [
        { id: 'node-1', position: { x: 0, y: 0 }, data: { label: '노드 1' } },
        { id: 'node-2', position: { x: 0, y: 0 }, data: { label: '노드 2' } },
      ];
      
      const edges: Edge[] = [
        { id: 'edge-1-2', source: 'node-1', target: 'node-2' },
      ];
      
      // 함수 실행
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, 'vertical');
      
      // 노드 위치 및 핸들 확인
      expect(layoutedNodes).toHaveLength(2);
      expect(layoutedNodes[0].targetPosition).toBe(Position.Top);
      expect(layoutedNodes[0].sourcePosition).toBe(Position.Bottom);
      
      // 엣지 핸들 확인
      expect(layoutedEdges).toHaveLength(1);
      expect(layoutedEdges[0].sourceHandle).toBe('bottom-source');
      expect(layoutedEdges[0].targetHandle).toBe('top-target');
    });
    
    it('노드가 없을 경우 원본 데이터를 반환해야 함', () => {
      const emptyNodes: Node[] = [];
      const edges: Edge[] = [];
      
      const result = getLayoutedElements(emptyNodes, edges);
      
      expect(result.nodes).toBe(emptyNodes);
      expect(result.edges).toBe(edges);
    });
  });
  
  describe('getGridLayout 함수', () => {
    it('노드를 그리드 형태로 배치해야 함', () => {
      // 테스트 데이터
      const nodes: Node[] = [
        { id: 'node-1', position: { x: 0, y: 0 }, data: { label: '노드 1' } },
        { id: 'node-2', position: { x: 0, y: 0 }, data: { label: '노드 2' } },
        { id: 'node-3', position: { x: 0, y: 0 }, data: { label: '노드 3' } },
        { id: 'node-4', position: { x: 0, y: 0 }, data: { label: '노드 4' } },
      ];
      
      const cardsPerRow = 2; // 한 행에 2개씩 배치
      
      // 함수 실행
      const layoutedNodes = getGridLayout(nodes, cardsPerRow);
      
      // 노드 수 확인
      expect(layoutedNodes).toHaveLength(4);
      
      // 모든 노드가 동일한 handle 위치를 가져야 함
      layoutedNodes.forEach(node => {
        expect(node.targetPosition).toBe(Position.Top);
        expect(node.sourcePosition).toBe(Position.Bottom);
      });
      
      // 첫 번째 행의 노드들 (node-1, node-2)
      expect(layoutedNodes[0].position.y).toBe(layoutedNodes[1].position.y);
      expect(layoutedNodes[0].position.x).toBeLessThan(layoutedNodes[1].position.x);
      
      // 두 번째 행의 노드들 (node-3, node-4)
      expect(layoutedNodes[2].position.y).toBe(layoutedNodes[3].position.y);
      expect(layoutedNodes[2].position.x).toBeLessThan(layoutedNodes[3].position.x);
      
      // 첫 번째 행과 두 번째 행의 y 위치가 다름
      expect(layoutedNodes[0].position.y).toBeLessThan(layoutedNodes[2].position.y);
    });
    
    it('기본값(cardsPerRow=3)으로 그리드를 생성해야 함', () => {
      // 테스트 데이터
      const nodes: Node[] = [
        { id: 'node-1', position: { x: 0, y: 0 }, data: { label: '노드 1' } },
        { id: 'node-2', position: { x: 0, y: 0 }, data: { label: '노드 2' } },
        { id: 'node-3', position: { x: 0, y: 0 }, data: { label: '노드 3' } },
      ];
      
      // cardsPerRow 생략
      const layoutedNodes = getGridLayout(nodes);
      
      // 모든 노드가 같은 행에 있어야 함 (3개 이하이므로)
      const firstRowY = layoutedNodes[0].position.y;
      layoutedNodes.forEach(node => {
        expect(node.position.y).toBe(firstRowY);
      });
      
      // x 좌표가 순차적으로 증가해야 함
      expect(layoutedNodes[0].position.x).toBeLessThan(layoutedNodes[1].position.x);
      expect(layoutedNodes[1].position.x).toBeLessThan(layoutedNodes[2].position.x);
    });
    
    it('노드가 없을 경우 빈 배열을 반환해야 함', () => {
      const emptyNodes: Node[] = [];
      
      const result = getGridLayout(emptyNodes);
      
      expect(result).toEqual([]);
    });
  });
}); 