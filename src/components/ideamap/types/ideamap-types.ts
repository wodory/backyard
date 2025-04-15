/**
 * 파일명: ideamap-types.ts
 * 목적: IdeaMapComponent 및 관련 컴포넌트에서 사용되는 타입 정의
 * 역할: 타입 정의를 중앙화하여 코드 중복을 방지하고 타입 안정성 제공
 * 작성일: 2025-03-28
 * 수정일: 2023-10-27 : ConnectionLineType 타입 추가 및 RefObject 타입 문제 해결
 */

import React from 'react';

import { 
  Node, 
  Edge as ReactFlowEdge, 
  Connection, 
  XYPosition, 
  NodeChange, 
  EdgeChange, 
  Position, 
  ConnectionMode,
  Viewport,
  MarkerType,
  ConnectionLineType
} from '@xyflow/react';

// lib/ideamap-utils.ts에서 정의된 IdeaMapSettings 타입 가져오기
import { IdeaMapSettings as OriginalIdeaMapSettings } from '@/lib/ideamap-utils';

/**
 * IdeaMapComponent의 Props 인터페이스
 * @interface IdeaMapComponentProps
 */
export interface IdeaMapComponentProps {
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
  content: string | null;
  tags?: string[];
  cardTags?: Array<{tag: {name: string}}>;
  [key: string]: any;
}

/**
 * lib/ideamap-utils.ts에서 가져온 IdeaMapSettings 타입을 재내보냅니다.
 * 이를 통해 IdeaMap 컴포넌트에서 사용하는 타입이 lib/ideamap-utils.ts의 타입과 일치하게 됩니다.
 */
export type IdeaMapSettings = OriginalIdeaMapSettings;

/**
 * 안전한 HTMLElement RefObject 타입
 * - TypeScript 타입 체크를 위한 RefObject 타입 확장
 */
export type SafeRef<T extends HTMLElement = HTMLDivElement> = React.RefObject<T>;

/**
 * 아이디어맵 노드 타입
 * @type IdeaMapNode
 */
export type IdeaMapNode = Node<CardData>;

/**
 * 아이디어맵 엣지 타입
 * @type IdeaMapEdge
 */
export type IdeaMapEdge = ReactFlowEdge;

/**
 * Edge 배열 타입 - 타입 호환성을 위한 타입 정의
 */
export type Edges = ReactFlowEdge[];

/**
 * Edge 변경 핸들러 타입
 */
export type EdgeSetFunction = (edges: ReactFlowEdge[] | ((currentEdges: ReactFlowEdge[]) => ReactFlowEdge[])) => void;

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
export type { 
  Node, 
  Connection, 
  XYPosition, 
  NodeChange, 
  EdgeChange, 
  Position, 
  ConnectionMode,
  Viewport,
  MarkerType,
  ConnectionLineType
};

// 중요: Edge 타입은 ReactFlowEdge로 재정의하여 내보냅니다 (타입 호환성 문제 해결)
export type Edge = ReactFlowEdge; 