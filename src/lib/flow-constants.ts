/**
 * 파일명: flow-constants.ts
 * 목적: React Flow 관련 상수 정의
 * 역할: 싱글톤 패턴으로 구현하여 항상 동일한 객체 참조를 유지함
 * 작성일: 2024-05-31
 */

import CardNode from '@/components/board/nodes/CardNode';
import CustomEdge from '@/components/board/nodes/CustomEdge';
import NodeInspect from '@/components/board/nodes/NodeInspect';

// 1. 먼저 타입 키 상수를 정의 (문자열만 포함)
// 노드 타입 키 정의 - 문자열 상수로 분리
export const NODE_TYPES_KEYS = Object.freeze({
  card: 'card',
  nodeInspect: 'nodeInspect',
  default: 'default'
});

// 엣지 타입 키 정의
export const EDGE_TYPES_KEYS = Object.freeze({
  custom: 'custom',
  default: 'default'
});

// 2. 그 다음 컴포넌트 정의 검증
// 컴포넌트 유효성 확인
const isValidComponent = (component: any): boolean => {
  return typeof component === 'function';
};

// 디버깅 로그 - 컴포넌트 검증
console.log('[flow-constants] 컴포넌트 유효성 검증:', {
  cardNode: isValidComponent(CardNode) ? 'OK' : 'ERROR',
  customEdge: isValidComponent(CustomEdge) ? 'OK' : 'ERROR',
  nodeInspect: isValidComponent(NodeInspect) ? 'OK' : 'ERROR'
});

// 3. 타입 키와 컴포넌트 연결
// 노드 타입 정의 - 객체 프리징하여 변경 불가능하게 함
export const NODE_TYPES = Object.freeze({
  [NODE_TYPES_KEYS.card]: CardNode,
  [NODE_TYPES_KEYS.nodeInspect]: NodeInspect,
  // React Flow 기본 타입에도 매핑
  [NODE_TYPES_KEYS.default]: CardNode
});

// 엣지 타입 정의 - 객체 프리징하여 변경 불가능하게 함
export const EDGE_TYPES = Object.freeze({
  [EDGE_TYPES_KEYS.custom]: CustomEdge,
  // React Flow는 'default' 타입을 찾지 못하면 fallback으로 사용합니다.
  // 명시적으로 'default' 타입도 등록합니다.
  [EDGE_TYPES_KEYS.default]: CustomEdge
});

// 4. 최종 로그 출력
// 디버깅 로그 추가
console.log('[flow-constants] 노드 및 엣지 타입 등록 완료:', {
  NODE_TYPES_KEYS: Object.keys(NODE_TYPES_KEYS),
  EDGE_TYPES_KEYS: Object.keys(EDGE_TYPES_KEYS),
  NODE_TYPES: Object.keys(NODE_TYPES),
  EDGE_TYPES: Object.keys(EDGE_TYPES)
});

// 타입 검증 - 디버깅용
if (!NODE_TYPES || !NODE_TYPES[NODE_TYPES_KEYS.card]) {
  console.error('[flow-constants] NODE_TYPES가 제대로 정의되지 않았습니다!');
}

if (!EDGE_TYPES || !EDGE_TYPES[EDGE_TYPES_KEYS.custom]) {
  console.error('[flow-constants] EDGE_TYPES가 제대로 정의되지 않았습니다!');
} 