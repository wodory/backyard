/**
 * 파일명: CardNode.tsx
 * 목적: 보드에 표시되는 카드 노드 컴포넌트
 * 역할: React Flow의 노드로 사용되는 카드 UI 컴포넌트
 * 작성일: 2024-05-31
 */

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow, useUpdateNodeInternals, Node } from '@xyflow/react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Tag, ChevronRight, ChevronUp } from 'lucide-react';
import TiptapViewer from '@/components/editor/TiptapViewer';
import { loadDefaultBoardUIConfig } from '@/lib/board-ui-config';
import { CSSProperties } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';
import { EditCardModal } from '@/components/cards/EditCardModal';
import { useTheme } from '@/contexts/ThemeContext';

// 디버깅용 로그
console.log('[CardNode] 모듈이 로드됨 - NODE_TYPES에 등록 확인 필요');

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

// 헥스 색상을 HSL로 변환하는 함수
const hexToHsl = (hex: string): { h: number, s: number, l: number } | null => {
  if (!hex) return null;
  
  // hex를 RGB로 변환
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

// HSL을 헥스 색상으로 변환하는 함수
const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// 카드 노드 컴포넌트 정의
export default function CardNode({ data, isConnectable, selected, id }: NodeProps) {
  // 컴포넌트 초기화 로그
  console.log(`[CardNode] 컴포넌트 렌더링 시작: ID=${id}`);

  const [isHovered, setIsHovered] = useState(false);
  const { getNode, setNodes } = useReactFlow();
  const nodeRef = useRef<HTMLDivElement>(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  // 테마 컨텍스트 가져오기
  const { theme } = useTheme();
  
  // 선택 관련 상태 및 함수들을 스토어에서 가져오기
  const selectCard = useAppStore((state) => state.selectCard);
  const addSelectedCard = useAppStore((state) => state.addSelectedCard);
  const removeSelectedCard = useAppStore((state) => state.removeSelectedCard);
  const selectedCardIds = useAppStore((state) => state.selectedCardIds);
  const updateCardInStore = useAppStore((state) => state.updateCard);
  const isMultiSelected = selectedCardIds.includes(id);
  
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
  
  // 노드가 변경될 때 ReactFlow에 알림
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, isExpanded, updateNodeInternals]);
  
  // 호버 상태 관리
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);
  
  // 카드 확장 토글
  const toggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  }, [isExpanded]);
  
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
    
    // 최소한의 동적 스타일만 포함
    const style: CSSProperties = {
      width: cardWidth,
      height: cardHeight,
      zIndex: isActive ? 9999 : 1, // 활성화된 카드는 항상 최상위에 표시
      backgroundColor: theme.node.backgroundColor,
      borderColor: selected || isMultiSelected ? theme.node.selectedBorderColor : theme.node.borderColor,
      borderWidth: theme.node.borderWidth,
      borderRadius: theme.node.borderRadius,
    };
    
    return style;
  }, [data, isExpanded, isActive, defaultCardWidth, cardMaxHeight, cardHeaderHeight, selected, isMultiSelected, theme]);

  // 노드 데이터 안전하게 타입 변환
  const nodeData = data as NodeData;
  
  // 카드 클릭 핸들러 - 노드 선택 및 확장 토글 분리
  const handleCardClick = useCallback((event: React.MouseEvent) => {
    // 토글 버튼이나 링크 클릭 시에는 이벤트 전파 중지
    if (
      (event.target as HTMLElement).tagName === 'BUTTON' || 
      (event.target as HTMLElement).closest('button') || 
      (event.target as HTMLElement).tagName === 'A'
    ) {
      // 버튼이나 링크만 이벤트 전파 중지
      event.stopPropagation(); 
      return;
    }
    
    // 더블 클릭은 카드 수정 모달 열기
    if (event.detail === 2) { 
      // 더블 클릭은 이벤트 전파 중지
      event.stopPropagation(); 
      
      // 모달 열기
      setIsEditModalOpen(true);
      return;
    }
    
    // 이후 처리는 BoardComponent의 onNodeClick에서 처리
    // React Flow의 onNodeClick 이벤트를 통해 선택 상태 업데이트
    // 이 함수에서는 특수 케이스만 처리하고 나머지는 상위 컴포넌트에 위임
  }, []);

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
        className="flex flex-wrap gap-1 mt-1 overflow-hidden" 
        style={{ fontSize: `${tagsFontSize}px` }}
      >
        {tags.map((tag, index) => (
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
    return (
      <div className="px-2 pt-1 pb-2 overflow-hidden" style={{ fontSize: `${contentFontSize}px` }}>
        {nodeData.content ? (
          <TiptapViewer content={nodeData.content} />
        ) : (
          <p className="text-gray-400 italic">내용 없음</p>
        )}
        {renderTags}
      </div>
    );
  }, [isExpanded, nodeData.content, contentFontSize, renderTags]);

  // 최종 렌더링
  return (
    <>
      <div
        className={cn(
          "bg-white border shadow-sm rounded-md transition-all duration-200",
          selected || isMultiSelected ? "ring-2 ring-blue-500" : "",
          isHovered ? "shadow-md" : ""
        )}
        ref={nodeRef}
        style={getNodeStyle()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        onTransitionEnd={handleTransitionEnd}
        data-testid={`card-node-${id}`}
      >
        {/* 수평 연결 핸들 (좌우) - 테마 설정을 사용 */}
        <Handle
          type="source"
          position={Position.Right}
          id="right-source"
          isConnectable={isConnectable}
          style={{
            width: handleSize,
            height: handleSize,
            background: theme.handle.backgroundColor,
            borderColor: theme.handle.borderColor,
            borderWidth: theme.handle.borderWidth,
            borderStyle: 'solid',
            borderRadius: '50%',
            right: -handleSize / 2 - 1,
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left-target"
          isConnectable={isConnectable}
          style={{
            width: handleSize,
            height: handleSize,
            background: theme.handle.backgroundColor,
            borderColor: theme.handle.borderColor,
            borderWidth: theme.handle.borderWidth,
            borderStyle: 'solid',
            borderRadius: '50%',
            left: -handleSize / 2 - 1, 
          }}
        />
        
        {/* 수직 연결 핸들 (상하) - 테마 설정을 사용 */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom-source"
          isConnectable={isConnectable}
          style={{
            width: handleSize,
            height: handleSize,
            background: theme.handle.backgroundColor,
            borderColor: theme.handle.borderColor,
            borderWidth: theme.handle.borderWidth,
            borderStyle: 'solid',
            borderRadius: '50%',
            bottom: -handleSize / 2 - 1,
          }}
        />
        <Handle
          type="target"
          position={Position.Top}
          id="top-target"
          isConnectable={isConnectable}
          style={{
            width: handleSize,
            height: handleSize,
            background: theme.handle.backgroundColor,
            borderColor: theme.handle.borderColor,
            borderWidth: theme.handle.borderWidth,
            borderStyle: 'solid',
            borderRadius: '50%',
            top: -handleSize / 2 - 1,
          }}
        />
        
        {/* 카드 헤더 */}
        <div 
          className="flex justify-between items-center px-2 py-1 border-b"
          style={{ height: `${cardHeaderHeight}px` }}
        >
          <div className="flex-1 truncate mr-1" style={{ fontSize: `${titleFontSize}px` }}>
            <Link 
              href={`/cards/${nodeData.id}`}
              className="hover:underline font-semibold text-gray-900 truncate block"
              onClick={(e) => e.stopPropagation()}
            >
              {nodeData.title || '제목 없음'}
            </Link>
          </div>
          <button 
            className="flex-shrink-0 text-gray-500 hover:text-gray-800 transition-colors"
            onClick={toggleExpand}
            aria-label={isExpanded ? "접기" : "펼치기"}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
        
        {/* 카드 내용 (확장 시에만 표시) */}
        {renderContent}
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