/**
 * 파일명: CardNode.tsx
 * 목적: 보드에 표시되는 카드 노드 컴포넌트
 * 역할: React Flow의 노드로 사용되는 카드 UI 컴포넌트
 * 작성일: 2024-05-31
 */

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow, useUpdateNodeInternals, Node as FlowNode } from '@xyflow/react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Tag, ChevronRight, ChevronUp } from 'lucide-react';
import TiptapViewer from '@/components/editor/TiptapViewer';
import { loadDefaultBoardUIConfig } from '@/lib/board-ui-config';
import { CSSProperties } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { cn, hexToHsl, hslToHex } from '@/lib/utils';
import { createPortal } from 'react-dom';
import { EditCardModal } from '@/components/cards/EditCardModal';
import { useTheme } from '@/contexts/ThemeContext';
import { NODE_TYPES_KEYS } from '@/lib/flow-constants';

// 고유 식별자 추가 - 이 컴포넌트가 정확히 어느 파일에서 로드되었는지 확인
const COMPONENT_ID = 'CardNode_from_nodes_directory';

// 디버깅용 로그 - 순환 참조 방지를 위해 NODE_TYPES 접근 제거
console.log(`[${COMPONENT_ID}] 모듈이 로드됨 - 경로: @/components/board/nodes/CardNode`);

// 노드 데이터 타입 정의
export interface NodeData {
  id: string;
  title: string;
  content: string;
  type?: string;
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  tags?: string[];
  position?: {
    x: number;
    y: number;
  };
  // 추가 속성들
  [key: string]: any;
}

// Portal 컴포넌트 - 내부 정의
const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
};

