/**
 * 파일명: flow-constants.ts
 * 목적: React Flow 관련 상수 정의
 * 역할: 싱글톤 패턴으로 구현하여 항상 동일한 객체 참조를 유지함
 * 작성일: 2024-05-31
 */

import CardNode from '@/components/board/nodes/CardNode';
import CustomEdge from '@/components/board/nodes/CustomEdge';
import NodeInspect from '@/components/board/nodes/NodeInspect';

// 디버깅 로그 추가
console.log('[flow-constants] 노드 및 엣지 타입 등록 상태 확인:', {
  cardNode: typeof CardNode === 'function' ? 'OK' : 'ERROR',
  customEdge: typeof CustomEdge === 'function' ? 'OK' : 'ERROR',
  nodeInspect: typeof NodeInspect === 'function' ? 'OK' : 'ERROR'
});

// 노드 타입 정의 - 객체 프리징하여 변경 불가능하게 함
export const NODE_TYPES = Object.freeze({
  card: CardNode,
  nodeInspect: NodeInspect,
  // React Flow 기본 타입에도 매핑
  default: CardNode
});

// 엣지 타입 정의 - 객체 프리징하여 변경 불가능하게 함
export const EDGE_TYPES = Object.freeze({
  custom: CustomEdge,
  // React Flow는 'default' 타입을 찾지 못하면 fallback으로 사용합니다.
  // 명시적으로 'default' 타입도 등록합니다.
  default: CustomEdge
});

// 디버깅 로그 추가
console.log('[flow-constants] 노드 및 엣지 타입 등록 완료:', {
  NODE_TYPES: NODE_TYPES ? 'DEFINED' : 'UNDEFINED',
  EDGE_TYPES: EDGE_TYPES ? 'DEFINED' : 'UNDEFINED',
});

// 타입 검증 - 디버깅용
if (!NODE_TYPES || !NODE_TYPES.card) {
  console.error('[flow-constants] NODE_TYPES가 제대로 정의되지 않았습니다!');
}

if (!EDGE_TYPES || !EDGE_TYPES.custom) {
  console.error('[flow-constants] EDGE_TYPES가 제대로 정의되지 않았습니다!');
} 