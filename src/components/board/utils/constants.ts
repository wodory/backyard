/**
 * 파일명: constants.ts
 * 목적: 보드 컴포넌트 관련 상수 정의
 * 역할: 보드 컴포넌트에서 사용되는 모든 상수값 제공
 * 작성일: 2025-03-28
 * 수정일: 2025-03-30
 */

import { ConnectionLineType, Position } from '@xyflow/react';

// 레이아웃 방향
export const LAYOUT_DIRECTION = {
  HORIZONTAL: 'LR',
  VERTICAL: 'TB'
};

// 노드 타입
export const NODE_TYPES = {
  CARD: 'card'
};

// 엣지 타입
export const EDGE_TYPES = {
  CUSTOM: 'custom'
};

// 핸들 위치 정보
export const HANDLE_POSITIONS = {
  TOP: Position.Top,
  RIGHT: Position.Right,
  BOTTOM: Position.Bottom,
  LEFT: Position.Left
};

// 연결선 타입
export const CONNECTION_LINE_TYPES = {
  BEZIER: ConnectionLineType.Bezier,
  STEP: ConnectionLineType.Step,
  SMOOTHSTEP: ConnectionLineType.SmoothStep,
  STRAIGHT: ConnectionLineType.Straight
};

// 기본 노드 크기
export const DEFAULT_NODE_DIMENSIONS = {
  WIDTH: 300,
  MIN_HEIGHT: 100
};

// 자동 저장 딜레이 (밀리초)
export const AUTO_SAVE_DELAY = 1000;

// 노드 기본 간격 값
export const NODE_SPACING = {
  HORIZONTAL: 100,
  VERTICAL: 80
};

// 새 노드 기본 데이터
export const DEFAULT_NEW_CARD = {
  title: '새 카드',
  content: '',
  tags: []
};

// 보드 줌 설정
export const ZOOM_SETTINGS = {
  MIN: 0.5,
  MAX: 2,
  STEP: 0.1
};

// 툴팁 표시 지연 (밀리초)
export const TOOLTIP_DELAY = 500; 