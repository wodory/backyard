/**
 * 파일명: src/types/edge.ts
 * 목적: 엣지 관련 타입 정의 (API 및 DB 상호작용용)
 * 역할: 엣지 데이터의 타입 안전성 보장을 위한 인터페이스 제공
 * 작성일: 2024-07-01
 */

// DB에 저장되는 엣지 데이터 타입
export interface Edge {
  id: string;          // 기본 키
  source: string;      // 시작 노드 ID (카드 ID)
  target: string;      // 도착 노드 ID (카드 ID)
  sourceHandle?: string; // 시작 노드의 연결점 (선택사항)
  targetHandle?: string; // 도착 노드의 연결점 (선택사항)
  type: string;        // 엣지 타입 ('default', 'straight', 'bezier', 'step' 등)
  animated: boolean;   // 애니메이션 여부
  style?: any;         // 스타일 속성 (JSON 형태로 저장)
  data?: any;          // 추가 데이터 (관계 타입 등, JSON 형태로 저장)
  userId: string;      // 소유자 ID (인증)
  createdAt: string;   // 생성 시간
  updatedAt: string;   // 업데이트 시간
}

// API 요청용 (생성/수정)
export interface EdgeInput {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  style?: any;
  data?: any;
}

// API 응답용 (부분 업데이트)
export interface EdgePatch {
  id: string;
  source?: string;
  target?: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  style?: any;
  data?: any;
}

// ReactFlow 표현용 (프론트엔드 전용)
export interface ReactFlowEdge extends Omit<Edge, 'userId' | 'createdAt' | 'updatedAt'> {
  markerEnd?: string;
  selected?: boolean;
}

// EdgeInput → Edge 변환
export function toEdge(input: EdgeInput, userId: string): Omit<Edge, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    source: input.source,
    target: input.target,
    sourceHandle: input.sourceHandle,
    targetHandle: input.targetHandle,
    type: input.type || 'default',
    animated: input.animated || false,
    style: input.style || {},
    data: input.data || {},
    userId
  };
}

// Edge → ReactFlowEdge 변환
export function toReactFlowEdge(edge: Edge): ReactFlowEdge {
  const { userId, createdAt, updatedAt, ...baseEdge } = edge;
  return {
    ...baseEdge,
    // ReactFlow 특화 속성 추가
    markerEnd: edge.data?.markerEnd || 'arrow',
    selected: false
  };
} 