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
  const [isHovered, setIsHovered] = useState(false);
  const { getNode, setNodes } = useReactFlow();
  const nodeRef = useRef<HTMLDivElement>(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
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
  
  // 보드 설정 가져오기
  const uiConfig = loadDefaultBoardUIConfig();
  
  // 필요한 값들 추출
  const defaultCardWidth = uiConfig.card.defaultWidth || 280;
  const cardHeaderHeight = uiConfig.layout.nodeSize?.height || 40;
  const cardMaxHeight = 240; // 최대 높이 기본값
  
  // 폰트 크기
  const titleFontSize = 16;
  const contentFontSize = 14;
  const tagsFontSize = 12;
  
  // 핸들 관련 설정
  const handleSize = uiConfig.handles.size || 10;
  const connectionLineColor = uiConfig.board.edgeColor || '#C1C1C1';
  const selectedBackgroundColor = "#FFD3E6"; // 선택된 카드 배경색
  
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
  
  // 핸들 스타일 계산
  const getHandleStyle = useCallback((position: string) => {
    const style: React.CSSProperties = {
      width: handleSize,
      height: handleSize,
      background: connectionLineColor,
      border: `1px solid ${connectionLineColor}`,
      opacity: isHovered ? 1 : 0.3,
      transition: 'opacity 0.3s ease',
    };
    
    // 핸들 위치별 추가 스타일
    if (position === 'top') {
      style.top = -handleSize / 2;
      style.left = '50%';
      style.transform = 'translateX(-50%)';
    } else if (position === 'right') {
      style.top = '50%';
      style.right = -handleSize / 2;
      style.transform = 'translateY(-50%)';
    } else if (position === 'bottom') {
      style.bottom = -handleSize / 2;
      style.left = '50%';
      style.transform = 'translateX(-50%)';
    } else if (position === 'left') {
      style.top = '50%';
      style.left = -handleSize / 2;
      style.transform = 'translateY(-50%)';
    }
    
    return style;
  }, [handleSize, connectionLineColor, isHovered]);
  
  // 카드 크기 및 스타일 계산
  const getNodeStyle = useCallback(() => {
    // 기본 카드 크기 설정
    const nodeData = data as NodeData;
    const cardWidth = nodeData.width || defaultCardWidth;
    const borderWidth = 1;
    
    // 카드 높이 계산 - 확장 상태에 따라 달라짐
    const cardHeight = isExpanded 
      ? (nodeData.height || cardMaxHeight)
      : cardHeaderHeight + 2; // 헤더 높이 + 테두리
    
    // 카드 스타일 생성
    const style: CSSProperties = {
      width: cardWidth,
      height: cardHeight,
      border: `${borderWidth}px solid ${selected ? connectionLineColor : isMultiSelected ? '#4CAF50' : '#e2e8f0'}`,
      backgroundColor: selected ? selectedBackgroundColor : isMultiSelected ? '#E8F5E9' : '#fff',
      transition: 'height 0.2s ease-in-out, background-color 0.2s ease',
      overflow: 'visible', // 핸들이 잘리지 않도록 오버플로우 설정
      position: 'relative',
      zIndex: isActive ? 9999 : 1, // 활성화된 카드는 항상 최상위에 표시
      isolation: 'isolate', // 새로운 쌓임 맥락 생성
      transformStyle: 'preserve-3d', // 3D 공간에서의 렌더링 최적화
      willChange: 'transform, height', // 변환 및 높이 변경 최적화
    };
    
    // 다중 선택된 경우 테두리 색상 변경
    if (isMultiSelected) {
      style.borderColor = '#4CAF50'; // 다중 선택 시 녹색 테두리
      style.borderWidth = 3; // 다중 선택 시 테두리 두께 증가
    }
    
    return style;
  }, [data, isExpanded, selected, isMultiSelected, isActive, defaultCardWidth, cardMaxHeight, cardHeaderHeight, connectionLineColor, selectedBackgroundColor]);

  // 스타일 계산 최적화 (메모이제이션 적용)
  const cardStyle = useMemo(() => {
    const nodeData = data as NodeData;
    return {
      background: nodeData.backgroundColor ? hexToHsl(nodeData.backgroundColor) : null,
      borderColor: isMultiSelected 
        ? 'rgb(37, 99, 235)' // 다중 선택 시 진한 파란색
        : selected 
          ? 'rgb(59, 130, 246)' // 단일 선택 시 파란색
          : 'transparent',
      borderWidth: (isMultiSelected || selected) ? '2px' : '1px'
    };
  }, [data, isMultiSelected, selected]);
  
  // 노드 데이터 안전하게 타입 변환
  const nodeData = data as NodeData;
  
  // 카드 클릭 핸들러 - 노드 선택 및 확장 토글 분리
  const handleCardClick = useCallback((event: React.MouseEvent) => {
    // Cmd/Ctrl 키와 함께 클릭하면 다중 선택 처리
    if (event.ctrlKey || event.metaKey) {
      // ReactFlow 기본 선택 동작 중지
      event.stopPropagation(); 
      
      if (isMultiSelected) {
        // 이미 선택된 경우 선택 해제
        removeSelectedCard(id);
      } else {
        // 선택되지 않은 경우 선택 추가
        addSelectedCard(id);
      }
      return;
    }
    
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
    
    // 단일 클릭은 직접 카드 선택 (중간 단계 없이)
    // ReactFlow의 기본 선택과 함께 작동하도록 전파 유지
    selectCard(id);
  }, [id, isMultiSelected, selectCard, addSelectedCard, removeSelectedCard]);

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

  return (
    <>
      <div
        data-node-id={id}
        ref={nodeRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        onTransitionEnd={handleTransitionEnd}
        className={`card-node-container card-node bg-white rounded-md ${selected ? 'ring-2 ring-blue-400' : ''} ${isHovered ? 'hovered' : ''} ${isMultiSelected ? 'multi-selected' : ''}`}
        style={getNodeStyle()}
      >
        {/* 카드 헤더 */}
        <div className="card-header" style={{ 
          padding: '0 12px',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
          height: `${cardHeaderHeight}px`
        }}>
          <h3 
            className="text-md font-semibold text-center flex-grow"
            style={{
              margin: 0,
              lineHeight: `${cardHeaderHeight}px`,
              alignItems: 'center',
              justifyContent: 'center',
              height: `${cardHeaderHeight}px`,
              fontSize: `${titleFontSize}px`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              padding: '0 4px'
            }}
          >
            {nodeData.title}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-6 w-6 ml-2"
            onClick={toggleExpand}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
          </Button>
        </div>
        
        {/* 카드 콘텐츠 - 펼쳐진 상태에서만 보임 */}
        {isExpanded && (
          <div className="card-content" style={{ 
            padding: '8px 12px',
            fontSize: `${contentFontSize}px`,
            maxHeight: `${cardMaxHeight}px`,
            overflow: 'auto'
          }}>
            <div className="tiptap-content" style={{ fontSize: `${contentFontSize}px` }}>
              <TiptapViewer content={nodeData.content || ''} />
            </div>
            
            {/* 태그 표시 */}
            {nodeData.tags && nodeData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {(nodeData.tags || []).map((tag: string, index: number) => (
                  <div key={index} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs flex items-center" style={{ fontSize: `${tagsFontSize}px` }}>
                    <Tag size={10} className="mr-1" />
                    {tag}
                  </div>
                ))}
              </div>
            )}
            
            {/* 카드 푸터 */}
            <div className="card-footer" style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
              <Link href={`/cards/${nodeData.id}`} passHref>
                <Button size="sm" variant="outline">자세히 보기</Button>
              </Link>
            </div>
          </div>
        )}
        
        {/* 핸들러 - 카드 외부에 위치 */}
        {/* 위쪽 핸들러 */}
        <Handle
          type="target"
          position={Position.Top}
          id="top-target"
          isConnectable={isConnectable}
          className="nodrag handle-top" // visible-handle 클래스 제거
          style={getHandleStyle('top')}
        />
        
        {/* 왼쪽 핸들러 */}
        <Handle
          type="target"
          position={Position.Left}
          id="left-target"
          isConnectable={isConnectable}
          className="nodrag handle-left" // visible-handle 클래스 제거
          style={getHandleStyle('left')}
        />
        
        {/* 오른쪽 핸들러 */}
        <Handle
          type="source"
          position={Position.Right}
          id="right-source"
          isConnectable={isConnectable}
          className="nodrag handle-right" // visible-handle 클래스 제거
          style={getHandleStyle('right')}
        />
        
        {/* 아래쪽 핸들러 */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom-source"
          isConnectable={isConnectable}
          className="nodrag handle-bottom" // visible-handle 클래스 제거
          style={getHandleStyle('bottom')}
        />
      </div>
      
      {/* 카드 수정 모달 */}
      {isEditModalOpen && (
        <Portal>
          <EditCardModal
            cardId={nodeData.id}
            onClose={() => setIsEditModalOpen(false)}
            onCardUpdated={handleCardUpdated}
          />
        </Portal>
      )}
    </>
  );
} 