/**
 * 파일명: src/types/edge.ts
 * 목적: 엣지 데이터 관련 타입 정의
 * 역할: API 및 프론트엔드에서 사용하는 엣지 관련 타입 제공
 * 작성일: 2025-04-21
 */

/**
 * API 응답 또는 DB와 직접 상호작용하는 엣지 데이터 구조
 */
export interface Edge {
  id: string;
  source: string;    // Prisma DB 컬럼명
  target: string;    // Prisma DB 컬럼명
  userId: string | null;
  projectId: string;
  sourceHandle: string | null;
  targetHandle: string | null;
  type: string | null;
  animated: boolean | null;
  style: Record<string, any> | null;
  data: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 엣지 생성을 위한 입력 데이터 구조
 */
export interface EdgeInput {
  source: string;
  target: string;
  projectId: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
  data?: Record<string, any>;
}

/**
 * 엣지 부분 업데이트를 위한 데이터 구조
 */
export interface EdgePatch {
  source?: string;
  target?: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
  data?: Record<string, any>;
} 