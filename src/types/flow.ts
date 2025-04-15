/**
 * 파일명: src/types/flow.ts
 * 목적: ReactFlow 관련 타입 정의
 * 역할: 애플리케이션에서 사용되는 ReactFlow 관련 타입들을 정의
 * 작성일: 2025-03-28
 * 수정일: 2023-10-27 : RefObject와 Edge 타입 관련 오류 수정
 * 수정일: 2023-10-27 : ESLint 오류 수정 (import 순서, 미사용 변수 제거, any 타입 제거)
 */

import React from 'react';

import { Edge as ReactFlowEdge } from '@xyflow/react';

export interface NodeData {
  id: string;
  title: string;
  content: string;
  type?: string;
  width?: number;
  height?: number;
  color?: string;
  tags?: string[];
  position?: {
    x: number;
    y: number;
  };
  // 추가 속성들
  [key: string]: unknown;
}

/**
 * SafeRefObject: HTMLElement에 대한 RefObject 타입 확장
 * - null 허용하지 않는 RefObject<HTMLElement> 타입을 안전하게 사용하기 위한 타입
 */
export type SafeRefObject<T extends HTMLElement> = React.RefObject<T>;

/**
 * Edge: ReactFlow Edge 타입 확장
 * - ReactFlow의 Edge 타입을 확장하여 애플리케이션에서 필요한 속성 추가
 */
export type Edge = ReactFlowEdge;

/**
 * EdgeChangeHandler: Edge 변경 핸들러 타입
 * - Edge 배열을 변경하는 함수의 타입 정의
 */
export type EdgeChangeHandler = (edges: Edge[]) => void; 