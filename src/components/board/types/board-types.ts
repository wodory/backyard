/**
 * 파일명: board-types.ts
 * 목적: BoardComponent 및 관련 컴포넌트에서 사용되는 타입 정의
 * 역할: 타입 정의를 중앙화하여 코드 중복을 방지하고 타입 안정성 제공
 * 작성일: 2024-05-09
 */

import { Node, Edge, Connection, XYPosition, NodeChange, EdgeChange, Position, ConnectionMode } from '@xyflow/react';

/**
 * BoardComponent의 Props 인터페이스
 * @interface BoardComponentProps
 */
export interface BoardComponentProps {
  /** 카드 선택 시 호출될 콜백 함수 */
  onSelectCard?: (cardId: string | null) => void;
  /** 컴포넌트에 적용할 추가 CSS 클래스 */
  className?: string;
  /** 컨트롤 표시 여부 */
  showControls?: boolean;
}

/**
 * 카드(노드) 데이터 인터페이스
 * @interface CardData
 */
export interface CardData {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  cardTags?: Array<{tag: {name: string}}>;
  [key: string]: any;
}

/**
 * 보드 설정 인터페이스
 * @interface BoardSettings
 */
export interface BoardSettings {
  /** 엣지 색상 */
  edgeColor: string;
  /** 엣지 두께 */
  strokeWidth: number;
  /** 엣지 애니메이션 여부 */
  animated: boolean;
  /** 방향 표시 여부 */
  markerEnd: boolean;
  /** 연결선 타입 */
  connectionLineType: string;
  /** 그리드 스냅 여부 */
  snapToGrid: boolean;
  /** 그리드 크기 */
  snapGrid: [number, number];
  [key: string]: any;
}

/**
 * 보드 노드 타입
 * @type BoardNode
 */
export type BoardNode = Node<CardData>;

/**
 * 보드 엣지 타입
 * @type BoardEdge
 */
export type BoardEdge = Edge;

/**
 * 엣지 드롭 데이터 인터페이스
 * @interface EdgeDropData
 */
export interface EdgeDropData {
  position: XYPosition;
  connectingNodeId: string;
  handleType: 'source' | 'target';
}

// 타입 재내보내기 - isolatedModules 설정 때문에 'export type'을 사용
export type { Node, Edge, Connection, XYPosition, NodeChange, EdgeChange, Position, ConnectionMode }; 