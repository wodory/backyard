/**
 * React Flow 관련 상수 정의
 * 싱글톤 패턴으로 구현하여 항상 동일한 객체 참조를 유지함
 */

import CardNode from '@/components/board/CardNode';
import CustomEdge from '@/components/board/CustomEdge';
import { NodeInspect } from '@/components/debug/NodeInspector';

// 노드 타입 정의 - 객체 프리징하여 변경 불가능하게 함
export const NODE_TYPES = Object.freeze({
  card: CardNode,
  nodeInspect: NodeInspect,
});

// 엣지 타입 정의 - 객체 프리징하여 변경 불가능하게 함
export const EDGE_TYPES = Object.freeze({
  custom: CustomEdge,
}); 