// 카드 노드 컴포넌트 정의
export default function CardNode({ data, isConnectable, selected, id }: NodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { getNode, setNodes } = useReactFlow();
  const nodeRef = useRef<HTMLDivElement>(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // ReactFlow 인스턴스 가져오기
  const reactFlowInstance = useReactFlow();

  // 컴포넌트 초기화 로그 - 상세 정보 추가
  // console.log(`[${COMPONENT_ID}] 컴포넌트 렌더링 시작:`, {
  //   id: id,
  //   title: data.title,
  //   type: data.type,
  //   expectedType: NODE_TYPES_KEYS.card,
  //   isTypeValid: data.type === NODE_TYPES_KEYS.card,
  //   componentId: COMPONENT_ID,
  //   isExpanded: isExpanded
  // });

  // 테마 컨텍스트 가져오기
  const { theme } = useTheme();

  // 선택 및 확장 관련 상태와 함수들을 스토어에서 가져오기
  const selectCard = useAppStore((state) => state.selectCard);
  const addSelectedCard = useAppStore((state) => state.addSelectedCard);
  const removeSelectedCard = useAppStore((state) => state.removeSelectedCard);
  const clearSelectedCards = useAppStore((state) => state.clearSelectedCards);
  const selectedCardIds = useAppStore((state) => state.selectedCardIds);
  const updateCardInStore = useAppStore((state) => state.updateCard);
  const expandedCardId = useAppStore((state) => state.expandedCardId);
  const toggleExpandCard = useAppStore((state) => state.toggleExpandCard);
  const isMultiSelected = selectedCardIds.includes(id);

  // 현재 노드의 펼침 상태 계산
  const isExpanded = expandedCardId === id;

  // 노드가 변경될 때 ReactFlow에 알림
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, isExpanded, updateNodeInternals]);

  // expandedCardId 변경을 감지하여 노드 내부 업데이트
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, expandedCardId, updateNodeInternals]);

  // 배열을 문자열로 변환하여 참조 동등성 문제 방지
  const selectedCardIdsKey = useMemo(() => {
    return selectedCardIds.join(',');
  }, [selectedCardIds]);

  // 보드 설정 가져오기 - 기존 설정 유지 (폴백용)
  const uiConfig = loadDefaultBoardUIConfig();

  // 필요한 값들 추출 - 테마 컨텍스트에서 가져오기
  const defaultCardWidth = theme.node.width;
  const cardHeaderHeight = theme.node.height;
  const cardMaxHeight = theme.node.maxHeight;
  const borderWidth = theme.node.borderWidth;

  // 폰트 크기 - 테마 컨텍스트에서 가져오기
  const titleFontSize = theme.node.font.titleSize;
  const contentFontSize = theme.node.font.contentSize;
  const tagsFontSize = theme.node.font.tagsSize;

  // 핸들 관련 설정 - 테마 컨텍스트에서 가져오기
  const handleSize = theme.handle.size;
  const connectionLineColor = theme.edge.color;

  // CSS 변수를 가져오는 함수
  const getCssVariable = (name: string): string => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }
    return '';
  };

  // 호버 상태 관리
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // 노드를 선택 상태로 설정하는 함수
  const selectThisNode = useCallback(() => {
    // 앱 스토어의 카드 선택 함수 호출 - 단일 선택
    selectCard(id);

    // ReactFlow 내부 노드 상태도 함께 업데이트
    reactFlowInstance.setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        selected: node.id === id
      }))
    );

    console.log(`[CardNode] 노드 ${id} 선택됨`);
  }, [id, selectCard, reactFlowInstance]);

  // 노드의 선택을 해제하는 함수 - 이 노드만 해제
  const deselectThisNode = useCallback(() => {
    // 앱 스토어의 카드 선택 해제 함수 호출
    removeSelectedCard(id);

    // ReactFlow 내부 노드 상태도 함께 업데이트
    reactFlowInstance.setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        // 이 노드만 선택 해제
        selected: node.id === id ? false : node.selected
      }))
    );

    console.log(`[CardNode] 노드 ${id} 선택 해제됨`);
  }, [id, removeSelectedCard, reactFlowInstance]);

  // 모든 노드의 선택 해제 함수
  const deselectAllNodes = useCallback(() => {
    // 앱 스토어의 모든 카드 선택 해제
    clearSelectedCards();

    // ReactFlow의 모든 노드 선택 해제
    reactFlowInstance.setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        selected: false
      }))
    );

    console.log('[CardNode] 모든 노드 선택 해제됨');
  }, [clearSelectedCards, reactFlowInstance]);

  // 전역 이벤트 리스너 설정 - 외부 클릭 감지 (보드 전체 혹은 다른 카드 영역)
  useEffect(() => {
    // 모든 클릭에 대한 이벤트 핸들러
    const handleGlobalClick = (e: MouseEvent) => {
      try {
        // 현재 노드가 확장되지 않았으면 처리 불필요
        if (!isExpanded) return;

        // 클릭된 요소
        const target = e.target as HTMLElement;

        // 이 노드 참조
        const thisNodeRef = nodeRef.current;

        // 토글 버튼 클릭인지 확인 (모든 토글 버튼)
        const isAnyToggleButton = target.closest('button[data-testid^="toggle-expand-"]');

        // 토글 버튼 클릭은 무시 (toggleExpand에서 처리)
        if (isAnyToggleButton) {
          console.log('[CardNode] 전역 클릭 핸들러: 토글 버튼 클릭 감지 - 무시');
          return;
        }

        // 외부 클릭 상황인지 확인: 현재 노드가 아닌 다른 곳 클릭
        const isExternalClick = thisNodeRef && !thisNodeRef.contains(target);

        // 외부 클릭인 경우 처리 (빈 보드 또는 다른 카드)
        if (isExternalClick) {
          console.log(`[CardNode] 외부 클릭 감지 - 노드 ${id}, ${isExpanded} - 접기 및 선택 해제`);

          // 이 노드의 확장 상태 해제 및 선택 해제 처리
          handleCardCollapse();
        }
      } catch (error) {
        console.error('[CardNode] 전역 클릭 처리 오류:', error);
      }
    };

    // 문서 레벨에서 클릭 이벤트 리스너 추가
    document.addEventListener('click', handleGlobalClick);

    // 정리 함수
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [
    id,
    isExpanded,
    reactFlowInstance
  ]);

  // 카드 접기 및 선택 해제 처리 함수 (재사용을 위해 분리)
  const handleCardCollapse = useCallback(() => {
    // 확장 상태가 아니면 무시
    if (!isExpanded) return;

    // 1. 이 노드의 확장 상태 해제
    toggleExpandCard(id);

    // 2. 선택 상태 해제 (앱 스토어)
    if (selected || isMultiSelected) {
      removeSelectedCard(id);
    }

    console.log(`[CardNode] 노드 ${id} 접기 및 선택 해제 완료`);
  }, [id, isExpanded, selected, isMultiSelected, removeSelectedCard, toggleExpandCard]);

  // 노드 트랜지션 완료 후 React Flow 업데이트
  const handleTransitionEnd = useCallback(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);

  // 카드 크기 및 스타일 계산
  const getNodeStyle = useCallback(() => {
    // 기본 카드 크기 설정
    const nodeData = data as NodeData;
    const cardWidth = nodeData.width || defaultCardWidth;

    // 카드 높이 계산 - 확장 상태에 따라 달라짐
    const cardHeight = isExpanded
      ? (nodeData.height || cardMaxHeight)
      : cardHeaderHeight + 2; // 헤더 높이 + 테두리

    // 스타일 계산
    const style: CSSProperties = {
      width: cardWidth,
      height: cardHeight,
      // 확장된 노드는 더 높은 z-index 값을 가지도록 설정
      zIndex: isExpanded ? 9999 : (selected || isMultiSelected ? 100 : 1),
      backgroundColor: theme.node.backgroundColor,
      borderColor: selected || isMultiSelected ? theme.node.selectedBorderColor : theme.node.borderColor,
      borderWidth: theme.node.borderWidth,
      borderRadius: theme.node.borderRadius,
      overflow: isExpanded ? 'visible' : 'visible', // 항상 visible로 설정하여 핸들러가 보이도록 처리
      position: 'relative', // 핸들러 위치 기준점
      // 확장된 노드에 그림자 효과 추가
      boxShadow: isExpanded
        ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
        : selected || isMultiSelected
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          : 'none',
      transition: 'height 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      display: 'flex', // 플렉스 컨테이너로 설정
      flexDirection: 'column', // 세로 방향 배치
    };

    return style;
  }, [
    data, isExpanded, selected, isMultiSelected,
    defaultCardWidth, cardMaxHeight, cardHeaderHeight,
    theme.node.backgroundColor, theme.node.selectedBorderColor,
    theme.node.borderColor, theme.node.borderWidth, theme.node.borderRadius
  ]);

  // 노드 데이터 안전하게 타입 변환
  const nodeData = data as NodeData;

  // 카드 클릭 핸들러 - 노드 선택 및 확장 토글 분리
  const handleCardClick = useCallback((event: React.MouseEvent) => {
    // 이벤트 전파 중지
    event.stopPropagation();
    event.preventDefault();

    // 클릭된 요소
    const target = event.target as HTMLElement;

    // 펼치기/접기 버튼 클릭 확인 - 데이터 속성 활용
    const isToggleButton = target.closest(`button[data-testid="toggle-expand-${id}"]`);

    if (isToggleButton) {
      console.log('[CardNode] 카드 클릭 핸들러: 토글 버튼 클릭 감지 - 이벤트 전파 중지만 수행');
      // 토글 버튼 클릭은 toggleExpand 함수에서 별도로 처리됨
      // handleCardClick에서는 추가 처리하지 않고 이벤트 전파만 중지
      return;
    }

    // 버튼이나 링크 클릭은 무시
    if (
      target.tagName === 'BUTTON' ||
      target.closest('button') ||
      target.tagName === 'A'
    ) {
      return;
    }

    // 더블 클릭은 카드 수정 모달 열기
    if (event.detail === 2) {
      setIsEditModalOpen(true);
      return;
    }

    try {
      // 단일 클릭: 카드 선택
      selectThisNode();
    } catch (error) {
      console.error('[CardNode] 카드 클릭 처리 오류:', error);
    }
  }, [id, selectThisNode]);

  // 카드 업데이트 핸들러
  const handleCardUpdated = useCallback((updatedCard: any) => {
    // 업데이트된 카드가 있는 경우에만 처리
    if (updatedCard) {
      // 1. 노드 데이터 업데이트 (로컬 상태)
      setNodes((nodes) => {
        return nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                title: updatedCard.title,
                content: updatedCard.content,
                tags: updatedCard.tags || [],
                // 기타 필요한 속성 업데이트
              },
            };
          }
          return node;
        });
      });

      // 2. 전역 상태(스토어) 업데이트
      updateCardInStore(updatedCard);

      console.log('[CardNode] 카드 업데이트 완료:', updatedCard.id);
    }

    // 모달 닫기
    setIsEditModalOpen(false);
  }, [id, setNodes, updateCardInStore]);

  // 태그 목록 렌더링
  const renderTags = useMemo(() => {
    const tags = nodeData.tags || [];
    if (tags.length === 0) return null;

    return (
      <div
        className="flex flex-wrap gap-1 overflow-hidden"
        style={{
          fontSize: `${tagsFontSize}px`,
          maxHeight: '24px' // 태그 영역 고정 높이
        }}
      >
        {tags.map((tag: string, index: number) => (
          <span
            key={`${tag}-${index}`}
            className="px-1 bg-gray-100 rounded-sm text-gray-700 truncate"
            style={{ maxWidth: '80px' }}
          >
            #{tag}
          </span>
        ))}
      </div>
    );
  }, [nodeData.tags, tagsFontSize]);

  // 내용 렌더링
  const renderContent = useMemo(() => {
    if (!isExpanded) return null;

    return nodeData.content ? (
      <div className="line-clamp-6 overflow-ellipsis">
        <TiptapViewer content={nodeData.content} />
      </div>
    ) : (
      <p className="text-gray-400 italic">내용 없음</p>
    );
  }, [isExpanded, nodeData.content]);

  // 핸들 표시 여부 결정 - normal, hover, selected 상태에 따라 결정
  const showHandles = useMemo(() => isHovered || selected || isMultiSelected, [isHovered, selected, isMultiSelected]);

  // 테두리 고려한 오프셋 계산
  const handleOffset = useMemo(() =>
    Math.ceil(handleSize / 2) + borderWidth
    , [handleSize, borderWidth]);

  // 각 방향별 핸들 스타일 계산
  const getHandleStyleByPosition = useCallback((position: Position) => {
    // 기본 스타일
    const baseStyle: CSSProperties = {
      width: handleSize,
      height: handleSize,
      background: theme.handle.backgroundColor,
      borderColor: theme.handle.borderColor,
      borderWidth: theme.handle.borderWidth,
      borderStyle: 'solid',
      borderRadius: '50%',
      opacity: showHandles ? 1 : 0,
      transition: 'opacity 0.2s ease-in-out',
      // 확장 시 더 높은 z-index로 핸들러가 항상 보이도록 설정
      zIndex: isExpanded ? 10000 : 1000,
      pointerEvents: showHandles ? 'auto' : 'none', // 숨겨진 상태에서 이벤트 무시
    };

    // 각 방향별 위치 미세 조정 
    // 핸들의 반지름 + 테두리 두께를 고려하여 정확한 위치 계산
    switch (position) {
      case Position.Top:
        baseStyle.top = -handleOffset;
        baseStyle.left = '50%';
        baseStyle.transform = 'translateX(-50%)';
        break;
      case Position.Right:
        baseStyle.right = -handleOffset;
        baseStyle.top = '50%';
        baseStyle.transform = 'translateY(-50%)';
        break;
      case Position.Bottom:
        baseStyle.bottom = -handleOffset;
        baseStyle.left = '50%';
        baseStyle.transform = 'translateX(-50%)';
        break;
      case Position.Left:
        baseStyle.left = -handleOffset;
        baseStyle.top = '50%';
        baseStyle.transform = 'translateY(-50%)';
        break;
    }

    return baseStyle;
  }, [handleSize, theme.handle.backgroundColor, theme.handle.borderColor, theme.handle.borderWidth, showHandles, handleOffset, isExpanded]);

  // 최종 렌더링
  return (
    <>
      <div
        ref={nodeRef}
        className={cn("card-node bg-white border transition-all", {
          "border-primary": selected || isMultiSelected,
          "border-muted": !selected && !isMultiSelected,
          "shadow-lg": isHovered || isActive,
          "shadow-sm": !(isHovered || isActive),
          "expanded": isExpanded // 확장 상태를 나타내는 클래스 추가
        })}
        style={getNodeStyle()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        onTransitionEnd={handleTransitionEnd}
        data-component-id={COMPONENT_ID}
        data-expanded={isExpanded ? "true" : "false"} // 확장 상태를 데이터 속성으로 추가
        data-nodeid={id} // 노드 ID를 데이터 속성으로 추가
        data-selected={selected || isMultiSelected ? "true" : "false"} // 선택 상태 추가
      >
        {/* 수평 연결 핸들 (좌우) - 각 방향별 스타일 적용 */}
        <Handle
          type="source"
          position={Position.Right}
          id="right-source"
          isConnectable={isConnectable}
          style={getHandleStyleByPosition(Position.Right)}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left-target"
          isConnectable={isConnectable}
          style={getHandleStyleByPosition(Position.Left)}
        />

        {/* 수직 연결 핸들 (상하) - 각 방향별 스타일 적용 */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom-source"
          isConnectable={isConnectable}
          style={getHandleStyleByPosition(Position.Bottom)}
        />
        <Handle
          type="target"
          position={Position.Top}
          id="top-target"
          isConnectable={isConnectable}
          style={getHandleStyleByPosition(Position.Top)}
        />

        {/* 카드 헤더 */}
        <div
          className="flex justify-between items-center px-2 py-1 border-b flex-shrink-0"
          style={{ height: `${cardHeaderHeight}px` }}
        >
          <div className="flex-1 truncate mr-1" style={{ fontSize: `${titleFontSize}px` }}>
            {nodeData.title || '제목 없음'}
          </div>
          {/* 확장/접기 버튼 - 위치 오른쪽 상단 고정 */}
          <button
            type="button"
            className="ml-auto shrink-0 focus:outline-none hover:bg-gray-100 p-1 rounded"
            aria-label={isExpanded ? "접기" : "펼치기"}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpandCard(id);
              console.log(`[CardNode] 토글 버튼 클릭 - 확장 상태 토글`);
            }}
            data-testid={`toggle-expand-${id}`}
            data-expanded={isExpanded ? "true" : "false"}
            data-nodeid={id}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* 카드 내용 (확장 시에만 표시) */}
        {isExpanded && (
          <div className="flex-grow overflow-hidden flex flex-col">
            {/* 콘텐츠 영역 - 남은 공간을 모두 차지 */}
            <div
              className="px-2 pt-2 overflow-auto flex-grow"
              style={{
                fontSize: `${contentFontSize}px`,
                maxHeight: 'calc(100% - 40px)' // 태그 영역 제외한 높이
              }}
            >
              {renderContent}
            </div>

            {/* 태그 영역 - 하단에 고정 (태그가 있을 때만) */}
            {nodeData.tags && nodeData.tags.length > 0 && (
              <div
                // 태그 영역의 상단 보더 삭제 
                className="border-t border-gray-100 pt-1 px-2"
              >
                {renderTags}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 카드 수정 모달 */}
      {isEditModalOpen && (
        <Portal>
          <EditCardModal
            cardId={nodeData.id}
            onCardUpdated={handleCardUpdated}
            onClose={() => setIsEditModalOpen(false)}
          />
        </Portal>
      )}
    </>
  );
} 